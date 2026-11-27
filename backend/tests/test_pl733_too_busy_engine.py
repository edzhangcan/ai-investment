"""
Automated Pytest Suite for PL-733: Standalone "Too Busy" 10-Minute EOD Systematic Index Tool (Tab 5).
Verifies the Adjusted Long-Only Core Strategy (TQQQ + SGOV / HQU.TO + CASH.TO),
App-Launch Daily Advice & Action Signals, <$10K Share-Delta & 10% Hysteresis Solver,
PDT/Tax/FX Guardrails, Honest Multi-Decade Leveraged Backtester, and FastAPI REST Endpoints.
"""

import datetime
from fastapi.testclient import TestClient
from backend.main import app
from backend.engines.too_busy_engine import TooBusyEngine, _get_ny_tz

client = TestClient(app)


def test_too_busy_long_only_primary_bull_100_pct():
    """S1 (+70%) + S2 (+30%) = 100% TQQQ when ^NDX > 250D & 50D SMA with healthy acceleration."""
    features = {
        "current_close": 21000.0,
        "sma_20": 20500.0,
        "sma_50": 20000.0,
        "sma_250": 18500.0,
        "ext_50_pct": 5.0,
        "ext_250_pct": 13.5,
        "roc_1_pct": 0.4,
        "roc_5_pct": 1.8,
        "roc_10_pct": 2.6,
        "roc_20_pct": 4.2,
        "d_roc_5_pct": 0.6,
        "z_bb_20": 1.1,
        "rsi_5": 62.0,
        "rsi_10": 60.0,
        "is_above_250d": True,
        "is_above_50d": True,
        "is_above_20d": True,
    }
    res = TooBusyEngine.evaluate_from_features(features, strategy_mode="TOO_BUSY_LONG_ONLY", market="US")
    assert res["target_long_pct"] == 100.0
    assert res["target_cash_pct"] == 0.0
    assert res["target_short_pct"] == 0.0
    assert res["vehicles"]["long_etf"] == "TQQQ"
    assert res["vehicles"]["cash_etf"] == "SGOV"


def test_s5_velocity_deceleration_trim_to_30_pct():
    """Velocity deceleration rule (S5): when Ext_50 > +10% and dROC_5 < 0 with ROC_5 < 0, trims TQQQ to 30%."""
    features = {
        "current_close": 22300.0,
        "sma_20": 21800.0,
        "sma_50": 20000.0,
        "sma_250": 18000.0,
        "ext_50_pct": 11.5,
        "ext_250_pct": 23.8,
        "roc_1_pct": -0.3,
        "roc_5_pct": -0.6,
        "roc_10_pct": 2.2,
        "roc_20_pct": 7.5,
        "d_roc_5_pct": -3.4,
        "z_bb_20": 1.4,
        "rsi_5": 48.0,
        "rsi_10": 64.0,
        "is_above_250d": True,
        "is_above_50d": True,
        "is_above_20d": True,
    }
    res = TooBusyEngine.evaluate_from_features(features, strategy_mode="TOO_BUSY_LONG_ONLY", market="US")
    assert res["target_long_pct"] == 30.0
    assert res["target_cash_pct"] == 70.0
    assert res["target_short_pct"] == 0.0
    assert res["regime_code"] == "BULL_OVEREXTENDED_TRIM"


def test_bear_regime_rotates_100_pct_to_tbill_cash_shield():
    """In TOO_BUSY_LONG_ONLY, breaking below 250D & 50D SMA rotates 100% into T-Bill Cash (0% SQQQ)."""
    features = {
        "current_close": 16500.0,
        "sma_20": 17200.0,
        "sma_50": 17800.0,
        "sma_250": 18500.0,
        "ext_50_pct": -7.3,
        "ext_250_pct": -10.8,
        "roc_1_pct": -0.5,
        "roc_5_pct": -2.1,
        "roc_10_pct": -4.5,
        "roc_20_pct": -8.0,
        "d_roc_5_pct": -1.2,
        "z_bb_20": -1.5,
        "rsi_5": 35.0,
        "rsi_10": 36.0,
        "is_above_250d": False,
        "is_above_50d": False,
        "is_above_20d": False,
    }
    res_long_only = TooBusyEngine.evaluate_from_features(features, strategy_mode="TOO_BUSY_LONG_ONLY", market="CA")
    assert res_long_only["target_long_pct"] == 0.0
    assert res_long_only["target_short_pct"] == 0.0
    assert res_long_only["target_cash_pct"] == 100.0
    assert res_long_only["vehicles"]["cash_etf"] == "CASH.TO"

    res_dual = TooBusyEngine.evaluate_from_features(features, strategy_mode="TOO_BUSY_DUAL", market="US")
    assert res_dual["target_short_pct"] == 50.0
    assert res_dual["target_long_pct"] == 0.0

    # When overstretched < -9% below 50D SMA or dROC_5 >= 0 (rebounding double-bottom), S7 anti-squeeze blocks SQQQ
    squeezed_features = dict(features, ext_50_pct=-10.38, d_roc_5_pct=0.49)
    res_squeezed = TooBusyEngine.evaluate_from_features(squeezed_features, strategy_mode="TOO_BUSY_DUAL", market="US")
    assert res_squeezed["target_short_pct"] == 0.0
    assert res_squeezed["target_cash_pct"] == 100.0


