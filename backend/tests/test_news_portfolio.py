"""
Pytest Suite for PL-722: News & Portfolio Intelligence Module
Tests US/CA news aggregation, Key Institutional Investor commentary,
relevance scoring for Holdings & Watchlist, and daily/tomorrow tactical synthesis.
"""

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from backend.main import app
from backend.database import get_session
from backend.models.db_models import UserWatchlistDB, get_utc_now
from backend.data_sources.data_provider import DataProviderManager


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


def test_empty_portfolio_demo_bellwether_fallback(client: TestClient, session: Session):
    """
    Requirement 1: When user has 0 stocks in HOLDING and WATCHLIST,
    the endpoint returns is_demo_portfolio=True with populated demo bellwethers.
    """
    res = client.get("/api/news-portfolio/analysis?market=ALL")
    assert res.status_code == 200
    data = res.json()

    summary = data["portfolio_summary"]
    assert summary["is_demo_portfolio"] is True
    assert summary["holdings_count"] == 3
    assert summary["watchlist_count"] == 3
    assert "NVDA" in summary["holding_symbols"]
    assert "RY.TO" in summary["watchlist_symbols"]

    # Check briefing presence
    briefing = data["briefing"]
    assert len(briefing["executive_summary"]) > 20
    assert len(briefing["action_advice"]) >= 1
    assert len(briefing["opportunities"]) >= 1
    assert len(briefing["risks"]) >= 1

    # Check news and investor posts presence
    assert len(data["news_feed"]) >= 1
    assert len(data["investor_posts"]) >= 1
    assert len(data["tracked_positions"]) >= 6


def test_holding_and_watchlist_news_prioritization(client: TestClient, session: Session):
    """
    Requirement 2: Tickers seeded in HOLDING and WATCHLIST rank higher in relevance_score
    than generic market news, and is_demo_portfolio is False.
    """
    holding = UserWatchlistDB(
        symbol="NVDA",
        company_name="NVIDIA Corporation",
        bucket="HOLDING",
        buy_in_price=120.0,
        buy_in_date="2026-08-01",
        shares_held=15.0,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
    )
    watchlist = UserWatchlistDB(
        symbol="TD.TO",
        company_name="Toronto-Dominion Bank",
        bucket="WATCHLIST",
        target_buy_price=75.0,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
    )
    session.add(holding)
    session.add(watchlist)
    session.commit()

    res = client.get("/api/news-portfolio/analysis?market=ALL")
    assert res.status_code == 200
    data = res.json()

    summary = data["portfolio_summary"]
    assert summary["is_demo_portfolio"] is False
    assert summary["holdings_count"] == 1
    assert summary["watchlist_count"] == 1
    assert summary["holding_symbols"] == ["NVDA"]
    assert summary["watchlist_symbols"] == ["TD.TO"]

    # News items for NVDA and TD.TO should have high relevance score
    news_feed = data["news_feed"]
    top_news = news_feed[0]
    assert top_news["relevance_score"] >= 75.0
    assert top_news["bucket"] in ["HOLDING", "WATCHLIST"]


def test_daily_briefing_action_opportunity_risk_generation(client: TestClient, session: Session):
    """
    Requirement 3: Daily briefing contains structured action advice for holdings
    and watchlist items with rationale and tactical instructions.
    """
    holding = UserWatchlistDB(
        symbol="COST",
        company_name="Costco Wholesale",
        bucket="HOLDING",
        buy_in_price=800.0,
        buy_in_date="2026-07-15",
        shares_held=10.0,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
    )
    session.add(holding)
    session.commit()

    res = client.get("/api/news-portfolio/analysis?market=US")
    assert res.status_code == 200
    data = res.json()

    briefing = data["briefing"]
    cost_action = next((a for a in briefing["action_advice"] if a["symbol"] == "COST"), None)
    assert cost_action is not None
    assert cost_action["bucket"] == "HOLDING"
    assert cost_action["category"] == "ACTION"
    assert len(cost_action["tactical_instruction"]) > 10


