"""
Unit tests for Portfolio Position Sizing Calculator Engine and REST Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.engines.portfolio_engine import PortfolioEngine

client = TestClient(app)

def test_portfolio_engine_calculation_balanced():
    res = PortfolioEngine.calculate_position_sizes(
        cash_balance=50000.0,
        risk_profile="BALANCED",
        currency="USD",
        selected_symbols=["NVDA", "MSFT", "AAPL"],
        lang="en"
    )

    assert res["cash_balance"] == 50000.0
    assert res["risk_profile"] == "BALANCED"
    assert res["equity_allocation_pct"] == 80.0
    assert res["cash_buffer_pct"] == 20.0
    assert len(res["position_breakdown"]) == 3
    assert res["total_allocated_dollars"] > 0
    assert res["residual_unallocated_cash"] >= 0

    first_stock = res["position_breakdown"][0]
    assert "executable_shares" in first_stock
    assert first_stock["executable_shares"] >= 0

def test_portfolio_rest_endpoint():
    payload = {
        "cash_balance": 100000.0,
        "risk_profile": "AGGRESSIVE",
        "currency": "USD",
        "symbols": ["NVDA", "MSFT", "SHOP.TO"],
        "lang": "zh"
    }

    response = client.post("/api/portfolio/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["cash_balance"] == 100000.0
    assert data["risk_profile"] == "AGGRESSIVE"
    assert "position_breakdown" in data
    assert len(data["position_breakdown"]) == 3
