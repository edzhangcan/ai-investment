"""
Pytest Suite for AI Investment Backend Engines & Data Providers
"""

import pytest
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.macro_engine import MacroEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.pricing_engine import PricingEngine
from backend.agents.agent_arena import MultiAgentArena

def test_data_provider_fallback():
    data = DataProviderManager.get_stock_data("AAPL")
    assert data["symbol"] == "AAPL"
    assert data["current_price"] > 0
    assert "source" in data

def test_data_provider_real_time_t_to():
    """Verifies that $T.TO (TELUS) accurately returns ~13.54 CAD live price instead of ~219 CAD."""
    data = DataProviderManager.get_stock_data("T.TO", force_refresh=True)
    assert data["symbol"] == "T.TO"
    assert data["currency"] == "CAD"
    assert data["market"] == "CA"
    assert "TELUS" in data["company_name"].upper()
    # Live market price for TELUS should be ~12-16 CAD, never ~219 CAD
    assert 10.0 <= data["current_price"] <= 30.0, f"Expected TELUS price in 10-30 CAD, got {data['current_price']}"
    assert "Real-Time Market Exchange" in data["source"]

def test_macro_engine():
    macro = MacroEngine.analyze_macro_environment()
    assert "cycle_stage" in macro
    assert "fed_sentiment" in macro
    assert len(macro["recommended_overweights"]) > 0

def test_fundamental_engine():
    stock = DataProviderManager.get_stock_data("MSFT")
    fundamentals = FundamentalEngine.evaluate_fundamentals(stock)
    assert fundamentals["fcf_quality"] is not None
    assert "moat_rating" in fundamentals
    assert len(fundamentals["guidance_shift_deltas"]) > 0

def test_pricing_engine():
    stock = DataProviderManager.get_stock_data("NVDA")
    pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock)
    assert pricing["ideal_buy_range_min"] <= pricing["ideal_buy_range_max"]
    assert pricing["dcf_fair_value"] > 0
    assert pricing["action_status"] is not None

def test_multi_agent_arena():
    stock = DataProviderManager.get_stock_data("SHOP.TO")
    macro = MacroEngine.analyze_macro_environment()
    fundamentals = FundamentalEngine.evaluate_fundamentals(stock)
    pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock)
    
    debate = MultiAgentArena.run_debate(stock, macro, pricing, fundamentals)
    assert debate["bull_argument"]["agent"].startswith("Bull Agent")
    assert debate["bear_argument"]["agent"].startswith("Bear Agent")
    assert debate["cio_verdict"]["agent"].startswith("CIO Agent")
    assert debate["cio_verdict"]["empirical_proof_verified"] is True
