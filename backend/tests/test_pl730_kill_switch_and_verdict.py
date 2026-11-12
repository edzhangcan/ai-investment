"""
Regression & Acceptance Test Suite for PL-730:
1. Holdings-only & cost-basis-aware Thesis Falsification Kill-Switch floor
   (prevents false breaches when purchased or trading under 200D SMA floor).
2. Terminology standardization: 纪律原则 / Discipline (zero 《纪律.md》 / 纪律.md).
3. Concise, non-redundant CIO Verdict copy & Discipline veto de-duplication.
"""

import pytest
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from backend.agents.agent_arena import MultiAgentArena
from backend.engines.discipline_engine import DisciplineEngine
from backend.models.db_models import UserWatchlistDB
from backend.services.alert_engine import PriceAlertEngine


def _sample_four_context(buy_in_price=None, trend_temp="WARM", batting_zone="RIGHT_SIDE", action_status="IN_BUY_ZONE"):
    stock = {
        "symbol": "FOUR",
        "company_name": "Shift4 Payments",
        "current_price": 41.43,
        "twenty_day_sma": 40.95,
        "fifty_day_sma": 40.34,
        "two_hundred_day_sma": 45.38,
        "atr_14": 2.59,
        "rsi_14": 50.6,
        "pe_ratio": 18.2,
        "free_cash_flow": 300_000_000.0,
        "roic": 0.14,
        "currency": "USD",
        "is_valid": True,
        "taxonomy": {"taxonomy": "TREE"},
    }
    if buy_in_price is not None:
        stock["buy_in_price"] = buy_in_price
        stock["bucket"] = "HOLDING"

    pricing = {
        "valuation_status": "UNDERVALUED",
        "fifty_day_sma": 40.34,
        "two_hundred_day_sma": 45.38,
        "dcf_fair_value": 61.85,
        "ideal_buy_range_min": 36.50,
        "ideal_buy_range_max": 42.99,
        "trend_temperature": trend_temp,
        "batting_zone": batting_zone,
        "right_side_path": "SUPPORT_BOUNCE" if batting_zone == "RIGHT_SIDE" else "NONE",
        "action_status": action_status,
        "ret_5d_pct": -1.5 if batting_zone == "LEFT_SIDE_WATCH" else 2.1,
        "reverse_dcf": {"implied_10y_ceiling_multiple": 2.4, "is_prosperity_trap": False},
    }
    macro = {"cycle_stage": "Late-Cycle", "fed_sentiment": {"tone": "Neutral"}}
    fundamental = {"fcf_quality": "STRONG_FCF", "moat_rating": "Narrow Moat", "free_cash_flow": 300_000_000.0}
    return stock, macro, pricing, fundamental


def test_purchased_under_200d_floor_uses_cost_basis_stop():
    """
    When a stock like FOUR (200D SMA $45.38 -> 200D floor $44.02) is purchased at $43.50
    under the 200D floor and currently trades at $41.43, the falsification floor must anchor
    below buy_in_price via COST_BASIS_ATR_STOP and NOT false-trigger at $44.02.
    """
    stock, macro, pricing, fundamental = _sample_four_context(buy_in_price=43.50)

    res_en = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en")
    sc_en = res_en["cio_verdict"]["mianji_framework"]["soul_check"]

    assert res_en["falsification_price_level"] < 41.43
    assert sc_en["bottom_threshold"] == res_en["falsification_price_level"]
    assert sc_en["floor_type"] == "COST_BASIS_ATR_STOP"
    assert sc_en["buy_in_price"] == 43.50
    assert sc_en["is_falsified"] is False
    assert "Cost-basis stop" in res_en["falsification_trigger_condition"]
    assert "bypassed" in res_en["falsification_trigger_condition"]

    res_zh = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="zh")
    assert res_zh["cio_verdict"]["mianji_framework"]["soul_check"]["floor_type"] == "COST_BASIS_ATR_STOP"
    assert "成本止损底线" in res_zh["falsification_trigger_condition"]
    assert "不适用均线止损" in res_zh["falsification_trigger_condition"]


def test_below_200d_without_buy_in_uses_recovery_support_stop():
    """Below-200D stock without buy_in_price recorded anchors to RECOVERY_SUPPORT_STOP below spot."""
    stock, macro, pricing, fundamental = _sample_four_context(buy_in_price=None)

    res = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en")
    sc = res["cio_verdict"]["mianji_framework"]["soul_check"]

    assert res["falsification_price_level"] < 41.43
    assert sc["floor_type"] == "RECOVERY_SUPPORT_STOP"
    assert sc["is_falsified"] is False


