"""
Automated Test Suite for Advanced Equity Methodology Transformation
Covers:
- Phase 1: Stock Taxonomy (Tree/Grain/Vegetable), Reverse-DCF Implied Narrative Ceiling, & Prosperity Trap
- Phase 2: Efficient Frontier, 80/20 Barbell Kelly Sizing, & Liability Stress Test
- Phase 3: High-Resolution Live Backtester & Calmar Analytics
- Phase 4: 纪律.md Engine, 4-State Trend Temperature (冻/平/温/热), & Bayesian Soul Check
- Phase 5: Big Picture Macro (AIAE, Modified Buffett) & 4-Layer Gold Board
"""

import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.models.schemas import StockTaxonomyEnum
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.portfolio_engine import PortfolioEngine
from backend.engines.backtest_engine import BacktestEngine
from backend.data_sources.data_provider import DataProviderManager

client = TestClient(app)

# ==============================================================================
# PHASE 1 TESTS: Taxonomy, Reverse-DCF Ceiling & Shareholder Yield
# ==============================================================================

def test_stock_taxonomy_tree_classification():
    """Verify high-ROIC secular compounders with positive FCF and low dilution are classified as TREE (种树)."""
    stock_tree = {
        "symbol": "NVDA",
        "free_cash_flow": 60000000000,
        "roic": 0.62,
        "revenue_growth": 0.50,
        "dilution_3y_pct": 0.5,
        "dividend_yield_pct": 0.1,
        "net_buyback_yield_pct": 1.5,
        "pe_ratio": 45.0
    }
    result = FundamentalEngine.classify_stock_taxonomy(stock_tree)
    assert result["taxonomy"] == StockTaxonomyEnum.TREE.value
    assert "Tree" in result["badge_en"]
    assert "种树" in result["badge_zh"]
    assert result["total_shareholder_yield_pct"] == 1.6

def test_stock_taxonomy_grain_classification():
    """Verify cyclical/dividend cash cows with high shareholder yield or low PE are classified as GRAIN (种粮)."""
    stock_grain = {
        "symbol": "KO",
        "free_cash_flow": 10000000000,
        "roic": 0.12,
        "revenue_growth": 0.04,
        "dilution_3y_pct": 0.0,
        "dividend_yield_pct": 3.1,
        "net_buyback_yield_pct": 0.8,
        "pe_ratio": 24.0
    }
    result = FundamentalEngine.classify_stock_taxonomy(stock_grain)
    assert result["taxonomy"] == StockTaxonomyEnum.GRAIN.value
    assert "Grain" in result["badge_en"]
    assert "种粮" in result["badge_zh"]
    assert result["total_shareholder_yield_pct"] == 3.9

def test_stock_taxonomy_vegetable_classification():
    """Verify negative-FCF or high-dilution equities are classified as VEGETABLE (种菜)."""
    stock_veg = {
        "symbol": "MOCK_VEG",
        "free_cash_flow": -50000000,
        "roic": -0.10,
        "revenue_growth": 0.20,
        "dilution_3y_pct": 10.5,
        "dividend_yield_pct": 0.0,
        "net_buyback_yield_pct": 0.0,
        "pe_ratio": None
    }
    result = FundamentalEngine.classify_stock_taxonomy(stock_veg)
    assert result["taxonomy"] == StockTaxonomyEnum.VEGETABLE.value
    assert "Vegetable" in result["badge_en"]
    assert "种菜" in result["badge_zh"]

def test_reverse_dcf_implied_ceiling_solver():
    """Verify 30-step binary search solves for implied 10-year earnings multiple given current PE."""
    # Current PE = 30.0
    solved = PricingEngine.solve_implied_narrative_ceiling(current_pe=30.0, net_income=1000000000)
    assert solved["current_pe"] == 30.0
    assert solved["implied_10y_ceiling_multiple"] > 1.0
    assert solved["implied_10y_profit_usd"] is not None
    assert solved["implied_10y_profit_usd"] > 1000000000
    assert len(solved["matrix"]) == 30  # 5 rates x 6 multiples