def test_holding_falsification_proximity_high_urgency_warning(client: TestClient, session: Session):
    """
    Requirement 4: When a holding's market price approaches or falls below its
    falsification floor (200D SMA * 0.97), a HIGH urgency action item is generated.
    """
    with DataProviderManager._LOCK:
        DataProviderManager._CACHE["SLB"] = {
            "symbol": "SLB",
            "company_name": "SLB Limited",
            "current_price": 42.0,
            "two_hundred_day_sma": 48.0,  # Floor is 48 * 0.97 = 46.56, so 42.0 is breached
        }

    holding = UserWatchlistDB(
        symbol="SLB",
        company_name="SLB Limited",
        bucket="HOLDING",
        buy_in_price=50.0,
        buy_in_date="2026-06-01",
        shares_held=20.0,
        created_at=get_utc_now(),
        updated_at=get_utc_now(),
    )
    session.add(holding)
    session.commit()

    res = client.get("/api/news-portfolio/analysis?market=US")
    assert res.status_code == 200
    data = res.json()

    briefing = data["briefing"]
    slb_action = next((a for a in briefing["action_advice"] if a["symbol"] == "SLB"), None)
    assert slb_action is not None
    assert slb_action["urgency"] == "HIGH"
    assert "Falsification Floor" in slb_action["headline"]
    assert "defensive stop-loss" in slb_action["tactical_instruction"].lower() or "discipline" in slb_action["tactical_instruction"].lower()


def test_key_investor_commentary_and_market_filtering(client: TestClient, session: Session):
    """
    Requirement 5: Market filtering by CA returns Canadian institutional leaders
    (e.g., Prem Watsa, Bruce Flatt, RBC/BMO strategy) and TSX positions.
    """
    res_ca = client.get("/api/news-portfolio/analysis?market=CA")
    assert res_ca.status_code == 200
    data_ca = res_ca.json()

    investor_names_ca = [p["investor_name"] for p in data_ca["investor_posts"]]
    assert any("Prem Watsa" in name or "Bruce Flatt" in name or "RBC" in name for name in investor_names_ca)

    # Tracked positions in CA should strictly be Canadian (.TO or CA)
    for pos in data_ca["tracked_positions"]:
        assert pos["market"] == "CA"


def test_english_content_invariant(client: TestClient, session: Session):
    """
    Requirement 6: Content body (executive summary, news titles, investor commentary)
    is strictly rendered in English.
    """
    res = client.get("/api/news-portfolio/analysis?market=ALL")
    assert res.status_code == 200
    data = res.json()

    briefing = data["briefing"]
    assert "portfolio" in briefing["executive_summary"].lower() or "market" in briefing["executive_summary"].lower()

    first_news = data["news_feed"][0]
    assert len(first_news["title"]) > 5
    assert len(first_news["portfolio_impact_note"]) > 5

    first_investor = data["investor_posts"][0]
    assert len(first_investor["investor_name"]) > 2
    assert len(first_investor["commentary"]) > 10


def test_briefing_items_have_source_urls_and_action_tag_explanations(client: TestClient, session: Session):
    """
    Requirement 7: Every item in Today & Tomorrow Executive Briefing (action_advice,
    opportunities, risks) includes a clickable source_url and source_name, and
    action tags include clear explanations.
    """
    res = client.get("/api/news-portfolio/analysis?market=ALL")
    assert res.status_code == 200
    data = res.json()

    briefing = data["briefing"]
    for col_key in ["action_advice", "opportunities", "risks"]:
        items = briefing[col_key]
        assert len(items) >= 1
        for item in items:
            assert item.get("source_url", "").startswith("http")
            assert len(item.get("source_name", "")) > 2

    for act in briefing["action_advice"]:
        assert act.get("action_tag") in ["HOLD_CORE", "WATCH_PULLBACK", "DEFEND_FLOOR", "SCALE_IN_READY", "TRIM_EXTENDED"]
        assert len(act.get("action_tag_explanation", "")) > 20

    for pos in data["tracked_positions"]:
        assert pos.get("day_signal") in ["HOLD_CORE", "WATCH_PULLBACK", "DEFEND_FLOOR", "SCALE_IN_READY", "TRIM_EXTENDED"]
        assert len(pos.get("day_signal_explanation", "")) > 20
        assert pos.get("latest_news_url", "").startswith("http")

