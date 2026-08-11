"""
Unit tests for RecommendationEngine (Multi-category macro-driven stock recommendations)
"""
import pytest
from backend.engines.recommendation_engine import RecommendationEngine

def test_get_top_recommendations_categorized():
    result = RecommendationEngine.get_top_recommendations()
    assert "macro_context" in result
    assert "sector_overweight_stocks" in result
    assert "overall_recommended_stocks" in result
    assert "gold_nugget_stocks" in result

    # 1. Sector Overweight Champions count == 4
    sector_stocks = result["sector_overweight_stocks"]
    assert len(sector_stocks) == 4
    for stock in sector_stocks:
        assert stock["category_badge"] == "SECTOR_OVERWEIGHT"

    # 2. Overall Market Leaders count >= 4
    overall_stocks = result["overall_recommended_stocks"]
    assert len(overall_stocks) >= 4
    first_pick = overall_stocks[0]
    assert "symbol" in first_pick
    assert "company_name" in first_pick
    assert "why_recommend_rationale" in first_pick
    assert "key_catalysts" in first_pick

    # 3. Gold Nuggets count >= 3
    gold_stocks = result["gold_nugget_stocks"]
    assert len(gold_stocks) >= 3
    for nugget in gold_stocks:
        assert nugget["symbol"] in ["CSU.TO", "CELH", "CRWD", "ONT.TO"]
