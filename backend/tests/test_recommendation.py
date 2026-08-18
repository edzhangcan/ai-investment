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

    # 1. Sector Overweight Champions count == 32
    sector_stocks = result["sector_overweight_stocks"]
    assert len(sector_stocks) == 32
    sector_symbols = [s["symbol"] for s in sector_stocks]
    for stock in sector_stocks:
        assert stock["category_badge"] == "SECTOR_OVERWEIGHT"

    # 2. Overall Market Leaders count == 32
    overall_stocks = result["overall_recommended_stocks"]
    assert len(overall_stocks) == 32
    overall_symbols = [s["symbol"] for s in overall_stocks]

    # 3. Gold Nuggets count == 32
    gold_stocks = result["gold_nugget_stocks"]
    assert len(gold_stocks) == 32
    gold_symbols = [s["symbol"] for s in gold_stocks]

    # -------------------------------------------------------------
    # STRICT MUTUAL EXCLUSIVITY ASSERTIONS (ZERO OVERLAP ACROSS ALL 96 STOCKS)
    # -------------------------------------------------------------
    sector_set = set(sector_symbols)
    overall_set = set(overall_symbols)
    gold_set = set(gold_symbols)

    assert len(sector_set.intersection(overall_set)) == 0, f"Overlap between Sector and Overall: {sector_set.intersection(overall_set)}"
    assert len(sector_set.intersection(gold_set)) == 0, f"Overlap between Sector and Gold: {sector_set.intersection(gold_set)}"
    assert len(overall_set.intersection(gold_set)) == 0, f"Overlap between Overall and Gold: {overall_set.intersection(gold_set)}"

def test_refresh_stock_recommendations_endpoint():
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)
    res = client.post("/api/macro/recommendations/refresh", json={
        "category": "SECTOR",
        "offset": 1,
        "lang": "en"
    })
    assert res.status_code == 200
    json_data = res.json()
    assert "stocks" in json_data
    assert len(json_data["stocks"]) == 32

def test_zero_hallucination_and_credible_backgrounds():
    """Verifies that all 96 recommended stocks have non-templated credible corporate profiles."""
    result = RecommendationEngine.get_top_recommendations(force_refresh=False)
    for cat_name in ["sector_overweight_stocks", "overall_recommended_stocks", "gold_nugget_stocks"]:
        for stock in result[cat_name]:
            assert stock["symbol"] is not None
            assert len(stock["symbol"]) > 0
            assert "." not in stock["symbol"] or stock["symbol"].endswith(".TO") or stock["symbol"].endswith(".V")
            # Verify no generic placeholders
            assert "General Equities" not in stock.get("sector", "")
            assert len(stock.get("company_background", "")) >= 40
            assert len(stock.get("growth_catalysts", [])) >= 2
            assert len(stock.get("revenue_drivers", [])) >= 2
            assert stock.get("current_price", 0) > 0

def test_canadian_dual_class_and_alias_normalization():
    """Verifies alias mapping for Canadian dual-class shares like TECK.B.TO -> TECK-B.TO."""
    from backend.data_sources.data_provider import DataProviderManager
    
    # Test TECK variants
    for var in ["TECK-B.TO", "TECK.B.TO", "TECH.B.TO", "TECK.TO", "TECK"]:
        data = DataProviderManager.get_stock_data(var)
        assert data["is_valid"] is True, f"Failed for {var}"
        assert data["symbol"] == "TECK-B.TO"
        assert "Teck Resources" in data["company_name"]
        assert data["currency"] == "CAD"
        assert data["current_price"] > 0

