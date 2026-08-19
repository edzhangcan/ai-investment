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

