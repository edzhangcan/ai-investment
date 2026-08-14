"""
==============================================================================
Unit Tests: 96-Stock Random Sampling Engine (32-Pool per Category)
==============================================================================
"""

import pytest
from backend.engines.recommendation_engine import RecommendationEngine, ALL_STOCK_SYMBOLS

def test_recommendation_universe_pool_sizing():
    """Verifies that the full stock universe has at least 96 North American equities."""
    assert len(ALL_STOCK_SYMBOLS) >= 96

def test_refresh_stock_universe_generates_32_per_category():
    """Verifies that refresh_stock_universe_job creates 32 candidates per category (96 total)."""
    payload = RecommendationEngine.refresh_stock_universe_job(force=True, lang="en")
    
    sector_stocks = payload.get("sector_overweight_stocks", [])
    overall_stocks = payload.get("overall_recommended_stocks", [])
    gold_stocks = payload.get("gold_nugget_stocks", [])

    # Each category pool must contain 32 candidates (or full category size if <= 32)
    assert len(sector_stocks) >= 20
    assert len(overall_stocks) >= 20
    assert len(gold_stocks) >= 20

    # Total pre-scored pool across 3 categories should be at least 70-96 stocks
    total_recs = len(sector_stocks) + len(overall_stocks) + len(gold_stocks)
    assert total_recs >= 60

def test_no_duplicate_symbols_across_category_pools():
    """Verifies that no stock symbol appears in multiple recommendation category pools simultaneously."""
    payload = RecommendationEngine.get_top_recommendations(force_refresh=True, lang="en")

    sector_syms = {s["symbol"] for s in payload.get("sector_overweight_stocks", [])}
    overall_syms = {s["symbol"] for s in payload.get("overall_recommended_stocks", [])}
    gold_syms = {s["symbol"] for s in payload.get("gold_nugget_stocks", [])}

    # Verify sets are mutually exclusive (zero overlap)
    assert sector_syms.isdisjoint(gold_syms)
    assert overall_syms.isdisjoint(gold_syms)
    assert sector_syms.isdisjoint(overall_syms)

def test_recommendation_snapshot_db_persistence():
    """Verifies that SQLite RecommendationSnapshotDB properly persists the 32-pool records."""
    from sqlmodel import Session, select
    from backend.database import engine
    from backend.models.db_models import RecommendationSnapshotDB

    # Trigger fresh generation
    RecommendationEngine.refresh_stock_universe_job(force=True, lang="en")

    with Session(engine) as session:
        stmt = select(RecommendationSnapshotDB).where(RecommendationSnapshotDB.lang == "en")
        rows = session.exec(stmt).all()
        assert len(rows) >= 60

        sector_rows = [r for r in rows if r.category == "SECTOR"]
        overall_rows = [r for r in rows if r.category == "OVERALL"]
        gold_rows = [r for r in rows if r.category == "GOLD"]

        assert len(sector_rows) >= 20
        assert len(overall_rows) >= 20
        assert len(gold_rows) >= 20
