"""
Pytest Suite for SQLite Database Models & Watchlist Router
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, select
from sqlmodel.pool import StaticPool

from backend.main import app
from backend.database import get_session
from backend.models.db_models import UserWatchlistDB, CompanyDB

# Setup isolated in-memory SQLite database for testing
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

def test_watchlist_crud_operations(client: TestClient):
    # 1. Add Ticker to Watchlist
    response = client.post(
        "/api/watchlist",
        json={
            "symbol": "NVDA",
            "company_name": "NVIDIA Corporation",
            "target_buy_price": 105.0,
            "portfolio_allocation_pct": 5.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "NVDA"
    assert data["target_buy_price"] == 105.0

    # 2. Fetch Watchlist Items
    get_res = client.get("/api/watchlist")
    assert get_res.status_code == 200
    items = get_res.json()
    assert len(items) == 1
    assert items[0]["symbol"] == "NVDA"

    # 3. Delete Watchlist Item
    del_res = client.delete("/api/watchlist/NVDA")
    assert del_res.status_code == 200

    # 4. Verify Empty
    get_res_empty = client.get("/api/watchlist")
    assert len(get_res_empty.json()) == 0

def test_watchlist_validation_errors(client: TestClient):
    # Negative target buy price should trigger 422 Unprocessable Entity
    invalid_res = client.post(
        "/api/watchlist",
        json={
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "target_buy_price": -50.0,
            "portfolio_allocation_pct": 5.0
        }
    )
    assert invalid_res.status_code == 422

    # Allocation > 100% should trigger 422 Unprocessable Entity
    invalid_alloc = client.post(
        "/api/watchlist",
        json={
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "target_buy_price": 150.0,
            "portfolio_allocation_pct": 150.0
        }
    )
    assert invalid_alloc.status_code == 422
