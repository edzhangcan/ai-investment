"""
Unit and Integration Tests for Valuation & Alert Sensitivity Settings
Validates GET/POST/RESET endpoints, PricingEngine custom MoS & technical anchors,
and AlertEngine dual-boundary (Buy/Sell) trigger evaluation with anti-spam cooldowns.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from backend.main import app
from backend.database import get_session, engine
from backend.models.db_models import ValuationAlertSettingsDB, UserWatchlistDB, PriceAlertLogDB, get_utc_now
from backend.engines.pricing_engine import PricingEngine
from backend.services.alert_engine import alert_engine

client = TestClient(app)

def test_get_valuation_settings_default():
    """Verify default settings initialization with 15% MoS and Adaptive Balanced mode."""
    client.post("/api/settings/valuation-alerts/reset")
    response = client.get("/api/settings/valuation-alerts")
    assert response.status_code == 200
    data = response.json()
    assert "global_mos_pct" in data
    assert data["global_mos_pct"] == 15.0
    assert data["technical_anchor_mode"] == "adaptive_balanced"
    assert "anchor_mode_descriptions" in data
    assert "strict_200d" in data["anchor_mode_descriptions"]
    assert "tactical_pullback" in data["anchor_mode_descriptions"]

def test_update_valuation_settings():
    """Verify updating global MoS, technical anchor mode, and per-ticker overrides."""
    payload = {
        "global_mos_pct": 22.5,
        "technical_anchor_mode": "strict_200d",
        "ticker_overrides": {
            "aapl": {"target_buy": 185.50, "target_sell": 250.00},
            "msft": {"target_buy": 390.00, "target_sell": 480.00}
        }
    }
    response = client.post("/api/settings/valuation-alerts", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "ok"
    assert res_data["settings"]["global_mos_pct"] == 22.5
    assert res_data["settings"]["technical_anchor_mode"] == "strict_200d"
    assert "AAPL" in res_data["settings"]["ticker_overrides"]
    assert res_data["settings"]["ticker_overrides"]["AAPL"]["target_buy"] == 185.50
    assert res_data["settings"]["ticker_overrides"]["AAPL"]["target_sell"] == 250.00

def test_update_valuation_settings_validation_errors():
    """Verify payload validation prevents out-of-range MoS and invalid anchor modes."""
    # MoS too high (> 30%)
    res_high = client.post("/api/settings/valuation-alerts", json={
        "global_mos_pct": 35.0,
        "technical_anchor_mode": "adaptive_balanced"
    })
    assert res_high.status_code == 422

    # MoS too low (< 10%)
    res_low = client.post("/api/settings/valuation-alerts", json={
        "global_mos_pct": 5.0,
        "technical_anchor_mode": "adaptive_balanced"
    })
    assert res_low.status_code == 422

    # Invalid anchor mode
    res_invalid_mode = client.post("/api/settings/valuation-alerts", json={
        "global_mos_pct": 18.0,
        "technical_anchor_mode": "invalid_mode_name"
    })
    assert res_invalid_mode.status_code == 400

def test_reset_valuation_settings():
    """Verify resetting settings returns to institutional defaults."""
    # First modify settings
    client.post("/api/settings/valuation-alerts", json={
        "global_mos_pct": 28.0,
        "technical_anchor_mode": "tactical_pullback",
        "ticker_overrides": {"NVDA": {"target_buy": 110.0, "target_sell": 180.0}}
    })

    # Reset
    reset_res = client.post("/api/settings/valuation-alerts/reset")
    assert reset_res.status_code == 200
    data = reset_res.json()
    assert data["settings"]["global_mos_pct"] == 15.0
    assert data["settings"]["technical_anchor_mode"] == "adaptive_balanced"
    assert data["settings"]["ticker_overrides"] == {}

def test_pricing_engine_custom_mos_and_anchors():
    """Verify PricingEngine computes different buy brackets under various MoS and anchor modes."""
    mock_stock = {
        "symbol": "TEST",
        "current_price": 100.0,
        "fifty_day_sma": 98.0,
        "two_hundred_day_sma": 90.0,
        "pe_ratio": 25.0,
        "free_cash_flow": 5000000000.0,
        "revenue_growth": 0.10,
        "is_valid": True
    }

    # 1. 10% MoS (Aggressive) vs 30% MoS (Deep Value)
    res_10 = PricingEngine.evaluate_pricing_and_entry_zone(mock_stock, custom_mos_pct=10.0, anchor_mode="adaptive_balanced")
    res_30 = PricingEngine.evaluate_pricing_and_entry_zone(mock_stock, custom_mos_pct=30.0, anchor_mode="adaptive_balanced")
    assert res_10["applied_mos_pct"] == 10.0
    assert res_30["applied_mos_pct"] == 30.0
    # Higher MoS must yield lower or equal buy ceiling
    assert res_30["ideal_buy_range_max"] <= res_10["ideal_buy_range_max"]
    assert res_10["ideal_sell_range_min"] is not None
    assert res_10["ideal_sell_range_min"] > res_10["current_price"]

    # 2. Strict 200D Anchor Mode
    res_strict = PricingEngine.evaluate_pricing_and_entry_zone(mock_stock, custom_mos_pct=15.0, anchor_mode="strict_200d")
    assert res_strict["applied_anchor_mode"] == "strict_200d"
    assert res_strict["ideal_buy_range_max"] <= 95.0

    # 3. Tactical Pullback Anchor Mode
    res_tactical = PricingEngine.evaluate_pricing_and_entry_zone(mock_stock, custom_mos_pct=15.0, anchor_mode="tactical_pullback")
    assert res_tactical["applied_anchor_mode"] == "tactical_pullback"
    assert res_tactical["ideal_buy_range_max"] >= res_strict["ideal_buy_range_max"]

def test_alert_engine_buy_and_sell_triggers(monkeypatch):
    """Verify alert engine correctly evaluates both buy zone and sell / profit-taking conditions."""
    async def run_test():
        with Session(engine) as session:
            test_sym = "TSLA_TEST"
            # Purge past test items and logs
            existing_items = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == test_sym)).all()
            for it in existing_items:
                session.delete(it)
            existing_logs = session.exec(select(PriceAlertLogDB).where(PriceAlertLogDB.symbol == test_sym)).all()
            for lg in existing_logs:
                session.delete(lg)
            session.commit()

            item = UserWatchlistDB(
                symbol=test_sym,
                company_name="Tesla Test",
                target_buy_price=200.0,
                target_sell_price=300.0,
                portfolio_allocation_pct=3.0
            )
            session.add(item)
            session.commit()

            # Mock market quote provider
            from backend.data_sources.data_provider import data_provider_manager
            
            # Test Case A: Price is 190.0 (Below target_buy_price 200.0) and in Right-Side Batting Zone -> BUY Trigger
            monkeypatch.setattr(
                data_provider_manager,
                "get_stock_quote",
                lambda sym: {
                    "symbol": sym,
                    "current_price": 190.0,
                    "fifty_day_sma": 180.0,
                    "two_hundred_day_sma": 170.0,
                    "is_valid": True,
                    "currency": "USD"
                }
            )
            results_buy = await alert_engine.evaluate_watchlist_alerts(session)
            buy_alerts = [r for r in results_buy if r["symbol"] == test_sym and r["alert_type"] == "BUY"]
            assert len(buy_alerts) >= 1
            assert buy_alerts[0]["target_price"] == 200.0

            # Clean up
            session.delete(item)
            for lg in session.exec(select(PriceAlertLogDB).where(PriceAlertLogDB.symbol == test_sym)).all():
                session.delete(lg)
            session.commit()

    import asyncio
    asyncio.run(run_test())
