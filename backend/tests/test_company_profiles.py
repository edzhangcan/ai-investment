"""
Unit Tests for CompanyProfileEngine & Institutional Knowledge Registry
Verifies company background summaries, key growth catalysts, and revenue driver segmentation
across US & Canadian equities in English, Chinese, and Hybrid modes.
"""

import pytest
from backend.data_sources.company_profiles import CompanyProfileEngine, COMPANY_PROFILES_REGISTRY
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.recommendation_engine import RecommendationEngine

def test_company_profile_registry_us_leaders():
    """Verifies authentic company profiles for US tech leaders."""
    for symbol in ["NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA"]:
        profile_en = CompanyProfileEngine.get_profile(symbol, lang="en")
        assert profile_en["symbol"] == symbol
        assert len(profile_en["company_background"]) > 50
        assert len(profile_en["growth_catalysts"]) >= 3
        assert len(profile_en["revenue_drivers"]) >= 2
        assert profile_en["is_institutional_verified"] is True

def test_company_profile_registry_canadian_bluechips():
    """Verifies authentic company profiles for Canadian leaders."""
    for symbol in ["SHOP.TO", "SU.TO", "ENB.TO", "TD.TO"]:
        profile_zh = CompanyProfileEngine.get_profile(symbol, lang="zh")
        assert profile_zh["symbol"] == symbol
        assert len(profile_zh["company_background"]) > 30
        assert len(profile_zh["growth_catalysts"]) >= 3
        assert len(profile_zh["revenue_drivers"]) >= 2

def test_company_profile_niche_growth_gems():
    """Verifies authentic profiles for high-growth niche gems."""
    for symbol in ["PLTR", "CRWD", "CELH"]:
        profile_hy = CompanyProfileEngine.get_profile(symbol, lang="hybrid")
        assert profile_hy["symbol"] == symbol
        assert len(profile_hy["growth_catalysts"]) >= 3
        assert len(profile_hy["revenue_drivers"]) >= 2

def test_dynamic_fallback_unmapped_stock():
    """Verifies intelligent fallback for unmapped arbitrary ticker."""
    unmapped_profile = CompanyProfileEngine.get_profile("UNKNOWN_XYZ", lang="en")
    assert unmapped_profile["symbol"] == "UNKNOWN_XYZ"
    assert len(unmapped_profile["company_background"]) > 20
    assert len(unmapped_profile["growth_catalysts"]) >= 2
    assert len(unmapped_profile["revenue_drivers"]) >= 2

def test_fundamental_engine_includes_profile():
    """Verifies that FundamentalEngine includes company_profile in its evaluation."""
    stock_raw = {
        "symbol": "NVDA",
        "company_name": "NVIDIA Corporation",
        "current_price": 219.46,
        "free_cash_flow": 60800000000,
        "currency": "USD"
    }
    fund_res = FundamentalEngine.evaluate_fundamentals(stock_raw, lang="en")
    assert "company_profile" in fund_res
    assert len(fund_res["growth_catalysts"]) >= 3
    assert len(fund_res["revenue_drivers"]) >= 2

def test_recommendation_engine_get_stock_info():
    """Verifies RecommendationEngine get_stock_info returns rich company profile data."""
    info = RecommendationEngine.get_stock_info("SHOP.TO", lang="en")
    assert "company_background" in info
    assert "growth_catalysts" in info
    assert "revenue_drivers" in info
    assert len(info["growth_catalysts"]) >= 3