def test_small_account_rebalance_ticket_hysteresis_and_sell_first():
    """<$10K Share-Delta Solver orders SELL before BUY and respects the 10% hysteresis filter."""
    tkt = TooBusyEngine.compute_rebalance_ticket(
        strategy_mode="TOO_BUSY_LONG_ONLY",
        market="US",
        account_type="TAXABLE",
        cash_balance=0.0,
        current_long_shares=100,
        current_short_shares=0,
        current_cash_etf_shares=0,
        hysteresis_pct=10.0,
        custom_long_price=65.0,
        custom_cash_etf_price=100.0,
        override_target_long_pct=30.0,
        use_live=False,
    )
    assert tkt["total_equity"] == 6500.0
    assert tkt["is_small_account_under_10k"] is True
    assert tkt["rebalance_required"] is True
    assert tkt["pdt_status"] == "PDT_SAFE_OVERNIGHT_HOLD"
    assert len(tkt["order_steps"]) == 2
    assert tkt["order_steps"][0]["action"] == "SELL"
    assert tkt["order_steps"][0]["symbol"] == "TQQQ"
    assert tkt["order_steps"][0]["shares"] == 70
    assert tkt["order_steps"][1]["action"] == "BUY"
    assert tkt["order_steps"][1]["symbol"] == "SGOV"
    assert tkt["order_steps"][1]["shares"] == 45
    assert any(w["code"] == "TAXABLE_WASH_SALE_DRAG" for w in tkt["friction_warnings"])

    tkt_hold = TooBusyEngine.compute_rebalance_ticket(
        strategy_mode="TOO_BUSY_LONG_ONLY",
        market="US",
        cash_balance=4550.0,
        current_long_shares=30,
        current_cash_etf_shares=0,
        hysteresis_pct=10.0,
        custom_long_price=65.0,
        custom_cash_etf_price=100.0,
        override_target_long_pct=35.0,
        use_live=False,
    )
    assert tkt_hold["rebalance_required"] is False
    assert len(tkt_hold["order_steps"]) == 0


def test_daily_launch_advice_and_execution_clock():
    """App-Launch Daily Advice classifies action signals and 15:50 EST clock states accurately."""
    live_window_dt = datetime.datetime(2026, 11, 24, 15, 53, tzinfo=_get_ny_tz())
    advice = TooBusyEngine.get_daily_launch_advice(
        strategy_mode="TOO_BUSY_LONG_ONLY",
        market="US",
        cash_balance=5000.0,
        current_long_shares=0,
        current_cash_etf_shares=0,
        override_target_long_pct=100.0,
        use_live=False,
        now_est=live_window_dt,
    )
    assert advice["action_signal"] == "STRONG_BUY_RISK_ON"
    assert advice["execution_clock"]["window_state"] == "ACTION_WINDOW_OPEN"
    assert advice["execution_clock"]["is_action_window_live"] is True
    assert advice["rebalance_required"] is True

    cash_shield_advice = TooBusyEngine.get_daily_launch_advice(
        strategy_mode="TOO_BUSY_LONG_ONLY",
        market="US",
        cash_balance=0.0,
        current_long_shares=80,
        current_cash_etf_shares=0,
        override_target_long_pct=0.0,
        use_live=False,
    )
    assert cash_shield_advice["action_signal"] == "ROTATE_TO_CASH_SHIELD"


