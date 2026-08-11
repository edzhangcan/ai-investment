"""
Unit tests for SEC EDGAR & SEDAR filing metric parsers
"""
import pytest
from backend.data_sources.sec_edgar_parser import SECEdgarParser
from backend.data_sources.sedar_parser import SEDARParser

def test_sec_edgar_parser_us_stocks():
    metrics = SECEdgarParser.extract_sec_metrics("NVDA")
    assert metrics["symbol"] == "NVDA"
    assert "operating_cash_flow" in metrics
    assert "capex" in metrics
    assert metrics["free_cash_flow"] is not None

def test_sedar_parser_canadian_stocks():
    metrics = SEDARParser.extract_sedar_metrics("SHOP.TO")
    assert metrics["symbol"] == "SHOP.TO"
    assert metrics["currency"] == "CAD"
    assert metrics["free_cash_flow"] > 0
    assert metrics["historical_5yr_filings_parsed"] is True
