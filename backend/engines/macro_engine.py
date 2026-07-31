"""
MacroEngine (宏观扫描仪)
Determines current economic cycle (Recovery, Overheat, Stagflation, Recession) for US & Canada.
Runs NLP hawkishness sentiment decoding on Fed and BoC central bank speeches.
Outputs sector rotation recommendations (e.g. Overweight Tech on rate cuts vs Energy on high inflation).
"""

from typing import Dict, Any, List
import re
from backend.data_sources.fred_client import MacroDataClient

class MacroEngine:
    """Macroeconomic scanning engine for North American markets."""

    HAWKISH_KEYWORDS = ["restrictive", "inflation", "elevated", "upside risks", "patience", "tightening", "hike", "above target"]
    DOVISH_KEYWORDS = ["easing", "rate cuts", "slowdown", "softening", "transitory", "rate reduction", "accommodative", "cooling"]

    @classmethod
    def analyze_macro_environment(cls) -> Dict[str, Any]:
        raw_data = MacroDataClient.get_latest_macro_data()
        us_macro = raw_data["us_macro"]
        ca_macro = raw_data["ca_macro"]

        # Decode Hawkishness / Dovishness NLP score for Fed
        fed_sentiment = cls._calculate_sentiment_score(us_macro["latest_statement_text"])
        boc_sentiment = cls._calculate_sentiment_score(ca_macro["latest_statement_text"])

        # Determine Economic Cycle (Recovery, Overheat, Stagflation, Recession)
        cpi = us_macro["cpi_yoy"]
        gdp = us_macro["gdp_growth_qoq"]

        if cpi <= 2.5 and gdp > 2.0:
            cycle_stage = "Recovery (复苏期)"
            cycle_code = "RECOVERY"
            plain_explanation = "Low inflation + solid economic growth. Ideal environment for growth stocks, technology, and real estate."
            sector_overweight = ["Technology & SaaS (科技与软件)", "Consumer Discretionary (可选消费)", "Real Estate / REITs (房地产)"]
            sector_underweight = ["Utilities (公用事业)", "Cash & Money Market (现金及短债)"]
        elif cpi > 3.0 and gdp > 2.0:
            cycle_stage = "Overheat / Late Expansion (过热期)"
            cycle_code = "OVERHEAT"
            plain_explanation = "High inflation + robust economic growth. Central banks keep interest rates high. Commodity producers and banks thrive."
            sector_overweight = ["Energy & Oil (能源与石油)", "Financials & Banks (金融与银行)", "Materials & Mining (基础材料)"]
            sector_underweight = ["Unprofitable Tech (未盈利科技股)", "High-Yield Bonds (高收益债)"]
        elif cpi > 3.0 and gdp <= 1.0:
            cycle_stage = "Stagflation (滞胀期)"
            cycle_code = "STAGFLATION"
            plain_explanation = "High inflation + weak economic growth. Defensive, recession-proof companies with pricing power perform best."
            sector_overweight = ["Consumer Staples (必需消费品)", "Healthcare & Pharma (医疗健康)", "Gold & Hard Assets (黄金与硬资产)"]
            sector_underweight = ["Cyclical Industrials (周期性工业)", "Consumer Discretionary (可选消费)"]
        else: # cpi low, gdp weak
            cycle_stage = "Recession / Early Recovery (衰退/早复苏期)"
            cycle_code = "RECESSION"
            plain_explanation = "Falling inflation + slowing economy. Central banks cut interest rates to boost growth. Fixed income and dividend aristocrats lead."
            sector_overweight = ["Fixed Income / Bonds (债券资产)", "Utilities & Infrastructure (公用事业)", "High-Dividend Stocks (高股息防守股)"]
            sector_underweight = ["Energy (能源)", "Commodities (商品)"]

        return {
            "cycle_stage": cycle_stage,
            "cycle_code": cycle_code,
            "plain_explanation": plain_explanation,
            "us_indicators": us_macro,
            "ca_indicators": ca_macro,
            "fed_sentiment": fed_sentiment,
            "boc_sentiment": boc_sentiment,
            "recommended_overweights": sector_overweight,
            "recommended_underweights": sector_underweight
        }

    @classmethod
    def _calculate_sentiment_score(cls, text: str) -> Dict[str, Any]:
        lower_text = text.lower()
        hawkish_count = sum(len(re.findall(r'\b' + kw + r'\b', lower_text)) for kw in cls.HAWKISH_KEYWORDS)
        dovish_count = sum(len(re.findall(r'\b' + kw + r'\b', lower_text)) for kw in cls.DOVISH_KEYWORDS)

        net_score = (hawkish_count - dovish_count) / max(1, hawkish_count + dovish_count)

        if net_score > 0.2:
            tone = "Hawkish (偏鹰派 - 维持或准备加息)"
        elif net_score < -0.2:
            tone = "Dovish (偏鸽派 - 预示降息周期)"
        else:
            tone = "Neutral / Wait-and-See (中立观望)"

        return {
            "score": round(net_score, 2),
            "tone": tone,
            "hawkish_signals_detected": hawkish_count,
            "dovish_signals_detected": dovish_count
        }
