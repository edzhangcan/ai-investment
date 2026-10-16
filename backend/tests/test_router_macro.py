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
    assert data["macro_assessment"]["country"] == "US"
    assert data["macro_assessment"]["country_name"] == "United States"

def test_get_macro_dashboard_ca_endpoint():
    response = client.get("/api/macro/dashboard?country=CA")
    assert response.status_code == 200
    data = response.json()
    assert "macro_assessment" in data
    assert "policy_news" in data
    assert "empirical_supporting_facts" in data
    assert "credible_sources" in data
    assert data["macro_assessment"]["country"] == "CA"
    assert data["macro_assessment"]["country_name"] == "Canada"
    assert data["macro_assessment"]["country_flag"] == "🇨🇦"
    # Verify Canadian sources are separated
    sources_text = " ".join([s["name"] for s in data["credible_sources"]])
    assert "Bank of Canada" in sources_text
    assert "Statistics Canada" in sources_text
    # Verify Canadian policy news
    news_text = " ".join([n["title"] + " " + n["source"] for n in data["policy_news"]])
    assert ("Bank of Canada" in news_text) or ("Statistics Canada" in news_text) or ("BoC" in news_text) or ("StatCan" in news_text)

def test_get_macro_analysis_ca_and_us_distinct():
    res_us = client.get("/api/macro?country=US")
    res_ca = client.get("/api/macro?country=CA")
    assert res_us.status_code == 200
    assert res_ca.status_code == 200
    us_data = res_us.json()
    ca_data = res_ca.json()
    assert us_data["country"] == "US"
    assert ca_data["country"] == "CA"
    assert us_data["active_indicators"]["cpi_yoy"] != ca_data["active_indicators"]["cpi_yoy"]

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
