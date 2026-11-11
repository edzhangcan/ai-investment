"""
Regression and Acceptance Test Suite for Epic PL-727:
3-Path Right-Side Batting Zone Engine, Pullback Support Bounces,
Bottom Reversals, 5-Day State Transitions & Staged Pilot Tranche Sizing.
"""

import pytest
import pandas as pd
from typing import Dict, Any

from backend.data_sources.data_provider import DataProviderManager
from backend.services.alert_engine import PriceAlertEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.discipline_engine import DisciplineEngine
from backend.agents.agent_arena import MultiAgentArena


# --------------------------------------------------------------------------
# 1. Path A: Primary Uptrend Continuation (PL-727.2.1)
# --------------------------------------------------------------------------

def test_path_a_trend_continuation_warm_and_hot():
    """
    Verify Path A (Primary Trend Continuation):
    A steady uptrending stock (curr > 50D SMA, ret_20d > 0, z_trend >= 0.25)
    returns state in ('WARM', 'HOT'), hitting_zone == 'RIGHT_SIDE',
    is_right_side is True, and right_side_path == 'TREND_CONTINUATION'.
    """
    prices = [100.0 + (i * 0.4) for i in range(60)] # Steady climb from 100 to 123.6
    dates = pd.date_range(end="2026-11-10", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    vols = [10_000_000] * len(prices)

    df = pd.DataFrame({
        "date": dates,
        "close": prices,
        "high": [p * 1.01 for p in prices],
        "low": [p * 0.99 for p in prices],
        "volume": vols
    })

    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=123.6)

    assert trend_eval["state"] in ("WARM", "HOT")
    assert trend_eval["hitting_zone"] == "RIGHT_SIDE"
    assert trend_eval["is_right_side"] is True
    assert trend_eval["right_side_path"] == "TREND_CONTINUATION"
    assert trend_eval["ret_20d_pct"] > 0.0
    assert trend_eval["ret_5d_pct"] > 0.0


# --------------------------------------------------------------------------
# 2. Path B: Pullback Bounce off 50D/200D SMA (PL-727.2.1 & PL-727.3.1)
# --------------------------------------------------------------------------

def test_path_b_support_bounce_solves_pullback_catch22_in_buy_zone():
    """
    Verify Path B (Support Bounce):
    A quality stock in a primary macro uptrend (50D SMA >= 200D SMA) experiences
    a healthy pullback toward its 50D SMA (ret_20d_pct < 0, curr_close < 20D SMA),
    then turns up with institutional volume accumulation over 3 sessions
    (ret_3d_pct >= +0.8%, ret_5d_pct >= +0.2%, curr_close >= EMA10).

    Verifies:
    1. trend_eval['ret_20d_pct'] < 0.0 (The 20-day return is still negative).
    2. trend_eval['right_side_path'] == 'SUPPORT_BOUNCE'.
    3. trend_eval['state'] == 'WARM' and trend_eval['hitting_zone'] == 'RIGHT_SIDE'.
    4. PricingEngine assigns action_status == 'IN_BUY_ZONE' (eliminating the Catch-22 lockout).
    """
    # 210-day series:
    # 185 days rising from 100.0 to 150.0
    prices = [100.0 + (i * (50.0 / 185)) for i in range(186)]
    # 21 days pulling back from 150.0 down to ~138.0 (-8.0% drop)
    for i in range(1, 22):
        prices.append(150.0 - (i * (12.0 / 21)))
    # Final 3 sessions: confirmed bounce off 50D SMA from 138.0 to 140.8 (+2.0%)
    prices.append(138.8)
    prices.append(139.7)
    prices.append(140.8)

    dates = pd.date_range(end="2026-11-10", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    vols = [10_000_000] * len(prices)
    # Institutional accumulation volume on the 3-day bounce
    vols[-3:] = [25_000_000, 28_000_000, 30_000_000]
    # Light contraction volume on previous pullback drop days
    for k in range(4, 11):
        vols[-k] = 6_000_000

    df = pd.DataFrame({
        "date": dates,
        "close": prices,
        "high": [p * 1.01 for p in prices],
        "low": [p * 0.99 for p in prices],
        "volume": vols
    })

    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=140.8)

    # 1. Negative 20D return confirms this is a pullback
    assert trend_eval["ret_20d_pct"] < 0.0
    assert trend_eval["ret_3d_pct"] >= 0.8
    assert trend_eval["ret_5d_pct"] >= 0.2
    assert trend_eval["up_down_vol_ratio_10d"] >= 0.95

    # 2. Path B correctly identified
    assert trend_eval["right_side_path"] == "SUPPORT_BOUNCE"
    assert trend_eval["state"] == "WARM"
    assert trend_eval["hitting_zone"] == "RIGHT_SIDE"
    assert trend_eval["is_right_side"] is True

    # 3. PricingEngine correctly admits the stock into IN_BUY_ZONE
    hist_series = [
        {"date": d, "close": p, "Price": p, "high": p * 1.01, "low": p * 0.99, "volume": v}
        for d, p, v in zip(dates, prices, vols)
    ]
    stock_data = {
        "symbol": "BOUNCE_CO",
        "company_name": "Bounce Corporation",
        "current_price": 140.8,
        "fifty_day_sma": trend_eval["sma_50"],
        "two_hundred_day_sma": trend_eval["sma_200"],
        "historical_series": hist_series,
        "dcf_fair_value": 175.0,
        "total_revenue": 10_000_000_000.0,
        "revenue_growth": 0.12,
        "free_cash_flow": 2_500_000_000.0,
        "operating_cash_flow": 3_000_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "market_cap": 14_080_000_000.0,
        "beta": 1.0,
        "currency": "USD",
        "is_valid": True
    }

    pricing_res = PricingEngine.evaluate_pricing_and_entry_zone(stock_data, lang="en")

    assert pricing_res["action_status"] == "IN_BUY_ZONE"
    assert pricing_res["batting_zone"] == "RIGHT_SIDE"
    assert pricing_res["right_side_path"] == "SUPPORT_BOUNCE"
    assert pricing_res["is_fresh_right_side_pivot"] is True
    assert "Right-Side Support Bounce" in pricing_res["timing_advice"]


