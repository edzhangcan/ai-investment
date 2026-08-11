"""
Unit tests for RecommendationEngine (Multi-category macro-driven stock recommendations & zero-overlap checks)
"""
import pytest
from backend.engines.recommendation_engine import RecommendationEngine

def test_get_top_recommendations_categorized():
    # Force refresh cache to test fresh generation logic
    result = RecommendationEngine.get_top_recommendations(force_refresh=True)
    assert "macro_context" in result
    assert "sector_overweight_stocks" in result
    assert "overall_recommended_stocks" in result
    assert "gold_nugget_stocks" in result

    # 1. Sector Overweight Champions count == 4
    sector_stocks = result["sector_overweight_stocks"]
    assert len(sector_stocks) == 4
    sector_symbols = [s["symbol"] for s in sector_stocks]
    for stock in sector_stocks:
        assert stock["category_badge"] == "SECTOR_OVERWEIGHT"

    # 2. Overall Market Leaders count >= 4
    overall_stocks = result["overall_recommended_stocks"]
    assert len(overall_stocks) >= 4
    overall_symbols = [s["symbol"] for s in overall_stocks]

    # 3. Gold Nuggets count >= 3
    gold_stocks = result["gold_nugget_stocks"]
    assert len(gold_stocks) >= 3
    gold_symbols = [s["symbol"] for s in gold_stocks]

    # -------------------------------------------------------------
    # STRICT MUTUAL EXCLUSIVITY ASSERTIONS (ZERO OVERLAP)
    # -------------------------------------------------------------
    sector_set = set(sector_symbols)
    overall_set = set(overall_symbols)
    gold_set = set(gold_symbols)

    assert len(sector_set.intersection(overall_set)) == 0, f"Overlap between Sector and Overall: {sector_set.intersection(overall_set)}"
    assert len(sector_set.intersection(gold_set)) == 0, f"Overlap between Sector and Gold: {sector_set.intersection(gold_set)}"
    assert len(overall_set.intersection(gold_set)) == 0, f"Overlap between Overall and Gold: {overall_set.intersection(gold_set)}"
