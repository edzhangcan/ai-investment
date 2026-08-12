"""
Portfolio Router: REST endpoints for Portfolio Position Sizing & Rebalancing Calculator
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.engines.portfolio_engine import PortfolioEngine

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio Calculator"])

class PortfolioCalculateRequest(BaseModel):
    cash_balance: float = Field(..., gt=0, description="Total capital cash balance (USD or CAD)")
    risk_profile: str = Field("BALANCED", description="Risk profile: CONSERVATIVE, BALANCED, or AGGRESSIVE")
    currency: str = Field("USD", description="Base currency (USD or CAD)")
    symbols: Optional[List[str]] = Field(default=None, description="Optional list of stock symbols to size")
    lang: str = Field("en", description="Target language: en, zh, or hybrid")

@router.post("/calculate")
def calculate_portfolio(req: PortfolioCalculateRequest):
    """
    Calculates risk-adjusted dollar allocations, target portfolio weights,
    exact share counts to execute, and residual cash reserves.
    """
    if req.cash_balance <= 0:
        raise HTTPException(status_code=400, detail="Cash balance must be greater than zero.")

    return PortfolioEngine.calculate_position_sizes(
        cash_balance=req.cash_balance,
        risk_profile=req.risk_profile,
        currency=req.currency,
        selected_symbols=req.symbols,
        lang=req.lang
    )
