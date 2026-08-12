"""
Unit tests for BacktestEngine and REST endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.engines.backtest_engine import BacktestEngine

client = TestClient(app)

def test_backtest_engine_single_stock():
    res = BacktestEngine.run_backtest(symbols=["NVDA"], benchmark="SPY", lang="en")

    assert res["period_years"] == 5
    assert res["benchmark"] == "SPY"
    assert "cagr_pct" in res
    assert "sharpe_ratio" in res
    assert "max_drawdown_pct" in res
    assert "win_rate_pct" in res
    assert len(res["equity_curve"]) == 6
    assert len(res["annual_breakdown"]) == 5

def test_backtest_rest_endpoint():
    response = client.get("/api/backtest/stock/AAPL?benchmark=SPY&lang=zh")
    assert response.status_code == 200
    data = response.json()

    assert data["benchmark"] == "SPY"
    assert "cagr_pct" in data
    assert "equity_curve" in data
