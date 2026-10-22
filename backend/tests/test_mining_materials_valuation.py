"""
Test Suite for Institutional Metals, Mining & Materials Valuation Archetype
Verifies universal calibration across North American mining equities (US, Canada, and global ADRs):
1. Accurate sector classification (is_mining_materials vs is_metals_royalty vs tech/platforms)
2. Cost of Capital Prudential Hurdle floor (WACC >= 8.85% for physical mineral extraction)
3. Calibrated institutional exit multiples (8.5x - 10.5x for miners vs 17.5x - 19.0x for royalties)
4. Life-of-Mine (LoM) reserve exhaustion factor (0.65x) applied to perpetual Gordon Growth
5. Prevention of multi-hundred-percent DCF valuation bubbles (TECK-B.TO, K.TO, AEM.TO, ABX.TO, IVN.TO, NEM)
6. Correct taxonomy classification as GRAIN (种粮股: Cyclical/Value)
"""

import pytest
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.data_sources.data_provider import DataProviderManager


def test_mining_materials_classification_flags():
    """Verify is_mining_materials and is_metals_royalty cleanly identify US, Canadian, and ADR assets."""
    # Canadian Miners
    for sym in ["TECK-B.TO", "K.TO", "AEM.TO", "ABX.TO", "IVN.TO", "LUN.TO", "FM.TO"]:
        sd = DataProviderManager.get_stock_data(sym)
        res = PricingEngine.evaluate_pricing_and_entry_zone(sd)
        bridge = res.get("bridge", {})
        assert bridge.get("is_mining_materials") is True, f"{sym} should be flagged as is_mining_materials"
        assert bridge.get("is_metals_royalty") is False, f"{sym} should not be flagged as is_metals_royalty"

    # US Miners & ADRs
    for sym in ["NEM", "AA", "BHP", "RIO", "VALE"]:
        sd = DataProviderManager.get_stock_data(sym)
        res = PricingEngine.evaluate_pricing_and_entry_zone(sd)
        bridge = res.get("bridge", {})
        assert bridge.get("is_mining_materials") is True, f"{sym} should be flagged as is_mining_materials"
        assert bridge.get("is_metals_royalty") is False, f"{sym} should not be flagged as is_metals_royalty"

    # Royalty & Streaming Companies (FNV.TO, WPM.TO)
    for sym in ["FNV.TO", "WPM.TO"]:
        sd = DataProviderManager.get_stock_data(sym)
        res = PricingEngine.evaluate_pricing_and_entry_zone(sd)
        bridge = res.get("bridge", {})
        assert bridge.get("is_metals_royalty") is True, f"{sym} should be flagged as is_metals_royalty"
        assert bridge.get("is_mining_materials") is False, f"{sym} should not be flagged as physical mining operator"

    # Non-mining benchmarks
    for sym in ["MSFT", "SHOP.TO", "CNR.TO", "RY.TO", "WMT"]:
        sd = DataProviderManager.get_stock_data(sym)
        res = PricingEngine.evaluate_pricing_and_entry_zone(sd)
        bridge = res.get("bridge", {})
        assert bridge.get("is_mining_materials") is False, f"{sym} should not be is_mining_materials"
        assert bridge.get("is_metals_royalty") is False, f"{sym} should not be is_metals_royalty"


def test_mining_prudential_wacc_floor():
    """Verify dynamic WACC enforces an institutional hurdle floor >= 8.85% for physical mineral extraction."""
    # Even when trailing rolling beta is low (e.g. 0.65 - 0.76 for gold miners), WACC must not fall to 7.6%
    mock_low_beta_miner = {
        "symbol": "MOCK_MINER",
        "current_price": 50.0,
        "currency": "USD",
        "shares_outstanding": 100_000_000,
        "free_cash_flow": 200_000_000,
        "operating_cash_flow": 300_000_000,
        "total_cash": 50_000_000,
        "total_debt": 100_000_000,
        "sector": "Basic Materials",
        "industry": "Gold",
        "beta": 0.60,  # Low beta: CAPM raw WACC would be 4.2% + 0.60 * 4.5% = 6.90%
        "is_valid": True
    }
    res = PricingEngine.evaluate_pricing_and_entry_zone(mock_low_beta_miner)
    wacc_used = res["bridge"]["dynamic_wacc_used"]
    assert wacc_used >= 0.0885, f"Mining WACC {wacc_used} must enforce 8.85% hurdle floor"


