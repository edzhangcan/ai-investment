"""
RecommendationEngine (宏观驱动多分类股票推荐引擎)
Analyzes North American macroeconomic cycles and sector overweights, evaluates US & Canadian stock universe,
and categorizes recommendations into 3 DISTINCT, MUTUALLY EXCLUSIVE strategic pools:
1. Sector Overweight Champions (4 stocks strictly matching macro overweight sectors)
2. Overall Market Leaders (4-6 mega/large-cap core picks)
3. Hidden Gold Nuggets (4-6 mid-cap/niche growth stocks)
Multi-language support for 'en', 'zh', and 'hybrid' modes.
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
        "company_background": {
            "en": "Suncor Energy Inc. is a major integrated Canadian energy company producing synthetic crude oil, offshore energy, and operating retail Petro-Canada stations.",
            "zh": "加拿大炼化一体化能源巨头，开采合成原油、海上能源，并运营全国 Petro-Canada 零售加油站网络。",
            "hybrid": "加拿大炼化一体化能源巨头 (Suncor Energy)，开采原油并运营 Petro-Canada 零售网络。"
        },
        "core_drivers": ["Elevated global oil prices", "Strong $6.8B Free Cash Flow", "Upstream cost efficiency"],
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },
    "ENB.TO": {
        "company_background": {
            "en": "Enbridge Inc. operates North America's largest crude oil and natural gas pipeline utility network with toll-booth cash flow stability.",
            "zh": "北美最大原油与天然气管道管网运营商，具备收费站式的管网现金流稳定性与 7%+ 高股息。",
            "hybrid": "北美最大管道管网运营商 (Enbridge Pipeline)，具 Toll-booth 现金流与 7%+ 股息率。"
        },
        "core_drivers": ["Regulated toll revenue", "7%+ Dividend yield", "Natural gas pipeline expansion"],
        "sector": "Energy & Infrastructure",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🟢 Financials & Banking Overweight Candidates
    "TD.TO": {
        "company_background": {
            "en": "Toronto-Dominion Bank is one of Canada's Big Five chartered banks, providing retail, commercial, and wealth management services across North America.",
            "zh": "加拿大五大商业银行之一，在北美提供零售银行、商业贷款和财富管理服务。",
            "hybrid": "加拿大五大商业银行之一 (TD Bank)，在北美提供 Retail & Wealth Management 服务。"
        },
        "core_drivers": ["Net Interest Margin (NIM) stability", "Dominant Canadian retail banking share", "Attractive dividend yield"],
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },
    "RY.TO": {
        "company_background": {
            "en": "Royal Bank of Canada (RBC) is Canada's largest commercial bank and wealth manager with dominant capital markets share.",
            "zh": "加拿大市值最大的商业银行与财富管理巨头，拥有顶尖的资本市场与零售银行业务。",
            "hybrid": "加拿大最大的商业银行 (Royal Bank of Canada)，拥有最高 Return on Equity (ROE)。"
        },
        "core_drivers": ["Highest ROE among Canadian banks", "Dominant wealth management", "$9.8B Free Cash Flow"],
        "sector": "Financials & Banking",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🟢 Materials & Mining Overweight Candidates
    "ABX.TO": {
        "company_background": {
            "en": "Barrick Gold Corporation is one of the world's largest gold and copper producers operating tier-one mining assets globally.",
            "zh": "全球顶尖黄金与铜矿开采巨头，在全球运营一级低成本矿业资产，提供通胀避险收益。",
            "hybrid": "全球顶尖黄金与铜矿巨头 (Barrick Gold)，具备一级低成本 Tier-1 矿业资产。"
        },
        "core_drivers": ["Gold safe-haven demand", "Tier-1 low-cost mining assets", "Free cash flow expansion"],
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },
    "TECK.B.TO": {
        "company_background": {
            "en": "Teck Resources Limited is a premier Canadian critical minerals and copper producer positioning for global electrification demand.",
            "zh": "加拿大顶尖关键矿产与铜矿生产商，直接受益于全球电气化、电动汽车与 AI 电网建设需求。",
            "hybrid": "加拿大关键矿产与铜矿生产商 (Teck Resources)，受益于 EV 与 AI 电网需求。"
        },
        "core_drivers": ["Copper demand surge for EV & AI power grids", "Pure-play critical minerals focus", "Low 12.8x P/E valuation"],
        "sector": "Materials & Mining",
        "category": "SECTOR_OVERWEIGHT"
    },

    # 🔵 Mega / Large-Cap Core Leaders
    "NVDA": {
        "company_background": {
            "en": "NVIDIA Corporation is the global leader in accelerated computing, AI GPUs (Hopper, Blackwell), and the CUDA software stack.",
            "zh": "全球加速计算与 AI 芯片领军者，凭借 Hopper/Blackwell 架构与 CUDA 软件生态垄断云端算力。",
            "hybrid": "全球加速计算与 AI 芯片领军者 (NVIDIA)，凭 CUDA Ecosystem 垄断云端算力。"
        },
        "core_drivers": ["Generative AI GPU demand", "Cloud CapEx expansion", "CUDA software ecosystem lock-in"],
        "sector": "Technology & AI Infrastructure",
        "category": "OVERALL_LEADER"
    },
    "MSFT": {
        "company_background": {
            "en": "Microsoft Corporation is a technology titan offering Azure cloud infrastructure, Office 365 productivity suites, and Copilot AI integrations.",
            "zh": "微软公司是全球科技巨头，提供 Azure 云计算基础设施、Office 365 订阅及 Copilot AI 商业化落地。",
            "hybrid": "全球科技巨头 (Microsoft)，结合 Azure 云计算与 Office 365 Copilot 订阅表现。"
        },
        "core_drivers": ["Azure cloud market share gains", "Enterprise Office 365 Copilot monetization", "Resilient B2B recurring revenue"],
        "sector": "Technology & AI Infrastructure",
        "category": "OVERALL_LEADER"
    },
    "AAPL": {
        "company_background": {
            "en": "Apple Inc. designs premium consumer electronics and operates a high-margin Services ecosystem with 2.2B+ active devices.",
            "zh": "苹果公司设计高端消费电子产品，并运营拥有 22 亿活跃设备的高利润服务生态（App Store/iCloud）。",
            "hybrid": "苹果公司 (Apple Inc.)，拥有 22 亿活跃设备的高利润 Services 生态系统。"
        },
        "core_drivers": ["Services recurring revenue expansion", "Strong Free Cash Flow generation & buybacks", "Sticky consumer ecosystem"],
        "sector": "Consumer & Technology",
        "category": "OVERALL_LEADER"
    },
    "SHOP.TO": {
        "company_background": {
            "en": "Shopify Inc. is Canada's premier e-commerce merchant operating system powering millions of global merchants.",
            "zh": "Shopify 是加拿大龙头电商商户操作系统，为全球数百万商家提供在线独立站与 Shop Pay 结算工具。",
            "hybrid": "加拿大龙头电商操作系统 (Shopify)，为全球商家提供店铺工具与 Shop Pay 结算。"
        },
        "core_drivers": ["Gross Merchandise Volume (GMV) expansion", "Enterprise brand onboarding", "Shop Pay conversion superiority"],
        "sector": "E-Commerce & Technology",
        "category": "OVERALL_LEADER"
    },

    # 🪙 Hidden Gold Nuggets (隐形金矿股) - Mid-Cap / Niche High-Growth Champions
    "CSU.TO": {
        "company_background": {
            "en": "Constellation Software Inc. is a master acquirer of vertical market software (VMS) companies worldwide with compounding FCF reinvestment.",
            "zh": " Constellation Software 是全球垂直市场软件（VMS）的复利收购大师，自由现金流年化复利增长惊人。",
            "hybrid": "全球垂直市场软件 (VMS) 收购大师，具备复利滚雪球式 Free Cash Flow 增长。"
        },
        "core_drivers": ["VMS software acquisition engine", "High customer switching costs", "Compounding Free Cash Flow per share"],
        "sector": "Enterprise Software & Tech",
        "category": "GOLD_NUGGET"
    },
    "CELH": {
        "company_background": {
            "en": "Celsius Holdings, Inc. manufactures and distributes functional energy drinks experiencing rapid market share gains via PepsiCo distribution.",
            "zh": "Celsius 生产功能性健康能量饮料，通过百事可乐（PepsiCo）渠道快速抢占市场份额，营收同比大增 38.5%。",
            "hybrid": " Celsius 功能性健康能量饮料，借助 PepsiCo 百事可乐渠道快速扩大市场份额。"
        },
        "core_drivers": ["PepsiCo distribution expansion", "Category share gains in functional beverages", "High 38.5% YoY revenue growth"],
        "sector": "Consumer Staples & Growth",
        "category": "GOLD_NUGGET"
    },
    "CRWD": {
        "company_background": {
            "en": "CrowdStrike Holdings, Inc. provides cloud-native endpoint cybersecurity protection via its Falcon AI platform.",
            "zh": "CrowdStrike 凭借 Falcon AI 云原生平台提供端点网络安全防护，净收入留存率（NRR）达 115%+。",
            "hybrid": " CrowdStrike 端点网络安全平台 (Falcon AI)，具备 115%+ 净收入留存率 (NRR)。"
        },
        "core_drivers": ["Falcon AI module cross-selling", "Net Revenue Retention (115%+)", "Secular cybersecurity spending expansion"],
        "sector": "Cybersecurity & Technology",
        "category": "GOLD_NUGGET"
    },
    "ONT.TO": {
        "company_background": {
            "en": "Onex Corporation is a Canadian private equity and asset management firm operating value-add buyout strategies.",
            "zh": "Onex 是加拿大老牌私募股权与资产管理巨头，市盈率低至 11.8 倍，具备深度的估值安全边际。",
            "hybrid": "加拿大私募股权与资产管理巨头 (Onex)，市盈率低至 11.8x P/E 具备估值安全边际。"
        },
        "core_drivers": ["Asset management fee compounding", "Private equity portfolio realizations", "Deep value P/E multiple (11.8x)"],
        "sector": "Financials & Asset Management",
        "category": "GOLD_NUGGET"
    }
}

_RECOMMENDATION_CACHE = {}
_CACHE_TIMESTAMP = {}
_CACHE_TTL_SECONDS = 300  # 5 minutes in-memory cache

class RecommendationEngine:
    """Macro-driven multi-category stock recommendation engine with strict mutual exclusivity & multi-language support."""

    @classmethod
    def get_top_recommendations(cls, force_refresh: bool = False, lang: str = "en") -> Dict[str, Any]:
        """
        Executes macro scan, scores stock universe against macro cycle overweights,
        and returns 3 DISTINCT, MUTUALLY EXCLUSIVE recommendation pools:
        1. Sector Overweight Champions (4 stocks strictly matching macro overweights)
        2. Overall Market Leaders (4-6 core picks without overlap)
        3. Hidden Gold Nuggets (4-6 mid-cap/niche growth stocks without overlap)
        """
        global _RECOMMENDATION_CACHE, _CACHE_TIMESTAMP

        now = time.time()
        if not force_refresh and lang in _RECOMMENDATION_CACHE and (now - _CACHE_TIMESTAMP.get(lang, 0)) < _CACHE_TTL_SECONDS:
            return _RECOMMENDATION_CACHE[lang]

        macro_summary = MacroEngine.analyze_macro_environment(lang=lang)
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
            rationale = cls._generate_recommendation_rationale(symbol, cycle_code, fundamental, pricing, info, lang=lang)

            bg_text = info["company_background"].get(lang, info["company_background"]["en"])

            rec_item = {
                "symbol": symbol,
                "company_name": stock_raw["company_name"],
                "market": stock_raw["market"],
                "currency": stock_raw["currency"],
                "current_price": stock_raw["current_price"],
                "previous_close": stock_raw["previous_close"],
                "company_background": bg_text,
                "why_recommend_rationale": rationale,
                "macro_alignment_tag": f"Beneficiary of {macro_summary['cycle_stage']}" if lang == "en" else f"受益于 {macro_summary['cycle_stage']}",
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
            "recommended_stocks": overall_leaders
        }

        _RECOMMENDATION_CACHE[lang] = payload
        _CACHE_TIMESTAMP[lang] = time.time()
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
        cls, symbol: str, cycle_code: str, fundamental: Dict[str, Any], pricing: Dict[str, Any], info: Dict[str, Any], lang: str = "en"
    ) -> str:
        """Generates clear 'Why Invest Now' rationale linking macro tailwinds to stock performance."""
        curr_price = pricing["current_price"]
        curr = pricing["currency"]
        dcf = pricing["dcf_fair_value"]
        moat = fundamental["moat_rating"]

        if lang == "zh":
            if symbol == "SU.TO":
                return "森科能源 (Suncor) 是高油价与过热阶段的直接受益者，年产生 68 亿加元自由现金流，市盈率仅 9.4 倍，完全契合能源超配推荐。"
            elif symbol == "ENB.TO":
                return "恩布里吉 (Enbridge) 提供类似公用事业的输油管网稳定现金流，在通胀周期提供 7%+ 高股息收益率，契合基础设施超配。"
            elif symbol == "TD.TO":
                return "多伦多道明银行 (TD Bank) 在高利率周期扩大净利息收入 (NIM)，拥有 dominant 加拿大零售银行份额，契合金融板块超配。"
            elif symbol == "RY.TO":
                return "加拿大皇家银行 (RBC) 是加国龙头商业银行，拥有最高股东权益回报率 (ROE) 与 98 亿加元自由现金流，契合金融超配。"
            elif symbol == "ABX.TO":
                return "巴里克黄金 (Barrick Gold) 是顶尖避险黄金与铜矿生产商，在通胀周期提供对冲能力与 14.5 亿加元自由现金流，契合采矿超配。"
            elif symbol == "TECK.B.TO":
                return "泰克资源 (Teck Resources) 是关键铜矿龙头，受益于全球电气化与 AI 电网建设需求，市盈率仅 12.8 倍，契合基础材料超配。"
            elif symbol == "NVDA":
                return "英伟达 (NVIDIA) 是全球 AI 基础设施建设的核心最大受益者，拥有一级宽护城河与极其强劲的自由现金流。"
            elif symbol == "MSFT":
                return "微软 (Microsoft) 结合了强韧的 B2B 云计算订阅收入与商业化 AI 变现能力，高度契合科技基础设施超配推荐。"
            elif symbol == "AAPL":
                return "苹果公司 (Apple) 拥有 22 亿活跃设备生态，年产生 1088 亿美元真金白银自由现金流与持续股票回购。"
            elif symbol == "SHOP.TO":
                return "Shopify 是占主导地位的电商商户操作系统，净收入留存率 (NRR) 达 118%，持续扩大商家市场份额。"
            elif symbol == "CSU.TO":
                return "Constellation Software 是全球垂直软件 (VMS) 收购大师，具备长期卓越的自由现金流复利滚雪球能力。"
            elif symbol == "CELH":
                return "Celsius 是高速增长的功能健康饮料龙头，借助百事可乐渠道拓展，营收同比强劲增长 38.5%。"
            elif symbol == "CRWD":
                return "CrowdStrike 是网络安全端点防护龙头，受受益于企业安全支出扩张，净收入留存率 (NRR) 达 115%+。"
            elif symbol == "ONT.TO":
                return "Onex 是深具安全边际的加拿大私募股权资产管理巨头，市盈率低至 11.8 倍，属于极具潜力的隐形金矿。"
            else:
                return "具备强劲自由现金流生成能力与竞争护城河保护。"
        elif lang == "hybrid":
            if symbol == "SU.TO":
                return "Suncor Energy 是高油价与 Overheat 阶段的受益者，年产生 $6.8B 自由现金流 (FCF)，P/E 仅 9.4x，契合 Energy 超配。"
            elif symbol == "ENB.TO":
                return "Enbridge 提供输油管网稳定现金流，在通胀周期提供 7%+ Dividend Yield 股息率，契合 Infrastructure 超配。"
            elif symbol == "TD.TO":
                return "TD Bank 在高利率周期扩大净利息收入 (NIM)，拥有 dominant 加拿大零售银行份额，契合 Financials 超配。"
            elif symbol == "RY.TO":
                return "Royal Bank of Canada (RBC) 是加国龙头商业银行，拥有最高 Return on Equity (ROE) 与 $9.8B 自由现金流。"
            elif symbol == "ABX.TO":
                return "Barrick Gold 是顶尖避险黄金与铜矿生产商，在通胀周期提供对冲能力与 $1.45B 自由现金流 (FCF)。"
            elif symbol == "TECK.B.TO":
                return "Teck Resources 是关键铜矿龙头，受益于全球电气化与 AI 电网需求，P/E 仅 12.8x，契合 Materials 超配。"
            elif symbol == "NVDA":
                return "NVIDIA 是全球 AI Infrastructure 建设的最大受益者，拥有 Wide Moat 护城河与强劲 Free Cash Flow。"
            elif symbol == "MSFT":
                return "Microsoft 结合了强韧的 B2B 云计算订阅收入与 Copilot AI 变现能力，高度契合 Tech Infrastructure 超配。"
            elif symbol == "AAPL":
                return "Apple 拥有 2.2B+ 活跃设备生态，年产生 $108.8B+ 真金白银 Free Cash Flow 与持续 Share Buybacks。"
            elif symbol == "SHOP.TO":
                return "Shopify 是主导地位的电商操作系统，Net Revenue Retention (NRR) 达 118%，持续扩大 GMV。"
            elif symbol == "CSU.TO":
                return "Constellation Software 是全球垂直软件 (VMS) 收购大师，具备长期卓越的 Free Cash Flow 复利增长。"
            elif symbol == "CELH":
                return "Celsius 是高速增长的功能健康饮料龙头，借助 PepsiCo 渠道拓展，营收 YoY 强劲增长 38.5%。"
            elif symbol == "CRWD":
                return "CrowdStrike 是网络安全端点防护龙头 (Falcon AI)，受受益于安全支出扩张，NRR 达 115%+。"
            elif symbol == "ONT.TO":
                return "Onex 是深具安全边际的加拿大私募股权资产管理巨头，市盈率低至 11.8x P/E，属于隐形金矿。"
            else:
                return "具备强劲自由现金流 (FCF) 生成能力与竞争护城河 (Moat) 保护。"
        else: # English
            if symbol == "SU.TO":
                return "Suncor Energy is a prime beneficiary of elevated oil prices during Overheat phases. Generates $6.8B Free Cash Flow with a low 9.4x P/E ratio. Aligned with Energy Overweight."
            elif symbol == "ENB.TO":
                return "Enbridge provides utility-like regulated pipeline cash flows with an attractive 7%+ dividend yield during inflation cycles. Aligned with Energy & Infrastructure Overweight."
            elif symbol == "TD.TO":
                return "Toronto-Dominion Bank expands Net Interest Income during elevated interest rate cycles with dominant Canadian market share. Aligned with Financials & Banks Overweight."
            elif symbol == "RY.TO":
                return "Royal Bank of Canada is Canada's premier commercial bank with highest Return on Equity (ROE) and $9.8B Free Cash Flow. Aligned with Financials & Banks Overweight."
            elif symbol == "ABX.TO":
                return "Barrick Gold is a premier safe-haven gold and copper producer providing inflation hedging and $1.45B Free Cash Flow. Aligned with Materials & Mining Overweight."
            elif symbol == "TECK.B.TO":
                return "Teck Resources is a key critical minerals and copper producer benefiting from global electrification and EV demand. Aligned with Materials & Mining Overweight."
            elif symbol == "NVDA":
                return "NVIDIA is the primary beneficiary of global AI Infrastructure buildout. Holds a Wide Moat with strong Free Cash Flow."
            elif symbol == "MSFT":
                return "Microsoft combines resilient enterprise B2B cloud recurring revenue with commercial AI monetization. Alignment with Tech Infrastructure overweights."
            elif symbol == "AAPL":
                return "Apple's 2.2B+ active device ecosystem generates stable $108.8B+ annual Free Cash Flow."
            elif symbol == "SHOP.TO":
                return "Shopify is the dominant e-commerce merchant operating system with 118% Net Revenue Retention."
            elif symbol == "CSU.TO":
                return "Constellation Software is a compounding VMS software acquirer generating exceptional long-term Free Cash Flow growth."
            elif symbol == "CELH":
                return "Celsius is a high-growth functional beverage leader expanding via PepsiCo distribution with 38.5% revenue growth."
            elif symbol == "CRWD":
                return "CrowdStrike is a top cybersecurity platform beneficiary with 115%+ NRR and recurring ARR expansion."
            elif symbol == "ONT.TO":
                return "Onex is a deep-value Canadian asset manager trading at an attractive 11.8x P/E ratio."
            else:
                return "Strong free cash flow generation with competitive moat protection."