# --------------------------------------------------------------------------
# 3. Path C: Bottom Reversal / Pocket Pivot (PL-727.2.1 & PL-727.3.1)
# --------------------------------------------------------------------------

def test_path_c_bottom_reversal_pocket_pivot_below_50d_sma():
    """
    Verify Path C (Bottom Reversal):
    A stock correcting below both 50D and 200D SMA forms a base around $48.0,
    then launches a volume-backed pocket pivot reversal reclaiming its 20D SMA
    (curr_close > 20D SMA * 1.005, ret_5d_pct >= +1.5%, RSI >= 45.0,
    up_down_vol_ratio_10d >= 1.15).

    Verifies:
    1. trend_eval['right_side_path'] == 'BOTTOM_REVERSAL'.
    2. trend_eval['state'] == 'WARM' and trend_eval['hitting_zone'] == 'RIGHT_SIDE'.
    3. PricingEngine sets action_status == 'IN_BUY_ZONE' with bottom reversal timing advice.
    """
    # 185 days falling from 100.0 to 52.0
    prices = [100.0 - (i * (48.0 / 185)) for i in range(186)]
    # 15 days consolidating at 48.0
    prices += [48.0] * 15
    # 5 days bottom reversal rally: 48.8, 49.6, 50.4, 51.2, 52.0
    prices += [48.8, 49.6, 50.4, 51.2, 52.0]

    dates = pd.date_range(end="2026-11-10", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    vols = [10_000_000] * len(prices)
    # Heavy accumulation volume on the bottom reversal
    vols[-5:] = [18_000_000, 20_000_000, 22_000_000, 25_000_000, 30_000_000]
    for k in range(6, 16):
        vols[-k] = 4_000_000

    df = pd.DataFrame({
        "date": dates,
        "close": prices,
        "high": [p * 1.01 for p in prices],
        "low": [p * 0.99 for p in prices],
        "volume": vols
    })

    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=52.0)

    assert trend_eval["right_side_path"] == "BOTTOM_REVERSAL"
    assert trend_eval["state"] == "WARM"
    assert trend_eval["hitting_zone"] == "RIGHT_SIDE"
    assert trend_eval["is_right_side"] is True
    assert trend_eval["ret_5d_pct"] >= 1.5
    assert trend_eval["up_down_vol_ratio_10d"] >= 1.15
    assert trend_eval["rsi_14"] >= 45.0

    # PricingEngine evaluation
    hist_series = [
        {"date": d, "close": p, "Price": p, "high": p * 1.01, "low": p * 0.99, "volume": v}
        for d, p, v in zip(dates, prices, vols)
    ]
    stock_data = {
        "symbol": "REV_CO",
        "company_name": "Reversal Corp",
        "current_price": 52.0,
        "fifty_day_sma": trend_eval["sma_50"],
        "two_hundred_day_sma": trend_eval["sma_200"],
        "twenty_day_sma": trend_eval["sma_20"],
        "historical_series": hist_series,
        "dcf_fair_value": 80.0,
        "total_revenue": 10_000_000_000.0,
        "revenue_growth": 0.10,
        "free_cash_flow": 2_000_000_000.0,
        "operating_cash_flow": 2_500_000_000.0,
        "shares_outstanding": 100_000_000.0,
        "market_cap": 5_200_000_000.0,
        "beta": 1.0,
        "currency": "USD",
        "is_valid": True
    }

    pricing_res = PricingEngine.evaluate_pricing_and_entry_zone(stock_data, lang="en")

    assert pricing_res["action_status"] == "IN_BUY_ZONE"
    assert pricing_res["batting_zone"] == "RIGHT_SIDE"
    assert pricing_res["right_side_path"] == "BOTTOM_REVERSAL"
    assert "Right-Side Bottom Reversal" in pricing_res["timing_advice"]


