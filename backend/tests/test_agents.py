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
    assert debate["cio_verdict"]["verdict"] in ["BUY (建议买入/分批建仓)", "HOLD / WATCH (观望/等待回调)", "PASS / OVERVALUED (估值偏高/暂不建仓)"]
