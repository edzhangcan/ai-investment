"""
Pytest Suite for PL-721: Stock Buckets (HOLDING, WATCHLIST, REGULAR) and Tiered Alerts
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from backend.main import app
from backend.database import get_session
from backend.models.db_models import (
    UserWatchlistDB,
    RecommendationSnapshotDB,
    get_utc_now
)
from backend.data_sources.data_provider import data_provider_manager
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


def test_default_bucket_regular(client: TestClient, session: Session):
    """
    Requirement 1: Un-tracked stock defaults to REGULAR bucket.
    Target buy price defaults to 95% of ideal buy ceiling if known.
    """
    res = client.get("/api/watchlist/status/NVDA")
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "NVDA"
    assert data["bucket"] == "REGULAR"
    assert data["is_tracked"] is False
    assert data["is_holding"] is False
    assert data["is_watchlist"] is False
    if data["target_buy_price"] is not None:
        assert data["target_buy_price"] > 0


def test_set_bucket_transitions_and_filtering(client: TestClient, session: Session):
    """
    Requirement 1 & 5: Transition between REGULAR, WATCHLIST, and HOLDING buckets.
    Verify that each stock belongs to only 1 bucket.
    """
    # 1. Put AAPL into WATCHLIST
    res1 = client.post("/api/watchlist/set-bucket", json={
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "bucket": "WATCHLIST",
        "target_buy_price": 210.0,
        "portfolio_allocation_pct": 5.0
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["symbol"] == "AAPL"
    assert data1["bucket"] == "WATCHLIST"
    assert data1["target_buy_price"] == 210.0

    # 2. Query WATCHLIST filter
    res_wl = client.get("/api/watchlist?bucket=WATCHLIST")
    assert res_wl.status_code == 200
    wl_items = res_wl.json()
    assert len(wl_items) == 1
    assert wl_items[0]["symbol"] == "AAPL"

    # 3. Transition AAPL into HOLDING with buy_in_price and buy_in_date
    res2 = client.post("/api/watchlist/set-bucket", json={
        "symbol": "AAPL",
        "company_name": "Apple Inc.",
        "bucket": "HOLDING",
        "buy_in_price": 215.50,
        "buy_in_date": "2026-10-15",
        "shares_held": 50.0,
        "portfolio_allocation_pct": 8.0
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["bucket"] == "HOLDING"
    assert data2["buy_in_price"] == 215.50
    assert data2["buy_in_date"] == "2026-10-15"
    assert data2["shares_held"] == 50.0

    # 4. Verify AAPL is now in HOLDING, not in WATCHLIST
    res_wl2 = client.get("/api/watchlist?bucket=WATCHLIST")
    assert len(res_wl2.json()) == 0
    res_h = client.get("/api/watchlist?bucket=HOLDING")
    assert len(res_h.json()) == 1
    assert res_h.json()[0]["symbol"] == "AAPL"


def test_holding_falsification_alert_only_for_holdings(session: Session, monkeypatch):
    """
    Requirement 2: Falsification kill-switch alert should ONLY be triggered
    for stocks in the HOLDING status. Suppressed for WATCHLIST items.
    """
    async def run_test():
        holding_item = UserWatchlistDB(
            symbol="HOLD_FAIL",
            company_name="Holding Failing Corp",
            bucket="HOLDING",
            buy_in_price=100.0,
            buy_in_date="2026-09-01",
            portfolio_allocation_pct=5.0
        )
        watchlist_item = UserWatchlistDB(
            symbol="WATCH_FAIL",
            company_name="Watchlist Failing Corp",
            bucket="WATCHLIST",
            target_buy_price=50.0,
            portfolio_allocation_pct=3.0
        )
        session.add(holding_item)
        session.add(watchlist_item)
        session.commit()

        def fake_get_stock_quote(sym):
            return {
                "symbol": sym,
                "current_price": 80.0,
                "fifty_day_sma": 85.0,
                "two_hundred_day_sma": 100.0,
                "ideal_buy_range_max": 95.0,
                "ideal_sell_range_min": 120.0
            }

        monkeypatch.setattr(data_provider_manager, "get_stock_quote", fake_get_stock_quote)

        # 1. Evaluate HOLDINGS: Must trigger FALSIFICATION
        h_alerts = await alert_engine.evaluate_holding_alerts(session)
        assert any(a["alert_type"] == "FALSIFICATION" and a["symbol"] == "HOLD_FAIL" for a in h_alerts)

        # 2. Evaluate WATCHLIST: Falsification breach must be strictly suppressed
        w_alerts = await alert_engine.evaluate_watchlist_items_alerts(session)
        assert not any(a["alert_type"] == "FALSIFICATION" for a in w_alerts)

    asyncio.run(run_test())


def test_watchlist_buy_alert_95_percent_threshold(session: Session, monkeypatch):
    """
    Requirement 3: For stocks in WATCHLIST, trigger buy alert when current price
    reaches target (defaulting to 95% of buy zone ceiling) AND is on Right Side of batting zone.
    """
    async def run_test():
        item = UserWatchlistDB(
            symbol="AAPL_WL",
            company_name="Apple Test",
            bucket="WATCHLIST",
            target_buy_price=220.0,
            portfolio_allocation_pct=5.0
        )
        session.add(item)
        session.commit()

        def fake_get_stock_quote(sym):
            return {
                "symbol": sym,
                "current_price": 215.0,
                "fifty_day_sma": 210.0,
                "two_hundred_day_sma": 200.0,
                "ideal_buy_range_max": 230.0
            }

        monkeypatch.setattr(data_provider_manager, "get_stock_quote", fake_get_stock_quote)

        alerts = await alert_engine.evaluate_watchlist_items_alerts(session)
        assert any(a["alert_type"] == "BUY" and a["symbol"] == "AAPL_WL" for a in alerts)

    asyncio.run(run_test())


def test_regular_universe_discovery_alert_90_percent_threshold(session: Session, monkeypatch):
    """
    Requirement 4: For REGULAR stocks, if current price is <= 90% of ideal buy zone
    ceiling AND on the right side of batting zone, trigger discovery buy alert.
    """
    async def run_test():
        snap = RecommendationSnapshotDB(
            symbol="DISC_STOCK",
            country="US",
            lang="en",
            category="OVERALL",
            company_name="Discovery Target Corp",
            category_badge="Opportunistic Compounder",
            total_recommendation_score=85.0,
            financial_payload_json='{"price": 88.0, "ideal_buy_range_max": 100.0}',
            updated_at=get_utc_now()
        )
        session.add(snap)
        session.commit()

        def fake_get_stock_quote(sym):
            return {
                "symbol": sym,
                "current_price": 88.0,
                "fifty_day_sma": 85.0,
                "two_hundred_day_sma": 80.0,
                "ideal_buy_range_max": 100.0,
                "currency": "USD"
            }

        monkeypatch.setattr(data_provider_manager, "get_stock_quote", fake_get_stock_quote)

        alerts = await alert_engine.evaluate_regular_universe_alerts(session)
        assert any(a["alert_type"] == "DISCOVERY_BUY" and a["symbol"] == "DISC_STOCK" for a in alerts)

    asyncio.run(run_test())


def test_sell_off_holding_endpoint(client: TestClient, session: Session):
    """
    Requirement 5: Selling off a stock in HOLDING calculates realized P&L %,
    holding duration, records trade history, and transitions bucket.
    """
    holding = UserWatchlistDB(
        symbol="MSFT",
        company_name="Microsoft Corp",
        bucket="HOLDING",
        buy_in_price=400.0,
        buy_in_date="2026-10-01",
        shares_held=25.0,
        portfolio_allocation_pct=7.5
    )
    session.add(holding)
    session.commit()

    payload = {
        "symbol": "MSFT",
        "sell_off_price": 440.0,
        "sell_off_date": "2026-10-22",
        "post_sell_bucket": "REGULAR",
        "notes": "Disciplined exit at upper valuation target"
    }
    res = client.post("/api/watchlist/sell-holding", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["symbol"] == "MSFT"
    assert data["bucket"] == "REGULAR"
    assert data["last_sell_price"] == 440.0
    assert data["last_sell_date"] == "2026-10-22"
    assert data["realized_pnl_pct"] == 10.0
    assert data["holding_days"] == 21

    # Database verification
    db_item = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == "MSFT")).first()
    assert db_item is not None
    assert db_item.bucket == "REGULAR"
    assert db_item.last_sell_price == 440.0
    assert db_item.realized_pnl_pct == 10.0
