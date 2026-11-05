"""
Regression and Acceptance Test Suite for Epic 17 / PL-725:
Selective Balanced Buy Zone Corridor, Right-Side Momentum Guards, and Dual-Gated Position Sizing.
"""

import pytest
import pandas as pd
from typing import Dict, Any

from backend.data_sources.data_provider import DataProviderManager
from backend.services.alert_engine import PriceAlertEngine
from backend.engines.pricing_engine import PricingEngine
from backend.agents.agent_arena import MultiAgentArena
from backend.engines.portfolio_engine import PortfolioEngine


# --------------------------------------------------------------------------
# 1. Multi-Horizon Trend Temperature & Batting Zone Guardrails (PL-725.1)
# --------------------------------------------------------------------------

def test_falling_stock_never_marked_right_side():
    """
    Verify that a stock experiencing recent price drops (e.g. ret_5d < -0.8% or ret_20d < 0%)
    is strictly barred from being evaluated as RIGHT_SIDE or WARM, even if spot is above 50D/200D SMA.
    """
    # Create price series where 50D/200D SMA are below spot (~100), but last 5 days dropped sharply from 115 to 105 (-8.7%)
    prices = [95.0 + (i * 0.4) for i in range(55)] # Rising to ~117
    # Last 5 days drop sharply
    prices[-5:] = [114.0, 111.0, 108.0, 106.0, 104.0]
    dates = pd.date_range(end="2026-11-04", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    hist_series = [{"date": d, "close": p, "Price": p, "volume": 10_000_000} for d, p in zip(dates, prices)]

    df = pd.DataFrame(hist_series)
    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=104.0)

    assert trend_eval["is_recently_falling"] is True
    assert trend_eval["ret_5d_pct"] < -0.8
    assert trend_eval["is_right_side"] is False
    assert trend_eval["hitting_zone"] == "LEFT_SIDE"
    assert trend_eval["state"] in ["FLAT", "FREEZE"]


def test_positive_momentum_stock_confirmed_right_side():
    """
    Verify that a stock with steady positive 5D/20D returns holding above 20D, 50D, and 200D SMA
    is properly recognized as WARM / RIGHT_SIDE.
    """
    prices = [100.0 + (i * 0.3) for i in range(60)] # Steady climb from 100 to 118
    dates = pd.date_range(end="2026-11-04", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    hist_series = [{"date": d, "close": p, "Price": p, "volume": 10_000_000} for d, p in zip(dates, prices)]

    df = pd.DataFrame(hist_series)
    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=118.0)

    assert trend_eval["is_recently_falling"] is False
    assert trend_eval["ret_5d_pct"] > 0.0
    assert trend_eval["is_right_side"] is True
    assert trend_eval["hitting_zone"] == "RIGHT_SIDE"
    assert trend_eval["state"] in ["WARM", "HOT"]


# --------------------------------------------------------------------------
# 2. Selective Balanced Buy Zone Corridor & Left-Side Watch (PL-725.2)
# --------------------------------------------------------------------------

def test_extended_stocks_do_not_qualify_for_in_buy_zone():
    """
    Verify that stocks trading at an extended premium above 50D and 200D SMA
    do NOT automatically qualify as IN_BUY_ZONE via artificial multipliers.
    """
    extended_stock = {
        "symbol": "EXT_CO",
        "current_price": 120.0,
        "fifty_day_sma": 105.0,  # Spot is +14.3% above 50D SMA
        "two_hundred_day_sma": 95.0,  # Spot is +26.3% above 200D SMA
        "market_cap": 10_000_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "total_revenue": 5_000_000_000.0,
        "free_cash_flow": 1_200_000_000.0,  # DCF target will be high ~$130
        "operating_cash_flow": 1_500_000_000.0,
        "total_cash": 1_000_000_000.0,
        "total_debt": 500_000_000.0,
        "beta": 1.0,
        "moat_rating": "Wide Moat",
        "is_valid": True
    }
    res = PricingEngine.evaluate_pricing_and_entry_zone(extended_stock, lang="en")

    assert res["is_valid"] is True
    assert res["dcf_fair_value"] > extended_stock["current_price"]
    # Even though DCF fair value is higher than price, extended spot (> +3% 50D and > +6% 200D)
    # MUST NOT place ideal_buy_range_max above spot (120.0)
    assert res["ideal_buy_range_max"] < extended_stock["current_price"]
    assert res["action_status"] == "PULLBACK_WATCH"


