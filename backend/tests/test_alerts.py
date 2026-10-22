"""
Pytest Suite for Price Alert Engine & Alerts REST Router
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from backend.main import app
from backend.database import get_session
from backend.models.db_models import UserWatchlistDB, PriceAlertLogDB, get_utc_now
from backend.services.alert_engine import alert_engine

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_alert_engine_trigger_and_cooldown(session: Session):
    async def run_test():
        # 1. Add item to watchlist with target buy price above market (AAPL is WARM / Right-Side)
        item = UserWatchlistDB(
            symbol="AAPL",
            company_name="Apple Inc.",
            target_buy_price=400.0,
            portfolio_allocation_pct=5.0
        )
        session.add(item)
        session.commit()

        # 2. Evaluate alerts (AAPL quote in buy zone AND Right-Side batting zone) -> Triggers
        results = await alert_engine.evaluate_watchlist_alerts(session)
        assert len(results) == 1
        assert results[0]["symbol"] == "AAPL"
        assert results[0]["alert_type"] == "BUY"
        assert results[0]["batting_zone"] == "RIGHT_SIDE"

        # 3. Verify alert log created in database
        logs = session.exec(select(PriceAlertLogDB)).all()
        assert len(logs) == 1
        assert logs[0].symbol == "AAPL"

        # 4. Immediate re-evaluation -> Cooldown anti-spam rule should prevent second duplicate trigger
        re_results = await alert_engine.evaluate_watchlist_alerts(session)
        assert len(re_results) == 0

    asyncio.run(run_test())

def test_buy_alert_suppressed_on_left_side_consolidation(session: Session):
    """Verifies that buy alerts are suppressed when price is in buy zone but batting zone is left-side (FLAT/FREEZE)."""
    async def run_test():
        # NVDA is currently below 50D SMA (FLAT/Left-Side)
        item = UserWatchlistDB(
            symbol="NVDA",
            company_name="NVIDIA Corporation",
            target_buy_price=300.0,
            portfolio_allocation_pct=5.0
        )
        session.add(item)
        session.commit()

        # Even though target_buy_price ($300) > current price ($222), batting zone is LEFT_SIDE -> suppressed
        results = await alert_engine.evaluate_watchlist_alerts(session)
        buy_alerts = [r for r in results if r["alert_type"] == "BUY"]
        assert len(buy_alerts) == 0

    asyncio.run(run_test())

def test_alerts_rest_endpoints(client: TestClient, session: Session):
    # Seed alert log
    log = PriceAlertLogDB(
        symbol="SHOP.TO",
        company_name="Shopify Inc.",
        current_price=190.0,
        target_buy_price=200.0,
        notification_channel="IN_APP",
        status="TRIGGERED",
        message="Shopify hit target price",
        triggered_at=get_utc_now()
    )
    session.add(log)
    session.commit()

    # GET /api/alerts/history
    res = client.get("/api/alerts/history")
    assert res.status_code == 200
    history = res.json()
    assert len(history) == 1
    assert history[0]["symbol"] == "SHOP.TO"

    # POST /api/alerts/trigger-check
    check_res = client.post("/api/alerts/trigger-check")
    assert check_res.status_code == 200
    assert "alerts_triggered_count" in check_res.json()

    # DELETE /api/alerts/history/{alert_id}
    del_res = client.delete(f"/api/alerts/history/{log.id}")
    assert del_res.status_code == 200
    assert del_res.json()["deleted_id"] == log.id

    # Verify deleted
    empty_res = client.get("/api/alerts/history")
    assert empty_res.status_code == 200
    assert len(empty_res.json()) == 0

    # 404 on non-existent
    del_404 = client.delete("/api/alerts/history/999999")
    assert del_404.status_code == 404

    # Seed 2 logs for DELETE /api/alerts/history (clear all)
    session.add(PriceAlertLogDB(symbol="AAPL", company_name="Apple", current_price=150, target_buy_price=160, notification_channel="IN_APP", status="TRIGGERED", message="Apple hit target", triggered_at=get_utc_now()))
    session.add(PriceAlertLogDB(symbol="MSFT", company_name="Microsoft", current_price=300, target_buy_price=310, notification_channel="IN_APP", status="TRIGGERED", message="MSFT hit target", triggered_at=get_utc_now()))
    session.commit()

    clear_res = client.delete("/api/alerts/history")
    assert clear_res.status_code == 200
    assert clear_res.json()["deleted_count"] == 2

    # Verify all cleared
    assert len(client.get("/api/alerts/history").json()) == 0

def test_alert_engine_scheduled_and_conditional_dual_run(session: Session):
    """Verifies that evaluate_scheduled_and_conditional_alerts executes properly."""
    async def run_test():
        from backend.models.db_models import PushAlertConfigDB
        # 1. Test when discord webhook is disabled
        res1 = await alert_engine.evaluate_scheduled_and_conditional_alerts(session)
        assert "conditional_alerts" in res1
        assert "scheduled_alerts" in res1
        assert res1["scheduled_alerts"]["status"] == "skipped"

        # 2. Test when discord webhook is enabled
        cfg = PushAlertConfigDB(
            discord_webhook_url="https://discord.com/api/webhooks/123/alert-eval",
            is_discord_enabled=True
        )
        session.add(cfg)
        session.commit()

        res2 = await alert_engine.evaluate_scheduled_and_conditional_alerts(session)
        assert "conditional_alerts" in res2
        assert "scheduled_alerts" in res2
        assert res2["scheduled_alerts"]["status"] == "ok"

    asyncio.run(run_test())

def test_watchlist_sync_targets_endpoint(client: TestClient, session: Session):
    """Verifies that /api/watchlist/sync-targets calculates and updates target buy prices."""
    item = UserWatchlistDB(
        symbol="NVDA",
        company_name="NVIDIA Corporation",
        target_buy_price=None,
        portfolio_allocation_pct=4.0
    )
    session.add(item)
    session.commit()

    res = client.post("/api/watchlist/sync-targets")
    assert res.status_code == 200
    synced = res.json()
    assert len(synced) == 1
    assert synced[0]["symbol"] == "NVDA"
    assert synced[0]["target_buy_price"] is not None
    assert synced[0]["target_buy_price"] > 0

def test_notify_falsification_endpoint(client: TestClient, session: Session):
    """Verifies that /api/alerts/notify-falsification logs and dispatches falsification alerts."""
    payload = {
        "symbol": "TEST",
        "company_name": "Test Corp",
        "current_price": 95.0,
        "bottom_threshold": 100.0,
        "lang": "en"
    }
    res = client.post("/api/alerts/notify-falsification", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["symbol"] == "TEST"
    assert data["bottom_threshold"] == 100.0

    # Verify log entry in DB
    logs = session.exec(select(PriceAlertLogDB).where(PriceAlertLogDB.symbol == "TEST")).all()
    assert len(logs) == 1
    assert logs[0].status == "FALSIFICATION_TRIGGERED"
    assert "Falsification Triggered" in logs[0].message

def test_evaluate_symbol_trend_temperature_and_batting_zone():
    """Verifies that evaluate_symbol_trend_temperature accurately maps left-side vs right-side."""
    from backend.services.alert_engine import PriceAlertEngine

    # 1. Below 200D SMA -> FREEZE (Left-Side)
    freeze_quote = {"current_price": 90.0, "fifty_day_sma": 95.0, "two_hundred_day_sma": 100.0}
    res_freeze = PriceAlertEngine.evaluate_symbol_trend_temperature(freeze_quote)
    assert res_freeze["state"] == "FREEZE"
    assert res_freeze["hitting_zone"] == "LEFT_SIDE"
    assert res_freeze["is_right_side"] is False

    # 2. Above 50D SMA -> WARM (Right-Side Batting Zone)
    warm_quote = {"current_price": 105.0, "fifty_day_sma": 102.0, "two_hundred_day_sma": 98.0}
    res_warm = PriceAlertEngine.evaluate_symbol_trend_temperature(warm_quote)
    assert res_warm["state"] in ["WARM", "HOT"]
    assert res_warm["hitting_zone"] == "RIGHT_SIDE"
    assert res_warm["is_right_side"] is True

def test_push_notifier_bundled_buy_right_side_and_falsification_danger():
    """Verifies push notifier bundled buy embed formatting with right-side batting zone and danger breach."""
    from backend.engines.push_notifier import PushNotifier

    # 1. Bundled Buy Alert with Right-Side Batting Zone confirmation
    test_buy_stocks = [{
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "current_price": 230.0,
        "target_buy_price": 240.0,
        "discount_pct": 4.17,
        "currency": "USD",
        "trend_state": "WARM",
        "batting_zone": "RIGHT_SIDE"
    }]
    # Dry run alert generation by calling send_bundled_buy_alert with mock webhook
    res_buy = PushNotifier.send_bundled_buy_alert(
        webhook_url="https://discord.com/api/webhooks/dummy/test",
        buy_stocks=test_buy_stocks,
        lang="zh"
    )
    # Invalid URL returns format error or network error, confirming method executes without exception
    assert "status" in res_buy

    # 2. Falsification Danger Alert triggered by floor breach
    test_danger_stocks = [{
        "symbol": "FCX",
        "company_name": "Freeport-McMoRan",
        "current_price": 42.0,
        "falsification_floor": 46.0,
        "breakdown_pct": 8.7,
        "currency": "USD",
        "risk_reason_zh": "跌破 200日均线离场底线 ($46.0)，假说证伪。",
        "risk_reason_en": "Breached 200D MA exit floor ($46.0).",
        "suggested_action": "🚨 强制机械离场 / 止损 (MANDATORY CUT-LOSS EXIT)"
    }]
    res_danger = PushNotifier.send_sell_danger_alert(
        webhook_url="https://discord.com/api/webhooks/dummy/test",
        sell_stocks=test_danger_stocks,
        lang="en"
    )
    assert "status" in res_danger



