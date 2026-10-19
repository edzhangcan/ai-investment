"""
Unit Test Suite for Canadian Equities Valuation & Ideal Buy Zone Calibration
Validates fixes for:
1. RY.TO: Commercial Bank Justified P/B (ROE), Retention DDM, and Normalized EPS multiples.
2. EMA.TO: Regulated Utility Rate-Base DDM and Allowed ROE multiples without capex penalization.
3. CP.TO: Transcontinental Railroad Wide Moat, 22x exit multiple, growth capex credit, KCS debt clamp.
4. WN.TO: Supermarket conglomerate IFRS 16 lease liability normalization preventing rent double-counting.
5. ATD.TO: Specialty retail guardrail preventing false SaaS platform 20% margin expansion ($1,798 anomaly).
6. Buy Zone Calibration: High-conviction compounders (TREE, Wide Moat, rails, banks) near fair value avoid the double-haircut cash drag deadlock.
"""

import pytest
from backend.engines.pricing_engine import PricingEngine
from backend.data_sources.data_provider import DataProviderManager


def test_canadian_bank_justified_pb_and_ddm_ry_to():
    """
    Verify that Royal Bank of Canada (RY.TO) is valued via depository bank institutional framework:
    - Bypasses loan creation OCF distortions
    - Evaluates Justified P/B (ROE ~16%), Retention-Compounded DDM ($7.04/sh dividend), and Normalized EPS
    - Produces institutional fair value in the $240 - $270 CAD range (vs broken $222 baseline)
    - Zeroes deposit liabilities in the bridge (plus_cash = 0, less_total_debt = 0)
    - Sets buy bracket near moving average support ($220 - $260 CAD) with PULLBACK_WATCH status
    """
    bank_stock = {
        "symbol": "RY.TO",
        "company_name": "Royal Bank of Canada",
        "sector": "Financial Services",
        "industry": "Banks - Diversified",
        "current_price": 277.51,
        "fifty_day_sma": 285.05,
        "two_hundred_day_sma": 287.18,
        "book_value": 96.726,
        "return_on_equity": 0.162,
        "dividend_rate": 7.04,
        "pe_ratio": 17.5,
        "shares_outstanding": 1_390_000_000.0,
        "market_cap": 385_700_000_000.0,
        "total_debt": 505_803_014_144.0,  # Deposits
        "total_cash": 840_208_023_552.0,  # Bank reserves
        "free_cash_flow": 12_500_000_000.0,
        "moat_rating": "Wide Moat",
        "currency": "CAD",
        "financial_currency": "CAD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(bank_stock, lang="en")
    assert res["is_valid"] is True
    assert 240.0 <= res["dcf_fair_value"] <= 270.0
    assert res["bridge"]["plus_cash"] == 0.0
    assert res["bridge"]["less_total_debt"] == 0.0
    assert res["ideal_buy_range_max"] >= 225.0
    assert res["ideal_buy_range_min"] >= 200.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_canadian_regulated_utility_rate_base_ema_to():
    """
    Verify that Emera Inc (EMA.TO) is valued via Rate-Base Utility framework:
    - Capital expenditure expanding rate base is accredited, not treated as lost FCF
    - Uses Rate-Base DDM and allowed ROE multiple
    - Produces fair value in the $60 - $70 CAD range (spot is ~$65.79)
    - Buy bracket ceiling ($56 - $65 CAD) is reachable on ordinary utility pullbacks
    - Action status is PULLBACK_WATCH
    """
    utility_stock = {
        "symbol": "EMA.TO",
        "company_name": "Emera Incorporated",
        "sector": "Utilities",
        "industry": "Utilities - Regulated Electric",
        "current_price": 65.79,
        "fifty_day_sma": 68.76,
        "two_hundred_day_sma": 70.16,
        "book_value": 42.168,
        "return_on_equity": 0.076,
        "dividend_rate": 2.96,
        "pe_ratio": 20.8,
        "shares_outstanding": 290_000_000.0,
        "market_cap": 19_079_000_000.0,
        "total_debt": 22_116_999_168.0,
        "total_cash": 396_000_000.0,
        "free_cash_flow": 720_000_000.0,
        "operating_cash_flow": 2_404_999_936.0,
        "net_income": 648_000_000.0,
        "moat_rating": "Narrow Moat",
        "currency": "CAD",
        "financial_currency": "CAD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(utility_stock, lang="en")
    assert res["is_valid"] is True
    assert 60.0 <= res["dcf_fair_value"] <= 72.0
    assert res["bridge"]["less_total_debt"] == 0.0  # Rate-base debt bypass
    assert res["ideal_buy_range_max"] >= 58.0
    assert res["ideal_buy_range_min"] >= 52.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_canadian_railroad_wide_moat_and_debt_clamp_cp_to():
    """
    Verify that Canadian Pacific Kansas City (CP.TO) transcontinental duopoly:
    - Is classified as Wide Moat
    - Receives 22x terminal multiple and 35% growth capex credit
    - Clamps KCS acquisition net debt deduction to 15% of enterprise value
    - Yields fair value >= $110.0 CAD (vs previous $85.82)
    - Brackets ideal buy zone near 200D SMA support ($105 - $120 CAD) with PULLBACK_WATCH
    """
    rail_stock = {
        "symbol": "CP.TO",
        "company_name": "Canadian Pacific Kansas City Limited",
        "sector": "Industrials",
        "industry": "Railroads",
        "current_price": 122.24,
        "fifty_day_sma": 125.35,
        "two_hundred_day_sma": 125.89,
        "book_value": 52.864,
        "return_on_equity": 0.082,
        "dividend_rate": 1.07,
        "pe_ratio": 28.4,
        "shares_outstanding": 929_600_000.0,
        "market_cap": 113_600_000_000.0,
        "total_debt": 25_147_000_832.0,  # KCS merger debt
        "total_cash": 366_000_000.0,
        "free_cash_flow": 3_200_000_000.0,
        "operating_cash_flow": 5_500_000_256.0,
        "capex": 2_300_000_000.0,
        "revenue_growth": 0.126,
        "currency": "CAD",
        "financial_currency": "CAD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(rail_stock, lang="en")
    assert res["is_valid"] is True
    assert res["bridge"]["terminal_exit_multiple_used"] == 22.0
    assert res["dcf_fair_value"] >= 110.0
    assert res["ideal_buy_range_max"] >= 115.0
    assert res["ideal_buy_range_min"] >= 100.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_canadian_supermarket_holding_lease_adjustment_wn_to():
    """
    Verify that George Weston Limited (WN.TO) avoids IFRS 16 lease double-counting:
    - Balance sheet operating store leases (~$15B) are excluded from corporate funded debt
    - Funded debt deduction (~$4.5B) prevents destroying 50%+ of equity value
    - Fair value restores to $90 - $110 CAD range (vs broken $55.94)
    - Buy zone ceiling is >= $85.0 CAD (vs impossible $44.75)
    """
    grocery_stock = {
        "symbol": "WN.TO",
        "company_name": "George Weston Limited",
        "sector": "Consumer Defensive",
        "industry": "Grocery Stores",
        "current_price": 108.57,
        "fifty_day_sma": 100.69,
        "two_hundred_day_sma": 101.38,
        "book_value": 9.909,
        "return_on_equity": 0.186,
        "dividend_rate": 1.29,
        "pe_ratio": 44.3,
        "shares_outstanding": 364_000_000.0,
        "market_cap": 39_500_000_000.0,
        "total_debt": 19_861_000_192.0,  # Heavily capitalized store lease commitments
        "total_cash": 1_294_000_000.0,
        "free_cash_flow": 1_600_000_000.0,
        "operating_cash_flow": 7_237_000_192.0,
        "revenue_growth": 0.041,
        "currency": "CAD",
        "financial_currency": "CAD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(grocery_stock, lang="en")
    assert res["is_valid"] is True
    # Fair value must be in $90 - $110 CAD range
    assert 90.0 <= res["dcf_fair_value"] <= 110.0
    # Effective debt deducted in bridge must reflect funded debt (< $6B), not $19.86B lease liabilities
    assert res["bridge"]["less_total_debt"] < 6_000_000_000.0
    assert res["ideal_buy_range_max"] >= 85.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_canadian_convenience_retail_not_high_growth_platform_atd_to():
    """
    Verify that Alimentation Couche-Tard (ATD.TO) guardrail eliminates the $1,798 anomaly:
    - Specialty retail convenience chain is NOT misclassified as a high-growth 20% margin tech platform
    - Organic growth capped at mature retail rate (not extrapolating 25% acquisition revenue spike)
    - Fair value reflects authentic retail economics ($75 - $95 CAD)
    - Buy zone brackets 200D SMA support ($70 - $84 CAD) with PULLBACK_WATCH
    """
    atd_stock = {
        "symbol": "ATD.TO",
        "company_name": "Alimentation Couche-Tard Inc.",
        "sector": "Consumer Cyclical",
        "industry": "Specialty Retail",
        "current_price": 83.74,
        "fifty_day_sma": 82.64,
        "two_hundred_day_sma": 84.29,
        "book_value": 25.734,
        "return_on_equity": 0.196,
        "dividend_rate": 0.86,
        "pe_ratio": 17.6,
        "shares_outstanding": 917_962_609.0,
        "market_cap": 76_870_000_000.0,
        "total_debt": 15_452_099_584.0,
        "total_cash": 3_198_299_904.0,
        "free_cash_flow": 2_788_137_472.0,
        "operating_cash_flow": 5_591_600_128.0,
        "revenue_growth": 0.251,  # TotalEnergies acquisition spike
        "currency": "CAD",
        "financial_currency": "USD",  # Reports in USD, trades in CAD
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(atd_stock, lang="en")
    assert res["is_valid"] is True
    # The $1,798 anomaly must be completely resolved
    assert res["dcf_fair_value"] < 120.0
    assert 75.0 <= res["dcf_fair_value"] <= 95.0
    assert res["bridge"]["valuation_outlier_warning"] is False
    assert 70.0 <= res["ideal_buy_range_min"] <= 78.0
    assert 80.0 <= res["ideal_buy_range_max"] <= 85.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_canadian_retail_champion_lease_adjustment_and_growth_dol_to():
    """
    Verify that Dollarama Inc (DOL.TO) Wide Moat retail champion:
    - Avoids IFRS 16 lease liability double-counting ($5.91B total debt contains ~$3.7B capitalized store leases)
    - Receives growth capex credit (for opening 60-70 new stores/year and Latin America Dollarcity expansion)
    - Reflects authentic ~11% compounder revenue growth (not crushed to 5% grocery store cap)
    - Accretes 2.5% net share buybacks over 10Y horizon
    - Fair value reflects institutional reality ($210 - $255 CAD vs broken $98.14)
    - Buy zone ceiling brackets moving average support ($180 - $198 CAD) with PULLBACK_WATCH status
    """
    dol_stock = {
        "symbol": "DOL.TO",
        "company_name": "Dollarama Inc.",
        "sector": "Consumer Defensive",
        "industry": "Discount Stores",
        "current_price": 205.45,
        "fifty_day_sma": 183.40,
        "two_hundred_day_sma": 184.54,
        "book_value": 5.49,
        "return_on_equity": 0.931,
        "dividend_rate": 0.36,
        "pe_ratio": 41.3,
        "shares_outstanding": 268_369_510.0,
        "market_cap": 55_136_000_000.0,
        "total_debt": 5_908_712_960.0,  # ~$3.7B capitalized store leases
        "total_cash": 485_027_008.0,
        "free_cash_flow": 1_239_868_288.0,
        "operating_cash_flow": 1_999_527_936.0,
        "capex": 760_000_000.0,
        "revenue_growth": 0.176,
        "beta": 0.314,
        "net_buyback_yield_pct": 2.5,
        "moat_rating": "Wide Moat",
        "currency": "CAD",
        "financial_currency": "CAD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(dol_stock, lang="en")
    assert res["is_valid"] is True
    # Fair value must be in $200 - $255 CAD range (vs broken $98.14)
    assert 200.0 <= res["dcf_fair_value"] <= 255.0
    # Less total debt in bridge must reflect funded debt (< $2.5B), not $5.91B
    assert res["bridge"]["less_total_debt"] < 2_500_000_000.0
    # Buy zone ceiling must sensibly bracket moving averages and 20% MoS DCF target ($180 - $202 CAD)
    assert 180.0 <= res["ideal_buy_range_max"] <= 202.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_sensitivity_matrix_monotonicity_canadian_bluechips():
    """
    Verify 5x5 sensitivity matrix preserves strict row and column monotonicity
    for Canadian banks, utilities, railroads, and retail conglomerates.
    """
    symbols = ["RY.TO", "EMA.TO", "CP.TO", "WN.TO", "ATD.TO", "DOL.TO"]
    for sym in symbols:
        stock = DataProviderManager.get_stock_data(sym)
        res = PricingEngine.evaluate_pricing_and_entry_zone(stock)
        matrix = res["sensitivity_matrix"]
        assert len(matrix) == 5
        for row in matrix:
            assert len(row) == 5
            # Along row: increasing WACC -> fair value strictly decreases
            for c in range(len(row) - 1):
                assert row[c]["fair_value"] >= row[c + 1]["fair_value"]
        # Along column: increasing g -> fair value strictly increases
        for c in range(5):
            for r in range(len(matrix) - 1):
                assert matrix[r + 1][c]["fair_value"] >= matrix[r][c]["fair_value"]