def test_honest_backtest_deducts_2x_fed_funds_financing_drag():
    """Realistic multi-decade leveraged backtest deducts 2x Fed Funds swap drag + 0.95% ER."""
    bt = TooBusyEngine.run_backtest(
        horizon="40Y_FULL_1986",
        strategy_mode="TOO_BUSY_LONG_ONLY",
        use_live=False,
    )
    assert bt["realistic_net_cagr_pct"] < bt["naive_no_drag_cagr_pct"]
    assert bt["annual_financing_drag_pct"] > 1.0
    assert bt["max_drawdown_pct"] < bt["tqqq_bh_max_drawdown_pct"]
    assert len(bt["equity_curve"]) >= 35


def test_too_busy_fastapi_endpoints():
    """Verifies /api/too-busy/* endpoints, PL-734 beginner guides, and live cache isolation."""
    from backend.engines import too_busy_engine as tbe

    # Populate synthetic sentinel in _NDX_LIVE_CACHE and confirm use_live=False does not wipe it
    sentinel_bars = [("2026-11-23", 25999.0), ("2026-11-24", 26083.0)]
    tbe._NDX_LIVE_CACHE["bars"] = list(sentinel_bars)
    tbe._NDX_LIVE_CACHE["is_live_source"] = True
    tbe._NDX_LIVE_CACHE["timestamp"] = 9999999999.0

    r1 = client.get("/api/too-busy/regime?strategy_mode=TOO_BUSY_LONG_ONLY&market=US&use_live=false")
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["strategy_mode"] == "TOO_BUSY_LONG_ONLY"
    assert len(d1["sub_strategies"]) == 7
    s6 = next(s for s in d1["sub_strategies"] if s["id"] == "S6")
    assert s6["status"] == "DISABLED_IN_LONG_ONLY"
    assert tbe._NDX_LIVE_CACHE["bars"] == sentinel_bars
    assert tbe._NDX_LIVE_CACHE["is_live_source"] is True

    # Reset live cache sentinel so offline checks stay deterministic afterwards
    tbe._NDX_LIVE_CACHE["bars"] = []
    tbe._NDX_LIVE_CACHE["is_live_source"] = False
    tbe._NDX_LIVE_CACHE["timestamp"] = 0.0

    # Verify PL-734 contracts
    assert "data_freshness" in d1
    guide = d1["beginner_decision_guide"]
    assert "aggressive_dual_track" in guide["recommended_strategy"]
    assert "balanced_long_only_track" in guide["recommended_strategy"]
    assert len(guide["execution_timeline_explainer"]["steps"]) == 4
    assert len(guide["execution_timeline_explainer"]["why_today_predicts_tomorrow"]) == 3
    assert len(guide["key_signals_checklist"]) == 4
    assert "headline_en" in guide["action_verdict"]

    etf_matrix = d1["equivalent_etf_matrix"]
    assert len(etf_matrix["families"]) == 5
    assert len(etf_matrix["us_vs_canada_differences"]) >= 4

    duet = d1["cross_border_duet"]
    assert duet["usd_pod"]["strategy_mode"] == "TOO_BUSY_DUAL"
    assert duet["cad_pod"]["strategy_mode"] == "TOO_BUSY_LONG_ONLY"

    r_duet = client.get("/api/too-busy/cross-border-duet?usd_capital=6000&cad_capital=4000&use_live=false")
    assert r_duet.status_code == 200
    duet_json = r_duet.json()
    assert duet_json["usd_account_equity"] == 6000.0
    assert duet_json["cad_account_equity"] == 4000.0
    assert "effective_bull_leverage" in duet_json["blended_summary"]

    r_adv = client.get("/api/too-busy/daily-advice?strategy_mode=TOO_BUSY_LONG_ONLY&market=US&use_live=false")
    assert r_adv.status_code == 200
    adv_json = r_adv.json()
    assert "action_signal" in adv_json
    assert "execution_clock" in adv_json
    assert "data_freshness" in adv_json
    assert "beginner_decision_guide" in adv_json

    r2 = client.post(
        "/api/too-busy/rebalance-ticket",
        json={
            "strategy_mode": "TOO_BUSY_LONG_ONLY",
            "market": "US",
            "account_type": "ROTH_IRA",
            "cash_balance": 2000.0,
            "current_long_shares": 40,
            "current_cash_etf_shares": 20,
            "hysteresis_pct": 10.0,
            "use_live": False,
        },
    )
    assert r2.status_code == 200
    assert "order_steps" in r2.json()

    r3 = client.get("/api/too-busy/backtest?horizon=16Y_POST_2010&strategy_mode=TOO_BUSY_LONG_ONLY&use_live=false")
    assert r3.status_code == 200
    assert "realistic_net_cagr_pct" in r3.json()
