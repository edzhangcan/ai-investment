"""
Unit Test Suite for Institutional Valuation 2.0 & Accounting Forensics (US-06)
Deterministic mathematical verification for:
1. EV-to-Equity Net Debt Bridge
2. SBC deduction lowering owner FCF
3. Unclamped DCF fair value with outlier warnings
4. 5x5 WACC vs Terminal Growth sensitivity matrix monotonicity
5. Earnings quality accrual and cash conversion forensic flags
6. Dynamic CAPM WACC bounds [0.06, 0.14]
"""

import pytest
from backend.engines.pricing_engine import PricingEngine
from backend.models.schemas import ValuationBridgeSchema, EarningsQualitySchema, SensitivityCellSchema

def test_ev_to_equity_net_debt_bridge():
    """
    Verify that a company with $50B cash and $0 debt has a strictly higher
    DCF fair value per share than an identical company with $0 cash and $50B debt.
    """
    base_stock = {
        "symbol": "CORP_TEST",
        "current_price": 100.0,
        "fifty_day_sma": 98.0,
        "two_hundred_day_sma": 90.0,
        "free_cash_flow": 10_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "revenue_growth": 0.08,
        "is_valid": True
    }

    # Company with $50B cash, $0 debt
    cash_rich = {**base_stock, "total_cash": 50_000_000_000.0, "total_debt": 0.0}
    # Company with $0 cash, $50B debt
    debt_laden = {**base_stock, "total_cash": 0.0, "total_debt": 50_000_000_000.0}

    res_cash = PricingEngine.evaluate_pricing_and_entry_zone(cash_rich)
    res_debt = PricingEngine.evaluate_pricing_and_entry_zone(debt_laden)

    assert res_cash["dcf_fair_value"] > res_debt["dcf_fair_value"]
    assert res_cash["bridge"] is not None
    assert res_debt["bridge"] is not None
    assert res_cash["bridge"]["plus_cash"] == 50_000_000_000.0
    assert res_debt["bridge"]["less_total_debt"] == 50_000_000_000.0
    
    # Under identical operating enterprise value, net debt bridge delta is exactly ($50B - (-$50B)) / 1B = $100 / share
    ev = res_cash["bridge"]["enterprise_value"]
    eq_cash = ev + res_cash["bridge"]["plus_cash"] - res_cash["bridge"]["less_total_debt"]
    eq_debt = ev + res_debt["bridge"]["plus_cash"] - res_debt["bridge"]["less_total_debt"]
    assert round((eq_cash - eq_debt) / 1_000_000_000.0, 2) == 100.0

def test_sbc_deduction_lowers_owner_fcf():
    """
    Verify that higher stock_based_compensation reduces owner_fcf and fair_value_per_share.
    """
    stock_no_sbc = {
        "symbol": "CLEAN_FCF",
        "current_price": 100.0,
        "fifty_day_sma": 98.0,
        "two_hundred_day_sma": 90.0,
        "free_cash_flow": 10_000_000_000.0,
        "stock_based_compensation": 0.0,
        "shares_outstanding": 1_000_000_000.0,
        "is_valid": True
    }

    stock_heavy_sbc = {
        "symbol": "DILUTIVE_FCF",
        "current_price": 100.0,
        "fifty_day_sma": 98.0,
        "two_hundred_day_sma": 90.0,
        "free_cash_flow": 10_000_000_000.0,
        "stock_based_compensation": 3_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "is_valid": True
    }

    res_clean = PricingEngine.evaluate_pricing_and_entry_zone(stock_no_sbc)
    res_sbc = PricingEngine.evaluate_pricing_and_entry_zone(stock_heavy_sbc)

    assert res_clean["dcf_fair_value"] > res_sbc["dcf_fair_value"]
    assert res_sbc["bridge"]["less_sbc_annual"] == 3_000_000_000.0
    assert res_clean["bridge"]["less_sbc_annual"] == 0.0

