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
from backend.config import settings
from backend.database import init_db
from backend.routers import macro, stock, debate, watchlist, alerts, portfolio, backtest, push_alerts

# Configure logging format for production and development debugging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

async def run_universe_refresh_daemon():
    """
    Background Async Worker Daemon:
    Runs continuously every 7,200 seconds (2 hours) to calculate and cache
    recommendations for 128 North American universe stocks across English, Chinese, and Hybrid modes.
    """
    await asyncio.sleep(1)  # Allow uvicorn to bind port immediately
    logging.info("Starting 2-Hour Automated Stock Universe Refresh Daemon...")
    while True:
        try:
            from backend.engines.recommendation_engine import RecommendationEngine
            logging.info("Daemon scanning North American stock universe for macro recommendation refresh...")
            RecommendationEngine.refresh_stock_universe_job(force=True, lang="en")
            RecommendationEngine.refresh_stock_universe_job(force=True, lang="zh")
            RecommendationEngine.refresh_stock_universe_job(force=True, lang="hybrid")
            logging.info("Daemon stock universe scan complete. Next background refresh in 2 hours.")
        except Exception as e:
            logging.error(f"Error in stock universe refresh daemon: {e}")
        await asyncio.sleep(7200)

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
    
    # 2. Launch non-blocking background daemon task in production (skip during pytest)
    if "pytest" not in sys.modules and os.getenv("TESTING") != "true":
        asyncio.create_task(run_universe_refresh_daemon())
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
    allow_origins=["*"],
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
