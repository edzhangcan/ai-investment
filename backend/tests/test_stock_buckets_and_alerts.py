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

        async def fake_get_stock_quote_async(sym):
            return fake_get_stock_quote(sym)

        monkeypatch.setattr(data_provider_manager, "get_stock_quote_async", fake_get_stock_quote_async)
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


def test_shares_and_total_value_tracking(client: TestClient, session: Session, monkeypatch):
    """
    PL-721 Fix 1: When user moves a stock into HOLDING, track shares_held and total_value.
    Total value = shares_held * current_price.
    Unrealized P&L $ = total_value - total_cost.
    """
    from backend.data_sources.data_provider import DataProviderManager
    with DataProviderManager._LOCK:
        DataProviderManager._CACHE["TESTVAL"] = {
            "symbol": "TESTVAL",
            "current_price": 200.0,
            "two_hundred_day_sma": 190.0,
            "fifty_day_sma": 195.0,
            "company_name": "Test Valuation Corp"
        }

    res = client.post("/api/watchlist/set-bucket", json={
        "symbol": "TESTVAL",
        "company_name": "Test Valuation Corp",
        "bucket": "HOLDING",
        "buy_in_price": 180.0,
        "buy_in_date": "2026-10-10",
        "shares_held": 50.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["symbol"] == "TESTVAL"
    assert data["bucket"] == "HOLDING"
    assert data["shares_held"] == 50.0
    assert data["buy_in_price"] == 180.0
    assert data["current_price"] == 200.0
    assert data["total_value"] == 10000.0  # 50 * 200.0
    assert data["total_cost"] == 9000.0    # 50 * 180.0
    assert data["unrealized_pnl_dollar"] == 1000.0
    assert data["unrealized_pnl_pct"] == 11.11


def test_scale_in_additional_buy_blending(client: TestClient, session: Session):
    """
    PL-721 Fix 2: When stock is already in HOLDING, additional buy-in blends
    cost basis via weighted average: (s1*p1 + s2*p2) / (s1 + s2).
    """
    from backend.data_sources.data_provider import DataProviderManager
    with DataProviderManager._LOCK:
        DataProviderManager._CACHE["SCALE"] = {
            "symbol": "SCALE",
            "current_price": 150.0,
            "two_hundred_day_sma": 130.0,
            "company_name": "Scale Corp"
        }

    # 1. Initial buy: 10 shares @ $100
    res1 = client.post("/api/watchlist/set-bucket", json={
        "symbol": "SCALE",
        "company_name": "Scale Corp",
        "bucket": "HOLDING",
        "buy_in_price": 100.0,
        "buy_in_date": "2026-10-01",
        "shares_held": 10.0
    })
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["shares_held"] == 10.0
    assert d1["buy_in_price"] == 100.0

    # 2. Additional buy-in: +10 shares @ $140
    res2 = client.post("/api/watchlist/set-bucket", json={
        "symbol": "SCALE",
        "company_name": "Scale Corp",
        "bucket": "HOLDING",
        "buy_in_price": 140.0,
        "buy_in_date": "2026-10-22",
        "shares_held": 10.0,
        "is_additional_buy": True
    })
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["shares_held"] == 20.0
    # Weighted average: (10*100 + 10*140) / 20 = 2400 / 20 = 120.0
    assert d2["buy_in_price"] == 120.0
    assert d2["total_cost"] == 2400.0
    assert d2["total_value"] == 3000.0  # 20 * 150.0
    assert d2["unrealized_pnl_dollar"] == 600.0
    assert d2["unrealized_pnl_pct"] == 25.0


def test_portfolio_total_value_and_dynamic_allocation(client: TestClient, session: Session):
    """
    PL-721 Fix 4: Portfolio total value = sum(stock_total_value across all holdings).
    Dynamic allocation % = (stock_total_value / portfolio_total_value) * 100.
    """
    from backend.data_sources.data_provider import DataProviderManager
    with DataProviderManager._LOCK:
        DataProviderManager._CACHE["PORT1"] = {"symbol": "PORT1", "current_price": 100.0, "company_name": "P1"}
        DataProviderManager._CACHE["PORT2"] = {"symbol": "PORT2", "current_price": 100.0, "company_name": "P2"}

    # Stock 1: 25 shares @ $100 -> value $2,500
    client.post("/api/watchlist/set-bucket", json={
        "symbol": "PORT1",
        "company_name": "P1",
        "bucket": "HOLDING",
        "buy_in_price": 100.0,
        "buy_in_date": "2026-10-01",
        "shares_held": 25.0
    })

    # Stock 2: 75 shares @ $100 -> value $7,500
    client.post("/api/watchlist/set-bucket", json={
        "symbol": "PORT2",
        "company_name": "P2",
        "bucket": "HOLDING",
        "buy_in_price": 100.0,
        "buy_in_date": "2026-10-01",
        "shares_held": 75.0
    })

    res = client.get("/api/watchlist?bucket=HOLDING")
    assert res.status_code == 200
    holdings = {it["symbol"]: it for it in res.json()}

    # Total portfolio value = $2,500 + $7,500 = $10,000 (plus any existing holdings if present)
    p1 = holdings["PORT1"]
    p2 = holdings["PORT2"]
    assert p1["total_value"] == 2500.0
    assert p2["total_value"] == 7500.0

    # P1 allocation should be 2500 / total, P2 should be 7500 / total
    # Specifically, ratio of P1 to P2 should be 1:3
    assert p2["portfolio_allocation_pct"] == round(p1["portfolio_allocation_pct"] * 3, 2)

