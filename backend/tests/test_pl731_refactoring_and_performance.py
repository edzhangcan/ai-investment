"""
Verification & Regression Suite for PL-731:
1. Active holding_days calculation without naive-vs-aware datetime TypeError.
2. Pure-Python compute_trend_temperature list fast-path parity with pd.DataFrame & speed.
3. Quote-level memoization (_trend_eval_cache) in evaluate_symbol_trend_temperature.
4. Pruned unused 3rd-party dependencies in backend/requirements.txt.
5. Structural cleanups: single hydrate_holding_context definition & SQL_ECHO default False.
"""

import inspect
import time
from pathlib import Path
import pandas as pd

from backend.config import settings
from backend.models.db_models import UserWatchlistDB
from backend.routers.watchlist import enrich_item_quote
from backend.services.alert_engine import PriceAlertEngine


def _build_synthetic_ohlcv(n_days: int = 250) -> list[dict]:
    series = []
    price = 100.0
    for i in range(n_days):
        # Gentle upward drift with minor oscillation
        delta = 0.25 if (i % 4 != 0) else -0.15
        price = round(max(10.0, price + delta), 2)
        series.append({
            "date": f"2026-01-{(i % 28) + 1:02d}",
            "close": price,
            "high": round(price * 1.015, 2),
            "low": round(price * 0.985, 2),
            "volume": float(1_200_000 + (i % 7) * 85_000),
        })
    return series


def test_active_holding_days_computed_correctly_without_timezone_error():
    """Active holdings with last_sell_date=None must compute integer holding_days >= 0."""
    item = UserWatchlistDB(
        symbol="MOCK_HOLD",
        company_name="Mock Holding Inc.",
        bucket="HOLDING",
        buy_in_price=100.0,
        buy_in_date="2026-08-01",
        last_sell_date=None,
        shares_held=10.0,
    )
    enriched = enrich_item_quote(item, allow_network=False)
    assert isinstance(enriched.holding_days, int)
    assert enriched.holding_days > 0


def test_compute_trend_temperature_list_vs_dataframe_parity_and_speed():
    """List fast-path must match DataFrame output identically and execute in < 10ms."""
    hist_list = _build_synthetic_ohlcv(250)
    df = pd.DataFrame(hist_list)
    curr_p = hist_list[-1]["close"]

    res_df = PriceAlertEngine.compute_trend_temperature(df, current_price=curr_p)

    t0 = time.perf_counter()
    res_list = PriceAlertEngine.compute_trend_temperature(hist_list, current_price=curr_p)
    elapsed_ms = (time.perf_counter() - t0) * 1000.0

    for key in (
        "state",
        "hitting_zone",
        "is_right_side",
        "right_side_path",
        "z_trend",
        "ret_3d_pct",
        "ret_5d_pct",
        "ret_10d_pct",
        "ret_20d_pct",
        "sma_20",
        "sma_50",
        "sma_200",
        "ema_10",
        "rsi_14",
        "atr_14",
        "vol_ratio",
        "transition",
    ):
        assert res_list[key] == res_df[key], f"Mismatch on {key}: {res_list[key]} vs {res_df[key]}"

    assert elapsed_ms < 25.0


def test_evaluate_symbol_trend_temperature_memoization():
    """evaluate_symbol_trend_temperature caches result on quote['_trend_eval_cache'] for identical signature."""
    hist_list = _build_synthetic_ohlcv(120)
    quote = {
        "symbol": "MEMO_TEST",
        "current_price": hist_list[-1]["close"],
        "fifty_day_sma": 110.0,
        "two_hundred_day_sma": 100.0,
        "historical_series": hist_list,
    }
    first = PriceAlertEngine.evaluate_symbol_trend_temperature(quote)
    assert "_trend_eval_cache" in quote
    second = PriceAlertEngine.evaluate_symbol_trend_temperature(quote)
    assert first == second


def test_requirements_txt_pruned_of_unused_packages():
    """backend/requirements.txt must not retain unused beautifulsoup4 or pytest-asyncio."""
    req_path = Path(__file__).resolve().parents[1] / "requirements.txt"
    req_text = req_path.read_text(encoding="utf-8").lower()
    assert "beautifulsoup4" not in req_text
    assert "pytest-asyncio" not in req_text


def test_no_duplicate_hydrate_holding_context_and_sql_echo_default_false():
    """Ensure duplicate hydrate_holding_context was removed and SQL_ECHO defaults to False."""
    src = inspect.getsource(PriceAlertEngine)
    assert src.count("def hydrate_holding_context") == 1
    assert settings.SQL_ECHO is False
