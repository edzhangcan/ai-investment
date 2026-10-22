"""
Comprehensive Unit Tests for Wave 3 Institutional Elevation Deliverables:
- US-07: Round 2 Rebuttals, Falsification Trigger Levels, SSE Stream & DB Persistence (#55)
- US-08: Bayesian Win Probability Shrinkage, Sector Correlation Penalty, Multi-Currency Barbell (#56)
- US-09: Point-in-Time 3M T-Bill Backtest, Sortino, Benchmark Alpha/Beta, Slippage Friction (#57)
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select
from backend.main import app
from backend.database import engine
from backend.models.db_models import DebateTranscriptDB
from backend.agents.agent_arena import MultiAgentArena
from backend.engines.portfolio_engine import (
    PortfolioEngine,
    get_core_saa_template,
    CORE_SAA_USD,
    CORE_SAA_CAD,
)
from backend.engines.backtest_engine import BacktestEngine, HISTORICAL_3M_TBILL_RATES

client = TestClient(app)

# ==============================================================================
# US-07: Round 2 Rebuttals & Multi-Agent Debate Verification
# ==============================================================================

def test_us07_fallback_debate_round2_rebuttals_and_falsification():
    """Verify fallback debate populates round 2 rebuttals, numerical falsification price level, and provenance."""
    stock = {
        "symbol": "AAPL",
        "current_price": 220.0,
        "currency": "USD",
        "pe_ratio": 33.5,
        "free_cash_flow": 105000000000,
        "is_valid": True
    }
    macro = {"cycle_stage": "Late-Cycle", "country": "US"}
    pricing = {
        "valuation_status": "Overvalued",
        "fifty_day_sma": 215.0,
        "two_hundred_day_sma": 195.0,
        "dcf_fair_value": 200.0,
        "ideal_buy_range_min": 185.0,
        "ideal_buy_range_max": 195.0,
        "bridge": {
            "enterprise_value": 3400000000000.0,
            "net_debt": 65000000000.0,
            "diluted_shares": 15500000000.0,
            "sbc_per_share": 1.25
        },
        "earnings_quality": {
            "sloan_accrual_ratio": 0.08,
            "beneish_m_score": -2.85,
            "forensic_flags": ["sbc_dilution_warning"]
        }
    }
    fundamental = {
        "fcf_quality": "STRONG_FCF",
        "moat_rating": "Wide Moat",
        "guidance_shift_deltas": []
    }

    debate = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="en", country="US")

    # 1. Round 2 Rebuttals must be present
    assert "bull_rebuttal" in debate
    assert "bear_rebuttal" in debate
    assert debate["bull_rebuttal"] is not None and len(debate["bull_rebuttal"]) > 20
    assert debate["bear_rebuttal"] is not None and len(debate["bear_rebuttal"]) > 20

    # Bear Rebuttal must interrogate SBC dilution and forensic flags
    assert "sbc" in debate["bear_rebuttal"].lower() or "dilution" in debate["bear_rebuttal"].lower()

    # 2. CIO Numerical Falsification Price Level & Trigger
    assert "falsification_price_level" in debate
    assert isinstance(debate["falsification_price_level"], (int, float))
    assert debate["falsification_price_level"] > 0
    # Decisive break below 200D SMA (-3% buffer): 195 * 0.97 = 189.15
    assert round(debate["falsification_price_level"], 2) == round(195.0 * 0.97, 2)
    assert "falsification_trigger_condition" in debate
    assert "200" in debate["falsification_trigger_condition"]

    # 3. Provenance metadata
    assert "provenance" in debate
    assert debate["provenance"]["source_mode"] == "SIMULATED_FALLBACK"

def test_us07_debate_multilingual_rebuttals():
    """Verify rebuttals are properly translated in Chinese and Hybrid modes."""
    stock = {"symbol": "SHOP.TO", "current_price": 110.0, "currency": "CAD", "pe_ratio": 65.0, "free_cash_flow": 800000000, "is_valid": True}
    macro = {"cycle_stage": "Easing", "country": "CA"}
    pricing = {
        "valuation_status": "Fair Value",
        "fifty_day_sma": 105.0,
        "two_hundred_day_sma": 95.0,
        "dcf_fair_value": 115.0,
        "ideal_buy_range_min": 90.0,
        "ideal_buy_range_max": 98.0,
        "bridge": {"sbc_per_share": 0.85},
        "earnings_quality": {"forensic_flags": []}
    }
    fundamental = {"fcf_quality": "High Quality", "moat_rating": "Narrow Moat"}

    # Test Chinese
    debate_zh = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="zh", country="CA")
    assert "空头第二轮反驳" in debate_zh["bear_rebuttal"]
    assert "多头第二轮反驳" in debate_zh["bull_rebuttal"]
    assert "200日均线" in debate_zh["falsification_trigger_condition"]

    # Test Hybrid
    debate_hy = MultiAgentArena._run_fallback_debate(stock, macro, pricing, fundamental, lang="hybrid", country="CA")
    assert "Bear Rebuttal" in debate_hy["bear_rebuttal"]
    assert "Bull Rebuttal" in debate_hy["bull_rebuttal"]

def test_us07_debate_rest_endpoint_and_db_persistence():
    """Verify POST /api/debate/{symbol} persists transcript and falsification trigger to SQLite."""
    res = client.post("/api/debate/NVDA?lang=en")
    assert res.status_code == 200
    data = res.json()

    assert data["symbol"] == "NVDA"
    assert "bull_rebuttal" in data
    assert "bear_rebuttal" in data
    assert "falsification_price_level" in data
    assert data["falsification_price_level"] is not None

    # Verify SQLite DB record
    with Session(engine) as session:
        records = session.exec(
            select(DebateTranscriptDB).where(DebateTranscriptDB.symbol == "NVDA").order_by(DebateTranscriptDB.id.desc())
        ).all()
        assert len(records) > 0
        latest = records[0]
        assert latest.symbol == "NVDA"
        assert latest.bull_rebuttal is not None
        assert latest.bear_rebuttal is not None
        assert latest.falsification_price_level is not None
        assert latest.falsification_trigger_condition is not None

def test_us07_debate_sse_stream_endpoint():
    """Verify GET /api/debate/{symbol}/stream yields SSE text/event-stream chunks across stages."""
    with client.stream("GET", "/api/debate/MSFT/stream?lang=en") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")

        lines = [line for line in response.iter_lines() if line.startswith("data:")]
        assert len(lines) >= 3  # opening, rebuttal, complete stages

        # First line is opening
        import json
        stage1 = json.loads(lines[0][len("data:"):])
        assert stage1["stage"] == "opening"
        assert "bull_argument" in stage1

        # Second line is rebuttal
        stage2 = json.loads(lines[1][len("data:"):])
        assert stage2["stage"] == "rebuttal"
        assert "bull_rebuttal" in stage2
        assert "bear_rebuttal" in stage2

        # Third line is complete
        stage3 = json.loads(lines[2][len("data:"):])
        assert stage3["stage"] == "complete"
        assert "cio_verdict" in stage3
        assert "falsification_price_level" in stage3

def test_pl716_debate_and_stock_force_refresh_ground_truth_verification():
    """Verify that force_refresh=true parameter bypasses cache and upgrades debate to verified filing ground truth."""
    # 1. Test GET /api/stock/AAPL?force_refresh=true
    stock_res = client.get("/api/stock/AAPL?force_refresh=true&lang=en")
    assert stock_res.status_code == 200
    s_data = stock_res.json()
    assert "stock" in s_data
    assert "debate" in s_data
    assert s_data["debate"]["provenance"]["source_mode"] == "LIVE"

    # 2. Test POST /api/debate/AAPL?force_refresh=true
    debate_res = client.post("/api/debate/AAPL?force_refresh=true&lang=zh")
    assert debate_res.status_code == 200
    d_data = debate_res.json()
    assert d_data["provenance"]["source_mode"] == "LIVE"
    assert "Verified" in d_data["provenance"]["data_source"] or "Gemini" in d_data["provenance"]["data_source"]
    assert d_data["cio_verdict"]["empirical_proof_verified"] is True

# ==============================================================================
# US-08: Correlated Kelly & Multi-Currency Barbell Verification
# ==============================================================================

def test_us08_bayesian_win_probability_shrinkage():
    """Verify Bayesian shrinkage formula p_shrunk = 0.50 + 0.35 * (p_raw - 0.50) and fallback haircut."""
    # Conviction 80 -> p_raw = 0.80 -> p_shrunk = 0.50 + 0.35 * 0.30 = 0.605
    p1 = PortfolioEngine.calibrate_win_probability(80.0, is_fallback_data=False)
    assert p1 == 0.605

    # Conviction 20 -> p_raw = 0.20 -> p_shrunk = 0.50 + 0.35 * (-0.30) = 0.395
    p2 = PortfolioEngine.calibrate_win_probability(20.0, is_fallback_data=False)
    assert p2 == 0.395

    # Conviction 50 -> neutral prior stays 0.50
    p_neutral = PortfolioEngine.calibrate_win_probability(50.0, is_fallback_data=False)
    assert p_neutral == 0.50

    # Heuristic fallback haircut: 0.605 * 0.90 = 0.5445
    p_fallback = PortfolioEngine.calibrate_win_probability(80.0, is_fallback_data=True)
    assert p_fallback == 0.5445

def test_us08_sector_correlation_penalty():
    """Verify correlation penalty factor = 1.0 / (1.0 + 0.25 * same_sector_count)."""
    # 0 holdings in sector -> penalty = 1.0
    res0 = PortfolioEngine.calculate_kelly_position(
        conviction_score=80.0,
        upside_pct=30.0,
        stop_loss_pct=10.0,
        same_sector_count=0
    )
    assert res0["correlation_penalty_factor"] == 1.0

    # 1 holding in sector -> penalty = 1.0 / 1.25 = 0.80
    res1 = PortfolioEngine.calculate_kelly_position(
        conviction_score=80.0,
        upside_pct=30.0,
        stop_loss_pct=10.0,
        same_sector_count=1
    )
    assert res1["correlation_penalty_factor"] == 0.80

    # 2 holdings in sector -> penalty = 1.0 / 1.50 = 0.667
    res2 = PortfolioEngine.calculate_kelly_position(
        conviction_score=80.0,
        upside_pct=30.0,
        stop_loss_pct=10.0,
        same_sector_count=2
    )
    assert res2["correlation_penalty_factor"] == 0.667

    # Recommended weight should decrease as sector concentration increases
    assert res0["recommended_weight_pct"] >= res1["recommended_weight_pct"]
    assert res1["recommended_weight_pct"] >= res2["recommended_weight_pct"]

def test_us08_multi_currency_core_saa_barbell_templates():
    """Verify USD and CAD distinct Core SAA ETF templates and macro tightening tilt."""
    # USD Base template
    usd_core = get_core_saa_template(base_currency="USD", macro_regime="NEUTRAL")
    usd_symbols = [x["symbol"] for x in usd_core]
    assert usd_symbols == ["SPY", "QQQ", "SCHD", "TLT", "GLD"]
    total_usd_weight = sum(x["target_pct"] for x in usd_core)
    assert total_usd_weight == 80.0

    # CAD Base template
    cad_core = get_core_saa_template(base_currency="CAD", macro_regime="NEUTRAL")
    cad_symbols = [x["symbol"] for x in cad_core]
    assert cad_symbols == ["VFV.TO", "XIC.TO", "ZDV.TO", "ZFL.TO", "CGL.TO"]
    total_cad_weight = sum(x["target_pct"] for x in cad_core)
    assert total_cad_weight == 80.0

    # Tightening tilt for USD: QQQ drops from 20% to 15%, SCHD and GLD gain 2.5% each
    usd_tightening = get_core_saa_template(base_currency="USD", macro_regime="TIGHTENING")
    qqq_weight = next(x["target_pct"] for x in usd_tightening if x["symbol"] == "QQQ")
    schd_weight = next(x["target_pct"] for x in usd_tightening if x["symbol"] == "SCHD")
    gld_weight = next(x["target_pct"] for x in usd_tightening if x["symbol"] == "GLD")
    assert qqq_weight == 15.0
    assert schd_weight == 12.5
    assert gld_weight == 12.5
    assert sum(x["target_pct"] for x in usd_tightening) == 80.0

    # Tightening tilt for CAD: VFV.TO drops from 25% to 20%, ZDV.TO and CGL.TO gain 2.5% each
    cad_tightening = get_core_saa_template(base_currency="CAD", macro_regime="LATE-CYCLE")
    vfv_weight = next(x["target_pct"] for x in cad_tightening if x["symbol"] == "VFV.TO")
    zdv_weight = next(x["target_pct"] for x in cad_tightening if x["symbol"] == "ZDV.TO")
    cgl_weight = next(x["target_pct"] for x in cad_tightening if x["symbol"] == "CGL.TO")
    assert vfv_weight == 20.0
    assert zdv_weight == 17.5
    assert cgl_weight == 12.5
    assert sum(x["target_pct"] for x in cad_tightening) == 80.0

def test_us08_portfolio_calculate_rest_cad_barbell():
    """Verify /api/portfolio/calculate route respects base_currency=CAD and macro_regime."""
    payload = {
        "cash_balance": 100000.0,
        "risk_profile": "BARBELL_80_20",
        "currency": "CAD",
        "base_currency": "CAD",
        "macro_regime": "TIGHTENING",
        "symbols": ["SHOP.TO", "TD.TO"],
        "lang": "en"
    }
    res = client.post("/api/portfolio/calculate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["base_currency"] == "CAD"
    assert data["active_macro_regime"] == "TIGHTENING"
    core_symbols = [p["symbol"] for p in data["position_breakdown"] if p["allocation_tier"] == "CORE_SAA"]
    assert "VFV.TO" in core_symbols
    assert "XIC.TO" in core_symbols
    assert "ZDV.TO" in core_symbols


# ==============================================================================
# US-09: Point-in-Time 3M T-Bill Backtest, Sortino & Friction Verification
# ==============================================================================

def test_us09_dynamic_tbill_rates_applied():
    """Verify BacktestEngine uses authentic 2021-2025 US 3M T-Bill rates and returns Sortino, Alpha, Beta."""
    res = BacktestEngine.run_backtest(symbols=["NVDA", "MSFT"], benchmark="SPY", lang="en")

    # 1. T-Bill rate schedules
    assert "yearly_risk_free_rates" in res
    assert res["yearly_risk_free_rates"]["2021"] == 0.05
    assert res["yearly_risk_free_rates"]["2022"] == 2.02
    assert res["yearly_risk_free_rates"]["2023"] == 5.07
    assert res["yearly_risk_free_rates"]["2024"] == 5.25
    assert res["yearly_risk_free_rates"]["2025"] == 4.30

    # 2. Sortino Ratio
    assert "sortino_ratio" in res
    assert isinstance(res["sortino_ratio"], (int, float))

    # 3. Benchmark Alpha and Beta
    assert "benchmark_alpha" in res
    assert "benchmark_beta" in res
    assert isinstance(res["benchmark_alpha"], (int, float))
    assert isinstance(res["benchmark_beta"], (int, float))

    # 4. 10 bps quarterly rebalancing turnover friction
    assert res["slippage_bps_applied"] == 10.0
    assert "survivorship_bias_notice" in res
    assert "surviving" in res["survivorship_bias_notice"]

def test_us09_single_stock_rebalance_friction():
    """Verify 10 bps quarterly rebalancing turnover friction is deducted from quarterly CAGR."""
    res = BacktestEngine.run_backtest(symbols=["AAPL"], benchmark="SPY", lang="en")

    assert res["period_years"] == 5
    assert res["slippage_bps_applied"] == 10.0
    assert res["sortino_ratio"] is not None
    assert "rebalancing_simulation" in res
    rebal = res["rebalancing_simulation"]
    assert "quarterly_rebalanced_cagr_pct" in rebal
    assert "rebalancing_bonus_bps" in rebal