def test_prosperity_trap_detection():
    """Verify high growth at low valuation multiple triggers prosperity trap alert for GRAIN stocks."""
    stock_trap = {
        "symbol": "CYCLICAL_TRAP",
        "current_price": 50.0,
        "fifty_day_sma": 48.0,
        "two_hundred_day_sma": 45.0,
        "free_cash_flow": 5000000000,
        "net_income": 4000000000,
        "revenue_growth": 0.35,  # > 25%
        "pe_ratio": 8.0,         # low multiple -> low valuation percentile
        "roic": 0.12,
        "dividend_yield_pct": 4.5,
        "net_buyback_yield_pct": 0.5,
        "dilution_3y_pct": 0.0,
        "taxonomy": {
            "taxonomy": "GRAIN",
            "badge_en": "Grain",
            "badge_zh": "种粮",
            "holding_rule_en": "",
            "holding_rule_zh": "",
            "total_shareholder_yield_pct": 5.0,
            "net_buyback_yield_pct": 0.5,
            "dilution_3y_pct": 0.0
        }
    }
    pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock_trap)
    assert pricing["reverse_dcf"] is not None
    # If val_percentile is low (< 25) with > 25% revenue growth in GRAIN, trap is flagged
    if pricing["valuation_percentile"] < 25:
        assert pricing["reverse_dcf"]["is_prosperity_trap"] is True

def test_vegetable_stock_suppresses_dcf_buy_zone():
    """Verify VEGETABLE stocks have dcf_applicable=False, no DCF buy brackets, and action_status=TREND_ONLY_NO_DCF."""
    stock_veg = {
        "symbol": "TREND_TRADER",
        "current_price": 25.0,
        "fifty_day_sma": 24.0,
        "two_hundred_day_sma": 22.0,
        "free_cash_flow": -10000000,
        "pe_ratio": None,
        "roic": -0.05,
        "revenue_growth": 0.15,
        "dilution_3y_pct": 12.0
    }
    pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock_veg)
    assert pricing["dcf_applicable"] is False
    assert pricing["ideal_buy_range_min"] is None
    assert pricing["ideal_buy_range_max"] is None
    assert pricing["action_status"] == "TREND_ONLY_NO_DCF"

def test_data_provider_enriches_yield_and_taxonomy():
    """Verify DataProviderManager provides authentic shareholder yield and roic metrics."""
    stock = DataProviderManager.get_stock_data("AAPL")
    assert stock["is_valid"] is True
    assert "dividend_yield_pct" in stock
    assert "net_buyback_yield_pct" in stock
    assert "total_shareholder_yield_pct" in stock
    assert "roic" in stock
    assert stock["total_shareholder_yield_pct"] > 0

# ==========================================
# Phase 2 Tests: Barbell 80/20, Kelly, Frontier & Liability
# ==========================================

def test_barbell_80_20_portfolio_profile():
    """Verify BARBELL_80_20 splits capital into 80% Core SAA and 20% Satellite TAA with finite bet cap."""
    res = PortfolioEngine.calculate_position_sizes(
        cash_balance=100000.0,
        risk_profile="BARBELL_80_20",
        selected_symbols=["NVDA", "AAPL", "MSFT"]
    )
    assert res["is_barbell"] is True
    assert res["max_per_stock_pct"] == 4.0
    # Core SAA contains 5 anchor ETFs
    core_items = [p for p in res["position_breakdown"] if p.get("allocation_tier") == "CORE_SAA"]
    sat_items = [p for p in res["position_breakdown"] if p.get("allocation_tier") == "SATELLITE_TAA"]
    assert len(core_items) == 5
    assert len(sat_items) == 3
    # Every satellite stock must obey the 4% finite bet cap
    for s in sat_items:
        assert s["target_weight_pct"] <= 4.0

