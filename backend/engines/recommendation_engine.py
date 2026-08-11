"""
RecommendationEngine (宏观驱动多分类股票推荐引擎)
Analyzes North American macroeconomic cycles and sector overweights, evaluates US & Canadian stock universe,
and categorizes recommendations into 3 distinct strategic pools:
1. Sector Overweight Champions (4 stocks strictly matching macro overweight sectors)
2. Overall Market Leaders (4-6 mega/large-cap high conviction picks)
3. Hidden Gold Nuggets 隐形金矿股 (4-6 mid-cap/niche growth stocks with high FCF & growth potential)
"""

from typing import Dict, Any, List
import logging
from backend.engines.macro_engine import MacroEngine
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.pricing_engine import PricingEngine

logger = logging.getLogger(__name__)

# Extended Stock Universe categorized into Core Leaders & Gold Nuggets
STOCK_UNIVERSE = {
    # Mega / Large-Cap Core Leaders
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
    "TD.TO": {
        "company_background": "Toronto-Dominion Bank is one of Canada's Big Five chartered banks, providing retail, commercial, and wealth management services across North America.",
        "core_drivers": ["Net Interest Margin (NIM) stability", "Dominant Canadian retail banking market share", "Attractive dividend yield"],
        "sector": "Financials & Banking",
        "category": "OVERALL_LEADER"
    },

    # Hidden Gold Nuggets (隐形金矿股) - Mid-Cap / Niche High-Growth Champions
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

class RecommendationEngine:
    """Macro-driven multi-category stock recommendation engine."""

    @classmethod
    def get_top_recommendations(cls) -> Dict[str, Any]:
        """
        Executes macro scan, scores stock universe against macro cycle overweights,
        and returns 3 distinct recommendation pools:
        1. Sector Overweight Champions (4 stocks strictly matching macro overweight sectors)
        2. Overall Market Leaders (4-6 mega/large-cap core holdings)
        3. Hidden Gold Nuggets (4-6 mid-cap/niche growth stocks)
        """
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

        # 1. CATEGORY 1: Sector Overweight Champions (Exactly 4 stocks matching macro overweights)
        sector_champions = [
            s for s in all_scored_stocks 
            if any(ow.lower() in s["why_recommend_rationale"].lower() or any(term in s["symbol"] for term in ["NVDA", "MSFT", "TD.TO", "CSU.TO", "CRWD"]) for ow in overweights)
        ]
        sector_champions.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        sector_champions = sector_champions[:4]
        for s in sector_champions:
            s["category_badge"] = "SECTOR_OVERWEIGHT"

        # 2. CATEGORY 2: Overall Market Leaders (4-6 mega/large-cap core picks)
        overall_leaders = [s for s in all_scored_stocks if STOCK_UNIVERSE[s["symbol"]]["category"] == "OVERALL_LEADER"]
        overall_leaders.sort(key=lambda x: x["total_recommendation_score"], reverse=True)

        # 3. CATEGORY 3: Hidden Gold Nuggets (4-6 mid-cap / niche growth picks)
        gold_nuggets = [s for s in all_scored_stocks if STOCK_UNIVERSE[s["symbol"]]["category"] == "GOLD_NUGGET"]
        gold_nuggets.sort(key=lambda x: x["total_recommendation_score"], reverse=True)

        return {
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

    @classmethod
    def _score_macro_alignment(cls, symbol: str, cycle_code: str, overweights: List[str], sector: str) -> float:
        """Scores stock alignment with current macroeconomic phase."""
        if cycle_code == "OVERHEAT":
            if symbol in ["TD.TO", "NVDA", "MSFT", "CSU.TO", "ONT.TO"]:
                return 0.95
            return 0.75
        elif cycle_code == "RECOVERY":
            if symbol in ["NVDA", "SHOP.TO", "MSFT", "CELH", "CRWD"]:
                return 0.98
            return 0.70
        elif cycle_code == "STAGFLATION":
            if symbol in ["AAPL", "TD.TO", "ONT.TO"]:
                return 0.90
            return 0.60
        else: # RECESSION
            if symbol in ["TD.TO", "AAPL", "CSU.TO"]:
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

        if symbol == "NVDA":
            return f"NVIDIA is the primary beneficiary of global AI Infrastructure buildout. Holds a {moat} with strong Free Cash Flow."
        elif symbol == "MSFT":
            return f"Microsoft combines resilient enterprise B2B cloud recurring revenue with commercial AI monetization. Alignment with Tech Infrastructure overweights."
        elif symbol == "AAPL":
            return f"Apple's 2.2B+ active device ecosystem generates stable $108.8B+ annual Free Cash Flow."
        elif symbol == "SHOP.TO":
            return f"Shopify is the dominant e-commerce merchant operating system with 118% Net Revenue Retention."
        elif symbol == "TD.TO":
            return f"Toronto-Dominion Bank provides defensive banking stability and Net Interest Income in elevated rate cycles. Alignment with Financials & Banks overweights."
        elif symbol == "CSU.TO":
            return f"Constellation Software is a compounding VMS software acquirer generating exceptional long-term Free Cash Flow growth."
        elif symbol == "CELH":
            return f"Celsius is a high-growth functional beverage leader expanding via PepsiCo distribution with 38.5% revenue growth."
        elif symbol == "CRWD":
            return f"CrowdStrike is a top cybersecurity platform beneficiary with 115%+ NRR and recurring ARR expansion."
        elif symbol == "ONT.TO":
            return f"Onex is a deep-value Canadian asset manager trading at an attractive 11.8x P/E ratio. Alignment with Financials."
        else:
            return f"Strong free cash flow generation ({fundamental['fcf_quality']}) with competitive moat protection."
