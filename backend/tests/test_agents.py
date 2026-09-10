"""
Unit tests for MultiAgentArena (Bull vs Bear vs CIO Verdict)
"""
import pytest
from backend.agents.agent_arena import MultiAgentArena

def test_agent_arena_fallback_debate():
    stock = {"symbol": "NVDA", "current_price": 118.5, "currency": "USD", "pe_ratio": 48.2, "ps_ratio": 24.5, "free_cash_flow": 60800000000, "fifty_day_sma": 122.1}
    macro = {"cycle_stage": "Overheat", "fed_sentiment": {"tone": "Hawkish"}}
    pricing = {"valuation_status": "Overvalued", "fifty_day_sma": 122.1, "two_hundred_day_sma": 98.4, "dcf_fair_value": 125.0, "ideal_buy_range_min": 98.4, "ideal_buy_range_max": 108.5}
    fundamental = {"fcf_quality": "High Quality", "fcf_yield_pct": 4.8, "moat_rating": "Wide Moat", "guidance_shift_deltas": [{"added_disclaimer": "Supply chain warning"}]}

    debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental)

    assert debate["symbol"] == "NVDA"
    assert "bull_argument" in debate
    assert "bear_argument" in debate
    assert "cio_verdict" in debate
    assert any(term in debate["cio_verdict"]["verdict"] for term in ["BUY", "HOLD", "PASS", "买入", "观望", "建仓"])
    assert isinstance(debate["cio_verdict"]["risk_reward_ratio"], (int, float))
    assert debate["cio_verdict"]["risk_reward_ratio"] > 0

def test_dynamic_risk_reward_ratio_variation():
    """Verify that different stocks get authentic mathematically calculated risk-reward ratios rather than static 2.4."""
    macro = {"cycle_stage": "Late-Cycle", "fed_sentiment": {"tone": "Hawkish"}}
    fundamental = {"fcf_quality": "High Quality", "fcf_yield_pct": 5.2, "moat_rating": "Wide Moat", "guidance_shift_deltas": []}

    # Stock A: Deep Value with High DCF Upside ($50 price, $75 DCF, $45 support)
    stock_undervalued = {"symbol": "SU.TO", "current_price": 50.0, "currency": "CAD", "pe_ratio": 12.0}
    pricing_undervalued = {"valuation_status": "Deep Value", "fifty_day_sma": 48.0, "two_hundred_day_sma": 45.0, "dcf_fair_value": 75.0, "ideal_buy_range_min": 45.0, "ideal_buy_range_max": 55.0}

    # Stock B: Fairly Valued Stock ($100 price, $110 DCF, $90 support)
    stock_fair = {"symbol": "KO", "current_price": 100.0, "currency": "USD", "pe_ratio": 24.0}
    pricing_fair = {"valuation_status": "Fair Value", "fifty_day_sma": 98.0, "two_hundred_day_sma": 90.0, "dcf_fair_value": 110.0, "ideal_buy_range_min": 85.0, "ideal_buy_range_max": 95.0}

    # Stock C: Overextended Stock ($200 price, $140 DCF, $100 support)
    stock_overextended = {"symbol": "EXPENSIVE", "current_price": 200.0, "currency": "USD", "pe_ratio": 80.0}
    pricing_overextended = {"valuation_status": "Overvalued", "fifty_day_sma": 180.0, "two_hundred_day_sma": 100.0, "dcf_fair_value": 140.0, "ideal_buy_range_min": 90.0, "ideal_buy_range_max": 110.0}

    debate_a = MultiAgentArena._run_fallback_debate(stock_undervalued, macro, pricing_undervalued, fundamental)
    debate_b = MultiAgentArena._run_fallback_debate(stock_fair, macro, pricing_fair, fundamental)
    debate_c = MultiAgentArena._run_fallback_debate(stock_overextended, macro, pricing_overextended, fundamental)

    rr_a = debate_a["cio_verdict"]["risk_reward_ratio"]
    rr_b = debate_b["cio_verdict"]["risk_reward_ratio"]
    rr_c = debate_c["cio_verdict"]["risk_reward_ratio"]

    # Undervalued stock should have a significantly higher R:R ratio than overextended stock
    assert rr_a > rr_b > rr_c
    assert rr_a >= 3.0  # High reward-to-risk (> 3.0:1)
    assert rr_c <= 0.5  # Low reward-to-risk (< 0.5:1)

def test_bear_and_bull_arguments_below_200d_sma_en():
    """Verify that when price is below 200D SMA, bear argument never outputs negative percentages and correctly cites overhead resistance and floor support."""
    stock = {"symbol": "TSLA", "current_price": 95.0, "currency": "USD", "pe_ratio": 45.0}
    macro = {"cycle_stage": "Late-Cycle", "fed_sentiment": {"tone": "Hawkish"}}
    pricing = {
        "valuation_status": "Fair Value",
        "fifty_day_sma": 92.0,
        "two_hundred_day_sma": 100.0,
        "dcf_fair_value": 110.0,
        "ideal_buy_range_min": 85.0,
        "ideal_buy_range_max": 94.0
    }
    fundamental = {"fcf_quality": "High Quality", "moat_rating": "Wide Moat"}

    debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en")
    bear = debate["bear_argument"]
    bull = debate["bull_argument"]

    # 1. Zero negative percentages in bear key points or downside risk
    for pt in bear["key_points"]:
        assert "-5.0%" not in pt
        assert "-5%" not in pt
        assert "above 200D MA support" not in pt

    # 2. Bear cites trend breakdown below 200D MA and overhead resistance
    assert any("Trend breakdown: Trading 5.0% below 200D MA ($100.0 USD)" in pt for pt in bear["key_points"])
    assert "overhead resistance" in bear["downside_risk"]
    assert "key value floor support lies at $85.0 USD" in bear["downside_risk"]

    # 3. Bull cites mean-reversion discount rather than support anchor
    assert any("Mean-reversion discount: Trading at a 5.0% discount below the 200-day moving average" in pt for pt in bull["key_points"])

