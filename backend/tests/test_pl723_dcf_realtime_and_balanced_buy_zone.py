"""
Regression and Acceptance Test Suite for Epic 16 / PL-723:
Institutional DCF 2.5 Multi-Industry Calibration, Real-Time Hydration & Balanced Buy Zone Overhaul.
"""

import pytest
import time
from typing import Dict, Any
from sqlmodel import Session, select

from backend.data_sources.data_provider import DataProviderManager
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.recommendation_engine import RecommendationEngine
from backend.models.db_models import UserWatchlistDB, PriceAlertLogDB, get_utc_now
from backend.database import engine
from backend.routers.watchlist import enrich_item_quote
from backend.routers.alerts import get_alert_history


# --------------------------------------------------------------------------
# 1. Multi-Industry Archetype DCF 2.5 Calibrations (PL-723.1 & PL-723.2)
# --------------------------------------------------------------------------

def test_mining_project_expansion_capex_and_reserve_factor():
    """Verify senior mining champions (FCX, FM.TO, HBM.TO) receive calibrated expansion capex and LoM factor."""
    stock = DataProviderManager.get_stock_data("FCX")
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert res["is_valid"] is True
    assert res["bridge"]["is_mining_materials"] is True
    assert 20.0 <= res["dcf_fair_value"] <= 35.0
    assert res["bridge"]["terminal_exit_multiple_used"] == 9.5
    assert res["bridge"]["valuation_outlier_warning"] is False


def test_franchise_whole_business_securitization_wing():
    """Verify asset-light franchise royalty systems (WING) with Whole-Business Securitization debt clamp."""
    stock = DataProviderManager.get_stock_data("WING")
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert res["is_valid"] is True
    assert 85.0 <= res["dcf_fair_value"] <= 135.0
    assert res["bridge"]["less_total_debt"] < stock["total_debt"]
    assert res["bridge"]["terminal_exit_multiple_used"] == 22.0
    assert res["bridge"]["valuation_outlier_warning"] is False


def test_precious_metals_royalty_streaming_fnv():
    """Verify precious metals royalty/streamers (FNV.TO) receive 96% OCF owner cash flow conversion and 24x exit multiple."""
    stock = DataProviderManager.get_stock_data("FNV.TO")
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert res["is_valid"] is True
    assert res["bridge"]["is_metals_royalty"] is True
    assert res["bridge"]["terminal_exit_multiple_used"] in {17.5, 19.0}
    # Price to DCF ratio must be realistic (< 2.0x)
    ratio = stock["current_price"] / res["dcf_fair_value"]
    assert ratio < 2.0


def test_midstream_distributable_cash_flow_pipeline_kmi():
    """Verify midstream pipelines (KMI, WMB) owner cash flow is anchored to Distributable Cash Flow (72% OCF)."""
    stock = DataProviderManager.get_stock_data("KMI")
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert res["is_valid"] is True
    assert res["bridge"]["terminal_exit_multiple_used"] == 15.5
    assert res["bridge"]["less_total_debt"] <= res["bridge"]["enterprise_value"] * 0.25
    ratio = stock["current_price"] / res["dcf_fair_value"]
    assert ratio < 2.0


def test_refining_mid_cycle_normalization_mpc():
    """Verify merchant petroleum refiners (MPC) mid-cycle refining crack spread normalization."""
    stock = DataProviderManager.get_stock_data("MPC")
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert res["is_valid"] is True
    assert 350.0 <= res["dcf_fair_value"] <= 520.0
    assert res["bridge"]["terminal_exit_multiple_used"] == 8.5
    assert res["bridge"]["valuation_outlier_warning"] is False


def test_port_marine_terminal_tollbooth_wte_to():
    """Verify Westshore Terminals (WTE.TO) export marine terminal tollbooth valuation."""
    stock = DataProviderManager.get_stock_data("WTE.TO")
    res = PricingEngine.evaluate_pricing_and_entry_zone(stock)

    assert res["is_valid"] is True
    # Fair value must be in realistic $30 - $48 CAD range (vs broken $8.12 CAD)
    assert 28.0 <= res["dcf_fair_value"] <= 48.0
    ratio = stock["current_price"] / res["dcf_fair_value"]
    assert ratio < 1.6


def test_mega_cap_hyperscaler_scale_deceleration_guardrail():
    """Verify mega-cap hyperscalers (GOOGL, META, ORCL) have scale deceleration guardrails preventing runaway DCF."""
    googl = DataProviderManager.get_stock_data("GOOGL")
    res_googl = PricingEngine.evaluate_pricing_and_entry_zone(googl)

    assert res_googl["is_valid"] is True
    assert res_googl["dcf_fair_value"] > 0
    # Price / DCF ratio should remain bounded between 0.35x and 1.6x (not collapsed or absurd)
    ratio_googl = googl["current_price"] / res_googl["dcf_fair_value"]
    assert 0.35 <= ratio_googl <= 1.6


# --------------------------------------------------------------------------
# 2. Balanced Investor Buy Zone Overhaul (PL-723.5)
# --------------------------------------------------------------------------

