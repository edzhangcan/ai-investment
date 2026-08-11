"""
Unit tests for NewsClient (Macro policy news and stock-specific news ingestion)
"""
import pytest
from backend.data_sources.news_client import NewsClient

def test_fetch_macro_news():
    news = NewsClient.fetch_macro_news()
    assert isinstance(news, list)
    assert len(news) >= 2
    assert "title" in news[0]
    assert "source" in news[0]
    assert "credibility_tier" in news[0]
    assert "url" in news[0]

def test_fetch_stock_news():
    news_nvda = NewsClient.fetch_stock_news("NVDA")
    assert isinstance(news_nvda, list)
    assert len(news_nvda) >= 1
    assert "relevance" in news_nvda[0]

    news_shop = NewsClient.fetch_stock_news("SHOP.TO")
    assert isinstance(news_shop, list)
    assert len(news_shop) >= 1

def test_news_cache():
    # Calling twice should hit cache
    res1 = NewsClient.fetch_macro_news()
    res2 = NewsClient.fetch_macro_news()
    assert res1 == res2