def test_bear_and_bull_arguments_below_200d_sma_zh():
    """Verify Chinese localization when price is below 200D SMA."""
    stock = {"symbol": "INTC", "current_price": 92.0, "currency": "USD", "pe_ratio": 15.0}
    macro = {"cycle_stage": "Slowdown", "fed_sentiment": {"tone": "Neutral"}}
    pricing = {
        "valuation_status": "Deep Value",
        "fifty_day_sma": 90.0,
        "two_hundred_day_sma": 100.0,
        "dcf_fair_value": 120.0,
        "ideal_buy_range_min": 80.0,
        "ideal_buy_range_max": 90.0
    }
    fundamental = {"fcf_quality": "Medium Quality", "moat_rating": "Narrow Moat"}

    debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="zh")
    bear = debate["bear_argument"]
    bull = debate["bull_argument"]

    # Zero negative percentages
    for pt in bear["key_points"]:
        assert "-8.0%" not in pt
        assert "高于 200日均线支撑位" not in pt

    assert any("技术面破位承压" in pt and "下方 8.0%" in pt and "阻力位" in pt for pt in bear["key_points"])
    assert "下方关键估值底部支撑" in bear["downside_risk"]
    assert any("均值回归折价契机" in pt for pt in bull["key_points"])

def test_bear_and_bull_arguments_above_200d_sma():
    """Verify that when price is above 200D SMA, bear argument cites pullback risk and bull cites support anchor."""
    stock = {"symbol": "NVDA", "current_price": 120.0, "currency": "USD", "pe_ratio": 65.0}
    macro = {"cycle_stage": "Expansion", "fed_sentiment": {"tone": "Dovish"}}
    pricing = {
        "valuation_status": "Overvalued",
        "fifty_day_sma": 115.0,
        "two_hundred_day_sma": 100.0,
        "dcf_fair_value": 130.0,
        "ideal_buy_range_min": 95.0,
        "ideal_buy_range_max": 105.0
    }
    fundamental = {"fcf_quality": "High Quality", "moat_rating": "Wide Moat"}

    debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en")
    bear = debate["bear_argument"]
    bull = debate["bull_argument"]

    assert any("Downside pullback risk: Price is extended 16.7% above 200D MA support" in pt for pt in bear["key_points"])
    assert "Technical support lies at 200D SMA ($100.0 USD) indicating 16.7% downside pullback exposure" in bear["downside_risk"]
    assert any("Technical strength: Price is holding support above the 200-day moving average" in pt for pt in bull["key_points"])

def test_cio_verdict_pass_rationale_below_200d_sma():
    """Verify that when a stock is in PASS/OVERVALUED status while below 200D SMA, CIO does not claim it is overextended above 200D SMA."""
    stock = {"symbol": "FALLING", "current_price": 95.0, "currency": "USD", "pe_ratio": 50.0}
    macro = {"cycle_stage": "Contraction", "fed_sentiment": {"tone": "Hawkish"}}
    pricing = {
        "valuation_status": "Overvalued",
        "fifty_day_sma": 92.0,  # price > fifty_day_sma (triggers PASS/OVERVALUED)
        "two_hundred_day_sma": 105.0,  # price < two_hundred_day_sma
        "dcf_fair_value": 80.0,
        "ideal_buy_range_min": 65.0,
        "ideal_buy_range_max": 75.0  # price > buy_max
    }
    fundamental = {"fcf_quality": "Low Quality", "moat_rating": "None"}

    debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en")
    cio = debate["cio_verdict"]

    assert "PASS" in cio["verdict"]
    assert "overextended above 200D SMA" not in cio["judge_summary"]
    assert "below 200D SMA resistance" in cio["judge_summary"]

def test_cae_to_debate_never_outputs_negative_downside_gap():
    """Explicitly verify that CAE.TO ($33.74 CAD vs 200D SMA $35.65 CAD) never outputs negative downside gap."""
    stock = {"symbol": "CAE.TO", "company_name": "CAE Inc.", "current_price": 33.74, "currency": "CAD", "pe_ratio": 37.9}
    macro = {"cycle_stage": "Overheat", "fed_sentiment": {"tone": "Hawkish"}}
    pricing = {
        "valuation_status": "Fair Value",
        "fifty_day_sma": 32.50,
        "two_hundred_day_sma": 35.65,
        "dcf_fair_value": 47.24,
        "ideal_buy_range_min": 30.78,
        "ideal_buy_range_max": 34.98
    }
    fundamental = {"fcf_quality": "High Quality", "moat_rating": "Narrow Moat"}

    for lang in ["en", "zh", "hybrid"]:
        debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang=lang)
        bear_pts = debate["bear_argument"]["key_points"]
        bear_risk = debate["bear_argument"]["downside_risk"]

        for pt in bear_pts:
            assert "-5" not in pt
            assert "above 200D MA support" not in pt
            assert "高于 200日均线支撑位" not in pt
        assert "-5" not in bear_risk