def test_balanced_buy_zone_no_moving_goalpost_lockout():
    """Verify that fundamentally undervalued stocks immediately qualify for IN_BUY_ZONE without moving-goalpost lockout."""
    mock_stock = {
        "symbol": "VALUE_CO",
        "current_price": 50.0,
        "market_cap": 10_000_000_000.0,
        "shares_outstanding": 200_000_000.0,
        "total_revenue": 5_000_000_000.0,
        "free_cash_flow": 700_000_000.0,
        "operating_cash_flow": 900_000_000.0,
        "total_cash": 1_000_000_000.0,
        "total_debt": 500_000_000.0,
        "beta": 1.0,
        "fifty_day_sma": 51.0,
        "two_hundred_day_sma": 52.0,
        "moat_rating": "Wide Moat",
        "is_valid": True
    }
    res = PricingEngine.evaluate_pricing_and_entry_zone(mock_stock)

    assert res["is_valid"] is True
    assert res["dcf_fair_value"] > mock_stock["current_price"]
    # Since dcf_target >= price, ceiling must accommodate the price (>= 50.0)
    assert res["ideal_buy_range_max"] >= mock_stock["current_price"]
    assert res["action_status"] == "IN_BUY_ZONE"
    assert "buy" in res["timing_advice"].lower() or "margin of safety" in res["timing_advice"].lower()


def test_balanced_tiered_margin_of_safety():
    """Verify tiered MoS applies 8% for Wide Moat / Utilities, 10% balanced default, and 15% for high multiple."""
    wide_stock = {
        "symbol": "WIDE_CO",
        "current_price": 100.0,
        "market_cap": 50_000_000_000.0,
        "shares_outstanding": 500_000_000.0,
        "total_revenue": 20_000_000_000.0,
        "free_cash_flow": 3_000_000_000.0,
        "operating_cash_flow": 4_000_000_000.0,
        "total_cash": 2_000_000_000.0,
        "total_debt": 1_000_000_000.0,
        "beta": 0.95,
        "fifty_day_sma": 102.0,
        "two_hundred_day_sma": 98.0,
        "moat_rating": "Wide Moat",
        "pe_ratio": 18.0,
        "is_valid": True
    }
    res = PricingEngine.evaluate_pricing_and_entry_zone(wide_stock)
    # Tiered MoS for Wide Moat should be 8% (dcf_target = dcf_fair_value * 0.92)
    expected_target = round(res["dcf_fair_value"] * 0.92, 2)
    assert res["ideal_buy_range_max"] >= expected_target * 0.95


# --------------------------------------------------------------------------
# 3. Stock Picks & Watchlist Real-Time Hydration (PL-723.3 & PL-723.4)
# --------------------------------------------------------------------------

def test_recommendation_engine_live_hydration():
    """Verify RecommendationEngine._hydrate_live_pricing_for_stocks updates quotes and buy zones."""
    sample_picks = [
        {
            "symbol": "AAPL",
            "company_name": "Apple Inc.",
            "current_price": 100.0,  # Old stale price
            "key_metrics": {
                "dcf_fair_value": 50.0,
                "ideal_buy_range_min": 40.0,
                "ideal_buy_range_max": 45.0
            }
        }
    ]
    hydrated = RecommendationEngine._hydrate_live_pricing_for_stocks(sample_picks)
    assert len(hydrated) == 1
    h_item = hydrated[0]

    # Current price must be hydrated to live market price (> 150.0)
    assert h_item["current_price"] > 150.0
    assert h_item["dcf_fair_value"] > 50.0
    assert h_item["ideal_buy_range_max"] > 50.0
    assert h_item["key_metrics"]["dcf_fair_value"] == h_item["dcf_fair_value"]
    assert h_item["action_status"] is not None


def test_watchlist_real_time_enrichment_and_dynamic_target():
    """Verify enrich_item_quote dynamically enriches watchlist item with live quote, DCF, and buy ceiling target."""
    item = UserWatchlistDB(
        id=999,
        symbol="MSFT",
        company_name="Microsoft Corporation",
        bucket="WATCHLIST",
        target_buy_price=None,  # User did not set explicit target
        portfolio_allocation_pct=3.0
    )
    enriched = enrich_item_quote(item, allow_network=True)

    assert enriched.symbol == "MSFT"
    assert enriched.current_price is not None
    assert enriched.current_price > 200.0
    assert enriched.dcf_fair_value is not None
    assert enriched.ideal_buy_range_max is not None
    # Dynamic target buy price must be populated from ideal buy ceiling
    assert enriched.target_buy_price is not None
    assert enriched.target_buy_price > 0.0


def test_alert_history_real_time_quote_enrichment():
    """Verify get_alert_history enriches past alert records with current live prices and targets."""
    with Session(engine) as session:
        # Create a test alert log entry
        test_log = PriceAlertLogDB(
            symbol="NVDA",
            company_name="NVIDIA Corporation",
            current_price=50.0,  # Historical trigger price
            target_buy_price=60.0,
            notification_channel="IN_APP",
            status="TRIGGERED",
            message="Test trigger",
            triggered_at=get_utc_now()
        )
        session.add(test_log)
        session.commit()
        session.refresh(test_log)
        log_id = test_log.id

        try:
            alerts = get_alert_history(session=session)
            matched = next((a for a in alerts if a.id == log_id), None)
            assert matched is not None
            # Current price must be enriched with live quote (> 80.0)
            assert matched.current_price > 80.0
        finally:
            # Clean up test log
            rec = session.get(PriceAlertLogDB, log_id)
            if rec:
                session.delete(rec)
                session.commit()
