"""
Unit tests for Fundamental Engine (Moat scoring, 5-year guidance text diffing, FCF quality)
"""
import pytest
from backend.engines.fundamental_engine import FundamentalEngine

def test_evaluate_fundamentals_wide_moat():
    mock_stock = {
        "symbol": "AAPL",
        "market": "US",
        "currency": "USD",
        "current_price": 220.0,
        "free_cash_flow": 108_800_000_000,
        "net_income": 100_900_000_000,
        "total_revenue": 385_000_000_000
    }
    result = FundamentalEngine.evaluate_fundamentals(mock_stock)
    assert result["symbol"] == "AAPL"
    assert "Wide Moat" in result["moat_rating"]
    assert len(result["moat_sources"]) >= 2
    assert result["cash_conversion_ratio"] > 90
    assert len(result["guidance_shift_deltas"]) > 0

def test_guidance_text_diffing():
    deltas = FundamentalEngine.track_guidance_shifts("NVDA")
    assert len(deltas) == 3
    assert "detected_keywords" in deltas[0]
    assert "year" in deltas[0]
