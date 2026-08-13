"""
FastAPI Main Application Server
Modular router architecture powering macro scanning, fundamental review, pricing engine, multi-agent debate, price alerts, and SQLModel persistence.
"""

import os
import sys
import logging
from contextlib import asynccontextmanager

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import init_db
from backend.routers import macro, stock, debate, watchlist, alerts, portfolio, backtest, push_alerts

import asyncio

async def run_universe_refresh_daemon():
    logging.info("Starting 2-Hour Automated Stock Universe Refresh Daemon...")
    while True:
        try:
            from backend.engines.recommendation_engine import RecommendationEngine
            logging.info("Daemon scanning 200+ North American stocks for macro recommendation refresh...")
            RecommendationEngine.refresh_stock_universe_job(force=True, lang="en")
            RecommendationEngine.refresh_stock_universe_job(force=True, lang="zh")
            RecommendationEngine.refresh_stock_universe_job(force=True, lang="hybrid")
            logging.info("Daemon stock universe scan complete. Next background refresh in 2 hours.")
        except Exception as e:
            logging.error(f"Error in stock universe refresh daemon: {e}")
        await asyncio.sleep(7200)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database tables on startup
    init_db()
    logging.info("SQLite database tables initialized successfully.")
    asyncio.create_task(run_universe_refresh_daemon())
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend service powering macro scanning, fundamental review, pricing engine, multi-agent debate, and price alerts for US & CA equities.",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Enable CORS for Next.js / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
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
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "env": settings.ENV
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
