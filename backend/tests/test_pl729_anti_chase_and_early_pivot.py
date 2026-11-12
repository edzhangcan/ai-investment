"""
Regression and Acceptance Test Suite for Epic PL-729:
Early Right-Side Pivot Recognition, Structural Buy-Ceiling Anchoring,
Short-Term Anti-Chase Overextension Veto, and Overhead 200D SMA Supply Guard.
Grounded in the empirical CELH and FOUR 12-day historical post-mortem.
"""

import pytest
import pandas as pd
from typing import Dict, Any

from backend.services.alert_engine import PriceAlertEngine
from backend.engines.pricing_engine import PricingEngine


# --------------------------------------------------------------------------
# 1. Early Right-Side Pivot at Support (PL-729.3)
# --------------------------------------------------------------------------

def test_early_right_side_pivot_below_200d_sma():
    """
    Verify PL-729.3:
    A stock recovering below the 200D SMA (50D < 200D) that reclaims its 20D and 50D SMA
    with positive 3D/5D returns and healthy RSI triggers WARM (SUPPORT_BOUNCE) and IN_BUY_ZONE,
    solving the late-turn lockout (exemplified by FOUR at $40.03 and CELH at $29.12 on Oct 30).
    """
    # 175-day baseline below 200D SMA leading into FOUR's Oct 30 pivot
    prices = [55.0 - (i * (10.0 / 175)) for i in range(175)]
    # Realistic 35-day sequence leading to $40.03 pivot
    prices += [
        45.32, 42.35, 42.09, 41.35, 38.98, 39.37, 39.07, 38.46, 38.16, 38.45,
        37.03, 37.08, 36.17, 35.58, 36.17, 37.55, 38.5, 38.99, 39.52, 40.0,
        39.85, 38.84, 37.99, 39.34, 39.43, 39.77, 40.46, 39.51, 40.17, 38.79,
        36.99, 37.72, 38.12, 39.25, 40.03
    ]

    dates = pd.date_range(end="2026-10-30", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    vols = [2_500_000] * len(prices)
    # Volume accumulation on the turn
    vols[-4:] = [3_000_000, 3_500_000, 4_000_000, 4_500_000]

    df = pd.DataFrame({
        "date": dates,
        "close": prices,
        "high": [p * 1.015 for p in prices],
        "low": [p * 0.985 for p in prices],
        "volume": vols
    })

    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=40.03)

    assert trend_eval["state"] == "WARM"
    assert trend_eval["hitting_zone"] == "RIGHT_SIDE"
    assert trend_eval["is_right_side"] is True
    assert trend_eval["right_side_path"] in ("SUPPORT_BOUNCE", "BOTTOM_REVERSAL")
    assert trend_eval["ret_3d_pct"] > 0.0
    assert trend_eval["ret_5d_pct"] > 0.0

    # Pricing evaluation
    hist_series = [
        {"date": d, "close": p, "Price": p, "high": p * 1.015, "low": p * 0.985, "volume": v}
        for d, p, v in zip(dates, prices, vols)
    ]
    stock_data = {
        "symbol": "FOUR_PIVOT",
        "company_name": "Shift4 Test Pivot",
        "current_price": 40.03,
        "twenty_day_sma": trend_eval["sma_20"],
        "fifty_day_sma": trend_eval["sma_50"],
        "two_hundred_day_sma": trend_eval["sma_200"],
        "historical_series": hist_series,
        "dcf_fair_value": 61.85,
        "total_revenue": 2_500_000_000.0,
        "revenue_growth": 0.15,
        "free_cash_flow": 300_000_000.0,
        "operating_cash_flow": 400_000_000.0,
        "shares_outstanding": 85_000_000.0,
        "market_cap": 3_400_000_000.0,
        "currency": "USD",
        "is_valid": True
    }

    pricing_res = PricingEngine.evaluate_pricing_and_entry_zone(stock_data, lang="en")
    assert pricing_res["action_status"] == "IN_BUY_ZONE"
    assert pricing_res["batting_zone"] == "RIGHT_SIDE"
    assert pricing_res["ideal_buy_range_max"] >= 40.03


# --------------------------------------------------------------------------
# 2. Structural Buy Ceiling Anchoring (PL-729.1)
# --------------------------------------------------------------------------

