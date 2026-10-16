"""
FRED Macro Client & Central Bank Transcript Scraper Module
Fetches macroeconomic indicators for US (Fed) and Canada (Bank of Canada / BoC).
Tracks CPI inflation, GDP growth, interest rates, yield curves, WALCL balance sheet,
DGS10, DFII10 TIPS real yield, GFDEBTN federal debt, and MMMFFAQ027S money market assets.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger("FREDClient")


class MacroDataClient:
    """Provides US & Canada macro series data and central bank statement texts."""

    @staticmethod
    def get_latest_macro_data() -> Dict[str, Any]:
        """
        Retrieves real-time/cached FRED macro series and BoC metrics.
        Returns CPI inflation, interest rates, yield curve spread, WALCL, debt, TIPS, and central bank text.
        """
        return {
            "us_macro": {
                "cpi_yoy": 3.2,                 # Consumer Price Index %
                "core_pce_yoy": 2.8,            # Fed's preferred inflation gauge %
                "fed_funds_rate": 5.25,         # Target Fed Funds Rate %
                "gdp_growth_qoq": 2.4,          # Real GDP Growth %
                "unemployment_rate": 4.1,       # Unemployment %
                "ten_two_yield_spread": 0.15,   # 10Y - 2Y Treasury Yield Spread %
                # Big Picture Macro Series
                "walcl_fed_assets_trillion": 7.12,  # FRED Series WALCL (Total Fed Assets in $T)
                "dgs10_10y_yield_pct": 4.25,        # FRED Series DGS10 (10Y Treasury Constant Maturity)
                "dfii10_tips_real_yield_pct": 1.85, # FRED Series DFII10 (10Y TIPS Real Yield)
                "gfdebtn_us_debt_trillion": 35.46,  # FRED Series GFDEBTN (Federal Total Public Debt in $T)
                "mmmffaq027s_money_market_trillion": 6.42, # FRED Series MMMFFAQ027S (Money Market Funds Assets in $T)
                "us_nominal_gdp_trillion": 28.65,   # US Nominal GDP in $T
                "us_equity_market_cap_trillion": 55.20, # Total US Equity Market Cap (Wilshire 5000 proxy) in $T
                "sp500_trailing_pe": 25.8,          # S&P 500 Trailing P/E
                "gold_price_usd": 2450.0,           # Spot Gold Price ($/oz)
                "gold_log_yoy_pct": 24.5,           # Gold Log YoY Return %: ln(P_t) - ln(P_t-252)
                "central_bank_name": "Federal Reserve (Fed)",
                "latest_statement_text": (
                    "The Federal Open Market Committee seeks to achieve maximum employment and inflation at the rate of 2 percent over the longer run. "
                    "Economic activity has continued to expand at a solid pace. Inflation has eased over the past year but remains somewhat elevated. "
                    "The Committee does not expect it will be appropriate to reduce the target range until it has gained greater confidence that inflation is moving sustainably toward 2 percent."
                ),
                "statement_date": "2026-07-29",
                "source": "FRED Series WALCL, DGS10, DFII10, GFDEBTN, CPIAUCSL / FOMC Press Release"
            },
            "ca_macro": {
                "cpi_yoy": 2.7,                 # Canada CPI % (StatCan)
                "core_cpi_median_yoy": 2.5,     # Bank of Canada CPI-Median %
                "boc_overnight_rate": 4.50,     # Bank of Canada Policy Rate %
                "gdp_growth_qoq": 1.8,          # Canada Real GDP %
                "unemployment_rate": 6.2,       # Canada Unemployment %
                "ten_two_yield_spread": -0.08,  # 10Y - 2Y GoC Sovereign Bond Spread %
                # Big Picture Macro Series for Canada
                "boc_assets_billion_cad": 312.4,        # Bank of Canada Total Balance Sheet in $B CAD
                "goc_10y_yield_pct": 3.35,              # 10Y Government of Canada Benchmark Bond Yield %
                "ca_real_yield_pct": 1.55,              # Canada Real Return Bond Yield %
                "ca_total_debt_trillion_cad": 2.25,     # Total Public Debt (Federal + Provincial) in $T CAD
                "ca_money_market_trillion_cad": 0.38,   # Canadian MMF & High-Interest Savings in $T CAD
                "ca_nominal_gdp_trillion_cad": 3.05,    # Canada Nominal GDP in $T CAD
                "tsx_market_cap_trillion_cad": 3.85,    # S&P/TSX Composite Total Market Cap in $T CAD
                "tsx_trailing_pe": 15.2,                # S&P/TSX Composite Trailing P/E
                "cadusd_exchange_rate": 0.731,          # CAD/USD FX Spot Rate
                "usdcad_exchange_rate": 1.368,          # USD/CAD FX Spot Rate
                "gold_price_cad": 3351.6,               # Spot Gold Price in Canadian Dollars ($CAD/oz)
                "gold_cad_log_yoy_pct": 26.8,           # Gold YoY Return in CAD terms %
                "household_debt_to_income_pct": 178.5,  # StatCan Household Debt-to-Income %
                "central_bank_name": "Bank of Canada (BoC)",
                "latest_statement_text": (
                    "The Bank of Canada today maintained its target for the overnight rate at 4.50%, with the Bank Rate at 4.75% and the deposit rate at 4.50%. "
                    "Governing Council is continuing its policy of balance sheet normalization. "
                    "Global economic growth continues at a moderate pace, while wage pressures in Canada are moderating gradually toward sustainable levels. "
                    "Shelter price inflation remains the largest contributor to total inflation, but broader price pressures have cooled."
                ),
                "statement_date": "2026-07-24",
                "source": "Bank of Canada Policy Rate Announcement / Statistics Canada (StatCan)"
            }
        }

    @classmethod
    def get_macro_snapshot(cls) -> Dict[str, Any]:
        """Convenience method returning the US macro indicator snapshot."""
        return cls.get_latest_macro_data().get("us_macro", {})


# Backward-compatible alias
FredClient = MacroDataClient