def test_falling_undervalued_stock_triggers_left_side_watch():
    """
    Verify that a stock trading within its valuation buy bracket but experiencing
    severe short-term falling momentum triggers LEFT_SIDE_WATCH instead of IN_BUY_ZONE.
    """
    # 5-day drop of -4.5%
    prices = [55.0 - (i * 0.1) for i in range(50)]
    prices[-5:] = [52.0, 50.5, 49.0, 48.0, 47.0] # Dropped from 52 to 47 (-9.6%)
    dates = pd.date_range(end="2026-11-04", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    hist_series = [{"date": d, "close": p, "Price": p, "volume": 5_000_000} for d, p in zip(dates, prices)]

    falling_value_stock = {
        "symbol": "FALLING_VAL",
        "current_price": 47.0,
        "fifty_day_sma": 51.0,
        "two_hundred_day_sma": 52.0,
        "historical_series": hist_series,
        "market_cap": 5_000_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "total_revenue": 3_000_000_000.0,
        "free_cash_flow": 500_000_000.0,
        "operating_cash_flow": 700_000_000.0,
        "total_cash": 500_000_000.0,
        "total_debt": 200_000_000.0,
        "beta": 0.9,
        "moat_rating": "Narrow Moat",
        "is_valid": True
    }
    res = PricingEngine.evaluate_pricing_and_entry_zone(falling_value_stock, lang="en")

    assert res["is_valid"] is True
    assert res["current_price"] <= res["ideal_buy_range_max"]
    assert res["action_status"] == "LEFT_SIDE_WATCH"
    assert "left-side" in res["timing_advice"].lower()
    assert res["ret_5d_pct"] < -2.5


# --------------------------------------------------------------------------
# 3. Dual-Gated CIO Verdict & Position Sizing in Debate Arena (PL-725.3)
# --------------------------------------------------------------------------

def test_debate_arena_zero_percent_allocation_on_left_side():
    """
    Verify that MultiAgentArena outputs 0% allocation when a stock is in LEFT_SIDE_WATCH,
    advising waiting for right-side reversal rather than recommending buy-in.
    """
    stock_data = {
        "symbol": "CHOP_CO",
        "company_name": "Choppy Drops Corp",
        "current_price": 50.0,
        "fifty_day_sma": 54.0,
        "two_hundred_day_sma": 55.0,
        "currency": "USD"
    }
    pricing_data = {
        "dcf_fair_value": 70.0,
        "ideal_buy_range_min": 45.0,
        "ideal_buy_range_max": 52.0,  # Price 50.0 <= 52.0 is within bracket!
        "valuation_status": "Fair Value",
        "fifty_day_sma": 54.0,
        "two_hundred_day_sma": 55.0,
        "action_status": "LEFT_SIDE_WATCH",
        "trend_temperature": "FREEZE",
        "batting_zone": "LEFT_SIDE_WATCH",
        "is_right_side": False,
        "is_recently_falling": True,
        "ret_5d_pct": -4.2
    }
    fundamental_data = {
        "fcf_quality": "STRONG_FCF",
        "moat_rating": "Wide Moat",
        "taxonomy": {"taxonomy": "TREE"}
    }
    macro_data = {"cycle_stage": "Late Cycle"}

    verdict_en = MultiAgentArena.run_debate(
        stock_data=stock_data,
        pricing_data=pricing_data,
        fundamental_data=fundamental_data,
        macro_data=macro_data,
        lang="en"
    )
    cio = verdict_en["cio_verdict"]

    assert "WATCH" in cio["verdict"] or "LEFT_SIDE" in cio["verdict"]
    assert "0%" in cio["position_sizing_advice"]
    assert "left-side" in cio["position_sizing_advice"].lower()
    assert cio["mianji_framework"]["soul_check"]["hitting_zone"] == "LEFT_SIDE_WATCH"


def test_debate_arena_accumulate_only_when_both_gates_pass():
    """
    Verify that MultiAgentArena recommends ACCUMULATE IN BRACKETS (3%-5%)
    ONLY when both the fundamental buy bracket AND the right-side momentum gate pass.
    """
    stock_data = {
        "symbol": "PRIME_CO",
        "company_name": "Prime Compounder Corp",
        "current_price": 50.0,
        "fifty_day_sma": 48.0,
        "two_hundred_day_sma": 45.0,
        "currency": "USD"
    }
    pricing_data = {
        "dcf_fair_value": 70.0,
        "ideal_buy_range_min": 46.0,
        "ideal_buy_range_max": 51.5,  # Price 50.0 <= 51.5
        "valuation_status": "Fair Value",
        "fifty_day_sma": 48.0,
        "two_hundred_day_sma": 45.0,
        "action_status": "IN_BUY_ZONE",
        "trend_temperature": "WARM",
        "batting_zone": "RIGHT_SIDE",
        "is_right_side": True,
        "is_recently_falling": False,
        "ret_5d_pct": 1.8
    }
    fundamental_data = {
        "fcf_quality": "STRONG_FCF",
        "moat_rating": "Wide Moat",
        "taxonomy": {"taxonomy": "TREE"}
    }
    macro_data = {"cycle_stage": "Early Expansion"}

    verdict_en = MultiAgentArena.run_debate(
        stock_data=stock_data,
        pricing_data=pricing_data,
        fundamental_data=fundamental_data,
        macro_data=macro_data,
        lang="en"
    )
    cio = verdict_en["cio_verdict"]

    assert cio["verdict"] == "ACCUMULATE IN BRACKETS"
    assert "3% - 5%" in cio["position_sizing_advice"]
    assert cio["mianji_framework"]["soul_check"]["hitting_zone"] == "RIGHT_SIDE"


# --------------------------------------------------------------------------
# 4. Portfolio Position Sizing Readiness Tags (PL-725.3)
# --------------------------------------------------------------------------

def test_portfolio_engine_attaches_readiness_and_limit_guidance():
    """
    Verify that PortfolioEngine.calculate_position_sizes attaches readiness_status
    ('BUY_READY', 'WAIT_PULLBACK', 'LEFT_SIDE_AWAIT') and actionable execution notes.
    """
    res = PortfolioEngine.calculate_position_sizes(
        cash_balance=100_000.0,
        risk_profile="BARBELL_80_20",
        currency="USD",
        selected_symbols=["AAPL", "MSFT"],
        lang="en"
    )

    breakdown = res["position_breakdown"]
    assert len(breakdown) > 0

    core_items = [item for item in breakdown if item.get("allocation_tier") == "CORE_SAA"]
    sat_items = [item for item in breakdown if item.get("allocation_tier") == "SATELLITE_TAA"]

    assert len(core_items) > 0
    assert len(sat_items) == 2

    # All items must have readiness_status and execution_advice
    for item in breakdown:
        assert item.get("readiness_status") in ["BUY_READY", "WAIT_PULLBACK", "LEFT_SIDE_AWAIT"]
        assert len(item.get("execution_advice", "")) > 0