def test_above_200d_structural_floor_preserved():
    """Above-200D stocks continue using the classic -3% 200D SMA structural floor."""
    stock = {
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "current_price": 220.0,
        "fifty_day_sma": 215.0,
        "two_hundred_day_sma": 195.0,
        "currency": "USD",
        "is_valid": True,
    }
    macro = {"cycle_stage": "Expansion", "fed_sentiment": {"tone": "Neutral"}}
    pricing = {
        "valuation_status": "FAIR",
        "fifty_day_sma": 215.0,
        "two_hundred_day_sma": 195.0,
        "dcf_fair_value": 230.0,
        "ideal_buy_range_min": 185.0,
        "ideal_buy_range_max": 205.0,
    }
    fundamental = {"fcf_quality": "STRONG_FCF", "moat_rating": "Wide Moat"}

    res = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en")
    sc = res["cio_verdict"]["mianji_framework"]["soul_check"]

    assert res["falsification_price_level"] == round(195.0 * 0.97, 2)
    assert sc["floor_type"] == "STRUCTURAL_200D_STOP"
    assert sc["is_falsified"] is False


def test_hydrate_holding_context_from_watchlist_db():
    """hydrate_holding_context injects bucket and buy_in_price from UserWatchlistDB."""
    mem_engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(mem_engine)
    with Session(mem_engine) as session:
        session.add(
            UserWatchlistDB(
                symbol="FOUR",
                company_name="Shift4 Payments",
                bucket="HOLDING",
                buy_in_price=43.50,
                shares_held=25.0,
            )
        )
        session.commit()

        stock_payload = {"symbol": "FOUR", "current_price": 41.43}
        PriceAlertEngine.hydrate_holding_context(stock_payload, "four", session=session)
        assert stock_payload["bucket"] == "HOLDING"
        assert stock_payload["buy_in_price"] == 43.50
        assert stock_payload["shares_held"] == 25.0

        untracked_payload = {"symbol": "MSFT", "current_price": 420.0}
        PriceAlertEngine.hydrate_holding_context(untracked_payload, "MSFT", session=session)
        assert untracked_payload["bucket"] == "NONE"
        assert "buy_in_price" not in untracked_payload


def test_discipline_terminology_standardized_no_book_marks_or_md():
    """Verify 《纪律.md》 and 纪律.md are replaced by 纪律原则 / Discipline."""
    audit_pass_en = DisciplineEngine.audit_trade({"symbol": "NVDA", "taxonomy": {"taxonomy": "TREE"}}, lang="en")
    audit_pass_zh = DisciplineEngine.audit_trade({"symbol": "NVDA", "taxonomy": {"taxonomy": "TREE"}}, lang="zh")
    audit_fail_zh = DisciplineEngine.audit_trade(
        {"symbol": "TRAP", "taxonomy": {"taxonomy": "GRAIN"}},
        pricing_data={"reverse_dcf": {"is_prosperity_trap": True}},
        lang="zh",
    )

    for text in [
        audit_pass_en["summary"],
        audit_pass_zh["summary"],
        audit_fail_zh["summary"],
        DisciplineEngine.get_constitution_content("nonexistent_file.md"),
    ]:
        assert "《" not in text and "》" not in text
        assert "纪律.md" not in text

    assert "Discipline" in audit_pass_en["summary"]
    assert "纪律原则" in audit_pass_zh["summary"]
    assert "纪律原则" in audit_fail_zh["summary"]


def test_cio_verdict_concise_and_no_duplicate_audit_prefix():
    """Verify CIO verdict copy is concise and does not duplicate [audit['summary']] on left-side/trap blocks."""
    stock, macro, pricing, fundamental = _sample_four_context(
        buy_in_price=None,
        trend_temp="FREEZE",
        batting_zone="LEFT_SIDE_WATCH",
        action_status="LEFT_SIDE_WATCH",
    )

    for lang in ("en", "zh", "hybrid"):
        res = MultiAgentArena.run_debate(stock, macro, pricing, fundamental, lang=lang)
        cio = res["cio_verdict"]
        summary = cio["judge_summary"]
        sizing = cio["position_sizing_advice"]
        diagnosis = cio["mianji_framework"]["taxonomy_diagnosis"]

        assert "《" not in sizing and "》" not in sizing and "纪律.md" not in sizing
        assert "DISCIPLINE BLOCKED:" not in summary
        assert len(summary) <= 220
        assert len(diagnosis) <= 220
