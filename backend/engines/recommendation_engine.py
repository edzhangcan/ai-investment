"""
RecommendationEngine (宏观驱动股票推荐引擎)
Analyzes North American macroeconomic cycles and sector overweights, evaluates US & Canadian stock universe,
and selects TOP 3-5 recommended stocks with company business backgrounds, "Why Invest Now" rationale,
and empirical snapshot metrics.
"""

from typing import Dict, Any, List
import logging
from backend.engines.macro_engine import MacroEngine
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.fundamental_engine import FundamentalEngine
from backend.engines.pricing_engine import PricingEngine

logger = logging.getLogger(__name__)

# Stock Universe Candidate Definitions with Business Background Overviews
STOCK_UNIVERSE = {
    "NVDA": {
        "company_background": "NVIDIA Corporation is the world leader in accelerated computing, AI GPUs (Hopper, Blackwell), and the CUDA software stack powering global data centers.",
        "core_drivers": ["Generative AI infrastructure demand", "Hyperscale cloud CapEx expansion", "CUDA software ecosystem lock-in"],
        "sector": "Technology & AI Infrastructure"
    },
    "AAPL": {
        "company_background": "Apple Inc. designs consumer electronics (iPhone, Mac, iPad) and operates a high-margin Services ecosystem (App Store, iCloud, Apple Pay) with 2.2B+ active devices.",
        "core_drivers": ["Services recurring revenue expansion", "Strong Free Cash Flow generation & share buybacks", "Sticky consumer ecosystem"],
        "sector": "Technology & Consumer Ecosystem"
    },
    "MSFT": {
        "company_background": "Microsoft Corporation is a global technology giant offering Azure cloud infrastructure, Office 365 productivity suites, enterprise security, and Copilot AI integrations.",
        "core_drivers": ["Azure cloud market share gains", "Enterprise Office 365 Copilot monetization", "Robust B2B recurring subscription revenues"],
        "sector": "Enterprise Software & Cloud"
    },
    "SHOP.TO": {
        "company_background": "Shopify Inc. is Canada's premier e-commerce platform powering millions of global merchants with storefront tools, Shop Pay checkout, logistics, and merchant solutions.",
        "core_drivers": ["Gross Merchandise Volume (GMV) expansion", "Enterprise brand onboarding", "Shop Pay conversion superiority"],
        "sector": "E-Commerce & Digital Commerce"
    },
    "TD.TO": {
        "company_background": "Toronto-Dominion Bank is one of Canada's Big Five chartered banks, providing retail, commercial, and wealth management services across North America.",
        "core_drivers": ["Net Interest Margin (NIM) stability in high-rate environments", "Dominant Canadian retail banking market share", "Attractive dividend yield"],
        "sector": "Financials & Banking"
    }
}

class RecommendationEngine:
    """Macro-driven stock recommendation engine selecting 3-5 top picks."""

    @classmethod
    def get_top_recommendations(cls) -> Dict[str, Any]:
        """
        Executes macro scan, scores stock universe against macro cycle overweights,
        and returns 3-5 top stock recommendations with detailed rationale.
        """
        macro_summary = MacroEngine.analyze_macro_environment()
        cycle_code = macro_summary["cycle_code"]

        recommendations = []

        for symbol, info in STOCK_UNIVERSE.items():
            stock_raw = DataProviderManager.get_stock_data(symbol)
            fundamental = FundamentalEngine.evaluate_fundamentals(stock_raw)
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(stock_raw)

            # Macro Alignment Scoring
            macro_score = cls._score_macro_alignment(symbol, cycle_code)
            fcf_score = 1.0 if fundamental["cash_conversion_ratio"] > 80 else 0.6
            moat_score = 1.0 if "Wide Moat" in fundamental["moat_rating"] else 0.7
            
            total_score = round(macro_score * 0.4 + fcf_score * 0.3 + moat_score * 0.3, 2)

            # Generate "Why Invest Now" Rationale
            rationale = cls._generate_recommendation_rationale(symbol, cycle_code, fundamental, pricing)

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
                "downside_risk_summary": f"Technical support at 200D SMA (${pricing['two_hundred_day_sma']} {stock_raw['currency']}). Guidance caution: {fundamental['guidance_shift_deltas'][0]['added_disclaimer']}",
                "action_status": pricing["action_status"]
            }

            recommendations.append(rec_item)

        # Sort by recommendation score descending and pick TOP 3 to 5
        recommendations.sort(key=lambda x: x["total_recommendation_score"], reverse=True)
        top_picks = recommendations[:4]  # Return top 4 recommended stocks

        return {
            "macro_context": {
                "cycle_stage": macro_summary["cycle_stage"],
                "cycle_code": macro_summary["cycle_code"],
                "plain_explanation": macro_summary["plain_explanation"]
            },
            "recommended_stocks_count": len(top_picks),
            "recommended_stocks": top_picks
        }

    @classmethod
    def _score_macro_alignment(cls, symbol: str, cycle_code: str) -> float:
        """Scores stock alignment with current macroeconomic phase."""
        if cycle_code == "OVERHEAT":
            if symbol in ["TD.TO", "NVDA", "MSFT"]:
                return 0.95
            return 0.75
        elif cycle_code == "RECOVERY":
            if symbol in ["NVDA", "SHOP.TO", "MSFT", "AAPL"]:
                return 0.98
            return 0.70
        elif cycle_code == "STAGFLATION":
            if symbol in ["AAPL", "TD.TO"]:
                return 0.90
            return 0.60
        else: # RECESSION
            if symbol in ["TD.TO", "AAPL"]:
                return 0.92
            return 0.65

    @classmethod
    def _generate_recommendation_rationale(cls, symbol: str, cycle_code: str, fundamental: Dict[str, Any], pricing: Dict[str, Any]) -> str:
        """Generates clear 'Why Invest Now' rationale linking macro tailwinds to stock performance."""
        curr_price = pricing["current_price"]
        curr = pricing["currency"]
        dcf = pricing["dcf_fair_value"]
        moat = fundamental["moat_rating"]

        if symbol == "NVDA":
            return (
                f"NVIDIA is the primary beneficiary of global AI infrastructure buildout. "
                f"Despite elevated interest rates, hyperscale Cloud CapEx is expanding rapidly. "
                f"The stock holds a {moat} with $60.8B in Free Cash Flow and DCF fair value target of ${dcf} {curr}."
            )
        elif symbol == "MSFT":
            return (
                f"Microsoft combines resilient enterprise B2B software cash flows with commercial AI monetization. "
                f"Azure cloud revenue expansion provides downside defense while cash conversion exceeds {fundamental['cash_conversion_ratio']}%."
            )
        elif symbol == "AAPL":
            return (
                f"Apple's 2.2B+ active device ecosystem generates stable $108.8B+ annual Free Cash Flow. "
                f"High Services margin growth protects profitability during late-cycle inflation phases."
            )
        elif symbol == "SHOP.TO":
            return (
                f"Shopify is the dominant e-commerce merchant operating system in North America. "
                f"Accelerating merchant GMV and 118% Net Revenue Retention position it for strong growth as consumer digital spending expands."
            )
        elif symbol == "TD.TO":
            return (
                f"Toronto-Dominion Bank provides defensive banking stability and high Net Interest Income during elevated interest rate cycles. "
                f"Offers an attractive dividend yield and solid regulatory moat in Canadian financial services."
            )
        else:
            return f"Strong free cash flow generation ({fundamental['fcf_quality']}) with competitive moat protection."
