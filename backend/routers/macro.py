"""
Macro Economy & Dashboard Router with multi-language support (en, zh, hybrid)
"""

from fastapi import APIRouter
from backend.engines.macro_engine import MacroEngine
from backend.engines.recommendation_engine import RecommendationEngine

from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/macro", tags=["Macro Engine & Dashboard"])

class RefreshRecommendationsRequest(BaseModel):
    category: Optional[str] = None
    offset: int = 0
    lang: str = "en"

@router.get("")
def get_macro_analysis(force_refresh: bool = False, lang: str = "en"):
    """Returns current US & Canada economic cycle status and sector rotation weights."""
    return MacroEngine.analyze_macro_environment(force_refresh=force_refresh, lang=lang)

@router.get("/dashboard")
def get_macro_dashboard(force_refresh: bool = False, lang: str = "en"):
    """
    Returns complete Macro Dashboard payload:
    Macro cycle assessment, empirical indicator proof array, policy news feed,
    and TOP 3-5 macro-driven stock recommendations with 'Why Invest Now' rationale.
    """
    macro_data = MacroEngine.analyze_macro_environment(force_refresh=force_refresh, lang=lang)
    recommendations_data = RecommendationEngine.get_top_recommendations(force_refresh=force_refresh, lang=lang)

    return {
        "macro_assessment": macro_data,
        "policy_news": macro_data.get("policy_news", []),
        "empirical_supporting_facts": macro_data.get("empirical_supporting_facts", []),
        "credible_sources": macro_data.get("credible_sources", []),
        "recommendations": recommendations_data
    }

@router.post("/recommendations/refresh")
def refresh_stock_recommendations(req: RefreshRecommendationsRequest):
    """
    Rotates and refreshes candidate stock recommendations for given category ('SECTOR', 'OVERALL', 'GOLD').
    Returns fresh candidate batch matching macro criteria.
    """
    return RecommendationEngine.get_refreshed_recommendations(
        category=req.category,
        offset=req.offset,
        lang=req.lang
    )
