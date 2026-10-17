"""
Portfolio Router: REST endpoints for Portfolio Position Sizing, 80/20 Barbell Sizer,
Kelly Sizing, Efficient Frontier Covariance Optimizer, and Liability-Side Stress Tester.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from backend.engines.portfolio_engine import PortfolioEngine

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio Calculator"])

class PortfolioCalculateRequest(BaseModel):
    cash_balance: float = Field(..., gt=0, description="Total capital cash balance (USD or CAD)")
    risk_profile: str = Field("BALANCED", description="Risk profile: CONSERVATIVE, BALANCED, AGGRESSIVE, or BARBELL_80_20")
    currency: str = Field("USD", description="Base currency (USD or CAD)")
    base_currency: Optional[str] = Field("USD", description="Base currency: USD or CAD")
    macro_regime: str = Field("NEUTRAL", description="Macro cycle regime: NEUTRAL, TIGHTENING, EASING, etc.")
    symbols: Optional[List[str]] = Field(default=None, description="Optional list of stock symbols to size")
    lang: str = Field("en", description="Target language: en, zh, or hybrid")

class KellySizeRequest(BaseModel):
    win_prob: float = Field(0.55, ge=0.01, le=0.99, description="Estimated win probability (p)")
    upside_pct: float = Field(25.0, gt=0, description="Expected upside potential percentage")
    stop_loss_pct: float = Field(8.0, gt=0, description="Hard stop-loss percentage")
    kelly_fraction: float = Field(0.25, gt=0, le=1.0, description="Kelly fraction multiplier (default 0.25)")
    max_cap_pct: float = Field(4.0, gt=0, le=25.0, description="Maximum finite bet cap percentage (default 4.0%)")
    conviction_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Raw conviction score (0-100) for Bayesian win probability shrinkage")
    same_sector_count: int = Field(0, ge=0, description="Count of existing positions in the same sector for correlation penalty")
    is_fallback_data: bool = Field(False, description="Flag indicating if the underlying input data is heuristic fallback")

class EfficientFrontierRequest(BaseModel):
    symbols: Optional[List[str]] = Field(default=None, description="List of asset symbols (defaults to core asset mix)")
    lookback_days: int = Field(756, ge=60, le=2520, description="Lookback window in trading days")

class LiabilityStressRequest(BaseModel):
    total_capital: float = Field(100000.0, gt=0, description="Total portfolio capital")
    est_max_drawdown_pct: float = Field(25.0, ge=0.0, le=99.0, description="Estimated max drawdown percentage")
    monthly_living_expense: float = Field(4000.0, gt=0, description="Monthly household living expense")
    annual_passive_income: float = Field(12000.0, ge=0, description="Annual steady passive dividend/interest income")

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
        base_currency=req.base_currency,
        macro_regime=req.macro_regime,
        selected_symbols=req.symbols,
        lang=req.lang
    )

@router.post("/kelly-size")
def calculate_kelly_size(req: KellySizeRequest):
    """
    Computes Quarter-Kelly position size with Bayesian win probability shrinkage,
    sector correlation penalty, and finite bet cap (2%-4%).
    """
    return PortfolioEngine.calculate_kelly_position(
        win_prob=req.win_prob,
        upside_pct=req.upside_pct,
        stop_loss_pct=req.stop_loss_pct,
        kelly_fraction=req.kelly_fraction,
        max_cap_pct=req.max_cap_pct,
        conviction_score=req.conviction_score,
        same_sector_count=req.same_sector_count,
        is_fallback_data=req.is_fallback_data
    )

@router.post("/efficient-frontier")
def compute_efficient_frontier(req: EfficientFrontierRequest):
    """
    Computes 3Y covariance matrix, 60D rolling correlation matrix,
    correlation decoupling alerts, and 400 Monte Carlo Efficient Frontier portfolios.
    """
    return PortfolioEngine.compute_efficient_frontier(
        symbols=req.symbols,
        lookback_days=req.lookback_days
    )

@router.post("/liability-stress")
@router.post("/liability-stress-test")
def evaluate_liability_stress(req: LiabilityStressRequest):
    """
    Evaluates investor liability-side runway and cash flow coverage against portfolio drawdowns.
    """
    return PortfolioEngine.evaluate_liability_stress_test(
        total_capital=req.total_capital,
        est_max_drawdown_pct=req.est_max_drawdown_pct,
        monthly_living_expense=req.monthly_living_expense,
        annual_passive_income=req.annual_passive_income
    )
