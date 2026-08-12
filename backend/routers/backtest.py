"""
Backtest Router: REST endpoints for Historical 5-Year Backtesting Engine
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.engines.backtest_engine import BacktestEngine

router = APIRouter(prefix="/api/backtest", tags=["Backtesting Engine"])

class CustomBacktestRequest(BaseModel):
    symbols: Optional[List[str]] = Field(default=None, description="List of stock symbols to backtest")
    benchmark: str = Field("SPY", description="Benchmark symbol: SPY or XIU.TO")
    period_years: int = Field(5, ge=1, le=10, description="Backtesting time horizon in years")
    lang: str = Field("en", description="Target language: en, zh, or hybrid")

@router.get("/stock/{ticker}")
def backtest_single_stock(
    ticker: str,
    benchmark: str = Query("SPY", description="Benchmark symbol: SPY or XIU.TO"),
    lang: str = Query("en", description="Target language: en, zh, or hybrid")
):
    """
    Executes 5-year quantitative backtest simulation (2021-2025) for a single stock symbol.
    """
    if not ticker or len(ticker.strip()) == 0:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")

    symbol = ticker.strip().upper()
    return BacktestEngine.run_backtest(
        symbols=[symbol],
        benchmark=benchmark,
        period_years=5,
        lang=lang
    )

@router.post("/run")
def run_custom_backtest(req: CustomBacktestRequest):
    """
    Executes custom multi-stock portfolio 5-year backtest simulation.
    """
    return BacktestEngine.run_backtest(
        symbols=req.symbols,
        benchmark=req.benchmark,
        period_years=req.period_years,
        lang=req.lang
    )