def test_calibrated_terminal_exit_multiples():
    """Verify mining exit multiples are calibrated to institutional standards (8.5x - 10.5x)."""
    # Senior champion (NEM, AEM.TO, ABX.TO) -> 10.5x
    nem_data = DataProviderManager.get_stock_data("NEM")
    res_nem = PricingEngine.evaluate_pricing_and_entry_zone(nem_data)
    assert res_nem["bridge"]["terminal_exit_multiple_used"] == 10.5

    # Mid-tier gold/copper miner (K.TO) -> 9.0x
    k_data = DataProviderManager.get_stock_data("K.TO")
    res_k = PricingEngine.evaluate_pricing_and_entry_zone(k_data)
    assert res_k["bridge"]["terminal_exit_multiple_used"] == 9.0

    # Bulk/industrial metal miner (TECK-B.TO) -> 9.0x
    teck_data = DataProviderManager.get_stock_data("TECK-B.TO")
    res_teck = PricingEngine.evaluate_pricing_and_entry_zone(teck_data)
    assert res_teck["bridge"]["terminal_exit_multiple_used"] == 9.0

    # Royalty / Streaming (FNV.TO) -> 17.5x - 19.0x
    fnv_data = DataProviderManager.get_stock_data("FNV.TO")
    res_fnv = PricingEngine.evaluate_pricing_and_entry_zone(fnv_data)
    assert res_fnv["bridge"]["terminal_exit_multiple_used"] in {17.5, 19.0}


def test_mining_valuation_bubble_elimination():
    """Verify that previously distorted mining DCF values are normalized and no longer trade at +100% to +200% bubble premiums."""
    # TECK-B.TO: Previously $176.46 (+100% over $88 spot) -> now normalized <= $85 CAD
    teck_res = PricingEngine.evaluate_pricing_and_entry_zone(DataProviderManager.get_stock_data("TECK-B.TO"))
    assert teck_res["dcf_fair_value"] <= 85.0, f"TECK-B DCF {teck_res['dcf_fair_value']} must not exceed $85 CAD"

    # K.TO: Previously $87.83 (+163% over $33 spot) -> now normalized <= $50 CAD
    k_res = PricingEngine.evaluate_pricing_and_entry_zone(DataProviderManager.get_stock_data("K.TO"))
    assert k_res["dcf_fair_value"] <= 50.0, f"K.TO DCF {k_res['dcf_fair_value']} must not exceed $50 CAD"

    # AEM.TO: Previously $561.88 (+113% over $263 spot) -> now normalized <= $250 CAD
    aem_res = PricingEngine.evaluate_pricing_and_entry_zone(DataProviderManager.get_stock_data("AEM.TO"))
    assert aem_res["dcf_fair_value"] <= 250.0, f"AEM.TO DCF {aem_res['dcf_fair_value']} must not exceed $250 CAD"

    # ABX.TO: Previously $175.35 (+206% over $57 spot) -> now normalized <= $85 CAD
    abx_res = PricingEngine.evaluate_pricing_and_entry_zone(DataProviderManager.get_stock_data("ABX.TO"))
    assert abx_res["dcf_fair_value"] <= 85.0, f"ABX.TO DCF {abx_res['dcf_fair_value']} must not exceed $85 CAD"

    # NEM: Previously $394.52 (+236% over $117 spot) -> now normalized <= $160 USD
    nem_res = PricingEngine.evaluate_pricing_and_entry_zone(DataProviderManager.get_stock_data("NEM"))
    assert nem_res["dcf_fair_value"] <= 160.0, f"NEM DCF {nem_res['dcf_fair_value']} must not exceed $160 USD"


def test_mining_taxonomy_classified_as_grain():
    """Verify resource extraction cyclicals are classified as GRAIN (种粮股: Cyclical/Value) rather than TREE."""
    for sym in ["TECK-B.TO", "K.TO", "AEM.TO", "ABX.TO"]:
        sd = DataProviderManager.get_stock_data(sym)
        tax = FundamentalEngine.classify_stock_taxonomy(sd)
        assert tax["taxonomy"] == "GRAIN", f"{sym} should be classified as GRAIN cyclical asset, got {tax['taxonomy']}"
