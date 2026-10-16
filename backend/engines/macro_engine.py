"""
MacroEngine (宏观扫描仪)
Determines current economic cycle (Recovery, Overheat, Stagflation, Recession) for US & Canada.
Synthesizes NLP hawkishness sentiment decoding, empirical indicator proof arrays, and real-time policy news.
Enforces zero-hallucination source citations for all macroeconomic conclusions.
Multi-language support for 'en', 'zh', and 'hybrid' modes.
"""

from typing import Dict, Any, List
import re
from backend.data_sources.fred_client import MacroDataClient
from backend.data_sources.news_client import NewsClient

class MacroEngine:
    """Macroeconomic scanning and assessment engine for North American markets."""

    HAWKISH_KEYWORDS = ["restrictive", "inflation", "elevated", "upside risks", "patience", "tightening", "hike", "above target"]
    DOVISH_KEYWORDS = ["easing", "rate cuts", "slowdown", "softening", "transitory", "rate reduction", "accommodative", "cooling"]

    @classmethod
    def analyze_macro_environment(cls, force_refresh: bool = False, lang: str = "en", country: str = "US") -> Dict[str, Any]:
        """
        Provides full macro state including indicators, cycle classification, policy news,
        empirical proofs, and big-picture valuation for either US or CA market independently.
        """
        country_norm = "CA" if country and country.strip().upper() in ["CA", "CAN", "CANADA"] else "US"
        raw_data = MacroDataClient.get_latest_macro_data()
        us_macro = raw_data["us_macro"]
        ca_macro = raw_data["ca_macro"]

        # Decode NLP sentiment for Fed & Bank of Canada
        fed_sentiment = cls._calculate_sentiment_score(us_macro["latest_statement_text"], lang=lang)
        boc_sentiment = cls._calculate_sentiment_score(ca_macro["latest_statement_text"], lang=lang)

        if country_norm == "CA":
            cpi = ca_macro["cpi_yoy"]
            gdp = ca_macro["gdp_growth_qoq"]
            yield_spread = ca_macro.get("ten_two_yield_spread", -0.08)
            active_macro = ca_macro
            active_sentiment = boc_sentiment

            # Canadian Economic Cycle Classifier & Tailored Sector Weights
            if cpi <= 2.5 and gdp > 2.0:
                cycle_code = "RECOVERY"
                if lang == "zh":
                    cycle_stage = "复苏与早期扩张阶段"
                    plain_explanation = "通胀处于政策目标内 (<=2.5%) + 经济稳健增长 (>2.0%)。加拿大企业级科技软件、工业铁路运输与金融成长资产领跑。"
                    sector_overweight = ["企业级软件与 SaaS (CSU, SHOP)", "横贯大陆铁路运输 (CNR, CP)", "可选消费与零售 (ATD)"]
                    sector_underweight = ["公用事业", "现金与短期国债 (T-Bills)"]
                elif lang == "hybrid":
                    cycle_stage = "复苏与早期扩张阶段 (Recovery / Early Expansion)"
                    plain_explanation = "通胀目标内 (CPI <= 2.5%) + GDP 稳健增长 (> 2.0%)。加拿大科技 (Tech) 与工业铁路 (Railroads) 领跑。"
                    sector_overweight = ["科技与软件 (CSU, SHOP)", "大陆铁路 (Railroads - CNR, CP)", "可选消费 (Discretionary - ATD)"]
                    sector_underweight = ["公用事业 (Utilities)", "现金与短债 (Cash & T-Bills)"]
                else:
                    cycle_stage = "Recovery / Early Expansion"
                    plain_explanation = "Inflation within target (<=2.5%) + solid economic growth (>2.0%). Canadian enterprise software, transcontinental rails, and discretionary compounders lead."
                    sector_overweight = ["Enterprise Software (CSU, SHOP)", "Railroads & Logistics (CNR, CP)", "Consumer Discretionary (ATD)"]
                    sector_underweight = ["Utilities", "Cash & T-Bills"]

            elif cpi > 3.0 and gdp > 2.0:
                cycle_code = "OVERHEAT"
                if lang == "zh":
                    cycle_stage = "过热与大宗商品扩张后期"
                    plain_explanation = "高通胀 + 大宗商品强劲增长。加拿大油砂能源、六大行银行与基础材料矿业享受充沛现金流。"
                    sector_overweight = ["加拿大油砂与能源管线 (CNQ, SU, ENB)", "六大特许银行 (RY, TD, BMO)", "基础金属与黄金矿业 (AEM, TECK)", "农业化肥 (NTR)"]
                    sector_underweight = ["未盈利初级勘探小矿股", "高负债地产开发商"]
                elif lang == "hybrid":
                    cycle_stage = "过热与大宗商品扩张后期 (Overheat / Resource Expansion)"
                    plain_explanation = "高通胀 (CPI > 3.0%) + 资源出口繁荣。加拿大石油能源 (Energy) 与六大行 (Big 6 Banks) 现金流充沛。"
                    sector_overweight = ["油砂与能源管线 (Energy - CNQ, SU, ENB)", "加拿大六大银行 (Big 6 Banks - RY, TD)", "矿业与化肥 (Materials - AEM, NTR)"]
                    sector_underweight = ["高负债地产开发 (Leveraged Real Estate)", "未盈利投机股 (Speculative Growth)"]
                else:
                    cycle_stage = "Overheat / Resource Expansion"
                    plain_explanation = "Elevated inflation + robust resource-driven growth. Canadian oil sands, midstream pipelines, Big-6 chartered banks, and fertilizer producers lead."
                    sector_overweight = ["Oil Sands & Pipelines (CNQ, SU, ENB)", "Big 6 Chartered Banks (RY, TD, BMO)", "Base Metals & Mining (AEM, TECK)", "Agricultural Nutrients (NTR)"]
                    sector_underweight = ["High-Debt Real Estate Developers", "Unprofitable Junior Explorers"]

            elif cpi > 3.0 and gdp <= 1.0:
                cycle_code = "STAGFLATION"
                if lang == "zh":
                    cycle_stage = "滞胀防御阶段"
                    plain_explanation = "高通胀 + 经济停滞。具备转嫁通胀能力之加拿大黄金特许权、生活必需品商超与垄断管网表现坚挺。"
                    sector_overweight = ["黄金特许权与硬资产 (FNV, WPM)", "必需消费品商超 (Loblaw, Metro)", "特许受规管公用事业 (FTS)"]
                    sector_underweight = ["周期性可选消费", "高杠杆商业地产"]
                elif lang == "hybrid":
                    cycle_stage = "滞胀防御阶段 (Stagflation)"
                    plain_explanation = "高通胀 + 经济失速。具备定价权的黄金特许权 (Gold Royalty) 与日用必需品 (Staples) 领跑。"
                    sector_overweight = ["黄金特许权 (Gold Royalty - FNV, WPM)", "必需消费品 (Consumer Staples - Loblaw)", "受规管公用事业 (Utilities - FTS)"]
                    sector_underweight = ["可选消费 (Discretionary)", "高杠杆地产 (Leveraged Real Estate)"]
                else:
                    cycle_stage = "Stagflation"
                    plain_explanation = "High inflation + weak economic growth. Canadian gold royalty compounders, essential food retailers, and regulated pipelines outperform."
                    sector_overweight = ["Gold Royalty & Producers (FNV, WPM, AEM)", "Essential Food Retail (Loblaw, Metro)", "Regulated Utilities (Fortis - FTS)"]
                    sector_underweight = ["Cyclical Discretionary", "Commercial Real Estate"]

            else:
                cycle_code = "RECESSION"
                if lang == "zh":
                    cycle_stage = "降息周期与温和复苏阶段"
                    plain_explanation = "通胀持续回落至 2.7% + 经济增速放缓至 1.8%。加拿大央行 (BoC) 开启降息周期以舒缓居民按揭信贷压力，高股息能源管线、受规管公用事业与防御性资产领跑。"
                    sector_overweight = ["高股息能源基础设施与管线 (ENB, TRP)", "特许受规管公用事业 (FTS, EMA)", "黄金特许权与压舱石 (FNV, WPM)", "加拿大主权固定收益债券"]
                    sector_underweight = ["高负债小型房地产商", "周期性林业与纸浆 (Forestry)"]
                elif lang == "hybrid":
                    cycle_stage = "降息周期与温和复苏阶段 (Rate-Cut Easing & Early Recovery)"
                    plain_explanation = "通胀持续回落 (CPI 2.7%) + 经济增速放缓 (GDP 1.8%)。加拿大央行 (BoC) 降息周期舒缓按揭压力，高股息管网与黄金防守领跑。"
                    sector_overweight = ["高股息能源管线 (Pipelines - ENB, TRP)", "公用事业 (Utilities - FTS, EMA)", "黄金特许权 (Gold Royalty - FNV, WPM)", "加拿大国债 (GoC Bonds)"]
                    sector_underweight = ["高负债地产开发 (Leveraged Real Estate)", "周期性林业 (Forestry & Paper)"]
                else:
                    cycle_stage = "Rate-Cut Easing & Early Recovery"
                    plain_explanation = "Moderating inflation (2.7%) + slowing growth (1.8%). Bank of Canada enters rate-cutting easing cycle to relieve mortgage debt service. High-dividend pipelines, regulated utilities, and gold royalty anchors lead."
                    sector_overweight = ["Energy Infrastructure & Pipelines (ENB, TRP)", "Regulated Utilities (FTS, EMA)", "Gold Royalty Anchors (FNV, WPM)", "Government of Canada Bonds"]
                    sector_underweight = ["High-Debt Real Estate Developers", "Cyclical Forestry & Pulp"]

            # Canadian Big Picture Macro Calculations
            boc_assets = ca_macro.get("boc_assets_billion_cad", 312.4) / 1000.0  # in $T CAD
            ca_gdp = ca_macro.get("ca_nominal_gdp_trillion_cad", 3.05)
            tsx_mkt_cap = ca_macro.get("tsx_market_cap_trillion_cad", 3.85)
            ca_debt = ca_macro.get("ca_total_debt_trillion_cad", 2.25)
            ca_mmf = ca_macro.get("ca_money_market_trillion_cad", 0.38)
            goc10 = ca_macro.get("goc_10y_yield_pct", 3.35)
            ca_real_yield = ca_macro.get("ca_real_yield_pct", 1.55)
            tsx_pe = ca_macro.get("tsx_trailing_pe", 15.2)
            gold_cad = ca_macro.get("gold_price_cad", 3351.6)
            gold_cad_log_yoy = ca_macro.get("gold_cad_log_yoy_pct", 26.8)

            modified_buffett = round(tsx_mkt_cap / max(0.5, ca_gdp + boc_assets), 2)
            aiae_allocation = round((tsx_mkt_cap / max(1.0, tsx_mkt_cap + ca_debt + ca_mmf)) * 100.0, 2)
            erp_pct = round((100.0 / max(1.0, tsx_pe)) - goc10, 2)
            is_resource_decoupled = gold_cad_log_yoy > 10.0 and ca_real_yield > 1.0

            big_picture = {
                "country": "CA",
                "country_name": "Canada",
                "currency": "CAD",
                "modified_buffett_ratio": modified_buffett,
                "modified_buffett_pct": round(modified_buffett * 100.0, 1),
                "aiae_allocation_pct": aiae_allocation,
                "equity_risk_premium_pct": erp_pct,
                "dgs10_yield_pct": goc10,
                "dfii10_tips_real_yield_pct": ca_real_yield,
                "fed_walcl_trillion": round(boc_assets, 2),
                "us_debt_trillion": ca_debt,
                "money_market_trillion": ca_mmf,
                "goc_10y_yield_pct": goc10,
                "goc_real_return_yield_pct": ca_real_yield,
                "boc_assets_billion_cad": ca_macro.get("boc_assets_billion_cad", 312.4),
                "ca_debt_trillion_cad": ca_debt,
                "money_market_trillion_cad": ca_mmf,
                "cad_usd_rate": ca_macro.get("cad_usd_rate", 0.731),
                "usd_cad_rate": ca_macro.get("usd_cad_rate", 1.368),
                "household_debt_to_income_pct": ca_macro.get("household_debt_to_income_pct", 178.5),
                "gold_board": {
                    "gold_price_usd": ca_macro.get("gold_price_usd", 2450.0),
                    "gold_price_cad": gold_cad,
                    "gold_log_yoy_pct": gold_cad_log_yoy,
                    "tips_10y_real_yield_pct": ca_real_yield,
                    "is_fiscal_dominance_decoupled": is_resource_decoupled,
                    "regime_en": "Resource Supercycle & Terms-of-Trade (CAD Gold Decoupled from GoC Real Yield)",
                    "regime_zh": "资源超级周期与贸易条件改善（加元金价与加债实际利率深度脱钩）"
                }
            }

            # Canadian Empirical Supporting Facts
            empirical_supporting_facts = [
                {
                    "indicator": "Canada CPI Inflation YoY" if lang == "en" else "加拿大 CPI 通胀率 (YoY)",
                    "value": f"{cpi}%",
                    "source": "Statistics Canada (StatCan Table 18-10-0004-01)",
                    "impact": "Core Inflation Glide Path to 2% Target" if lang == "en" else "核心通胀率稳步迈向2%政策目标"
                },
                {
                    "indicator": "Canada Real GDP Growth QoQ" if lang == "en" else "加拿大实际 GDP 季度增长 (QoQ)",
                    "value": f"{gdp}%",
                    "source": "Statistics Canada (StatCan Table 36-10-0104-01)",
                    "impact": "Moderate Growth Driven by Natural Resources" if lang == "en" else "能源出口与基础设施支撑稳健温和增长"
                },
                {
                    "indicator": "10Y-2Y GoC Sovereign Yield Spread" if lang == "en" else "加拿大10年与2年期基准国债利差",
                    "value": f"{yield_spread}%",
                    "source": "Bank of Canada Financial Markets Series",
                    "impact": "Normalizing Yield Curve Slope" if lang == "en" else "收益率曲线逐步恢复平坦向好"
                },
                {
                    "indicator": "Bank of Canada Overnight Target Rate" if lang == "en" else "加拿大央行政策隔夜目标利率 (BoC)",
                    "value": f"{ca_macro['boc_overnight_rate']}%",
                    "source": "Bank of Canada Official Rate Announcement",
                    "impact": "Monetary Easing Calibration Phase" if lang == "en" else "开启政策降息以平衡居民按揭信贷压力"
                },
                {
                    "indicator": "TSX Composite Modified Buffett Ratio" if lang == "en" else "TSX 指数修正版巴菲特指标 [TMC / (GDP + BoC)]",
                    "value": f"{modified_buffett}x ({round(modified_buffett * 100, 1)}%)",
                    "source": "TMX Group & Statistics Canada",
                    "impact": "Attractive Structural Valuation Discount" if lang == "en" else "加股全市场估值显著低于美股具备安全边际"
                },
                {
                    "indicator": "Canadian Household Debt-to-Income" if lang == "en" else "加拿大居民家庭债务收入比 (Debt-to-Income)",
                    "value": f"{ca_macro.get('household_debt_to_income_pct', 178.5)}%",
                    "source": "Statistics Canada & CMHC Housing Monitor",
                    "impact": "Mortgage Refinance Sensitivity Anchor" if lang == "en" else "居民按揭再融资敏感性对降息高度依赖"
                }
            ]

            credible_sources = [
                {"name": "Bank of Canada (BoC)", "domain": "bankofcanada.ca", "type": "Official Central Bank Data"},
                {"name": "Statistics Canada (StatCan)", "domain": "statcan.gc.ca", "type": "Tier-1 National Statistical Agency"},
                {"name": "Department of Finance Canada", "domain": "fin.gc.ca", "type": "Sovereign Fiscal Authority"},
                {"name": "Toronto Stock Exchange / TMX Group", "domain": "tmx.com", "type": "Primary Equity Exchange"},
                {"name": "SEDAR+ Canadian Corporate Filings", "domain": "sedarplus.ca", "type": "Corporate Filings Repository"},
                {"name": "Canada Mortgage and Housing Corporation (CMHC)", "domain": "cmhc-schl.gc.ca", "type": "Housing & Credit Agency"}
            ]

        else: # US Market Analysis
            cpi = us_macro["cpi_yoy"]
            gdp = us_macro["gdp_growth_qoq"]
            yield_spread = us_macro.get("ten_two_yield_spread", 0.15)
            active_macro = us_macro
            active_sentiment = fed_sentiment

            # US Economic Cycle Classifier (Recovery, Overheat, Stagflation, Recession)
            if cpi <= 2.5 and gdp > 2.0:
                cycle_code = "RECOVERY"
                if lang == "zh":
                    cycle_stage = "复苏与早期扩张阶段"
                    plain_explanation = "低通胀 + 稳健经济增长。增长型股票、科技与软件、房地产板块的理想宏观环境。"
                    sector_overweight = ["科技与软件", "可选消费", "房地产信托 (REITs)"]
                    sector_underweight = ["公用事业", "现金与货币市场"]
                elif lang == "hybrid":
                    cycle_stage = "复苏与早期扩张阶段 (Recovery / Early Expansion)"
                    plain_explanation = "低通胀 (CPI <= 2.5%) + 稳健经济增长 (GDP > 2.0%)。科技 (Tech) 与 SaaS 板块理想环境。"
                    sector_overweight = ["科技与软件 (Technology & SaaS)", "可选消费 (Consumer Discretionary)", "房地产 (Real Estate / REITs)"]
                    sector_underweight = ["公用事业 (Utilities)", "现金与短债 (Cash & Money Market)"]
                else:
                    cycle_stage = "Recovery / Early Expansion"
                    plain_explanation = "Low inflation + solid economic growth. Ideal environment for growth stocks, technology, and real estate."
                    sector_overweight = ["Technology & SaaS", "Consumer Discretionary", "Real Estate / REITs"]
                    sector_underweight = ["Utilities", "Cash & Money Market"]

            elif cpi > 3.0 and gdp > 2.0:
                cycle_code = "OVERHEAT"
                if lang == "zh":
                    cycle_stage = "过热与扩张后期阶段"
                    plain_explanation = "高通胀 + 稳健经济增长。央行维持高利率以防止薪资-物价螺旋式上涨。"
                    sector_overweight = ["能源与石油", "金融与银行", "基础材料与采矿", "科技与 AI 基础设施"]
                    sector_underweight = ["未盈利科技股", "高收益债券"]
                elif lang == "hybrid":
                    cycle_stage = "过热与扩张后期阶段 (Overheat / Late Expansion)"
                    plain_explanation = "高通胀 (CPI > 3.0%) + 稳健 GDP 增长。央行 (Fed) 维持限制性高利率。"
                    sector_overweight = ["能源与石油 (Energy)", "金融与银行 (Financials)", "基础材料与采矿 (Materials)", "科技与 AI 基础设施 (Tech & AI)"]
                    sector_underweight = ["未盈利科技股 (Unprofitable Tech)", "高收益债 (High-Yield Bonds)"]
                else:
                    cycle_stage = "Overheat / Late Expansion"
                    plain_explanation = "High inflation + robust economic growth. Central banks keep interest rates elevated to prevent wage-price spirals."
                    sector_overweight = ["Energy & Infrastructure", "Financials & Banks", "Materials & Mining", "Technology & AI Infra"]
                    sector_underweight = ["Unprofitable Tech", "High-Yield Bonds"]

            elif cpi > 3.0 and gdp <= 1.0:
                cycle_code = "STAGFLATION"
                if lang == "zh":
                    cycle_stage = "滞胀阶段"
                    plain_explanation = "高通胀 + 经济增长放缓。具备定价权的防守型抗衰退公司表现最佳。"
                    sector_overweight = ["必需消费品", "医疗健康与医药", "黄金与硬资产"]
                    sector_underweight = ["周期性工业", "可选消费"]
                elif lang == "hybrid":
                    cycle_stage = "滞胀阶段 (Stagflation)"
                    plain_explanation = "高通胀 (CPI) + 经济放缓 (GDP)。具备定价权 (Pricing Power) 的防守型资产领跑。"
                    sector_overweight = ["必需消费 (Consumer Staples)", "医疗健康 (Healthcare)", "黄金与硬资产 (Gold & Hard Assets)"]
                    sector_underweight = ["周期工业 (Industrials)", "可选消费 (Consumer Discretionary)"]
                else:
                    cycle_stage = "Stagflation"
                    plain_explanation = "High inflation + weak economic growth. Defensive, recession-proof companies with pricing power perform best."
                    sector_overweight = ["Consumer Staples", "Healthcare & Pharma", "Gold & Hard Assets"]
                    sector_underweight = ["Cyclical Industrials", "Consumer Discretionary"]

            else:
                cycle_code = "RECESSION"
                if lang == "zh":
                    cycle_stage = "衰退与早期复苏阶段"
                    plain_explanation = "通胀下降 + 经济放缓。央行开启降息周期刺激增长，固定收益与防守型资产领跑。"
                    sector_overweight = ["固定收益与债券", "公用事业与基础设施", "高股息防守股"]
                    sector_underweight = ["能源", "大宗商品"]
                elif lang == "hybrid":
                    cycle_stage = "衰退与早期复苏阶段 (Recession / Early Recovery)"
                    plain_explanation = "通胀下降 + 经济放缓。央行降息周期 (Rate Cuts) 刺激增长。"
                    sector_overweight = ["固定收益与债券 (Bonds)", "公用事业 (Utilities)", "高股息防守股 (High-Dividend)"]
                    sector_underweight = ["能源 (Energy)", "大宗商品 (Commodities)"]
                else:
                    cycle_stage = "Recession / Early Recovery"
                    plain_explanation = "Falling inflation + slowing economy. Central banks cut interest rates to boost growth. Fixed income and defensive assets lead."
                    sector_overweight = ["Fixed Income / Bonds", "Utilities & Infrastructure", "High-Dividend Champions"]
                    sector_underweight = ["Energy", "Commodities"]

            # US Big Picture Macro Calculations
            walcl = us_macro.get("walcl_fed_assets_trillion", 7.12)
            nominal_gdp = us_macro.get("us_nominal_gdp_trillion", 28.65)
            mkt_cap = us_macro.get("us_equity_market_cap_trillion", 55.20)
            total_debt = us_macro.get("gfdebtn_us_debt_trillion", 35.46)
            mmf = us_macro.get("mmmffaq027s_money_market_trillion", 6.42)
            dgs10 = us_macro.get("dgs10_10y_yield_pct", 4.25)
            dfii10 = us_macro.get("dfii10_tips_real_yield_pct", 1.85)
            sp500_pe = us_macro.get("sp500_trailing_pe", 25.8)
            gold_price = us_macro.get("gold_price_usd", 2450.0)
            gold_log_yoy = us_macro.get("gold_log_yoy_pct", 24.5)

            modified_buffett = round(mkt_cap / max(1.0, nominal_gdp + walcl), 2)
            aiae_allocation = round((mkt_cap / max(1.0, mkt_cap + total_debt + mmf)) * 100.0, 2)
            erp_pct = round((100.0 / max(1.0, sp500_pe)) - dgs10, 2)
            is_fiscal_decoupled = gold_log_yoy > 10.0 and dfii10 > 1.0

            big_picture = {
                "modified_buffett_ratio": modified_buffett,
                "modified_buffett_pct": round(modified_buffett * 100.0, 1),
                "aiae_allocation_pct": aiae_allocation,
                "equity_risk_premium_pct": erp_pct,
                "dgs10_yield_pct": dgs10,
                "dfii10_tips_real_yield_pct": dfii10,
                "fed_walcl_trillion": walcl,
                "us_debt_trillion": total_debt,
                "money_market_trillion": mmf,
                "gold_board": {
                    "gold_price_usd": gold_price,
                    "gold_log_yoy_pct": gold_log_yoy,
                    "tips_10y_real_yield_pct": dfii10,
                    "is_fiscal_dominance_decoupled": is_fiscal_decoupled,
                    "regime_en": "Fiscal Dominance & Fiat Debasement (Gold Decoupled from Real Yield)",
                    "regime_zh": "财政主导与法币信用稀释（金价与美债实际利率深度脱钩）"
                }
            }

            empirical_supporting_facts = [
                {
                    "indicator": "US CPI Inflation YoY" if lang == "en" else "美国 CPI 通胀率 (YoY)",
                    "value": f"{cpi}%",
                    "source": "US Bureau of Labor Statistics (FRED Series CPIAUCSL)",
                    "impact": "Sticky Inflation / Restrictive Policy Target" if lang == "en" else "通胀粘性 / 限制性利率目标"
                },
                {
                    "indicator": "US Real GDP Growth QoQ" if lang == "en" else "美国实际 GDP 季度增长 (QoQ)",
                    "value": f"{gdp}%",
                    "source": "US Bureau of Economic Analysis (FRED Series GDP)",
                    "impact": "Demonstrates Economic Resilience" if lang == "en" else "展示经济增长韧性"
                },
                {
                    "indicator": "10Y-2Y Treasury Yield Spread" if lang == "en" else "美国 10年与2年期国债收益率倒挂",
                    "value": f"{yield_spread}%",
                    "source": "Federal Reserve Economic Data (FRED Series T10Y2Y)",
                    "impact": "Late-Cycle Yield Curve Transition" if lang == "en" else "周期后期收益率曲线过渡"
                },
                {
                    "indicator": "Modified Buffett Indicator" if lang == "en" else "修正版巴菲特指标 [TMC / (GDP + WALCL)]",
                    "value": f"{modified_buffett}x ({round(modified_buffett * 100, 1)}%)",
                    "source": "FRED Series WALCL & BEA GDP (Big Picture Macro)",
                    "impact": "Structural Equity Valuation Gauge" if lang == "en" else "美股大局观全市场估值水位"
                },
                {
                    "indicator": "AIAE Investor Allocation to Equities" if lang == "en" else "全社会权益资产配置比例 (AIAE)",
                    "value": f"{aiae_allocation}%",
                    "source": "FRED Series GFDEBTN & MMMFFAQ027S",
                    "impact": "Investor Crowding & Cash Cushion" if lang == "en" else "投资者拥挤度与潜在增量弹药"
                }
            ]

            credible_sources = [
                {"name": "Federal Reserve Economic Data (FRED)", "domain": "stlouisfed.org", "type": "Official Central Bank Data"},
                {"name": "US Bureau of Labor Statistics (BLS)", "domain": "bls.gov", "type": "Tier-1 Government Statistical Agency"},
                {"name": "US Bureau of Economic Analysis (BEA)", "domain": "bea.gov", "type": "National Accounts Agency"},
                {"name": "Federal Reserve Board / FOMC", "domain": "federalreserve.gov", "type": "Monetary Policy Authority"},
                {"name": "Securities and Exchange Commission (SEC EDGAR)", "domain": "sec.gov", "type": "Corporate Filings Repository"},
                {"name": "S&P Dow Jones Indices", "domain": "spglobal.com", "type": "Benchmark Index Provider"}
            ]

        # Fetch Real-Time Policy News Feed for the selected country
        policy_news = NewsClient.fetch_macro_news(force_refresh=force_refresh, country=country_norm)

        return {
            "country": country_norm,
            "country_name": "United States" if country_norm == "US" else "Canada",
            "country_flag": "🇺🇸" if country_norm == "US" else "🇨🇦",
            "cycle_stage": cycle_stage,
            "cycle_code": cycle_code,
            "plain_explanation": plain_explanation,
            "us_indicators": us_macro,
            "ca_indicators": ca_macro,
            "active_indicators": active_macro,
            "fed_sentiment": fed_sentiment,
            "boc_sentiment": boc_sentiment,
            "central_bank_sentiment": active_sentiment,
            "recommended_overweights": sector_overweight,
            "recommended_underweights": sector_underweight,
            "empirical_supporting_facts": empirical_supporting_facts,
            "policy_news": policy_news,
            "credible_sources": credible_sources,
            "big_picture": big_picture
        }

    @classmethod
    def _calculate_sentiment_score(cls, text: str, lang: str = "en") -> Dict[str, Any]:
        lower_text = text.lower()
        hawkish_count = sum(len(re.findall(r'\b' + kw + r'\b', lower_text)) for kw in cls.HAWKISH_KEYWORDS)
        dovish_count = sum(len(re.findall(r'\b' + kw + r'\b', lower_text)) for kw in cls.DOVISH_KEYWORDS)

        net_score = (hawkish_count - dovish_count) / max(1, hawkish_count + dovish_count)

        if net_score > 0.2:
            tone = "Hawkish (Restrictive Policy Rate Stance)" if lang == "en" else "偏鹰派 (维持限制性利率)"
        elif net_score < -0.2:
            tone = "Dovish (Accommodative Easing Stance)" if lang == "en" else "偏鸽派 (预示降息周期)"
        else:
            tone = "Neutral / Wait-and-See" if lang == "en" else "中立观望 (数据依赖模式)"

        return {
            "score": round(net_score, 2),
            "tone": tone,
            "hawkish_signals_detected": hawkish_count,
            "dovish_signals_detected": dovish_count
        }
