"""
Unit tests for SEC EDGAR 10-K & SEDAR+ Text Mining Engine
"""

import pytest
from backend.engines.sec_text_miner import SECTextMiner

def test_mine_filings_mda_us_stock():
    res = SECTextMiner.mine_filings_mda("NVDA", lang="en")
    assert res["symbol"] == "NVDA"
    assert res["historical_years_parsed"] == 5
    assert len(res["text_mining_timeline"]) > 0
    
    first_entry = res["text_mining_timeline"][0]
    assert "year" in first_entry
    assert "similarity_score" in first_entry
    assert "added_disclaimer" in first_entry
    assert "keywords_trend" in first_entry

def test_mine_filings_mda_canadian_stock():
    res = SECTextMiner.mine_filings_mda("SHOP.TO", lang="zh")
    assert res["symbol"] == "SHOP.TO"
    assert "SEDAR+" in res["filing_repository"]
    assert len(res["text_mining_timeline"]) > 0

def test_mine_filings_mda_fallback():
    res = SECTextMiner.mine_filings_mda("UNKNOWN_TICKER", lang="hybrid")
    assert res["symbol"] == "UNKNOWN_TICKER"
    assert len(res["text_mining_timeline"]) >= 2
