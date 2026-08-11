"""
Unit tests for Macro & Stock FastAPI Routers (/api/macro/dashboard, /api/stock/{ticker}/news)
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_macro_dashboard_endpoint():
    response = client.get("/api/macro/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "macro_assessment" in data
    assert "policy_news" in data
    assert "empirical_supporting_facts" in data
    assert "recommendations" in data
    assert len(data["recommendations"]["recommended_stocks"]) >= 3

def test_get_stock_analysis_with_news_endpoint():
    response = client.get("/api/stock/NVDA")
    assert response.status_code == 200
    data = response.json()
    assert "stock" in data
    assert "news" in data
    assert data["stock"]["symbol"] == "NVDA"

def test_get_stock_news_endpoint():
    response = client.get("/api/stock/SHOP.TO/news")
    assert response.status_code == 200
    news = response.json()
    assert isinstance(news, list)
    assert len(news) >= 1
