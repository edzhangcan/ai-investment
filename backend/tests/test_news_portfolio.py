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

    try:
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
    finally:
        with DataProviderManager._LOCK:
            DataProviderManager._CACHE.pop("SLB", None)


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


def test_news_recency_scan_within_1_month_and_3_month_purge(client: TestClient, session: Session):
    """
    Requirement 8 (PL-722.7):
    - Only scan news and articles recent within the past 1 month (<= 30 days).
    - Do not include info older than 3 months (> 90 days).
    """
    from datetime import datetime, timezone, timedelta
    from backend.data_sources.news_client import (
        NewsClient,
        calculate_news_age_days,
        MAX_NEWS_SCAN_DAYS,
        MAX_NEWS_RETENTION_DAYS,
        _NEWS_CACHE,
    )

    now = datetime.now(timezone.utc)
    date_5d_ago = (now - timedelta(days=5)).strftime("%Y-%m-%d")
    date_45d_ago = (now - timedelta(days=45)).strftime("%Y-%m-%d")
    date_120d_ago = (now - timedelta(days=120)).strftime("%Y-%m-%d")

    assert calculate_news_age_days(date_5d_ago, now) == 5
    assert calculate_news_age_days(date_45d_ago, now) == 45
    assert calculate_news_age_days(date_120d_ago, now) == 120

    # Seed custom cache with 5d (recent), 45d (>1m, <3m), and 120d (>3m) articles
    NewsClient._set_cache("STOCK_NEWS_NVDA", [
        {
            "title": "NVDA Fresh 5-Day-Old Catalyst Record Expansion",
            "source": "NVIDIA SEC 8-K",
            "url": "https://nvidianews.nvidia.com/fresh-5d",
            "published_at": date_5d_ago,
            "summary": "Strong recent datacenter expansion.",
            "credibility_tier": "Tier-1 Official Filing / IR",
            "relevance": "NVDA",
        },
        {
            "title": "NVDA Stale 45-Day-Old Article",
            "source": "Old Financial Media",
            "url": "https://example.com/stale-45d",
            "published_at": date_45d_ago,
            "summary": "Outdated news from 45 days ago.",
            "credibility_tier": "Tier-2 Financial Media",
            "relevance": "NVDA",
        },
        {
            "title": "NVDA Ancient 120-Day-Old Article Beyond 3 Months",
            "source": "Ancient Media",
            "url": "https://example.com/ancient-120d",
            "published_at": date_120d_ago,
            "summary": "Info older than 3 months must be purged.",
            "credibility_tier": "Tier-2 Financial Media",
            "relevance": "NVDA",
        },
    ])

    try:
        # 1. Verify NewsClient.fetch_batch_stock_news purges > 90d items immediately
        batch = NewsClient.fetch_batch_stock_news(["NVDA"])
        nvda_batch_titles = [it["title"] for it in batch.get("NVDA", [])]
        assert "NVDA Ancient 120-Day-Old Article Beyond 3 Months" not in nvda_batch_titles

        # 2. Verify PortfolioNewsEngine analysis endpoint only scans <= 30d (1 month) news
        res = client.get("/api/news-portfolio/analysis?market=ALL")
        assert res.status_code == 200
        data = res.json()

        feed_titles = [n["title"] for n in data["news_feed"]]
        assert "NVDA Fresh 5-Day-Old Catalyst Record Expansion" in feed_titles
        assert "NVDA Stale 45-Day-Old Article" not in feed_titles
        assert "NVDA Ancient 120-Day-Old Article Beyond 3 Months" not in feed_titles

        for item in data["news_feed"]:
            assert item["age_days"] <= MAX_NEWS_SCAN_DAYS
            assert item["is_recent"] is True

        for post in data["investor_posts"]:
            assert post["age_days"] <= MAX_NEWS_SCAN_DAYS
            assert post["is_recent"] is True
    finally:
        _NEWS_CACHE.pop("STOCK_NEWS_NVDA", None)


