"""
Stock Analysis Router with multi-language support (en, zh, hybrid)
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from sqlmodel import Session, select
from backend.database import get_session
from backend.models.db_models import ValuationAlertSettingsDB
from backend.data_sources.data_provider import DataProviderManager
from backend.data_sources.news_client import NewsClient
from backend.engines.macro_engine import MacroEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.sec_text_miner import SECTextMiner
from backend.agents.agent_arena import MultiAgentArena

router = APIRouter(prefix="/api/stock", tags=["Stock Analyzer"])

@router.get("/{ticker}")
def analyze_stock(ticker: str, lang: str = "en", session: Optional[Session] = Depends(get_session)):
    """
    Synthesizes stock metrics, fundamental analysis, valuation models, technical overlays,
    and runs the Bull vs Bear vs CIO multi-agent debate in target language (en, zh, hybrid).
    Respects user-configured Margin of Safety (MoS) and technical anchor mode settings.
    """
    if not ticker or len(ticker.strip()) == 0:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")

    symbol = ticker.strip().upper()
    stock_data = DataProviderManager.get_stock_data(symbol)
    macro_data = MacroEngine.analyze_macro_environment(lang=lang)
    fundamental_data = FundamentalEngine.evaluate_fundamentals(stock_data, lang=lang)

    custom_mos = None
    anchor_mode = "adaptive_balanced"
    if session and hasattr(session, "exec"):
        try:
            settings_rec = session.exec(select(ValuationAlertSettingsDB)).first()
            if settings_rec:
                custom_mos = settings_rec.global_mos_pct
                anchor_mode = settings_rec.technical_anchor_mode
        except Exception:
            pass

    pricing_data = PricingEngine.evaluate_pricing_and_entry_zone(
        stock_data,
        lang=lang,
        custom_mos_pct=custom_mos,
        anchor_mode=anchor_mode
    )
    debate_data = MultiAgentArena.run_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang)
    news_data = NewsClient.fetch_stock_news(symbol)
    profile_data = fundamental_data.get("company_profile")

    return {
        "stock": stock_data,
        "profile": profile_data,
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

@router.get("/{ticker}/filings/mining")
def get_sec_text_mining(ticker: str, lang: str = "en"):
    """
    Executes historical 5-year SEC EDGAR 10-K & SEDAR+ MD&A text mining diffing,
    extracting added/removed disclaimers and keyword frequency trends.
    """
    if not ticker or len(ticker.strip()) == 0:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")
    return SECTextMiner.mine_filings_mda(ticker.strip().upper(), lang=lang)

@router.get("/{ticker}/backtest")
def get_stock_backtest(
    ticker: str,
    benchmark: str = "SPY",
    use_live_data: bool = False,
    lang: str = "en"
):
    """
    Executes 5-year quantitative backtest simulation (2021-2025) for a single stock symbol.
    """
    if not ticker or len(ticker.strip()) == 0:
        raise HTTPException(status_code=400, detail="Ticker symbol cannot be empty")
    from backend.engines.backtest_engine import BacktestEngine
    return BacktestEngine.run_backtest(
        symbols=[ticker.strip().upper()],
        benchmark=benchmark,
        period_years=5,
        use_live_data=use_live_data,
        lang=lang
    )
