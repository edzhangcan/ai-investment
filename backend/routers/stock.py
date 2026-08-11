"""
Stock Analysis Router
"""

from fastapi import APIRouter, HTTPException
from backend.data_sources.data_provider import DataProviderManager
from backend.data_sources.news_client import NewsClient
from backend.engines.macro_engine import MacroEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.agents.agent_arena import MultiAgentArena

router = APIRouter(prefix="/api/stock", tags=["Stock Analyzer"])

@router.get("/{ticker}")
def analyze_stock(ticker: str):
    """
    Synthesizes stock metrics, fundamental analysis, valuation models, technical overlays,
    and runs the Bull vs Bear vs CIO multi-agent debate.
    """
    if not ticker or len(ticker.strip()) == 0:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")

    symbol = ticker.strip().upper()
    stock_data = DataProviderManager.get_stock_data(symbol)
    macro_data = MacroEngine.analyze_macro_environment()
    fundamental_data = FundamentalEngine.evaluate_fundamentals(stock_data)
    pricing_data = PricingEngine.evaluate_pricing_and_entry_zone(stock_data)
    debate_data = MultiAgentArena.run_debate(stock_data, macro_data, pricing_data, fundamental_data)
    news_data = NewsClient.fetch_stock_news(symbol)

    return {
        "stock": stock_data,
        "macro": macro_data,
        "fundamentals": fundamental_data,
        "pricing": pricing_data,
        "debate": debate_data,
        "news": news_data
    }

@router.get("/{ticker}/news")
def get_stock_news(ticker: str):
    """Returns real-time stock news headlines for target symbol."""
    if not ticker or len(ticker.strip()) == 0:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")
    return NewsClient.fetch_stock_news(ticker.strip().upper())
