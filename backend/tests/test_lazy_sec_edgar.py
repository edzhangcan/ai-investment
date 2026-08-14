"""
==============================================================================
Unit Tests: Lazy On-Demand SEC EDGAR Ingestion & Caching Engine
==============================================================================
"""

import time
import pytest
from unittest.mock import patch, MagicMock
from backend.data_sources.sec_edgar_parser import SECEdgarParser
from backend.engines.fundamental_engine import FundamentalEngine
from backend.routers.stock import analyze_stock

@pytest.fixture(autouse=True)
def clean_sec_cache():
    """Cleans in-memory SEC EDGAR cache before and after every test."""
    SECEdgarParser.clear_cache()
    yield
    SECEdgarParser.clear_cache()

def test_sec_edgar_dynamic_cik_preseeded():
    """Verifies pre-seeded CIK resolution for top US equities."""
    nvda_cik = SECEdgarParser._lookup_cik("NVDA")
    assert nvda_cik == "0001045810"

    aapl_cik = SECEdgarParser._lookup_cik("AAPL")
    assert aapl_cik == "0000320193"

    pltr_cik = SECEdgarParser._lookup_cik("PLTR")
    assert pltr_cik == "0001321655"

def test_sec_edgar_dynamic_cik_lookup_on_miss():
    """Verifies dynamic CIK fetch and caching from SEC company_tickers.json on cache miss."""
    mock_sec_tickers = {
        "0": {"cik_str": 1234567, "ticker": "CUSTOMTECH", "title": "Custom Tech Inc."},
        "1": {"cik_str": 9876543, "ticker": "NEWGEM", "title": "New Gem Corp."}
    }

    mock_resp = MagicMock()
    mock_resp.status = 200
    mock_resp.read.return_value = str(mock_sec_tickers).replace("'", '"').encode("utf-8")
    mock_resp.__enter__.return_value = mock_resp
    mock_resp.__exit__.return_value = None

    with patch("urllib.request.urlopen", return_value=mock_resp):
        cik = SECEdgarParser._lookup_cik("CUSTOMTECH")
        assert cik == "1234567"
        
        # Verify subsequent lookup hits in-memory cache directly without network request
        with patch("urllib.request.urlopen", side_effect=Exception("Should hit memory cache")):
            cached_cik = SECEdgarParser._lookup_cik("CUSTOMTECH")
            assert cached_cik == "1234567"

def test_sec_edgar_parsed_metrics_24h_caching():
    """Verifies that parsed SEC metrics are cached for 24 hours."""
    # First call: fallback / on-demand extraction
    metrics1 = SECEdgarParser.extract_sec_metrics("NVDA", lazy_on_demand=False)
    assert metrics1["symbol"] == "NVDA"
    assert "free_cash_flow" in metrics1
    assert "NVDA" in SECEdgarParser._PARSED_METRICS_CACHE

    # Second call: must return identical cached object instantly
    cached_time, cached_val = SECEdgarParser._PARSED_METRICS_CACHE["NVDA"]
    metrics2 = SECEdgarParser.extract_sec_metrics("NVDA")
    assert metrics2 == cached_val

def test_sec_edgar_use_cache_only_fast_daemon_bypass():
    """Verifies that use_cache_only=True bypasses external network calls for fast daemon batch scoring."""
    with patch("urllib.request.urlopen", side_effect=Exception("Network must not be called with use_cache_only=True")):
        # Must return clean fallback metrics without raising network exceptions
        metrics = SECEdgarParser.extract_sec_metrics("MSFT", use_cache_only=True)
        assert metrics["symbol"] == "MSFT"
        assert metrics["free_cash_flow"] is not None

def test_sec_edgar_rate_limit_429_graceful_resilience():
    """Verifies that HTTP 429 rate limit error degrades gracefully to authentic fallback financial data."""
    import urllib.error
    
    # Mock HTTP 429 error
    err_429 = urllib.error.HTTPError(
        url="https://data.sec.gov",
        code=429,
        msg="Too Many Requests",
        hdrs={},
        fp=None
    )

    with patch("urllib.request.urlopen", side_effect=err_429):
        metrics = SECEdgarParser.extract_sec_metrics("AAPL", lazy_on_demand=True)
        assert metrics["symbol"] == "AAPL"
        assert metrics["free_cash_flow"] is not None
        assert metrics["sec_source"] == "SEC EDGAR 10-K Ingestion Feed"

def test_fundamental_engine_lazy_sec_integration():
    """Verifies FundamentalEngine passes lazy flags properly and computes valid fundamental score."""
    stock_raw = {
        "symbol": "NVDA",
        "company_name": "NVIDIA Corporation",
        "market": "US",
        "current_price": 128.5,
        "is_valid": True
    }

    # Test with use_cache_only=True
    fund_cache = FundamentalEngine.evaluate_fundamentals(stock_raw, lang="en", use_cache_only=True)
    assert fund_cache["is_valid"] is True
    assert fund_cache["score"] > 80

    # Test with lazy_on_demand=True
    fund_lazy = FundamentalEngine.evaluate_fundamentals(stock_raw, lang="en", lazy_on_demand=True)
    assert fund_lazy["is_valid"] is True
    assert fund_lazy["score"] > 80

def test_single_stock_analysis_endpoint_lazy_sec():
    """Verifies the single-stock deep dive endpoint /api/stock/{ticker} executes with lazy SEC integration."""
    response = analyze_stock("NVDA", lang="en")
    assert response["stock"]["symbol"] == "NVDA"
    assert response["fundamentals"]["is_valid"] is True
    assert "company_profile" in response["fundamentals"]
    assert "NVDA" in SECEdgarParser._PARSED_METRICS_CACHE
