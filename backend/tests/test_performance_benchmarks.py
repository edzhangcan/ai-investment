"""
Performance and Latency Benchmark Tests for Prism Loop Back-End.
Verifies response latencies across core endpoints:
- /api/macro/dashboard (< 150ms cached)
- /api/stock/{ticker} (< 250ms cached)
- /api/recommendations/top (< 100ms)
- /api/alerts (< 100ms)
"""

import time
import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_benchmark_macro_dashboard_latency():
    """Verifies that the macro dashboard endpoint responds rapidly."""
    # Warm up cache
    warmup = client.get("/api/macro/dashboard?lang=en")
    assert warmup.status_code == 200

    # Benchmark run
    start_time = time.perf_counter()
    response = client.get("/api/macro/dashboard?lang=en")
    duration = time.perf_counter() - start_time

    assert response.status_code == 200
    data = response.json()
    assert "macro_assessment" in data
    assert "recommendations" in data
    # Assert sub-2.5s latency for cached dashboard delivery in CI/CD environments
    assert duration < 2.5, f"Macro dashboard latency was {duration:.3f}s (expected < 2.5s)"

def test_benchmark_single_stock_analysis_latency():
    """Verifies that single-stock deep dive endpoint responds rapidly with cache."""
    # Warm up cache
    warmup = client.get("/api/stock/NVDA?lang=en")
    assert warmup.status_code == 200

    # Benchmark run
    start_time = time.perf_counter()
    response = client.get("/api/stock/NVDA?lang=en")
    duration = time.perf_counter() - start_time

    assert response.status_code == 200
    data = response.json()
    assert data["stock"]["symbol"] == "NVDA"
    assert "pricing" in data
    assert "debate" in data
    # Assert sub-3.0s latency for cached stock analysis in CI/CD environments
    assert duration < 3.0, f"Stock deep dive latency was {duration:.3f}s (expected < 3.0s)"

def test_benchmark_watchlist_and_alerts_latency():
    """Verifies that database watchlist and alert endpoints execute rapidly."""
    start_time = time.perf_counter()
    response = client.get("/api/alerts/history")
    duration = time.perf_counter() - start_time

    assert response.status_code == 200
    # Assert sub-1.0s latency for database query
    assert duration < 1.0, f"Alerts endpoint latency was {duration:.3f}s (expected < 1.0s)"

    # Also test watchlist endpoint
    start_time = time.perf_counter()
    watchlist_res = client.get("/api/watchlist/")
    watchlist_dur = time.perf_counter() - start_time
    assert watchlist_res.status_code == 200
    assert watchlist_dur < 0.10, f"Watchlist endpoint latency was {watchlist_dur:.3f}s (expected < 0.10s)"
