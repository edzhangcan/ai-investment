"""
==============================================================================
FastAPI Main Application Entry Point & Server Initialization
==============================================================================
Developer Guide for Beginners:
------------------------------------------------------------------------------
1. FastAPI Framework:
   - FastAPI is a modern, high-performance web framework for building APIs with Python 3.8+.
   - We register modular routes via APIRouter objects (e.g. macro, stock, portfolio).

2. Lifespan Events (`lifespan` context manager):
   - Handles startup and shutdown logic automatically.
   - `init_db()` creates SQLite database tables if they do not exist.
   - `asyncio.create_task(run_universe_refresh_daemon())` launches a background worker task that refreshes stock universe recommendations every 2 hours without blocking HTTP requests.

3. CORS Middleware:
   - Allows cross-origin requests from the React/Vite frontend (running on port 3000) to communicate with this FastAPI backend (running on port 8000).
==============================================================================
"""

import os
import sys
import logging
import asyncio
from contextlib import asynccontextmanager

# Step 1: Ensure project root is in Python module search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, func
from backend.config import settings
from backend.database import init_db, engine
from backend.models.db_models import RecommendationSnapshotDB
from backend.routers import macro, stock, debate, watchlist, alerts, portfolio, backtest, push_alerts, valuation_settings

# Configure logging format for production and development debugging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

def _run_universe_refresh_sync():
    """Worker function executed inside a thread pool to avoid blocking asyncio event loop."""
    try:
        from backend.engines.recommendation_engine import RecommendationEngine
        logging.info("Worker thread scanning US & Canadian stock universes for macro recommendation refresh...")
        for c in ["US", "CA"]:
            for l in ["en", "zh", "hybrid"]:
                RecommendationEngine.refresh_stock_universe_job(force=True, lang=l, country=c)
        logging.info("Worker thread US & CA stock universe scan complete. Next background refresh in 2 hours.")
    except Exception as e:
        logging.error(f"Error in stock universe refresh daemon thread: {e}")

async def run_universe_refresh_daemon():
    """
    Background Async Worker Daemon:
    Runs continuously every 7,200 seconds (2 hours) to calculate and cache
    recommendations for 128 North American universe stocks across English, Chinese, and Hybrid modes.
    Non-blocking: offloads heavy synchronous calculation to asyncio.to_thread.
    """
    await asyncio.sleep(10)  # Allow uvicorn to bind port and serve initial client requests
    
    # Check if database already has valid snapshots on startup
    has_snapshots = False
    try:
        with Session(engine) as session:
            count = session.exec(select(func.count(RecommendationSnapshotDB.id))).one()
            if count and count > 0:
                has_snapshots = True
                logging.info(f"Database already populated with {count} recommendation snapshots. Skipping startup scan.")
    except Exception as e:
        logging.warning(f"Failed to check initial snapshot count: {e}")

    if not has_snapshots:
        logging.info("Starting initial background Stock Universe Refresh in worker thread...")
        await asyncio.to_thread(_run_universe_refresh_sync)

    while True:
        await asyncio.sleep(7200)
        logging.info("Starting scheduled 2-Hour Stock Universe Refresh in worker thread...")
        await asyncio.to_thread(_run_universe_refresh_sync)

async def run_alerts_scheduler_daemon():
    """
    Background Async Alert Scheduler Daemon:
    Runs every 300 seconds (5 minutes) to evaluate:
    1. Scheduled triggers (Morning Macro Digest at 8:00 AM EST, Midday Gold Nuggets at 12:00 PM EST).
    2. Watchlist target price condition triggers with 12-hour anti-spam cooldown protection.
    """
    await asyncio.sleep(45)  # Allow uvicorn, frontend bootstrap, and client connections to fully settle
    logging.info("Starting Automated Scheduled & Conditional Alerts Daemon...")
    while True:
        try:
            from backend.services.alert_engine import alert_engine
            with Session(engine) as session:
                await alert_engine.evaluate_scheduled_and_conditional_alerts(session)
        except Exception as e:
            logging.error(f"Error in scheduled alerts daemon: {e}")
        await asyncio.sleep(300)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan Manager:
    Executes database schema creation and starts background tasks on startup,
    and handles graceful cleanup on shutdown.
    """
    # 1. Initialize SQLite database tables via SQLModel ORM
    init_db()
    logging.info("SQLite database tables initialized successfully.")
    
    # 2. Launch non-blocking background daemon tasks in production (skip during pytest)
    if "pytest" not in sys.modules and os.getenv("TESTING") != "true":
        asyncio.create_task(run_universe_refresh_daemon())
        asyncio.create_task(run_alerts_scheduler_daemon())
    yield

# Create FastAPI application instance
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend service powering macro scanning, fundamental review, pricing engine, multi-agent debate, and price alerts for US & CA equities.",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Enable CORS middleware to allow cross-origin requests from web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(macro.router)
app.include_router(stock.router)
app.include_router(debate.router)
app.include_router(watchlist.router)
app.include_router(alerts.router)
app.include_router(portfolio.router)
app.include_router(backtest.router)
app.include_router(push_alerts.router)
app.include_router(valuation_settings.router)

@app.get("/api/health")
def health_check():
    """Simple Liveness Probe / Health Check Endpoint."""
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "env": settings.ENV
    }

if __name__ == "__main__":
    import uvicorn
    # Start Uvicorn ASGI Web Server locally on port 8000
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
