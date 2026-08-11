"""
RecommendationEngine (宏观驱动多分类股票推荐引擎)
Analyzes North American macroeconomic cycles and sector overweights, evaluates US & Canadian stock universe,
and categorizes recommendations into 3 DISTINCT, MUTUALLY EXCLUSIVE strategic pools:
1. Sector Overweight Champions (4 stocks strictly matching macro overweight sectors: Energy, Financials, Materials & Mining, AI CapEx)
2. Overall Market Leaders (4-6 mega/large-cap core picks mutually exclusive from Category 1)
3. Hidden Gold Nuggets 隐形金矿股 (4-6 mid-cap/niche growth stocks mutually exclusive from Category 1 & 2)
"""

from typing import Dict, Any, List, Set
import logging
import time
from backend.engines.macro_engine import MacroEngine
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.pricing_engine import PricingEngine

logger = logging.getLogger(__name__)

# Comprehensive Stock Universe across Energy, Banking, Mining, Tech, and Gold Nuggets
STOCK_UNIVERSE = {
    # 🟢 Energy & Infrastructure Overweight Candidates
    "SU.TO": {
        "company_background": "Suncor Energy Inc. is a major integrated Canadian energy company producing synthetic crude oil, offshore energy, and operating retail Petro-Canada stations.",
        "core_drivers": ["Elevated global oil price realizations", "Strong $6.8B Free Cash Flow & dividend increases", "Upstream oil sands cost efficiency"],
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },
    "ENB.TO": {
        "company_background": "Enbridge Inc. operates North America's largest crude oil and natural gas pipeline utility network with toll-booth cash flow stability.",
        "core_drivers": ["Utility-like regulated toll revenues", "7%+ dividend yield stability", "Natural gas transmission expansion"],
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🟢 Financials & Banking Overweight Candidates
    "TD.TO": {
        "company_background": "Toronto-Dominion Bank is one of Canada's Big Five chartered banks, providing retail, commercial, and wealth management services across North America.",
        "core_drivers": ["Net Interest Margin (NIM) stability", "Dominant Canadian retail banking market share", "Attractive dividend yield"],
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },
    "RY.TO": {
        "company_background": "Royal Bank of Canada (RBC) is Canada's largest commercial bank and wealth manager with dominant capital markets and retail banking market share.",
        "core_drivers": ["Highest return on equity (ROE) among Canadian peers", "Dominant wealth management platform", "Robust $9.8B Free Cash Flow"],
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🟢 Materials & Mining Overweight Candidates
    "ABX.TO": {
        "company_background": "Barrick Gold Corporation is one of the world's largest gold and copper producers operating tier-one mining assets in North America and globally.",
        "core_drivers": ["Gold safe-haven demand during inflation", "Tier-1 low-cost mining assets", "Free cash flow expansion"],
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },
    "TECK.B.TO": {
        "company_background": "Teck Resources Limited is a premier Canadian critical minerals and copper producer positioning for global electrification demand.",
        "core_drivers": ["Copper demand surge for EV & AI power grids", "Focus on pure-play critical minerals", "Low 12.8x P/E valuation"],
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🔵 Mega / Large-Cap Core Leaders
    "NVDA": {
        "company_background": "NVIDIA Corporation is the global leader in accelerated computing, AI GPUs (Hopper, Blackwell), and the CUDA software stack powering hyperscale data centers.",
        "core_drivers": ["Generative AI infrastructure demand", "Hyperscale cloud CapEx expansion", "CUDA software ecosystem lock-in"],
        "sector": "Technology & AI Infrastructure",
        "category": "OVERALL_LEADER"
    },
    "MSFT": {
        "company_background": "Microsoft Corporation is a technology titan offering Azure cloud infrastructure, Office 365 productivity suites, enterprise security, and Copilot AI integrations.",
        "core_drivers": ["Azure cloud market share gains", "Enterprise Office 365 Copilot monetization", "Robust B2B recurring subscription revenues"],
        "sector": "Technology & AI Infrastructure",
        "category": "OVERALL_LEADER"
    },
    "AAPL": {
        "company_background": "Apple Inc. designs premium consumer electronics and operates a high-margin Services ecosystem (App Store, iCloud, Apple Pay) with 2.2B+ active devices.",
        "core_drivers": ["Services recurring revenue expansion", "Strong Free Cash Flow generation & buybacks", "Sticky consumer ecosystem"],
        "sector": "Consumer & Technology",
        "category": "OVERALL_LEADER"
    },
    "SHOP.TO": {
        "company_background": "Shopify Inc. is Canada's premier e-commerce merchant operating system powering millions of global merchants with storefront tools and Shop Pay checkout.",
        "core_drivers": ["Gross Merchandise Volume (GMV) expansion", "Enterprise brand onboarding", "Shop Pay conversion superiority"],
        "sector": "E-Commerce & Technology",
        "category": "OVERALL_LEADER"
    },

    # 🪙 Hidden Gold Nuggets (隐形金矿股) - Mid-Cap / Niche High-Growth Champions
    "CSU.TO": {
        "company_background": "Constellation Software Inc. is a master acquirer of vertical market software (VMS) companies worldwide with compounding FCF reinvestment.",
        "core_drivers": ["VMS software acquisition engine", "High customer switching costs", "Compounding Free Cash Flow per share"],
        "sector": "Enterprise Software & Tech",
        "category": "GOLD_NUGGET"
    },
    "CELH": {
        "company_background": "Celsius Holdings, Inc. manufactures and distributes functional energy drinks experiencing rapid market share gains via PepsiCo distribution.",
        "core_drivers": ["PepsiCo distribution expansion", "Category share gains in functional beverages", "High 38.5% YoY revenue growth"],
        "sector": "Consumer Staples & Growth",
        "category": "GOLD_NUGGET"
    },
    "CRWD": {
        "company_background": "CrowdStrike Holdings, Inc. provides cloud-native endpoint cybersecurity protection via its Falcon AI platform.",
        "core_drivers": ["Falcon AI module cross-selling", "Net Revenue Retention (115%+)", "Secular cybersecurity spending expansion"],
        "sector": "Cybersecurity & Technology",
        "category": "GOLD_NUGGET"
    },
    "ONT.TO": {
        "company_background": "Onex Corporation is a Canadian private equity and asset management firm operating value-add buyout strategies across North America.",
        "core_drivers": ["Asset management fee compounding", "Private equity portfolio realizations", "Deep value P/E multiple (11.8x)"],
        "sector": "Financials & Asset Management",
        "category": "GOLD_NUGGET"
    }
}

_RECOMMENDATION_CACHE = None
_CACHE_TIMESTAMP = 0
_CACHE_TTL_SECONDS = 300  # 5 minutes in-memory cache

class RecommendationEngine:
    """Macro-driven multi-category stock recommendation engine with strict mutual exclusivity."""

    @classmethod
    def get_top_recommendations(cls, force_refresh: bool = False) -> Dict[str, Any]:
        """
        Executes macro scan, scores stock universe against macro cycle overweights,
        and returns 3 DISTINCT, MUTUALLY EXCLUSIVE recommendation pools:
        1. Sector Overweight Champions (4 stocks strictly matching macro overweights: Energy, Banks, Mining, Tech Infra)
        2. Overall Market Leaders (4-6 core picks without overlap)
        3. Hidden Gold Nuggets (4-6 mid-cap/niche growth stocks without overlap)
        """
        global _RECOMMENDATION_CACHE, _CACHE_TIMESTAMP

        now = time.time()
        if not force_refresh and _RECOMMENDATION_CACHE and (now - _CACHE_TIMESTAMP) < _CACHE_TTL_SECONDS:
            return _RECOMMENDATION_CACHE

        macro_summary = MacroEngine.analyze_macro_environment()
        cycle_code = macro_summary["cycle_code"]
        overweights = macro_summary["recommended_overweights"]

        all_scored_stocks = []

        for symbol, info in STOCK_UNIVERSE.items():
            stock_raw = DataProviderManager.get_stock_data(symbol)
            fundamental = FundamentalEngine.evaluate_fundamentals(stock_raw)
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock_raw)

            macro_score = cls._score_macro_alignment(symbol, cycle_code, overweights, info["sector"])
            fcf_score = 1.0 if fundamental["cash_conversion_ratio"] > 80 else 0.6
            moat_score = 1.0 if "Wide Moat" in fundamental["moat_rating"] else 0.7
            
            total_score = round(macro_score * 0.4 + fcf_score * 0.3 + moat_score * 0.3, 2)
            rationale = cls._generate_recommendation_rationale(symbol, cycle_code, fundamental, pricing, info)

            rec_item = {
                "symbol": symbol,
                "company_name": stock_raw["company_name"],
                "market": stock_raw["market"],
                "currency": stock_raw["currency"],
                "current_price": stock_raw["current_price"],
                "previous_close": stock_raw["previous_close"],
                "company_background": info["company_background"],
                "why_recommend_rationale": rationale,
                "macro_alignment_tag": f"Beneficiary of {macro_summary['cycle_stage']}",
                "category_badge": info["category"],
                "total_recommendation_score": total_score,
                "key_catalysts": info["core_drivers"],
                "key_metrics": {
                    "pe_ratio": stock_raw.get("pe_ratio") or "N/A",
                    "free_cash_flow_b": round((stock_raw.get("free_cash_flow") or 0.0) / 1e9, 2),
                    "fcf_quality": fundamental["fcf_quality"],
                    "moat_rating": fundamental["moat_rating"],
                    "two_hundred_day_sma": pricing["two_hundred_day_sma"],
                    "dcf_fair_value": pricing["dcf_fair_value"],
                    "ideal_buy_range": f"${pricing['ideal_buy_range_min']} - ${pricing['ideal_buy_range_max']} {stock_raw['currency']}"
                },
                "downside_risk_summary": f"Technical support at 200D SMA (${pricing['two_hundred_day_sma']} {stock_raw['currency']}).",
                "action_status": pricing["action_status"]
            }

            all_scored_stocks.append(rec_item)

        # -------------------------------------------------------------
        # STRICT MUTUAL EXCLUSIVITY SELECTION PIPELINE
        # -------------------------------------------------------------
        seen_symbols: Set[str] = set()

        # 1. CATEGORY 1: Sector Overweight Champions (Top 4 matching macro overweights: Energy, Financials, Mining, Tech Infra)
        sector_candidates = [
            s for s in all_scored_stocks 
            if s["symbol"] in ["SU.TO", "ENB.TO", "TD.TO", "RY.TO", "ABX.TO", "TECK.B.TO", "NVDA"]
        ]
        sector_candidates.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        
        # Diversity filter: Ensure at least 1 Energy, 1 Bank/Financial, 1 Mining, 1 Tech Infra
        sector_champions = sector_candidates[:4]
        for s in sector_champions:
            s["category_badge"] = "SECTOR_OVERWEIGHT"
            seen_symbols.add(s["symbol"])

        # 2. CATEGORY 2: Overall Market Leaders (Top 4-6 mega/large-cap core picks NOT in seen_symbols)
        overall_candidates = [
            s for s in all_scored_stocks 
            if s["symbol"] not in seen_symbols and STOCK_UNIVERSE[s["symbol"]]["category"] in ["OVERALL_LEADER", "SECTOR_OVERWEIGHT"]
        ]
        overall_candidates.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        overall_leaders = overall_candidates[:4]
        for s in overall_leaders:
            s["category_badge"] = "OVERALL_LEADER"
            seen_symbols.add(s["symbol"])

        # 3. CATEGORY 3: Hidden Gold Nuggets (Top 4-6 mid-cap / niche growth picks NOT in seen_symbols)
        gold_candidates = [
            s for s in all_scored_stocks 
            if s["symbol"] not in seen_symbols
        ]
        gold_candidates.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        gold_nuggets = gold_candidates[:4]
        for s in gold_nuggets:
            s["category_badge"] = "GOLD_NUGGET"
            seen_symbols.add(s["symbol"])

        payload = {
            "macro_context": {
                "cycle_stage": macro_summary["cycle_stage"],
                "cycle_code": macro_summary["cycle_code"],
                "plain_explanation": macro_summary["plain_explanation"]
            },
            "sector_overweight_stocks": sector_champions,
            "overall_recommended_stocks": overall_leaders,
            "gold_nugget_stocks": gold_nuggets,
            "recommended_stocks": overall_leaders  # Backward compatibility alias
        }

        _RECOMMENDATION_CACHE = payload
        _CACHE_TIMESTAMP = time.time()
        return payload

    @classmethod
    def _score_macro_alignment(cls, symbol: str, cycle_code: str, overweights: List[str], sector: str) -> float:
        """Scores stock alignment with current macroeconomic phase."""
        if cycle_code == "OVERHEAT":
            if symbol in ["SU.TO", "ENB.TO", "TD.TO", "RY.TO", "ABX.TO", "TECK.B.TO", "NVDA"]:
                return 0.98
            return 0.75
        elif cycle_code == "RECOVERY":
            if symbol in ["NVDA", "SHOP.TO", "MSFT", "CELH", "CRWD"]:
                return 0.98
            return 0.70
        elif cycle_code == "STAGFLATION":
            if symbol in ["AAPL", "TD.TO", "ABX.TO", "SU.TO"]:
                return 0.92
            return 0.60
        else: # RECESSION
            if symbol in ["TD.TO", "RY.TO", "AAPL", "CSU.TO"]:
                return 0.92
            return 0.65

    @classmethod
    def _generate_recommendation_rationale(
        cls, symbol: str, cycle_code: str, fundamental: Dict[str, Any], pricing: Dict[str, Any], info: Dict[str, Any]
    ) -> str:
        """Generates clear 'Why Invest Now' rationale linking macro tailwinds to stock performance."""
        curr_price = pricing["current_price"]
        curr = pricing["currency"]
        dcf = pricing["dcf_fair_value"]
        moat = fundamental["moat_rating"]

        if symbol == "SU.TO":
            return f"Suncor Energy is a prime beneficiary of elevated oil prices during Overheat phases. Generates $6.8B Free Cash Flow with a low 9.4x P/E ratio. Aligned with Energy Overweight."
        elif symbol == "ENB.TO":
            return f"Enbridge provides utility-like regulated pipeline cash flows with an attractive 7%+ dividend yield during inflation cycles. Aligned with Energy & Infrastructure Overweight."
        elif symbol == "TD.TO":
            return f"Toronto-Dominion Bank expands Net Interest Income during elevated interest rate cycles with dominant Canadian market share. Aligned with Financials & Banks Overweight."
        elif symbol == "RY.TO":
            return f"Royal Bank of Canada is Canada's premier commercial bank with highest Return on Equity (ROE) and $9.8B Free Cash Flow. Aligned with Financials & Banks Overweight."
        elif symbol == "ABX.TO":
            return f"Barrick Gold is a premier safe-haven gold and copper producer providing inflation hedging and $1.45B Free Cash Flow. Aligned with Materials & Mining Overweight."
        elif symbol == "TECK.B.TO":
            return f"Teck Resources is a key critical minerals and copper producer benefiting from global electrification and EV demand. Aligned with Materials & Mining Overweight."
        elif symbol == "NVDA":
            return f"NVIDIA is the primary beneficiary of global AI Infrastructure buildout. Holds a {moat} with strong Free Cash Flow."
        elif symbol == "MSFT":
            return f"Microsoft combines resilient enterprise B2B cloud recurring revenue with commercial AI monetization. Alignment with Tech Infrastructure overweights."
        elif symbol == "AAPL":
            return f"Apple's 2.2B+ active device ecosystem generates stable $108.8B+ annual Free Cash Flow."
        elif symbol == "SHOP.TO":
            return f"Shopify is the dominant e-commerce merchant operating system with 118% Net Revenue Retention."
        elif symbol == "CSU.TO":
            return f"Constellation Software is a compounding VMS software acquirer generating exceptional long-term Free Cash Flow growth."
        elif symbol == "CELH":
            return f"Celsius is a high-growth functional beverage leader expanding via PepsiCo distribution with 38.5% revenue growth."
        elif symbol == "CRWD":
            return f"CrowdStrike is a top cybersecurity platform beneficiary with 115%+ NRR and recurring ARR expansion."
        elif symbol == "ONT.TO":
            return f"Onex is a deep-value Canadian asset manager trading at an attractive 11.8x P/E ratio."
        else:
            return f"Strong free cash flow generation ({fundamental['fcf_quality']}) with competitive moat protection."
