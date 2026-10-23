"""
News & Portfolio Intelligence REST Router (PL-722)
Provides endpoints to aggregate US/CA news, key institutional investor commentary,
and tactical today/tomorrow portfolio briefings.
"""

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session

from backend.database import get_session
from backend.models.schemas import PortfolioNewsAnalysisResponseSchema
from backend.engines.portfolio_news_engine import PortfolioNewsEngine

router = APIRouter(prefix="/api/news-portfolio", tags=["News & Portfolio Intelligence"])


@router.get("/analysis", response_model=PortfolioNewsAnalysisResponseSchema)
def get_portfolio_news_analysis(
    market: str = Query("ALL", description="Filter by market: ALL, US, or CA"),
    force_refresh: bool = Query(False, description="Bypass 15-minute news cache"),
    session: Session = Depends(get_session),
):
    """
    Returns aggregated US/CA stock news and Key Investor commentary prioritized
    by user Holdings and Watchlist, paired with daily/tomorrow tactical Action Advice,
    Opportunities, and Risks.
    """
    return PortfolioNewsEngine.analyze_portfolio_and_news(
        session=session,
        market=market,
        force_refresh=force_refresh,
    )