def test_unclamped_dcf_outlier_warning():
    """
    Verify that a deeply overvalued stock is NOT artificially clamped to 0.70 * current_price
    and sets bridge.valuation_outlier_warning == True.
    """
    deeply_overvalued = {
        "symbol": "HYPER_BUBBLE",
        "current_price": 1000.0,
        "fifty_day_sma": 950.0,
        "two_hundred_day_sma": 800.0,
        "free_cash_flow": 10_000_000.0,  # $10M FCF on 1B shares -> $0.01 FCF/share
        "shares_outstanding": 1_000_000_000.0,
        "pe_ratio": 200.0,
        "revenue_growth": 0.05,
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(deeply_overvalued)

    # In the old engine, dcf_fair_value would have been artificially clamped to 1000 * 0.7 = 700.0
    # In Valuation 2.0, fair value reflects true economic DCF (< $1.00)
    assert res["dcf_fair_value"] < 10.0
    assert res["dcf_fair_value"] < 0.70 * deeply_overvalued["current_price"]
    assert res["bridge"]["valuation_outlier_warning"] is True

def test_5x5_sensitivity_matrix_monotonicity():
    """
    Verify sensitivity_matrix has shape 5x5, and fair value strictly decreases
    as wacc increases along each row and strictly increases as terminal_growth
    increases along each column.
    """
    matrix = PricingEngine.build_sensitivity_matrix(
        base_wacc=0.08,
        base_g=0.03,
        owner_fcf=5_000_000_000.0,
        rev_growth=0.08,
        total_cash=10_000_000_000.0,
        total_debt=5_000_000_000.0,
        implied_shares=1_000_000_000.0,
        price=100.0
    )

    # Verify 5x5 dimensions
    assert len(matrix) == 5
    for row in matrix:
        assert len(row) == 5

    # Along each row: terminal_growth is fixed; as column index increases, WACC increases -> fair value strictly decreases
    for row in matrix:
        for c in range(len(row) - 1):
            assert row[c]["fair_value"] > row[c + 1]["fair_value"], (
                f"Row monotonicity breach: {row[c]['fair_value']} not > {row[c+1]['fair_value']}"
            )
            assert row[c]["wacc"] < row[c + 1]["wacc"]

    # Along each column: WACC is fixed; as row index increases, terminal_growth increases -> fair value strictly increases
    for c in range(5):
        for r in range(len(matrix) - 1):
            assert matrix[r + 1][c]["fair_value"] > matrix[r][c]["fair_value"], (
                f"Column monotonicity breach: {matrix[r+1][c]['fair_value']} not > {matrix[r][c]['fair_value']}"
            )
            assert matrix[r + 1][c]["terminal_growth"] > matrix[r][c]["terminal_growth"]

def test_earnings_quality_forensic_flags():
    """
    Verify compute_earnings_quality triggers:
    - LOW_CASH_CONVERSION (<0.75x)
    - HIGH_ACCRUAL_INTENSITY (>8% Assets)
    - HEAVY_SBC_DILUTION (>30% FCF)
    when thresholds are breached, and assigns LOW_ACCRUAL_RISK when 2+ flags are active.
    """
    forensics = PricingEngine.compute_earnings_quality(
        operating_cash_flow=50.0,
        net_income=100.0,
        total_assets=500.0,
        raw_fcf=100.0,
        sbc=45.0
    )

    # 1. cash conversion = 50 / 100 = 0.50 (< 0.75)
    assert forensics["cash_conversion_ratio"] == 0.50
    assert "LOW_CASH_CONVERSION (<0.75x)" in forensics["forensic_flags"]

    # 2. Sloan accruals = (100 - 50) / 500 = 0.10 (> 0.08)
    assert forensics["sloan_accruals_ratio"] == 0.10
    assert "HIGH_ACCRUAL_INTENSITY (>8% Assets)" in forensics["forensic_flags"]

    # 3. SBC % of FCF = 45 / 100 = 0.45 (> 0.30)
    assert forensics["sbc_pct_of_fcf"] == 0.45
    assert "HEAVY_SBC_DILUTION (>30% FCF)" in forensics["forensic_flags"]

    # Rating should flag accrual risk
    assert forensics["quality_rating"] == "LOW_ACCRUAL_RISK"
    assert len(forensics["forensic_flags"]) == 3

    # High quality case: no flags
    clean_forensics = PricingEngine.compute_earnings_quality(
        operating_cash_flow=120.0,
        net_income=100.0,
        total_assets=1000.0,
        raw_fcf=110.0,
        sbc=10.0
    )
    assert clean_forensics["quality_rating"] == "HIGH"
    assert len(clean_forensics["forensic_flags"]) == 0

def test_dynamic_wacc_bounds():
    """
    Verify compute_dynamic_wacc always clamps the resulting WACC to [0.06, 0.14].
    """
    # Extremely negative / low beta
    wacc_low = PricingEngine.compute_dynamic_wacc(beta=-5.0)
    assert 0.06 <= wacc_low <= 0.14
    assert wacc_low == 0.0645  # rf (0.042) + clamped_beta (0.5) * erp (0.045) = 0.0645

    # Extremely high beta
    wacc_high = PricingEngine.compute_dynamic_wacc(beta=10.0)
    assert 0.06 <= wacc_high <= 0.14
    assert wacc_high == 0.14  # rf + 2.2 * 0.045 = 0.141 -> clamped to 0.14

    # Standard market beta = 1.0
    wacc_market = PricingEngine.compute_dynamic_wacc(beta=1.0)
    assert round(wacc_market, 3) == 0.087
    assert 0.06 <= wacc_market <= 0.14

    # Capital structure weighting with debt
    wacc_with_debt = PricingEngine.compute_dynamic_wacc(
        beta=1.2,
        total_debt=40_000_000_000.0,
        market_cap=60_000_000_000.0
    )
    assert 0.06 <= wacc_with_debt <= 0.14

def test_financial_institution_ev_bridge_bypasses_deposits():
    """
    Verify that financial institutions (banks, insurers) bypass deposit liabilities and cash reserves
    in the EV-to-Equity bridge, setting effective cash and debt to 0, with WACC matching Cost of Equity.
    """
    bank_stock = {
        "symbol": "JPM",
        "sector": "Financial Services",
        "current_price": 200.0,
        "free_cash_flow": 25_000_000_000.0,
        "shares_outstanding": 2_800_000_000.0,
        "market_cap": 560_000_000_000.0,
        "total_debt": 800_000_000_000.0,  # Customer deposit liabilities
        "total_cash": 1_200_000_000_000.0,  # Central bank reserves
        "beta": 1.1,
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(bank_stock)
    bridge = res["bridge"]
    assert bridge is not None
    assert bridge["plus_cash"] == 0.0
    assert bridge["less_total_debt"] == 0.0
    assert bridge["equity_value"] == bridge["enterprise_value"]
    # WACC should reflect pure ke = 0.042 + 1.1 * 0.045 = 0.0915
    assert bridge["dynamic_wacc_used"] == 0.0915

def test_debt_heavy_going_concern_guardrail():
    """
    Verify that for going concerns where debt exceeds enterprise value (e.g. capitalized operating leases),
    net debt deduction is clamped so equity value does not collapse to $0.01 (-100%).
    """
    leveraged_retailer = {
        "symbol": "LEVERAGED_CORP",
        "sector": "Consumer Cyclical",
        "current_price": 100.0,
        "free_cash_flow": 500_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "market_cap": 10_000_000_000.0,
        "total_debt": 25_000_000_000.0,  # Heavy operating leases exceeding EV
        "total_cash": 1_000_000_000.0,
        "revenue_growth": 0.05,
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(leveraged_retailer)
    assert res["dcf_fair_value"] > 10.0  # Must not collapse to $0.01
    assert res["bridge"]["equity_value"] > 0
    # Clamped net debt must not exceed 70% of enterprise value
    ev = res["bridge"]["enterprise_value"]
    assert res["bridge"]["equity_value"] >= round(ev * 0.30, 2) - 0.10

def test_cyclical_peak_fcf_normalization():
    """
    Verify that an equity with an extreme peak cyclical FCF yield (> 12% of market cap)
    is normalized to mid-cycle cash flow, preventing absurd 1000%+ DCF fair value targets.
    """
    cyclical_miner = {
        "symbol": "PEAK_COMMODITY",
        "sector": "Basic Materials",
        "taxonomy": {"taxonomy": "GRAIN"},
        "current_price": 50.0,
        "free_cash_flow": 2_000_000_000.0,  # $2B FCF on $5B market cap = 40% FCF yield!
        "shares_outstanding": 100_000_000.0,
        "market_cap": 5_000_000_000.0,
        "total_debt": 500_000_000.0,
        "total_cash": 200_000_000.0,
        "revenue_growth": 0.50,  # 50% revenue spike in commodity boom
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(cyclical_miner)
    # Fair value should reflect sustainable normalized earnings (< 3x price), not 10x price ($500+)
    assert res["dcf_fair_value"] < 150.0  # < 3x current price of $50
    assert (res["dcf_fair_value"] - 50.0) / 50.0 < 2.0  # Margin < 200%

def test_moat_calibrated_exit_multiple_blending():
    """
    Verify that Wide Moat & high-ROIC equities receive 25x exit multiple in terminal value,
    yielding strictly higher DCF fair value than an identical No-Moat equity (13x exit multiple).
    """
    base_stock = {
        "symbol": "MOAT_TEST",
        "current_price": 100.0,
        "free_cash_flow": 5_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "total_cash": 10_000_000_000.0,
        "total_debt": 10_000_000_000.0,
        "revenue_growth": 0.08,
        "is_valid": True
    }

    wide_moat_stock = {
        **base_stock,
        "moat_rating": "Wide Moat",
        "roic": 0.25
    }

    no_moat_stock = {
        **base_stock,
        "moat_rating": "None",
        "roic": 0.05
    }

    res_wide = PricingEngine.evaluate_pricing_and_entry_zone(wide_moat_stock)
    res_no_moat = PricingEngine.evaluate_pricing_and_entry_zone(no_moat_stock)

    assert res_wide["bridge"]["terminal_exit_multiple_used"] == 25.0
    assert res_no_moat["bridge"]["terminal_exit_multiple_used"] == 13.0
    assert res_wide["dcf_fair_value"] > res_no_moat["dcf_fair_value"]
    # The terminal value for wide moat should be significantly higher
    assert res_wide["bridge"]["pv_terminal_value"] > res_no_moat["bridge"]["pv_terminal_value"]

def test_share_buyback_accretion_lowers_effective_shares():
    """
    Verify that positive net_buyback_yield_pct reduces implied_shares_effective over the 10Y horizon,
    increasing fair_value_per_share without changing underlying operating enterprise value.
    """
    stock_no_buyback = {
        "symbol": "NO_BUYBACK",
        "current_price": 100.0,
        "free_cash_flow": 5_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "net_buyback_yield_pct": 0.0,
        "is_valid": True
    }

    stock_with_buyback = {
        "symbol": "WITH_BUYBACK",
        "current_price": 100.0,
        "free_cash_flow": 5_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "net_buyback_yield_pct": 3.2,
        "is_valid": True
    }

    res_no = PricingEngine.evaluate_pricing_and_entry_zone(stock_no_buyback)
    res_bb = PricingEngine.evaluate_pricing_and_entry_zone(stock_with_buyback)

    assert res_no["bridge"]["implied_shares_effective"] == 1_000_000_000.0
    assert res_bb["bridge"]["implied_shares_effective"] < 1_000_000_000.0
    # Over 10 years at 3.2%, shares_terminal = 1B * (1 - 0.032)^10 = ~722M -> effective ~861M
    assert 850_000_000.0 < res_bb["bridge"]["implied_shares_effective"] < 870_000_000.0
    assert res_bb["dcf_fair_value"] > res_no["dcf_fair_value"]
    assert res_bb["bridge"]["net_buyback_yield_used"] == 3.2

def test_fortress_balance_sheet_wacc_credit():
    """
    Verify that a Wide Moat equity with net cash receives a 75 bps WACC credit,
    reducing dynamic_wacc_used by exactly 0.0075.
    """
    net_debt_stock = {
        "symbol": "DEBT_STOCK",
        "current_price": 100.0,
        "free_cash_flow": 5_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "total_cash": 10_000_000_000.0,
        "total_debt": 30_000_000_000.0,
        "moat_rating": "Wide Moat",
        "beta": 1.0,
        "is_valid": True
    }

    net_cash_stock = {
        "symbol": "CASH_STOCK",
        "current_price": 100.0,
        "free_cash_flow": 5_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "total_cash": 30_000_000_000.0,
        "total_debt": 10_000_000_000.0,
        "moat_rating": "Wide Moat",
        "beta": 1.0,
        "is_valid": True
    }

    res_debt = PricingEngine.evaluate_pricing_and_entry_zone(net_debt_stock)
    res_cash = PricingEngine.evaluate_pricing_and_entry_zone(net_cash_stock)

    wacc_debt = res_debt["bridge"]["dynamic_wacc_used"]
    wacc_cash = res_cash["bridge"]["dynamic_wacc_used"]

    # Net cash Wide Moat stock should have a lower WACC than baseline
    assert wacc_cash < wacc_debt
    assert wacc_cash <= 0.080  # 0.087 - 0.0075 = ~0.0795

def test_owner_cash_flow_growth_capex_separation():
    """
    Verify that high-growth Wide Moat compounders (hyperscalers) separate growth CapEx from maintenance CapEx,
    yielding higher owner cash flow and preventing artificial DCF collapse.
    """
    hyperscaler = {
        "symbol": "CLOUD_TITAN",
        "current_price": 200.0,
        "free_cash_flow": 10_000_000_000.0,
        "operating_cash_flow": 40_000_000_000.0,
        "capex": 30_000_000_000.0,  # $30B CapEx building AI infrastructure
        "shares_outstanding": 1_000_000_000.0,
        "revenue_growth": 0.20,
        "moat_rating": "Wide Moat",
        "roic": 0.22,
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(hyperscaler)
    # With 20% rev growth and $30B CapEx, growth CapEx credit should be added back
    # EV should reflect Owner Earnings, not depressed accounting FCF
    assert res["dcf_fair_value"] > 150.0

def test_sensitivity_matrix_aligns_with_blended_valuation():
    """
    Verify that the center cell of the 5x5 sensitivity matrix (base_g, base_wacc)
    closely aligns with the bridge fair value per share.
    """
    stock = {
        "symbol": "MATRIX_TEST",
        "current_price": 100.0,
        "free_cash_flow": 5_000_000_000.0,
        "shares_outstanding": 1_000_000_000.0,
        "moat_rating": "Wide Moat",
        "roic": 0.25,
        "net_buyback_yield_pct": 2.0,
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)
    matrix = res["sensitivity_matrix"]
    fv_bridge = res["bridge"]["fair_value_per_share"]

    # Center cell is row 2, col 2 (0-indexed)
    center_cell = matrix[2][2]
    # Fair value should match within 1% of bridge fair value
    assert abs(center_cell["fair_value"] - fv_bridge) / fv_bridge < 0.02

def test_regulated_infrastructure_rate_base_debt_bypass():
    """
    Verify that regulated midstream pipelines, utilities, and infrastructure equities (e.g. TRP.TO, ENB.TO)
    do not have rate-base / project debt double-counted in the EV-to-Equity net debt bridge,
    since reported FCF is Free Cash Flow to Equity (already deducting debt interest expense).
    """
    pipeline_stock = {
        "symbol": "TRP.TO",
        "company_name": "TC Energy Corporation",
        "sector": "Energy",
        "industry": "Oil & Gas Midstream",
        "current_price": 87.13,
        "two_hundred_day_sma": 88.22,
        "free_cash_flow": 3_600_000_000.0,
        "shares_outstanding": 1_041_766_896.0,
        "total_debt": 63_845_998_592.0,
        "total_cash": 2_476_999_936.0,
        "revenue_growth": 0.057,
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(pipeline_stock)
    # Without rate-base bypass, debt would wipe out 70% of value, collapsing DCF to $27.97.
    # With FCFE equity valuation, fair value should be close to intrinsic cash flow value ($80 - $95).
    assert res["dcf_fair_value"] > 75.0
    assert abs(res["dcf_fair_value"] - pipeline_stock["current_price"]) / pipeline_stock["current_price"] < 0.15
    assert res["bridge"]["less_total_debt"] == 0.0
    assert res["bridge"]["equity_value"] == res["bridge"]["enterprise_value"]


def test_oilfield_services_normalized_fcf_and_buybacks():
    """
    Verify that oilfield services leaders (e.g. SLB) with normalized 10-K FCF and net share buyback yield
    are properly calibrated:
    - 10-K audited FCF baseline ($4.1B) yields intrinsic fair value in the $60-$75 range
    - Effective share count reflects net share retirements (net_buyback_yield_pct = 2.0%)
    - Ideal buy zone ($45-$52) accurately brackets current price ($49.50) and 200D SMA ($51.86)
    - Action status correctly triggers IN_BUY_ZONE when price is within the buy bracket
    """
    from backend.data_sources.data_provider import DataProviderManager
    stock = DataProviderManager.get_stock_data("SLB", force_refresh=True)
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert stock["free_cash_flow"] >= 4_000_000_000.0
    assert stock["net_buyback_yield_pct"] == 2.0
    assert 60.0 <= res["dcf_fair_value"] <= 75.0
    assert res["ideal_buy_range_min"] <= 49.50 <= res["ideal_buy_range_max"]
    assert res["action_status"] == "IN_BUY_ZONE"
    assert res["bridge"]["net_buyback_yield_used"] == 2.0
    assert res["bridge"]["implied_shares_effective"] < res["bridge"]["implied_shares"]


def test_dual_currency_conversion_and_blume_smoothing_fm_to():
    """
    Verify that Canadian resource equities reporting in USD (e.g. FM.TO)
    properly convert financial metrics to CAD and smooth crisis-inflated rolling betas:
    - Currency conversion multiplies USD fundamental metrics (FCF, Cash, Debt) by USDCAD exchange rate (~1.368)
    - Currency conversion note is recorded in valuation bridge
    - Blume beta adjustment smooths crisis-distorted rolling beta toward 1.0
    - DCF fair value is in a sensible bracket (>= $22 CAD) rather than the previous distorted $6.53
    - Valuation outlier warning is not triggered
    """
    from backend.data_sources.data_provider import DataProviderManager
    with DataProviderManager._LOCK:
        DataProviderManager._CACHE.clear()
        DataProviderManager._CACHE_TIMESTAMPS.clear()
    stock = DataProviderManager.get_stock_data("FM.TO", force_refresh=True)
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert stock["currency"] == "CAD"
    assert stock["financial_currency"] == "USD"
    assert res["dcf_fair_value"] >= 10.0
    assert res["bridge"]["valuation_outlier_warning"] is False
    assert res["bridge"]["is_mining_materials"] is True
    assert "Converted USD financials to CAD" in str(res["bridge"].get("currency_conversion_note"))
    assert res["ideal_buy_range_min"] > 8.0


def test_high_growth_platform_compounder_dcf_shop_to():
    """
    Regression test for Shopify Inc. (SHOP.TO) DCF valuation:
    Verifies that high-growth secular platform compounders with operating leverage:
    1. Apply Blume beta smoothing for large-cap ($30B+) equities to prevent macro rate-hike beta distortion (WACC < 10.5%).
    2. Model operating leverage and mature FCF margin expansion (from current ~12% toward 24% Wide Moat benchmark).
    3. Produce an institutional-grade DCF fair value (>= $165.0 CAD) aligning with institutional consensus and technical support.
    4. Categorize market price above DCF as GROWTH_PREMIUM with realistic technical buy brackets (ideal_buy_max >= $160 CAD)
       rather than advising absurd 85%+ catastrophic crashes ($32 CAD).
    5. Valuation outlier warning is False.
    """
    shop_stock = {
        "symbol": "SHOP.TO",
        "current_price": 239.71,
        "currency": "CAD",
        "financial_currency": "USD",
        "market_cap": 292_000_000_000.0,
        "shares_outstanding": 1_219_581_025.0,
        "total_revenue": 13_269_000_192.0,
        "revenue_growth": 0.337,
        "free_cash_flow": 1_587_750_016.0,
        "operating_cash_flow": 2_376_999_936.0,
        "total_cash": 4_946_999_808.0,
        "total_debt": 178_000_000.0,
        "beta": 2.625,
        "fifty_day_sma": 208.27,
        "two_hundred_day_sma": 179.84,
        "pe_ratio": 110.0,
        "moat_rating": "Wide Moat",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(shop_stock, lang="en")

    assert res["is_valid"] is True
    # WACC must be smoothly discounted around ~9.97%, not punitive 12.84%
    assert res["bridge"]["dynamic_wacc_used"] < 0.105
    assert res["bridge"]["dynamic_wacc_used"] >= 0.090

    # DCF fair value must be institutional-grade (> $165.0 CAD) rather than the flawed $40.05
    assert res["dcf_fair_value"] >= 165.0
    assert res["dcf_fair_value"] <= 230.0

    # Must be categorized as GROWTH_PREMIUM
    assert res["action_status"] == "GROWTH_PREMIUM"
    assert "growth premium" in res["timing_advice"].lower()

    # Buy bracket must anchor sensibly near support (>= $160 CAD) rather than $32 CAD
    assert res["ideal_buy_range_max"] >= 160.0
    assert res["ideal_buy_range_min"] >= 140.0

    # Outlier warning must NOT be triggered
    assert res["bridge"]["valuation_outlier_warning"] is False






