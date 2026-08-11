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
        # 1. Add item to watchlist with high target buy price ($300.0)
        item = UserWatchlistDB(
            symbol="NVDA",
            company_name="NVIDIA Corporation",
            target_buy_price=300.0,
            portfolio_allocation_pct=5.0
        )
        session.add(item)
        session.commit()

        # 2. Evaluate alerts (NVDA real quote ~$217 <= $300.0) -> Should trigger
        results = await alert_engine.evaluate_watchlist_alerts(session)
        assert len(results) == 1
        assert results[0]["symbol"] == "NVDA"

        # 3. Verify alert log created in database
        logs = session.exec(select(PriceAlertLogDB)).all()
        assert len(logs) == 1
        assert logs[0].symbol == "NVDA"

        # 4. Immediate re-evaluation -> Cooldown anti-spam rule should prevent second duplicate trigger
        re_results = await alert_engine.evaluate_watchlist_alerts(session)
        assert len(re_results) == 0

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