# --------------------------------------------------------------------------
# 4. Anti-Knife Pre-Filter & Unconfirmed Bounces Blocked (PL-727.2.1)
# --------------------------------------------------------------------------

def test_falling_knife_and_unconfirmed_bounce_still_blocked():
    """
    Verify that unconfirmed bounces or active falling knives are strictly blocked:
    1. Still falling into 50D SMA (ret_3d < 0, ret_5d = -2.5%) -> LEFT_SIDE, NONE.
    2. 1-day dead-cat bounce below 20D SMA (ret_5d < -0.5% or ret_3d < 0.8%) -> LEFT_SIDE, NONE.
    3. Volume distribution on pullback (vol_ratio >= 1.25 on negative return) -> LEFT_SIDE, NONE.
    """
    # Case A: Pullback still falling (no turn confirmation)
    prices_falling = [100.0 + (i * 0.3) for i in range(180)] # up to 154
    prices_falling += [154.0 - (i * 1.5) for i in range(1, 15)] # down to 133
    dates = pd.date_range(end="2026-11-10", periods=len(prices_falling), freq="B").strftime("%Y-%m-%d").tolist()

    df_falling = pd.DataFrame({
        "date": dates,
        "close": prices_falling,
        "high": [p * 1.01 for p in prices_falling],
        "low": [p * 0.99 for p in prices_falling],
        "volume": [10_000_000] * len(prices_falling)
    })
    eval_falling = PriceAlertEngine.compute_trend_temperature(df_falling, current_price=prices_falling[-1])
    assert eval_falling["is_right_side"] is False
    assert eval_falling["hitting_zone"] == "LEFT_SIDE"
    assert eval_falling["right_side_path"] == "NONE"

    # Case B: High volume distribution during pullback
    prices_dist = [100.0 + (i * 0.3) for i in range(180)]
    prices_dist += [154.0 - (i * 1.0) for i in range(1, 12)]
    # 2 days small bounce (+0.5%), but 5D return still negative and volume 2x on drops
    prices_dist += [142.5, 143.0]
    vols_dist = [10_000_000] * len(prices_dist)
    # Heavy distribution volume
    vols_dist[-5:-2] = [28_000_000, 30_000_000, 25_000_000]

    df_dist = pd.DataFrame({
        "date": pd.date_range(end="2026-11-10", periods=len(prices_dist), freq="B").strftime("%Y-%m-%d").tolist(),
        "close": prices_dist,
        "high": [p * 1.01 for p in prices_dist],
        "low": [p * 0.99 for p in prices_dist],
        "volume": vols_dist
    })
    eval_dist = PriceAlertEngine.compute_trend_temperature(df_dist, current_price=143.0)
    assert eval_dist["is_right_side"] is False
    assert eval_dist["hitting_zone"] == "LEFT_SIDE"
    assert eval_dist["right_side_path"] == "NONE"


# --------------------------------------------------------------------------
# 5. 5-Day Marginal State Transition Detection (PL-727.2.2)
# --------------------------------------------------------------------------

