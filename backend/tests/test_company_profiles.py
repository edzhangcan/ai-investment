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

def test_company_profile_registry_consumer_defensive_leaders():
    """Verifies that KO (Coca-Cola), PEP, COST, and T.TO have authentic profiles and never 'General Equities'."""
    ko_en = CompanyProfileEngine.get_profile("KO", lang="en")
    assert ko_en["symbol"] == "KO"
    assert "Coca-Cola" in ko_en["company_name"]
    assert "Consumer Defensive" in ko_en["sector"]
    assert "General Equities" not in ko_en["sector"]
    assert "beverage" in ko_en["company_background"].lower()
    assert len(ko_en["growth_catalysts"]) >= 3
    assert len(ko_en["revenue_drivers"]) >= 3

    t_to_zh = CompanyProfileEngine.get_profile("T.TO", lang="zh")
    assert t_to_zh["symbol"] == "T.TO"
    assert "TELUS" in t_to_zh["company_name"]
    assert "Communication Services" in t_to_zh["sector"]
    assert len(t_to_zh["growth_catalysts"]) >= 3

def test_dynamic_fallback_unmapped_stock():
    """Verifies intelligent dynamic resolution for unmapped arbitrary ticker."""
    mcd_profile = CompanyProfileEngine.get_profile("MCD", lang="en")
    assert mcd_profile["symbol"] == "MCD"
    assert len(mcd_profile["company_background"]) > 20
    assert len(mcd_profile["growth_catalysts"]) >= 2
    assert len(mcd_profile["revenue_drivers"]) >= 2

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

def test_full_universe_profile_registry_coverage():
    """Verifies that all universe equities have verified non-templated institutional profiles."""
    from backend.engines.recommendation_engine import SECTOR_SYMBOLS, OVERALL_SYMBOLS, GOLD_SYMBOLS
    all_universe = list(set(SECTOR_SYMBOLS + OVERALL_SYMBOLS + GOLD_SYMBOLS))
    
    assert len(all_universe) >= 128
    for sym in all_universe:
        assert sym in COMPANY_PROFILES_REGISTRY, f"Symbol {sym} missing from COMPANY_PROFILES_REGISTRY"
        reg = COMPANY_PROFILES_REGISTRY[sym]
        assert len(reg["name"]) > 1
        assert "General Equities" not in reg["sector"]
        assert len(reg["background"]["en"]) > 40
        assert len(reg["background"]["zh"]) > 20
        assert len(reg["background"]["hybrid"]) > 30
        assert len(reg["catalysts"]["en"]) >= 3
        assert len(reg["revenue_drivers"]["en"]) >= 2

def test_teck_resources_and_alias_profile_verification():
    """Verifies Teck Resources profile and dual-class dot/hyphen alias consistency."""
    prof_hyphen = CompanyProfileEngine.get_profile("TECK-B.TO", lang="en")
    assert "Teck Resources" in prof_hyphen["company_name"]
    assert "Copper" in prof_hyphen["company_background"] or "mining" in prof_hyphen["company_background"].lower()
    assert prof_hyphen["is_institutional_verified"] is True

    prof_dot = CompanyProfileEngine.get_profile("TECK.B.TO", lang="en")
    assert "Teck Resources" in prof_dot["company_name"]
    assert prof_dot["is_institutional_verified"] is True

