"""
Regression and Acceptance Test Suite for Epic PL-726:
Leading Technical/Macro Metrics, Structural Buy Ceilings, FCF Decay Integrity,
Constitutional Pre-Trade Vetoes & Adaptive Falsification Rules.
"""

import pytest
import pandas as pd
from typing import Dict, Any

from backend.data_sources.data_provider import DataProviderManager
from backend.services.alert_engine import PriceAlertEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.discipline_engine import DisciplineEngine
from backend.engines.portfolio_engine import PortfolioEngine


# --------------------------------------------------------------------------
# 1. Authentic Leading Technicals Computation (PL-726.1.1)
# --------------------------------------------------------------------------

def test_wilder_rsi14_sma20_atr14_and_vol_ratio_computation():
    """
    Verify DataProviderManager._compute_realtime_technicals_from_series calculates
    Wilder's RSI(14) dynamically (not hardcoded 54.0), 20D SMA, 14-day ATR,
    5D/20D volume ratio, and 50D SMA slope.
    """
    # Build 60 days of mock history with known drop at the end
    prices = [100.0 + (i * 0.5) for i in range(50)] # Rising to 124.5
    # Last 10 days drop from 124.5 down to 108.0
    prices += [122.0, 120.0, 117.0, 115.0, 113.0, 111.0, 109.5, 108.5, 108.0, 107.0]
    vols = [10_000_000 + (i * 100_000) for i in range(50)]
    # Higher volume on the drop
    vols += [12_000_000] * 5 + [25_000_000] * 5

    dates = pd.date_range(end="2026-11-06", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    hist_series = [
        {"date": d, "close": p, "volume": v, "high": p + 1.5, "low": p - 1.5}
        for d, p, v in zip(dates, prices, vols)
    ]

    techs = DataProviderManager._compute_realtime_technicals_from_series(
        historical_series=hist_series,
        current_price=107.0,
        fifty_day_sma=115.0
    )

    assert techs["twenty_day_sma"] > 0
    assert techs["twenty_day_sma"] != 107.0
    # Falling price series must result in low RSI (< 45.0) and NOT the old static 54.0
    assert techs["rsi_14"] < 45.0
    assert techs["rsi_14"] != 54.0
    assert techs["atr_14"] > 0.0
    assert techs["atr_14_pct"] > 0.0
    # Elevated drop volume must show vol_ratio_5d_20d > 1.20
    assert techs["vol_ratio_5d_20d"] > 1.20
    assert techs["up_down_vol_ratio_10d"] < 1.0


# --------------------------------------------------------------------------
# 2. FCF Decay Warning & Valuation Haircut (PL-726.1.2 & PL-726.2.2)
# --------------------------------------------------------------------------

def test_fcf_decay_warning_and_orcl_dcf_haircut():
    """
    Verify that when a company exhibits severe FCF deterioration (e.g. ORCL live FCF -$45.85B
    vs +$11.80B audited baseline), fcf_decay_warning is active and PricingEngine bounds
    dcf_fair_value below 1.55x spot price rather than producing a runaway 4x valuation.
    """
    orcl_stock = {
        "symbol": "ORCL",
        "company_name": "Oracle Corporation",
        "current_price": 149.66,
        "fifty_day_sma": 165.0,
        "two_hundred_day_sma": 155.0,
        "total_revenue": 53_000_000_000.0,
        "revenue_growth": 0.08,
        "free_cash_flow": 11_800_000_000.0,
        "operating_cash_flow": 18_000_000_000.0,
        "capex": 6_200_000_000.0,
        "total_debt": 85_000_000_000.0,
        "total_cash": 10_000_000_000.0,
        "shares_outstanding": 2_750_000_000.0,
        "market_cap": 411_000_000_000.0,
        "fcf_decay_warning": True,
        "live_reported_fcf": -45_850_000_000.0,
        "fcf_decay_ratio": -3.88,
        "moat_rating": "Wide Moat",
        "is_valid": True
    }

    pricing = PricingEngine.evaluate_pricing_and_entry_zone(orcl_stock, lang="en")
    assert pricing["is_valid"] is True
    # Runaway DCF was $463.66 (3.1x price). With FCF decay clamp, must be <= 1.55x price ($232.00)
    assert pricing["dcf_fair_value"] <= orcl_stock["current_price"] * 1.55
    assert pricing["dcf_fair_value"] < 235.0


# --------------------------------------------------------------------------
# 3. Pre-Earnings Blackout Window Detection & Veto (PL-726.1.3 & PL-726.4.2)
# --------------------------------------------------------------------------

def test_earnings_blackout_window_detection_and_discipline_veto():
    """
    Verify that buying a stock within <= 7 calendar days of quarterly earnings
    (e.g. TFII.TO pre-earnings) is caught by is_earnings_blackout and vetoed by DisciplineEngine.
    """
    stock_with_earnings = {
        "symbol": "TFII.TO",
        "company_name": "TFI International Inc.",
        "current_price": 150.0,
        "days_to_earnings": 3,
        "is_earnings_blackout": True,
        "taxonomy": {"taxonomy": "TREE"}
    }
    pricing_data = {
        "action_status": "IN_BUY_ZONE",
        "reverse_dcf": {"is_prosperity_trap": False}
    }

    audit = DisciplineEngine.audit_trade(
        stock_data=stock_with_earnings,
        pricing_data=pricing_data,
        action="BUY"
    )

    assert audit["is_compliant"] is False
    assert audit["audit_verdict"] == "DISCIPLINE_BLOCKED"
    assert any("Earnings Blackout Veto" in r for r in audit["veto_reasons"])


# --------------------------------------------------------------------------
# 4. Elimination of Floating price * 1.02 Buy Ceiling (PL-726.2.1)
# --------------------------------------------------------------------------

def test_no_floating_price_102_ceiling_on_crashing_left_side_stocks():
    """
    Verify that when a stock falls well below both 50D and 200D SMA, ideal_buy_range_max
    is anchored to structural moving average support, and does NOT equal price * 1.02.
    """
    crashing_stock = {
        "symbol": "CRASH_CO",
        "current_price": 100.0,
        "fifty_day_sma": 125.0,     # Spot is -20% below 50D SMA
        "two_hundred_day_sma": 130.0, # Spot is -23% below 200D SMA
        "twenty_day_sma": 110.0,
        "market_cap": 20_000_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "total_revenue": 10_000_000_000.0,
        "free_cash_flow": 2_000_000_000.0,
        "operating_cash_flow": 2_500_000_000.0,
        "total_cash": 1_000_000_000.0,
        "total_debt": 500_000_000.0,
        "moat_rating": "Wide Moat",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(crashing_stock, lang="en")
    assert res["is_valid"] is True
    # The old flawed logic set ideal_buy_max = round(price * 1.02, 2) = 102.0
    # Structural anchoring must anchor to structural reclaim (>= 110.0), NOT 102.0!
    assert res["ideal_buy_range_max"] != 102.0
    assert res["ideal_buy_range_max"] >= 110.0


# --------------------------------------------------------------------------
# 5. Strict Right-Side Momentum Gate for IN_BUY_ZONE (PL-726.2.3)
# --------------------------------------------------------------------------

def test_freeze_and_flat_stocks_never_marked_in_buy_zone():
    """
    Verify that a stock in FREEZE or FLAT trend state (e.g. TECK-B.TO or ABX.TO below declining MAs)
    is strictly assigned LEFT_SIDE_WATCH and NEVER IN_BUY_ZONE, even if 5D return is positive (+1.0%).
    """
    # 50 days of falling prices below 200D SMA (~130), with a tiny 1-day bounce from 100 to 101 (+1.0%)
    prices = [140.0 - (i * 0.8) for i in range(50)] # Dropped from 140 to 100.8
    prices[-1] = 101.8 # 1-day small bounce
    dates = pd.date_range(end="2026-11-06", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    hist_series = [{"date": d, "close": p, "volume": 5_000_000} for d, p in zip(dates, prices)]

    rebound_falling_stock = {
        "symbol": "BOUNCE_KNIFE",
        "current_price": 101.8,
        "fifty_day_sma": 120.0,
        "two_hundred_day_sma": 130.0,
        "twenty_day_sma": 108.0,
        "historical_series": hist_series,
        "market_cap": 10_000_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "total_revenue": 5_000_000_000.0,
        "free_cash_flow": 1_000_000_000.0,
        "operating_cash_flow": 1_200_000_000.0,
        "total_cash": 1_000_000_000.0,
        "total_debt": 500_000_000.0,
        "moat_rating": "Wide Moat",
        "is_valid": True
    }

    res = PricingEngine.evaluate_pricing_and_entry_zone(rebound_falling_stock, lang="en")
    assert res["is_valid"] is True
    # Must NOT be marked IN_BUY_ZONE despite trading within buy ceiling
    assert res["action_status"] == "LEFT_SIDE_WATCH"
    assert res["batting_zone"] in ["LEFT_SIDE", "LEFT_SIDE_WATCH"]


# --------------------------------------------------------------------------
# 6. Institutional Distribution Veto & 3-Day Shock Guard (PL-726.3.1 & PL-726.3.2)
# --------------------------------------------------------------------------

def test_high_volume_distribution_and_3d_post_shock_stabilization_veto():
    """
    Verify that PriceAlertEngine.compute_trend_temperature vetoes RIGHT_SIDE
    whenever high-volume distribution is detected (vol_ratio >= 1.25 on negative 5D/10D returns)
    or within 3 sessions of a single-day drop <= -3.5%.
    """
    # Case A: Institutional Volume Distribution (e.g. WCP.TO / ORCL)
    prices = [100.0] * 20
    prices[-5:] = [99.0, 98.0, 97.0, 96.5, 96.0] # 5-day drop -4.0%
    vols = [1_000_000] * 15 + [2_000_000] * 5 # vol_ratio = 2.0 / 1.25 = 1.6x
    df_dist = pd.DataFrame({"close": prices, "volume": vols})
    trend_dist = PriceAlertEngine.compute_trend_temperature(df_dist, current_price=96.0)

    assert trend_dist["is_high_volume_distribution"] is True
    assert trend_dist["is_right_side"] is False
    assert trend_dist["hitting_zone"] == "LEFT_SIDE"

    # Case B: 3-Day Post-Shock Stabilization Rule
    # Day -2 had a -5.0% single-day crash (105 to 99.75), followed by a tiny dead-cat bounce to 100.5
    shock_prices = [105.0] * 18 + [99.75, 100.5]
    df_shock = pd.DataFrame({"close": shock_prices, "volume": [1_000_000] * len(shock_prices)})
    trend_shock = PriceAlertEngine.compute_trend_temperature(df_shock, current_price=100.5)

    assert trend_shock["has_recent_3d_shock"] is True
    assert trend_shock["is_post_shock_unsettled"] is True
    assert trend_shock["is_right_side"] is False
    assert trend_shock["hitting_zone"] == "LEFT_SIDE"


# --------------------------------------------------------------------------
# 7. Sector/Commodity Tape Headwind Veto & VIX Sizing Haircut (PL-726.4.2 & PL-726.4.3)
# --------------------------------------------------------------------------

def test_sector_commodity_headwind_veto_and_vix_sizing_haircut():
    """
    Verify that:
    1. DisciplineEngine vetoes BUY when primary sector/commodity driver has 5D return <= -5.0%.
    2. PortfolioEngine applies a 50% sizing haircut when vix_level >= 22.0.
    """
    # 1. Sector Tape Veto
    energy_stock = {
        "symbol": "WCP.TO",
        "current_price": 8.50,
        "driver_symbol": "CL=F",
        "driver_ret_5d_pct": -12.76, # Crude oil plunge
        "is_sector_headwind": True,
        "taxonomy": {"taxonomy": "GRAIN"}
    }
    audit = DisciplineEngine.audit_trade(
        stock_data=energy_stock,
        pricing_data={"action_status": "PULLBACK_WATCH", "reverse_dcf": {"is_prosperity_trap": False}},
        action="BUY"
    )
    assert audit["is_compliant"] is False
    assert any("Sector/Commodity Tape Headwind Veto" in r for r in audit["veto_reasons"])

    # 2. VIX Volatility Sizing Haircut
    standard_sizing = PortfolioEngine.calculate_kelly_position(
        win_prob=0.60,
        upside_pct=30.0,
        stop_loss_pct=8.0,
        vix_level=16.0 # Normal regime
    )
    high_vix_sizing = PortfolioEngine.calculate_kelly_position(
        win_prob=0.60,
        upside_pct=30.0,
        stop_loss_pct=8.0,
        vix_level=25.64 # High volatility expansion regime
    )

    assert high_vix_sizing["is_high_vix_regime"] is True
    assert high_vix_sizing["recommended_weight_pct"] <= 2.5
    assert high_vix_sizing["recommended_weight_pct"] < standard_sizing["recommended_weight_pct"]


# --------------------------------------------------------------------------
# 8. Adaptive ATR Falsification Floor & Oversold RSI Guard (PL-726.5.1)
# --------------------------------------------------------------------------

def test_adaptive_falsification_floor_eliminates_day0_paradox_and_guards_oversold_rsi():
    """
    Verify that:
    1. A contrarian entry below 200D SMA (e.g. TFII.TO bought at $155 vs 200D SMA $179)
       anchors falsification_floor to cost basis - 2x ATR ($147), eliminating the Day-0 breach.
    2. Early 50D-ATR trim breach is flagged when price drops below 50D SMA - 1.0*ATR on volume.
    3. Deeply oversold RSI (< 30.0) activates the oversold bounce guard to prevent panic-selling.
    """
    # 1. Day-0 Elimination
    deep_val_eval = PriceAlertEngine.compute_adaptive_falsification_floor(
        current_price=155.0,
        sma_50=165.0,
        sma_200=179.0,
        buy_in_price=155.0, # Bought below 200D SMA
        atr_14=4.0
    )
    # Must be below cost basis ($155.0), NEVER $179.0 * 0.97 = $173.63
    assert deep_val_eval["falsification_floor"] < 155.0
    assert deep_val_eval["floor_type"] == "COST_BASIS_ATR_STOP"

    # 2. Tier-1 Early 50D Breach
    trend_stock_eval = PriceAlertEngine.compute_adaptive_falsification_floor(
        current_price=190.0,
        sma_50=200.0, # 50D - 1.0*ATR = 200 - 5 = 195. Spot 190 is below!
        sma_200=170.0,
        buy_in_price=195.0,
        atr_14=5.0,
        vol_ratio=1.30
    )
    assert trend_stock_eval["is_early_trim_breach"] is True
    assert trend_stock_eval["early_trim_level"] == 195.0

    # 3. Oversold Capitulation Bounce Guard (NVDA RSI 28.4 case)
    oversold_eval = PriceAlertEngine.compute_adaptive_falsification_floor(
        current_price=185.0,
        sma_50=210.0,
        sma_200=175.0,
        buy_in_price=215.0,
        atr_14=6.0,
        rsi_14=28.4
    )
    assert oversold_eval["is_oversold_bounce_guard"] is True
    assert "oversold (<30)" in oversold_eval["oversold_guidance"].lower()