def test_5d_marginal_state_transition_detection():
    """
    Verify 5-day state transition detection:
    When a stock transitions from FLAT (5 sessions ago during pullback drop)
    to WARM today (upon completing a 3-day SUPPORT_BOUNCE),
    transition is 'FLAT_TO_WARM' and is_fresh_right_side_pivot is True.
    """
    # 185 days rising
    prices = [100.0 + (i * (50.0 / 185)) for i in range(186)]
    # 21 days pulling back
    for i in range(1, 22):
        prices.append(150.0 - (i * (12.0 / 21)))
    # 3-day support bounce
    prices.append(138.8)
    prices.append(139.7)
    prices.append(140.8)

    dates = pd.date_range(end="2026-11-10", periods=len(prices), freq="B").strftime("%Y-%m-%d").tolist()
    vols = [10_000_000] * len(prices)
    vols[-3:] = [25_000_000, 28_000_000, 30_000_000]
    for k in range(4, 11):
        vols[-k] = 6_000_000

    df = pd.DataFrame({
        "date": dates,
        "close": prices,
        "high": [p * 1.01 for p in prices],
        "low": [p * 0.99 for p in prices],
        "volume": vols
    })

    trend_eval = PriceAlertEngine.compute_trend_temperature(df, current_price=140.8)

    assert trend_eval["transition"] == "FLAT_TO_WARM"
    assert trend_eval["is_fresh_right_side_pivot"] is True


# --------------------------------------------------------------------------
# 6. Staged Pilot Sizing & Discipline Compliance on Pivot (PL-727.3.2)
# --------------------------------------------------------------------------

def test_staged_pilot_sizing_and_discipline_compliance_on_pivot():
    """
    Verify DisciplineEngine and MultiAgentArena staged sizing on fresh pivots:
    1. DisciplineEngine.audit_trade passes (is_compliant is True) for a confirmed
       SUPPORT_BOUNCE in IN_BUY_ZONE, exempting it from the Rule 5 falling-knife veto.
    2. MultiAgentArena.run_debate issues verdict 'ACCUMULATE IN BRACKETS' with staged pilot
       tranche sizing: 'Deploy 1.5% - 2.5% pilot tranche now; scale to 3% - 5%' for TREE taxonomy.
    """
    stock_data = {
        "symbol": "PIVOT_CO",
        "company_name": "Pivot Compounder Corp",
        "current_price": 140.8,
        "fifty_day_sma": 144.99,
        "twenty_day_sma": 142.0,
        "two_hundred_day_sma": 128.38,
        "currency": "USD",
        "taxonomy": {"taxonomy": "TREE"}
    }
    pricing_data = {
        "current_price": 140.8,
        "fifty_day_sma": 144.99,
        "two_hundred_day_sma": 128.38,
        "twenty_day_sma": 142.0,
        "action_status": "IN_BUY_ZONE",
        "batting_zone": "RIGHT_SIDE",
        "is_right_side": True,
        "right_side_path": "SUPPORT_BOUNCE",
        "is_fresh_right_side_pivot": True,
        "transition": "FLAT_TO_WARM",
        "ret_5d_pct": 1.19,
        "ret_20d_pct": -4.68,
        "ideal_buy_range_min": 128.54,
        "ideal_buy_range_max": 142.82,
        "dcf_fair_value": 175.0,
        "valuation_status": "Fair Value",
        "reverse_dcf": {"is_prosperity_trap": False}
    }

    # 1. DisciplineEngine Compliance Audit
    audit = DisciplineEngine.audit_trade(
        stock_data=stock_data,
        pricing_data=pricing_data,
        action="BUY"
    )
    assert audit["is_compliant"] is True
    assert audit["audit_verdict"] == "COMPLIANT"
    assert len(audit["veto_reasons"]) == 0

    # 2. MultiAgentArena Debate & Position Sizing
    fundamental_data = {
        "fcf_quality": "STRONG_FCF",
        "moat_rating": "Wide Moat",
        "taxonomy": {"taxonomy": "TREE"}
    }
    macro_data = {"cycle_stage": "Mid Expansion"}

    arena_res = MultiAgentArena.run_debate(
        stock_data=stock_data,
        pricing_data=pricing_data,
        fundamental_data=fundamental_data,
        macro_data=macro_data,
        lang="en"
    )
    cio = arena_res["cio_verdict"]

    assert cio["verdict"] == "ACCUMULATE IN BRACKETS"
    assert "1.5% - 2.5%" in cio["position_sizing_advice"]
    assert "3% - 5%" in cio["position_sizing_advice"]
    assert "pilot tranche" in cio["position_sizing_advice"].lower()
