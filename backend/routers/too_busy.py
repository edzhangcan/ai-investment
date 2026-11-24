"""
FastAPI Router for the Standalone "Too Busy" 10-Minute EOD Systematic Index Tool (Tab 5)
and App-Launch Daily Advice & Action Signal Banner.
Completely isolated from existing Prism Loop single-stock and macro engines.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, Query, Response
from backend.engines.too_busy_engine import TooBusyEngine

router = APIRouter(prefix="/api/too-busy", tags=["Too Busy 10-Min EOD Strategy"])


class TooBusyRebalanceRequest(BaseModel):
    strategy_mode: str = Field(default="TOO_BUSY_LONG_ONLY")
    market: str = Field(default="US")
    account_type: str = Field(default="ROTH_IRA")
    has_usd_subaccount: bool = Field(default=True)
    cash_balance: float = Field(default=2000.0, ge=0.0)
    current_long_shares: int = Field(default=50, ge=0)
    current_short_shares: int = Field(default=0, ge=0)
    current_cash_etf_shares: int = Field(default=20, ge=0)
    hysteresis_pct: float = Field(default=10.0, ge=0.0, le=30.0)
    opened_intraday_today: bool = Field(default=False)
    custom_long_price: Optional[float] = Field(default=None)
    custom_short_price: Optional[float] = Field(default=None)
    custom_cash_etf_price: Optional[float] = Field(default=None)
    override_target_long_pct: Optional[float] = Field(default=None)
    override_target_short_pct: Optional[float] = Field(default=None)
    lang: str = Field(default="en")
    use_live: bool = Field(default=True)
    force_refresh: bool = Field(default=False)


def _extract_shared_ticket_kwargs(payload: TooBusyRebalanceRequest) -> Dict[str, Any]:
    """Maps shared portfolio state fields once to prevent drift between /daily-advice and /rebalance-ticket."""
    return {
        "strategy_mode": payload.strategy_mode,
        "market": payload.market,
        "account_type": payload.account_type,
        "has_usd_subaccount": payload.has_usd_subaccount,
        "cash_balance": payload.cash_balance,
        "current_long_shares": payload.current_long_shares,
        "current_short_shares": payload.current_short_shares,
        "current_cash_etf_shares": payload.current_cash_etf_shares,
        "hysteresis_pct": payload.hysteresis_pct,
        "opened_intraday_today": payload.opened_intraday_today,
        "override_target_long_pct": payload.override_target_long_pct,
        "lang": payload.lang,
        "use_live": payload.use_live,
        "force_refresh": payload.force_refresh,
    }


@router.get("/regime")
def get_too_busy_regime(
    response: Response,
    strategy_mode: str = Query(default="TOO_BUSY_LONG_ONLY"),
    market: str = Query(default="US"),
    lang: str = Query(default="en"),
    use_live: bool = Query(default=True),
    force_refresh: bool = Query(default=False),
):
    """Evaluates live ^NDX features, S1-S7 sub-strategies, beginner guide, and ETF matrices."""
    response.headers["Cache-Control"] = "no-store"
    return TooBusyEngine.evaluate_live_regime(
        strategy_mode=strategy_mode,
        market=market,
        lang=lang,
        use_live=use_live,
        force_refresh=force_refresh,
    )


@router.get("/cross-border-duet")
def get_too_busy_cross_border_duet(
    response: Response,
    usd_capital: float = Query(default=4000.0, ge=0.0),
    cad_capital: float = Query(default=4000.0, ge=0.0),
    lang: str = Query(default="en"),
    use_live: bool = Query(default=True),
    force_refresh: bool = Query(default=False),
):
    """Calculates blended cross-border allocation across US (USD 3x Dual) + Canada (CAD 2x Long-Only) accounts."""
    response.headers["Cache-Control"] = "no-store"
    return TooBusyEngine.compute_cross_border_duet(
        usd_equity=usd_capital,
        cad_equity=cad_capital,
        lang=lang,
        use_live=use_live,
        force_refresh=force_refresh,
    )


@router.get("/daily-advice")
def get_too_busy_daily_advice(
    response: Response,
    strategy_mode: str = Query(default="TOO_BUSY_LONG_ONLY"),
    market: str = Query(default="US"),
    lang: str = Query(default="en"),
    use_live: bool = Query(default=True),
    force_refresh: bool = Query(default=False),
):
    """Returns default Daily Advice & Action Signal for App Launch."""
    response.headers["Cache-Control"] = "no-store"
    return TooBusyEngine.get_daily_launch_advice(
        strategy_mode=strategy_mode,
        market=market,
        lang=lang,
        use_live=use_live,
        force_refresh=force_refresh,
    )


@router.post("/daily-advice")
def post_too_busy_daily_advice(payload: TooBusyRebalanceRequest, response: Response):
    """Returns personalized App-Launch Daily Advice & Action Signal based on saved <$10K holdings."""
    response.headers["Cache-Control"] = "no-store"
    return TooBusyEngine.get_daily_launch_advice(**_extract_shared_ticket_kwargs(payload))


@router.post("/rebalance-ticket")
def calculate_too_busy_rebalance_ticket(payload: TooBusyRebalanceRequest, response: Response):
    """Generates an exact whole-share <$10K EOD Rebalance Ticket with 10% hysteresis and PDT/Tax/FX audits."""
    response.headers["Cache-Control"] = "no-store"
    res = TooBusyEngine.compute_rebalance_ticket(
        **_extract_shared_ticket_kwargs(payload),
        custom_long_price=payload.custom_long_price,
        custom_short_price=payload.custom_short_price,
        custom_cash_etf_price=payload.custom_cash_etf_price,
        override_target_short_pct=payload.override_target_short_pct,
    )
    res.pop("_regime", None)
    return res


@router.get("/backtest")
def get_too_busy_backtest(
    horizon: str = Query(default="16Y_POST_2010"),
    strategy_mode: str = Query(default="TOO_BUSY_LONG_ONLY"),
    hysteresis_pct: float = Query(default=10.0),
    initial_capital: float = Query(default=10000.0),
    lang: str = Query(default="en"),
    use_live: bool = Query(default=True),
    force_refresh: bool = Query(default=False),
):
    """Runs the multi-decade realistic leveraged ETF backtest (deducting 2x Fed Funds financing drag & 0.95% ER)."""
    return TooBusyEngine.run_backtest(
        horizon=horizon,
        strategy_mode=strategy_mode,
        hysteresis_pct=hysteresis_pct,
        initial_capital=initial_capital,
        lang=lang,
        use_live=use_live,
        force_refresh=force_refresh,
    )
