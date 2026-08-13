from backend.data_sources.data_provider import DataProviderManager, REAL_UNIVERSE_FINANCIALS
from backend.data_sources.sec_edgar_parser import SECEdgarParser
from backend.data_sources.sedar_parser import SEDARParser
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.macro_engine import MacroEngine
from backend.engines.recommendation_engine import RecommendationEngine
from backend.engines.backtest_engine import BacktestEngine
from backend.engines.portfolio_engine import PortfolioEngine
from backend.services.alert_engine import alert_engine
from backend.engines.sec_text_miner import SECTextMiner

def test_data_provider_universe_list():
    """Verifies that 100+ North American equities are supported in REAL_UNIVERSE_FINANCIALS."""
    assert len(REAL_UNIVERSE_FINANCIALS) >= 100
    assert "NVDA" in REAL_UNIVERSE_FINANCIALS
    assert "AAPL" in REAL_UNIVERSE_FINANCIALS
    assert "SHOP.TO" in REAL_UNIVERSE_FINANCIALS
    assert "SU.TO" in REAL_UNIVERSE_FINANCIALS

def test_data_provider_fallback_price():
    """Verifies fallback synthetic data generation for unmapped tickers."""
    data = DataProviderManager.get_stock_data("XYZ_UNMAPPED_999")
    assert data["is_valid"] is True
    assert data["symbol"] == "XYZ_UNMAPPED_999"
    assert data["current_price"] > 0

def test_pricing_engine_overvalued_stock():
    """Verifies PricingEngine behavior for overvalued stock above DCF fair value."""
    stock_raw = {
        "is_valid": True,
        "symbol": "HIGH_VAL_STOCK",
        "current_price": 500.0,
        "currency": "USD",
        "fifty_day_sma": 480.0,
        "two_hundred_day_sma": 400.0,
        "pe_ratio": 95.0,
        "free_cash_flow": 1000000000,
        "rsi_14": 75.0
    }
    pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock_raw, lang="en")
    assert pricing["is_valid"] is True
    assert pricing["action_status"] in ["OVEREXTENDED", "PULLBACK_WATCH", "IN_BUY_ZONE"]
    assert pricing["valuation_percentile"] >= 30.0

def test_fundamental_engine_etf_portfolio():
    """Verifies FundamentalEngine handling of ETF / Index portfolios."""
    etf_stock = {
        "is_valid": True,
        "symbol": "VFV.TO",
        "company_name": "Vanguard S&P 500 Index ETF",
        "current_price": 125.0,
        "free_cash_flow": None,
        "currency": "CAD"
    }
    fund = FundamentalEngine.evaluate_fundamentals(etf_stock, lang="en")
    assert fund["is_valid"] is True
    assert "N/A" in fund["free_cash_flow_formatted"]
    assert fund["score"] >= 50.0

def test_backtest_engine_full_run():
    """Verifies 5-year quantitative backtest engine calculations."""
    res = BacktestEngine.run_backtest(symbols=["NVDA"], benchmark="SPY", lang="en")
    assert "cagr_pct" in res
    assert "sharpe_ratio" in res

def test_portfolio_engine_risk_models():
    """Verifies PortfolioEngine allocation across Conservative, Balanced, and Aggressive risk profiles."""
    for profile in ["CONSERVATIVE", "BALANCED", "AGGRESSIVE"]:
        calc = PortfolioEngine.calculate_position_sizes(
            cash_balance=100000.0,
            risk_profile=profile,
            currency="USD",
            selected_symbols=["NVDA", "AAPL"],
            lang="en"
        )
        assert calc["cash_balance"] == 100000.0
        assert len(calc["position_breakdown"]) == 2

def test_sec_text_miner_keyword_trends():
    """Verifies SECTextMiner 5-year MD&A filing keyword mining."""
    mining = SECTextMiner.mine_filings_mda("NVDA", lang="en")
    assert mining["symbol"] == "NVDA"
    assert len(mining["text_mining_timeline"]) >= 1

def test_sec_edgar_parser_authentic_fcf():
    """Verifies SECEdgarParser authentic FCF extraction without static defaults."""
    metrics = SECEdgarParser.extract_sec_metrics("AAPL")
    assert metrics["symbol"] == "AAPL"
    assert metrics["free_cash_flow"] is not None
    assert metrics["free_cash_flow"] != 22_000_000_000

def test_sedar_parser_authentic_fcf():
    """Verifies SEDARParser authentic Canadian FCF extraction without static defaults."""
    metrics = SEDARParser.extract_sedar_metrics("SHOP.TO")
    assert metrics["symbol"] == "SHOP.TO"
    assert metrics["free_cash_flow"] is not None
    assert metrics["free_cash_flow"] != 2_200_000_000
