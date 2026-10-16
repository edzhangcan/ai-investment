"""
Unit tests for RecommendationEngine (Multi-jurisdiction US & CA macro-driven stock recommendations & zero-overlap checks - PL-708)
"""
import pytest
from backend.engines.recommendation_engine import (
    RecommendationEngine,
    US_STOCK_SYMBOLS,
    CA_STOCK_SYMBOLS,
    ALL_STOCK_SYMBOLS
)

def test_universe_symbols_count():
    assert len(US_STOCK_SYMBOLS) == 96
    assert len(CA_STOCK_SYMBOLS) == 48
    assert len(ALL_STOCK_SYMBOLS) == 144

def test_get_top_recommendations_us_categorized():
    # Force refresh cache to test fresh generation logic for US
    result = RecommendationEngine.get_top_recommendations(force_refresh=True, country="US")
    assert "macro_context" in result
    assert result["country"] == "US"
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

    # STRICT MUTUAL EXCLUSIVITY ASSERTIONS (ZERO OVERLAP ACROSS ALL 96 US STOCKS)
    sector_set = set(sector_symbols)
    overall_set = set(overall_symbols)
    gold_set = set(gold_symbols)

    assert len(sector_set.intersection(overall_set)) == 0, f"Overlap between Sector and Overall: {sector_set.intersection(overall_set)}"
    assert len(sector_set.intersection(gold_set)) == 0, f"Overlap between Sector and Gold: {sector_set.intersection(gold_set)}"
    assert len(overall_set.intersection(gold_set)) == 0, f"Overlap between Overall and Gold: {overall_set.intersection(gold_set)}"

def test_get_top_recommendations_ca_categorized():
    # Force refresh cache to test fresh generation logic for CA
    result = RecommendationEngine.get_top_recommendations(force_refresh=True, country="CA")
    assert "macro_context" in result
    assert result["country"] == "CA"
    assert "sector_overweight_stocks" in result
    assert "overall_recommended_stocks" in result
    assert "gold_nugget_stocks" in result

    # 1. CA Sector Champions count == 16
    sector_stocks = result["sector_overweight_stocks"]
    assert len(sector_stocks) == 16
    sector_symbols = [s["symbol"] for s in sector_stocks]
    for stock in sector_stocks:
        assert stock["category_badge"] == "SECTOR_OVERWEIGHT"
        assert stock["symbol"].endswith(".TO") or stock["symbol"].endswith(".V")

    # 2. CA Overall Market Leaders count == 16
    overall_stocks = result["overall_recommended_stocks"]
    assert len(overall_stocks) == 16
    overall_symbols = [s["symbol"] for s in overall_stocks]
    for stock in overall_stocks:
        assert stock["symbol"].endswith(".TO") or stock["symbol"].endswith(".V")

    # 3. CA Gold Nuggets count == 16
    gold_stocks = result["gold_nugget_stocks"]
    assert len(gold_stocks) == 16
    gold_symbols = [s["symbol"] for s in gold_stocks]
    for stock in gold_stocks:
        assert stock["symbol"].endswith(".TO") or stock["symbol"].endswith(".V")

    # STRICT MUTUAL EXCLUSIVITY ASSERTIONS (ZERO OVERLAP ACROSS ALL 48 CA STOCKS)
    sector_set = set(sector_symbols)
    overall_set = set(overall_symbols)
    gold_set = set(gold_symbols)

    assert len(sector_set.intersection(overall_set)) == 0, f"Overlap between Sector and Overall: {sector_set.intersection(overall_set)}"
    assert len(sector_set.intersection(gold_set)) == 0, f"Overlap between Sector and Gold: {sector_set.intersection(gold_set)}"
    assert len(overall_set.intersection(gold_set)) == 0, f"Overlap between Overall and Gold: {overall_set.intersection(gold_set)}"

def test_refresh_stock_recommendations_endpoints_by_country():
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)

    # Test US refresh
    res_us = client.post("/api/macro/recommendations/refresh", json={
        "category": "SECTOR",
        "offset": 1,
        "lang": "en",
        "country": "US"
    })
    assert res_us.status_code == 200
    json_us = res_us.json()
    assert "stocks" in json_us
    assert len(json_us["stocks"]) == 32

    # Test CA refresh
    res_ca = client.post("/api/macro/recommendations/refresh", json={
        "category": "SECTOR",
        "offset": 1,
        "lang": "en",
        "country": "CA"
    })
    assert res_ca.status_code == 200
    json_ca = res_ca.json()
    assert "stocks" in json_ca
    assert len(json_ca["stocks"]) == 16
    for s in json_ca["stocks"]:
        assert s["symbol"].endswith(".TO") or s["symbol"].endswith(".V")

def test_get_macro_dashboard_recommendations_segregation():
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)

    # US Dashboard recommendations
    res_us = client.get("/api/macro/dashboard?country=US")
    assert res_us.status_code == 200
    recs_us = res_us.json()["recommendations"]
    assert recs_us["country"] == "US"
    assert len(recs_us["sector_overweight_stocks"]) == 32

    # CA Dashboard recommendations
    res_ca = client.get("/api/macro/dashboard?country=CA")
    assert res_ca.status_code == 200
    recs_ca = res_ca.json()["recommendations"]
    assert recs_ca["country"] == "CA"
    assert len(recs_ca["sector_overweight_stocks"]) == 16
    assert len(recs_ca["overall_recommended_stocks"]) == 16
    assert len(recs_ca["gold_nugget_stocks"]) == 16

def test_zero_hallucination_and_credible_backgrounds():
    """Verifies that all recommended stocks have non-templated credible corporate profiles."""
    for c in ["US", "CA"]:
        result = RecommendationEngine.get_top_recommendations(force_refresh=False, country=c)
        for cat_name in ["sector_overweight_stocks", "overall_recommended_stocks", "gold_nugget_stocks"]:
            for stock in result[cat_name]:
                assert stock["symbol"] is not None
                assert len(stock["symbol"]) > 0
                if c == "CA":
                    assert stock["symbol"].endswith(".TO") or stock["symbol"].endswith(".V")
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