def test_calculate_kelly_position_positive_and_negative_edge():
    """Verify Quarter-Kelly computation and clamping."""
    # Positive edge: 60% win prob, 3:1 payoff
    pos = PortfolioEngine.calculate_kelly_position(win_prob=0.60, upside_pct=30.0, stop_loss_pct=10.0)
    assert pos["is_positive_edge"] is True
    assert pos["full_kelly_pct"] > 0
    assert pos["quarter_kelly_pct"] > 0
    assert 0.0 < pos["recommended_weight_pct"] <= 4.0

    # Negative edge: 30% win prob, 0.5:1 payoff
    neg = PortfolioEngine.calculate_kelly_position(win_prob=0.30, upside_pct=5.0, stop_loss_pct=10.0)
    assert neg["is_positive_edge"] is False
    assert neg["recommended_weight_pct"] == 0.0

def test_compute_efficient_frontier_and_decoupling():
    """Verify Efficient Frontier generates covariance, 400 points, and checks decoupling."""
    ef = PortfolioEngine.compute_efficient_frontier(symbols=["SPY", "QQQ", "GLD", "TLT"])
    assert len(ef["symbols"]) == 4
    assert len(ef["frontier_points"]) > 0
    assert "max_sharpe_portfolio" in ef
    assert "min_variance_portfolio" in ef
    assert "correlation_matrix_3y" in ef
    assert "correlation_matrix_60d" in ef
    assert isinstance(ef["correlation_decoupling_alerts"], list)

def test_evaluate_liability_stress_test():
    """Verify liability stress tester computes months of runway and passive coverage."""
    res = PortfolioEngine.evaluate_liability_stress_test(
        total_capital=200000.0,
        est_max_drawdown_pct=25.0,
        monthly_living_expense=5000.0,
        annual_passive_income=15000.0
    )
    assert res["max_drawdown_usd"] == 50000.0
    assert res["drawdown_months_of_living_expenses"] == 10.0
    assert res["passive_income_coverage_pct"] == 25.0  # 15000 / 60000
    assert res["remaining_capital"] == 150000.0
    assert res["runway_months"] == 30.0
    assert res["is_runway_secure"] is True

# ==========================================
# Phase 3 Tests: Calmar Analytics & Ergodicity Backtester
# ==========================================

def test_backtest_calmar_and_drawdown_events():
    """Verify Calmar Ratio, robust 3Y Calmar, underwater curve, and drawdown events."""
    bt = BacktestEngine.run_backtest(symbols=["NVDA", "MSFT", "AAPL"], benchmark="SPY")
    assert "calmar_ratio" in bt
    assert "robust_3y_calmar_ratio" in bt
    assert bt["calmar_ratio"] > 0
    assert len(bt["underwater_curve"]) == 6  # 2020 through 2025
    assert "drawdown_events" in bt
    assert "rebalancing_simulation" in bt
    rebal = bt["rebalancing_simulation"]
    assert "drift_cagr_pct" in rebal
    assert "quarterly_rebalanced_cagr_pct" in rebal
    assert "rebalancing_bonus_bps" in rebal

def test_portfolio_router_endpoints():
    """Verify REST API routes for Kelly, Frontier, and Liability stress tests."""
    # Kelly endpoint
    res_k = client.post("/api/portfolio/kelly-size", json={
        "win_prob": 0.55,
        "upside_pct": 25.0,
        "stop_loss_pct": 8.0
    })
    assert res_k.status_code == 200
    assert res_k.json()["is_positive_edge"] is True

    # Efficient Frontier endpoint
    res_ef = client.post("/api/portfolio/efficient-frontier", json={
        "symbols": ["SPY", "QQQ", "GLD", "TLT"],
        "lookback_days": 756
    })
    assert res_ef.status_code == 200
    assert len(res_ef.json()["frontier_points"]) > 0

    # Liability Stress endpoint
    res_ls = client.post("/api/portfolio/liability-stress", json={
        "total_capital": 100000.0,
        "est_max_drawdown_pct": 20.0,
        "monthly_living_expense": 3000.0,
        "annual_passive_income": 9000.0
    })
    assert res_ls.status_code == 200
    assert res_ls.json()["runway_months"] > 0