def test_structural_buy_ceiling_does_not_ratchet_up_during_rally():
    """
    Verify PL-729.1:
    When a stock rallies from $40.00 to $45.00 (+12.5%), ideal_buy_max stays
    anchored to structural support (around $41.00 - $42.00) and DOES NOT float up
    to $45.45 via the flawed price * 1.01 multiplier.
    """
    stock_data_base = {
        "symbol": "FOUR_ANCHOR",
        "company_name": "Shift4 Payments",
        "fifty_day_sma": 40.34,
        "two_hundred_day_sma": 45.38,
        "twenty_day_sma": 40.95,
        "dcf_fair_value": 61.85,
        "total_revenue": 2_500_000_000.0,
        "free_cash_flow": 300_000_000.0,
        "operating_cash_flow": 400_000_000.0,
        "currency": "USD",
        "is_valid": True
    }

    # At $40.50 (near support)
    res_at_support = PricingEngine.evaluate_pricing_and_entry_zone(
        {**stock_data_base, "current_price": 40.50}, lang="en"
    )
    buy_max_at_support = res_at_support["ideal_buy_range_max"]
    assert 41.0 <= buy_max_at_support <= 42.5

    # At $45.01 (+11% rally at the peak)
    res_at_peak = PricingEngine.evaluate_pricing_and_entry_zone(
        {**stock_data_base, "current_price": 45.01}, lang="en"
    )
    buy_max_at_peak = res_at_peak["ideal_buy_range_max"]

    # Must stay anchored to structural support, NEVER float to price * 1.01 = $45.46
    assert buy_max_at_peak <= 42.50
    assert buy_max_at_peak < 45.01  # Price has exceeded the buy zone!


# --------------------------------------------------------------------------
# 3. Short-Term Anti-Chase Veto & Overhead 200D Resistance Guard (PL-729.2)
# --------------------------------------------------------------------------

def test_anti_chase_and_overhead_200d_resistance_veto():
    """
    Verify PL-729.2:
    Even when price is fundamentally undervalued, IN_BUY_ZONE is strictly vetoed
    and switched to PULLBACK_WATCH when:
    1. Short-term overextended (>6.5% above 20D SMA or 10D return >= 12%).
    2. Directly underneath the overhead 200D SMA supply wall after a multi-day surge.
    """
    stock_data_nov9 = {
        "symbol": "FOUR_NOV9",
        "company_name": "Shift4 Payments Peak",
        "current_price": 45.01,
        "twenty_day_sma": 40.95,  # +9.9% above 20D SMA!
        "fifty_day_sma": 40.34,
        "two_hundred_day_sma": 45.38,  # Only -0.8% below 200D SMA wall!
        "dcf_fair_value": 61.85,
        "total_revenue": 2_500_000_000.0,
        "free_cash_flow": 300_000_000.0,
        "operating_cash_flow": 400_000_000.0,
        "currency": "USD",
        "is_valid": True
    }

    pricing_res = PricingEngine.evaluate_pricing_and_entry_zone(stock_data_nov9, lang="en")

    # Anti-chase veto must block IN_BUY_ZONE
    assert pricing_res["action_status"] == "PULLBACK_WATCH"
    assert "chasing" in pricing_res["timing_advice"].lower() or "pullback" in pricing_res["timing_advice"].lower()
    assert pricing_res["ideal_buy_range_max"] < 45.01


# --------------------------------------------------------------------------
# 4. Adaptive Falsification Floor Below 200D SMA (PL-729.4)
# --------------------------------------------------------------------------

def test_adaptive_falsification_floor_below_200d_sma():
    """
    Verify PL-729.4:
    Fixes the Day-0 Falsification Paradox where a stock trading below 200D SMA
    was assigned a floor of 200D SMA * 0.97 above the current price.
    """
    # Case A: FOUR at $41.43 without entry price
    eval_unspecified = PriceAlertEngine.compute_adaptive_falsification_floor(
        current_price=41.43,
        sma_50=40.34,
        sma_200=45.38,
        buy_in_price=None,
        atr_14=2.59,
        rsi_14=50.6
    )
    # Floor must be BELOW spot price ($41.43), NEVER $45.38 * 0.97 = $44.02
    assert eval_unspecified["falsification_floor"] < 41.43
    assert eval_unspecified["falsification_floor"] >= 37.0
    assert eval_unspecified["floor_type"] == "RECOVERY_SUPPORT_STOP"

    # Case B: Entered at $45.01 below 200D SMA ($45.38)
    eval_entered = PriceAlertEngine.compute_adaptive_falsification_floor(
        current_price=41.43,
        sma_50=40.34,
        sma_200=45.38,
        buy_in_price=45.01,
        atr_14=2.59,
        rsi_14=50.6
    )
    # Floor must be anchored to cost basis / 50D SMA, giving room for healthy testing of support
    assert eval_entered["falsification_floor"] < 45.01
    assert eval_entered["falsification_floor"] <= 41.50
    assert eval_entered["floor_type"] == "COST_BASIS_ATR_STOP"