def test_no_recommendation_based_on_news_older_than_1_month():
    """
    Requirement 9 (PL-722.7):
    Do not make recommendations (action_advice, opportunities, risks) based on news older than 1 month (> 30 days).
    """
    from datetime import datetime, timezone, timedelta
    from backend.engines.portfolio_news_engine import PortfolioNewsEngine

    now = datetime.now(timezone.utc)
    fresh_date = (now - timedelta(days=4)).strftime("%Y-%m-%d")
    stale_40d_date = (now - timedelta(days=40)).strftime("%Y-%m-%d")

    tracked_positions = [
        {
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "market": "US",
            "currency": "USD",
            "bucket": "HOLDING",
            "current_price": 225.0,
            "buy_in_price": 200.0,
            "target_buy_price": None,
            "falsification_floor": 195.0,
            "unrealized_pnl_pct": 12.5,
            "portfolio_allocation_pct": 3.5,
            "batting_zone": "RIGHT_SIDE",
            "trend_state": "WARM",
            "day_signal": "HOLD_CORE",
        }
    ]

    # Provide only a 40-day-old news item for AAPL and a 4-day-old news item for MSFT
    mixed_news_feed = [
        {
            "id": "stale-aapl-40d",
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "market": "US",
            "bucket": "HOLDING",
            "title": "AAPL Stale 40-Day Bullish Record Growth Headline",
            "summary": "This article is 40 days old and must not drive recommendations.",
            "portfolio_impact_note": "Stale impact note.",
            "source": "Stale Source 40D",
            "url": "https://example.com/stale-aapl-40d",
            "published_at": stale_40d_date,
            "sentiment": "BULLISH",
            "age_days": 40,
            "is_recent": False,
        },
        {
            "id": "stale-risk-45d",
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "market": "US",
            "bucket": "HOLDING",
            "title": "AAPL Stale 45-Day Bearish Warning Drop",
            "summary": "This bearish article is 45 days old and must not appear in risks.",
            "portfolio_impact_note": "Stale risk note.",
            "source": "Stale Bearish 45D",
            "url": "https://example.com/stale-risk-45d",
            "published_at": stale_40d_date,
            "sentiment": "RISK_ALERT",
            "age_days": 45,
            "is_recent": False,
        },
        {
            "id": "fresh-msft-4d",
            "symbol": "MSFT",
            "company_name": "Microsoft Corp",
            "market": "US",
            "bucket": "HOLDING",
            "title": "MSFT Fresh 4-Day Cloud Record Expansion",
            "summary": "Fresh 4-day-old catalyst eligible for recommendation.",
            "portfolio_impact_note": "Fresh impact note.",
            "source": "Microsoft IR Fresh",
            "url": "https://example.com/fresh-msft-4d",
            "published_at": fresh_date,
            "sentiment": "BULLISH",
            "age_days": 4,
            "is_recent": True,
        },
    ]

    briefing = PortfolioNewsEngine._synthesize_daily_briefing(
        date_label="Monday, October 26, 2026",
        market="US",
        tracked_positions=tracked_positions,
        news_feed=mixed_news_feed,
        investor_posts=[],
    )

    # 1. AAPL action_advice must NOT cite the 40-day-old stale source
    aapl_act = briefing["action_advice"][0]
    assert aapl_act["symbol"] == "AAPL"
    assert aapl_act["source_url"] != "https://example.com/stale-aapl-40d"
    assert aapl_act["source_name"] != "Stale Source 40D"

    # 2. Opportunities must include the 4-day-old MSFT item and exclude the 40-day-old AAPL item
    opp_urls = [o["source_url"] for o in briefing["opportunities"]]
    assert "https://example.com/fresh-msft-4d" in opp_urls
    assert "https://example.com/stale-aapl-40d" not in opp_urls

    # 3. Risks must exclude the 45-day-old bearish item
    risk_urls = [r["source_url"] for r in briefing["risks"]]
    assert "https://example.com/stale-risk-45d" not in risk_urls


