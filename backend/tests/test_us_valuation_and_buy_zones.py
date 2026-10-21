import pytest
from backend.engines.pricing_engine import PricingEngine


def test_smci_hardware_assembler_classification_and_reasonable_valuation():
    """
    Verify that Super Micro Computer (SMCI) hardware assembler:
    - Is excluded from high-growth software/platform margin expansion (no 20% margin on $39B revenue)
    - Uses audited baseline FCF ($420M) and hardware exit multiple (14.0x)
    - Yields a realistic fair value (< $40) rather than absurd $546 fantasy
    - Buy zone ceiling anchors near 200D SMA support
    - Timing advice accurately recognizes price is near 200D SMA support while trading above DCF
    """
    smci_stock = {
        "symbol": "SMCI",
        "company_name": "Super Micro Computer, Inc.",
        "sector": "Technology",
        "industry": "Computer Hardware",
        "current_price": 35.50,
        "fifty_day_sma": 38.20,
        "two_hundred_day_sma": 36.53,
        "shares_outstanding": 585_000_000.0,
        "market_cap": 20_767_500_000.0,
        "total_debt": 2_600_000_000.0,
        "total_cash": 1_200_000_000.0,
        "free_cash_flow": 420_000_000.0,
        "revenue_growth": 0.45,
        "moat_rating": "None",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(smci_stock, lang="en")
    assert res["is_valid"] is True
    assert res["dcf_fair_value"] < 40.0  # Real hardware DCF, not $546!
    assert 28.0 <= res["ideal_buy_range_max"] <= 38.0
    assert res["action_status"] == "PULLBACK_WATCH"
    assert "200D SMA technical support" in res["timing_advice"]
    assert "above conservative DCF" in res["timing_advice"]


def test_et_midstream_mlp_corporate_debt_clamp():
    """
    Verify that Energy Transfer LP (ET) US midstream MLP:
    - Does NOT bypass corporate debt completely like Canadian rate-base utilities (TRP.TO)
    - Caps recourse net debt deduction at 35% of EV, preventing equity value inflation to $80
    - DCF fair value lands in realistic $10 - $22 range
    - Buy zone brackets near 200D SMA support ($18 - $20.50)
    """
    et_stock = {
        "symbol": "ET",
        "company_name": "Energy Transfer LP",
        "sector": "Energy",
        "industry": "Oil & Gas Midstream",
        "current_price": 20.14,
        "fifty_day_sma": 19.80,
        "two_hundred_day_sma": 20.72,
        "shares_outstanding": 3_433_000_000.0,
        "market_cap": 69_140_000_000.0,
        "total_debt": 73_400_000_000.0,
        "total_cash": 3_200_000_000.0,
        "free_cash_flow": 3_160_000_000.0,
        "revenue_growth": 0.04,
        "moat_rating": "Narrow",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(et_stock, lang="en")
    assert res["is_valid"] is True
    # Fair value must be in $10 - $22 range (vs broken $80.32)
    assert 10.0 <= res["dcf_fair_value"] <= 22.0
    # Net debt deduction must be positive (debt is deducted, not zeroed out)
    assert res["bridge"]["less_total_debt"] > 0.0
    assert 17.0 <= res["ideal_buy_range_max"] <= 21.0
    assert res["action_status"] == "PULLBACK_WATCH"


def test_vst_independent_power_producer_dcf():
    """
    Verify that Vistra Corp. (VST) independent power producer (IPP):
    - Is recognized as IPP and routes to merchant DCF rather than regulated utility DDM
    - Bypasses the 17.5x P/E cap and dividend payout limitation of Sub-Engine 2
    - Reflects merchant power cash generation with DCF fair value >= $95 (vs broken $61.13)
    - Buy zone ceiling reflects 200D SMA support
    """
    vst_stock = {
        "symbol": "VST",
        "company_name": "Vistra Corp.",
        "sector": "Utilities",
        "industry": "Independent Power and Renewable Electricity Producers",
        "current_price": 157.68,
        "fifty_day_sma": 152.10,
        "two_hundred_day_sma": 146.81,
        "shares_outstanding": 344_000_000.0,
        "market_cap": 54_240_000_000.0,
        "total_debt": 15_800_000_000.0,
        "total_cash": 1_100_000_000.0,
        "free_cash_flow": 2_850_000_000.0,
        "revenue_growth": 0.12,
        "moat_rating": "Narrow",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(vst_stock, lang="en")
    assert res["is_valid"] is True
    # DCF fair value must be >= $95 (reflecting commercial DCF, not utility DDM capped at $61)
    assert res["dcf_fair_value"] >= 95.0
    assert res["bridge"]["terminal_exit_multiple_used"] == 17.5
    assert 130.0 <= res["ideal_buy_range_max"] <= 155.0


def test_retail_champions_lease_adjustment_and_capex_credit_wmt_cost():
    """
    Verify that US retail champions (WMT, COST):
    - Avoid ASC 842 capitalized store lease double-counting via funded debt ratio
    - Receive 25% growth CapEx credit for supply chain automation and warehouse openings
    - Avoid unrealistic pre-split price crash requirements
    """
    wmt_stock = {
        "symbol": "WMT",
        "company_name": "Walmart Inc.",
        "sector": "Consumer Defensive",
        "industry": "Discount Stores",
        "current_price": 117.80,
        "fifty_day_sma": 114.50,
        "two_hundred_day_sma": 109.78,
        "shares_outstanding": 8_010_000_000.0,
        "market_cap": 943_500_000_000.0,
        "total_debt": 75_000_000_000.0,
        "total_cash": 10_500_000_000.0,
        "free_cash_flow": 15_100_000_000.0,
        "operating_cash_flow": 36_000_000_000.0,
        "capex": 20_900_000_000.0,
        "revenue_growth": 0.055,
        "beta": 0.58,
        "stock_based_compensation": 1_810_000_000.0,
        "moat_rating": "Wide Moat",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(wmt_stock, lang="en")
    assert res["is_valid"] is True
    # Fair value should reflect retail compounder multiple (~$65 - $95 vs broken $47.31)
    assert 65.0 <= res["dcf_fair_value"] <= 95.0
    # Buy zone ceiling converges near 200D SMA support ($100 - $115 vs broken $37.85)
    assert 98.0 <= res["ideal_buy_range_max"] <= 115.0


def test_ko_compounder_200d_convergence_eliminates_cliff_edge():
    """
    Verify that Coca-Cola (KO) quality compounder:
    - Does NOT suffer a 40% buy zone cliff-edge drop when price is within 10% of 200D SMA
    - Buy zone ceiling brackets 200D SMA support ($85 - $91) rather than collapsing to $55
    """
    ko_stock = {
        "symbol": "KO",
        "company_name": "The Coca-Cola Company",
        "sector": "Consumer Defensive",
        "industry": "Beverages - Non-Alcoholic",
        "current_price": 92.67,
        "fifty_day_sma": 90.10,
        "two_hundred_day_sma": 88.18,
        "shares_outstanding": 4_290_000_000.0,
        "market_cap": 397_500_000_000.0,
        "total_debt": 44_000_000_000.0,
        "total_cash": 17_000_000_000.0,
        "free_cash_flow": 9_800_000_000.0,
        "revenue_growth": 0.03,
        "moat_rating": "Wide Moat",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(ko_stock, lang="en")
    assert res["is_valid"] is True
    # Buy zone ceiling must bracket 200D SMA support ($85 - $91), not $55!
    assert 84.0 <= res["ideal_buy_range_max"] <= 91.0


def test_fcx_timing_prose_differentiates_technical_support_from_dcf():
    """
    Verify that Freeport-McMoRan (FCX) copper miner:
    - Consolidating near 200D SMA ($70.45) with price $68.89 and conservative DCF $17.08
    - Timing advice accurately states price is consolidating near 200D SMA technical support
    - Eliminates contradiction claiming price is 'near intrinsic fair value ($17.08)'
    """
    fcx_stock = {
        "symbol": "FCX",
        "company_name": "Freeport-McMoRan Inc.",
        "sector": "Basic Materials",
        "industry": "Copper",
        "current_price": 68.89,
        "fifty_day_sma": 67.20,
        "two_hundred_day_sma": 70.45,
        "shares_outstanding": 1_435_000_000.0,
        "market_cap": 98_800_000_000.0,
        "total_debt": 9_500_000_000.0,
        "total_cash": 4_800_000_000.0,
        "free_cash_flow": 2_400_000_000.0,
        "revenue_growth": 0.08,
        "moat_rating": "Narrow",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(fcx_stock, lang="en")
    assert res["is_valid"] is True
    assert res["action_status"] == "PULLBACK_WATCH"
    # Timing advice must correctly explain 200D SMA support above DCF
    assert "200D SMA technical support" in res["timing_advice"]
    assert "above conservative DCF" in res["timing_advice"]
    assert "near technical support and intrinsic fair value" not in res["timing_advice"]


def test_broadcom_avgo_post_vmware_dcf_calibration():
    """
    Verify Broadcom (AVGO) post-VMware valuation:
    - Incorporates post-VMware cash flow scale ($30.6B)
    - Accurately balances VMware acquisition debt
    - Fair value reflects institutional reality ($300 - $340) vs broken $244
    """
    avgo_stock = {
        "symbol": "AVGO",
        "company_name": "Broadcom Inc.",
        "sector": "Technology",
        "industry": "Semiconductors",
        "current_price": 337.80,
        "fifty_day_sma": 348.50,
        "two_hundred_day_sma": 369.62,
        "shares_outstanding": 4_680_000_000.0,
        "market_cap": 1_580_000_000_000.0,
        "total_debt": 68_000_000_000.0,
        "total_cash": 10_000_000_000.0,
        "free_cash_flow": 30_600_000_000.0,
        "revenue_growth": 0.22,
        "beta": 1.48,
        "stock_based_compensation": 3_670_000_000.0,
        "moat_rating": "Wide Moat",
        "currency": "USD",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(avgo_stock, lang="en")
    assert res["is_valid"] is True
    assert 280.0 <= res["dcf_fair_value"] <= 340.0
    assert 285.0 <= res["ideal_buy_range_max"] <= 335.0
