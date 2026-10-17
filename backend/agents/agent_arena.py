import os
import json
import logging
from typing import Dict, Any
from google import genai
from google.genai import types
from backend.config import settings

logger = logging.getLogger(__name__)

class MultiAgentArena:
    """Orchestrates Bull vs. Bear debate refereed by CIO Agent, powered by live Gemini LLM with empirical fallback capabilities and multi-language support."""

    @classmethod
    def run_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en", country: Optional[str] = None) -> Dict[str, Any]:
        symbol = stock_data.get("symbol", "UNKNOWN")

        # Resolve country context (CA vs US)
        is_ca = (
            country == "CA"
            or stock_data.get("market") == "CA"
            or stock_data.get("currency") == "CAD"
            or symbol.endswith(".TO")
            or symbol.endswith(".V")
            or macro_data.get("country") == "CA"
        )
        resolved_country = "CA" if is_ca else "US"

        # 0. Check validity - strictly return NO DATA if stock data is invalid or unlisted
        if not stock_data.get("is_valid", True) or stock_data.get("current_price") is None:
            return {
                "is_valid": False,
                "symbol": symbol,
                "bull_argument": {
                    "agent": "Bull Agent 🐂" if lang == "en" else ("多头分析师 🐂" if lang == "zh" else "多头分析师 (Bull Agent 🐂)"),
                    "key_points": [f"No active market data feed found for ticker '{symbol}'."],
                    "upside_catalyst": "N/A (Unlisted / Invalid Ticker)"
                },
                "bear_argument": {
                    "agent": "Bear Agent 🐻" if lang == "en" else ("空头分析师 🐻" if lang == "zh" else "空头分析师 (Bear Agent 🐻)"),
                    "key_points": [f"Unable to verify exchange pricing or financial filings for '{symbol}'."],
                    "downside_risk": "N/A (Unlisted / Invalid Ticker)"
                },
                "cio_verdict": {
                    "agent": "CIO Agent 👨‍⚖️" if lang == "en" else ("投委会主席 👨‍⚖️" if lang == "zh" else "投委会主席 (CIO Agent 👨‍⚖️)"),
                    "verdict": "NO DATA / UNVERIFIED",
                    "position_sizing_advice": "0% allocation (Do not trade unverified tickers).",
                    "recommended_buy_bracket": "N/A",
                    "risk_reward_ratio": 0.0,
                    "judge_summary": f"Ticker '{symbol}' has no real-time market data feed. Please verify ticker symbol.",
                    "empirical_proof_verified": False
                }
            }

        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        debate_result = None
        if api_key:
            try:
                debate_result = cls._run_gemini_llm_debate(api_key, stock_data, macro_data, pricing_data, fundamental_data, lang=lang, country=resolved_country)
            except Exception as e:
                logger.warning(f"Gemini LLM debate generation failed ({e}), falling back to empirical engine rules.")
                debate_result = cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang, country=resolved_country)
        else:
            debate_result = cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang, country=resolved_country)

        # Audit against 《纪律.md》 Personal Investment Constitution
        from backend.engines.discipline_engine import DisciplineEngine
        audit = DisciplineEngine.audit_trade(stock_data, pricing_data, lang=lang)
        if debate_result and "cio_verdict" in debate_result:
            debate_result["cio_verdict"]["discipline_audit"] = audit
            if not audit["is_compliant"]:
                veto_str = "; ".join(audit["veto_reasons_zh"] if lang == "zh" else audit["veto_reasons"])
                debate_result["cio_verdict"]["verdict"] = "DISCIPLINE_BLOCKED / 纪律否决"
                debate_result["cio_verdict"]["position_sizing_advice"] = f"0% Allocation — Blocked by 《纪律.md》: {veto_str}"
                debate_result["cio_verdict"]["judge_summary"] = f"[{audit['summary']}] {debate_result['cio_verdict'].get('judge_summary', '')}"

        return debate_result

    @classmethod
    def _run_gemini_llm_debate(cls, api_key: str, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en", country: str = "US") -> Dict[str, Any]:
        """Calls Gemini API using google-genai SDK to generate adversarial debate and CIO verdict with regional macro parity and Mianji principles."""
        client = genai.Client(api_key=api_key)

        lang_instruction = "Respond in English." if lang == "en" else ("Respond in Simplified Chinese." if lang == "zh" else "Respond in Simplified Chinese narrative with English financial terms in parentheses.")

        country_context = "Canada (TSX / Canadian Market)" if country == "CA" else "United States (US Market)"
        central_bank_name = "Bank of Canada (BoC)" if country == "CA" else "Federal Reserve (Fed)"
        central_bank_sentiment = macro_data.get("boc_sentiment", {}).get("tone") or macro_data.get("central_bank_sentiment", {}).get("tone") if country == "CA" else macro_data.get("fed_sentiment", {}).get("tone", "RESTRICTIVE")

        system_instruction = (
            f"You are an institutional investment debate orchestrator managing three agents for equities in {country_context}. {lang_instruction}\n"
            "1. Bull Agent (Advocate): Highlights real competitive moats, cash flow quality, DCF upside, growth catalysts, and region-specific macroeconomic tailwinds (for Canada: Bank of Canada monetary easing cycle, TSX structural valuation discount vs US, resource export demand and high dividend yields; for US: GDP resilience, tech innovation, domestic consumption, and strong corporate cash flows).\n"
            "2. Bear Agent (Prosecutor): Scrutinizes overvaluation, P/E percentiles, technical pullback risk to 200D MA support (if price > 200D MA) or trend breakdown below 200D MA overhead resistance (if price < 200D MA), and region-specific macro cycle headwinds (for Canada: household debt sensitivity, mortgage resets, growth softening; for US: restrictive Fed rates, negative Equity Risk Premium).\n"
            "3. CIO Agent (Judge): Impartial referee enforcing empirical evidence, Risk-Reward ratio, and institutional investment discipline (pre-trade soul check & prior framework):\n"
            "   - judge_summary: Decisive executive investment conclusion synthesizing Bull and Bear arguments, valuation margin of safety, and recommended entry price. STRICTLY DO NOT repeat generic checklist text or static boilerplate here as it is rendered separately below.\n"
            "   - mianji_framework.taxonomy_diagnosis: Analyze THIS specific stock's business engine, FCF conversion ($X), ROIC (X%), and cyclicality to diagnose why it belongs to 🌲 Tree (compounder), 🌾 Grain (cyclical/dividend value), or 🥬 Vegetable (trend-only satellite). Avoid generic boilerplate; evaluate the real business.\n"
            "   - Pre-trade Soul Check (投前灵魂四问): Check FOMO emotional urgency (eliminate anxiety), verify Trend Temperature (regime FREEZE/FLAT/WARM/HOT, favoring right-side entry over left-side knife-catching), penetrate narrative with Reverse-DCF 10Y ceiling multiple and Prosperity Trap warnings, cap Bayesian prior confidence at <= 95% (never 100% certainty, respect unknown), and establish a mandatory pre-set falsification exit trigger with a quantified bottom threshold (e.g., breach below $X.XX, calculated as 3% below 200D MA, or quarterly FCF turning negative).\n"
            "   - Position Sizing & Barbell: Core SAA (80% Tree/Grain) vs Satellite TAA (20% Vegetable). Anti-ruin rule: strictly block counter-trend averaging down.\n"
            "   - Qualified Holder Mindset (只做合格持有人): '不是人在做投资，是纪律在做投资。'\n\n"
            "STRICT MANDATE: Base all numbers strictly on the provided real-time stock parameters. Never hallucinate fake prices or company names. Never output negative percentages like '-X% above support'. IMPORTANT: Strictly DO NOT mention the words 'Mianji' or '面基' anywhere in the output text.\n"
            "Respond ONLY with a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "symbol": "TICKER",\n'
            '  "bull_argument": {\n'
            '    "agent": "Bull Agent 🐂",\n'
            '    "key_points": ["point 1", "point 2", "point 3"],\n'
            '    "upside_catalyst": "Target Fair Value $X (+Y% upside)"\n'
            '  },\n'
            '  "bear_argument": {\n'
            '    "agent": "Bear Agent 🐻",\n'
            '    "key_points": ["risk 1", "risk 2", "risk 3"],\n'
            '    "downside_risk": "Technical support or overhead resistance at $X (downside risk assessment)"\n'
            '  },\n'
            '  "cio_verdict": {\n'
            '    "agent": "CIO Agent 👨‍⚖️",\n'
            '    "verdict": "BUY" OR "HOLD / WATCH" OR "PASS / OVERVALUED",\n'
            '    "position_sizing_advice": "Advice string",\n'
            '    "recommended_buy_bracket": "$MIN - $MAX CURR",\n'
            '    "risk_reward_ratio": 2.1,\n'
            '    "judge_summary": "Executive debate synthesis and timing verdict evaluating pricing and margin of safety (without repeating checklist bullets)",\n'
            '    "empirical_proof_verified": true,\n'
            '    "mianji_framework": {\n'
            '      "taxonomy": "TREE" OR "GRAIN" OR "VEGETABLE",\n'
            '      "taxonomy_diagnosis": "Company-specific diagnosis analyzing the stock real FCF, ROIC, and cyclical nature",\n'
            '      "soul_check": {\n'
            '        "urgency_fomo_check": "PASS" OR "CAUTION",\n'
            '        "trend_temperature": "FREEZE" OR "FLAT" OR "WARM" OR "HOT",\n'
            '        "variant_view_penetration": "Summary of 10Y ceiling and prosperity trap check",\n'
            '        "bayesian_prior": "<= 95% confidence cap",\n'
            '        "mandatory_falsification_trigger": "Decisive breach below bottom threshold $X.XX (-3% below 200D MA), or quarterly FCF turning negative",\n'
            '        "bottom_threshold": 123.45,\n'
            '        "is_falsified": false\n'
            '      },\n'
            '      "barbell_allocation": "Core SAA (80%)" OR "Satellite TAA (20%)",\n'
            '      "qualified_holder_creed": "只做合格持有人：不是人在做投资，是纪律在做投资。"\n'
            '    }\n'
            '  }\n'
            "}"
        )

        prompt = (
            f"Analyze Ticker: {stock_data['symbol']}\n"
            f"Company Name: {stock_data.get('company_name', stock_data['symbol'])}\n"
            f"Market Jurisdiction: {country_context}\n"
            f"Current Real-Time Price: ${stock_data['current_price']} {stock_data['currency']}\n"
            f"P/E Ratio: {stock_data.get('pe_ratio', 'N/A')} | P/S: {stock_data.get('ps_ratio', 'N/A')} | Valuation Status: {pricing_data['valuation_status']}\n"
            f"50D SMA: ${pricing_data['fifty_day_sma']} | 200D SMA: ${pricing_data['two_hundred_day_sma']}\n"
            f"DCF Fair Value: ${pricing_data['dcf_fair_value']} | Ideal Buy Range: ${pricing_data['ideal_buy_range_min']} - ${pricing_data['ideal_buy_range_max']}\n"
            f"Free Cash Flow Quality: {fundamental_data['fcf_quality']} | Moat Rating: {fundamental_data['moat_rating']}\n"
            f"Economic Cycle Phase: {macro_data['cycle_stage']} | Central Bank ({central_bank_name}) Hawkishness: {central_bank_sentiment}\n"
            f"Taxonomy: {fundamental_data.get('taxonomy', pricing_data.get('taxonomy', 'N/A'))}\n"
            f"Reverse-DCF 10Y Ceiling: {pricing_data.get('reverse_dcf', 'N/A')}\n"
        )

        model_name = "gemini-2.5-flash"
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )
        except Exception as err:
            logger.info(f"Model {model_name} failed ({err}), trying gemini-1.5-flash...")
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    temperature=0.2,
                )
            )

        parsed = json.loads(response.text)
        parsed["symbol"] = stock_data["symbol"]

        # Ensure quantified falsification parameters exist in parsed verdict
        cio_verdict = parsed.get("cio_verdict", {})
        mianji_framework = cio_verdict.get("mianji_framework", {})
        if "soul_check" in mianji_framework:
            sc = mianji_framework["soul_check"]
            price_val = float(stock_data.get("current_price", 0.0))
            two_hundred_sma_val = float(pricing_data.get("two_hundred_day_sma", price_val))
            curr_val = stock_data.get("currency", "USD")
            bottom_thresh = round(two_hundred_sma_val * 0.97, 2) if two_hundred_sma_val > 0 else round(price_val * 0.95, 2)

            if "bottom_threshold" not in sc or not sc["bottom_threshold"]:
                sc["bottom_threshold"] = bottom_thresh
            if "is_falsified" not in sc:
                sc["is_falsified"] = bool(price_val < float(sc["bottom_threshold"]))
            if "threshold_currency" not in sc:
                sc["threshold_currency"] = curr_val

        return parsed

    @classmethod
    def _run_fallback_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en", country: str = "US") -> Dict[str, Any]:
        """Empirical calculation rules fallback dynamically tailored to the exact stock parameters, regional macro cycle, and Mianji Podcast principles."""
        symbol = stock_data["symbol"]
        company = stock_data.get("company_name", symbol)
        price = stock_data["current_price"]
        curr = stock_data["currency"]
        pe = stock_data.get("pe_ratio", "N/A")
        moat = fundamental_data["moat_rating"]
        buy_min = pricing_data["ideal_buy_range_min"]
        buy_max = pricing_data["ideal_buy_range_max"]
        two_hundred_sma = pricing_data["two_hundred_day_sma"]
        dcf_fair_value = pricing_data["dcf_fair_value"]
        fcf_quality = fundamental_data["fcf_quality"]
        cycle = macro_data.get("cycle_stage", "Normal")
        is_ca = country == "CA" or stock_data.get("market") == "CA" or curr == "CAD" or symbol.endswith(".TO") or symbol.endswith(".V")

        # 1. Calculate technical distance and 200D SMA context
        upside_pct = round(((dcf_fair_value - price) / max(1.0, price)) * 100, 1)
        is_above_200 = price >= two_hundred_sma

        if is_above_200:
            above_pct = round(((price - two_hundred_sma) / max(1.0, price)) * 100, 1)
            below_pct = 0.0
        else:
            above_pct = 0.0
            below_pct = round(((two_hundred_sma - price) / max(1.0, two_hundred_sma)) * 100, 1)

        has_buy_bracket = buy_min is not None and buy_max is not None
        safe_buy_min = buy_min if has_buy_bracket else round(two_hundred_sma * 0.88, 2)
        safe_buy_max = buy_max if has_buy_bracket else round(two_hundred_sma * 0.95, 2)
        floor_gap_pct = round(((price - safe_buy_min) / max(1.0, price)) * 100, 1) if price > safe_buy_min else 0.0

        # 2. Extract Mianji Taxonomy & Reverse-DCF Parameters
        raw_tax = fundamental_data.get("taxonomy") or pricing_data.get("taxonomy") or {}
        taxonomy = raw_tax.get("taxonomy") if isinstance(raw_tax, dict) else str(raw_tax).upper()
        if taxonomy not in ["TREE", "GRAIN", "VEGETABLE"]:
            taxonomy = "TREE" if fcf_quality == "STRONG_FCF" else "GRAIN"

        reverse_dcf = pricing_data.get("reverse_dcf") or {}
        ceiling_mult = reverse_dcf.get("implied_10y_ceiling_multiple", 3.2)
        is_prosperity_trap = reverse_dcf.get("is_prosperity_trap", False)
        trap_reason = reverse_dcf.get("prosperity_trap_reason", "")

        trend_temp = (stock_data.get("trend_temperature") or pricing_data.get("trend_temperature") or ("WARM" if is_above_200 else "FLAT")).upper()
        if trend_temp not in ["FREEZE", "FLAT", "WARM", "HOT"]:
            trend_temp = "WARM" if is_above_200 else "FLAT"

        hitting_zone = "RIGHT_SIDE" if trend_temp in ["WARM", "HOT"] else "LEFT_SIDE_WATCH"

        # 3. Formulate Regional Macro Bull & Bear Points
        if is_ca:
            macro_bull_point_zh = f"加拿大宏观顺风：受惠于加拿大央行（BoC）货币降息周期（当前处于 {cycle} 阶段），TSX 市场整体估值折价提供显著修复空间与充沛股息安全垫。"
            macro_bull_point_en = f"Canadian Macro Tailwinds: Benefiting from Bank of Canada monetary easing cycle ({cycle}) and TSX structural valuation discount offering multiple expansion runway."
            macro_bull_point_hy = f"加拿大宏观顺风 (CA Macro): 加拿大央行 (BoC) 降息宽松周期 ({cycle})，TSX 估值折价 (Valuation Discount) 与股息现金流提供扎实安全垫。"

            macro_bear_point_zh = f"加拿大宏观周期约束：处于 {cycle} 周期；加拿大央行连续降息反映出本土经济增长放缓、居民高负债率房贷续签去杠杆压力及加元汇率波动敞口。"
            macro_bear_point_en = f"Canadian Macro Headwinds: Current phase is {cycle}; Bank of Canada rate cuts signal domestic economic softness, elevated household debt-to-income sensitivity, and mortgage renewal strain."
            macro_bear_point_hy = f"加拿大宏观周期约束 (CA Headwinds): 处于 {cycle} 阶段，央行 (BoC) 降息凸显加拿大本土增长放缓与居民房贷去杠杆敏感性。"
        else:
            macro_bull_point_zh = f"美国宏观韧性：处于 {cycle} 阶段，美国经济与企业自由现金流具备强劲内生增长动力，美元资产具备全球避险与配置吸引力。"
            macro_bull_point_en = f"US Macro Resilience: Operating in {cycle} phase with resilient US corporate cash generation and technological capital expenditure tailwinds."
            macro_bull_point_hy = f"美国宏观韧性 (US Macro): 处于 {cycle} 阶段，企业 FCF 转化强劲与资本开支顺风支撑核心资产长期复利。"

            macro_bear_point_zh = f"美国宏观周期约束：处于 {cycle} 阶段，美联储维持限制性高利率政策，美股股权风险溢价（ERP）偏紧，面临高估值压缩风险。"
            macro_bear_point_en = f"US Macro Headwinds: Current phase is {cycle} with Federal Reserve restrictive policy, higher-for-longer rates, and compressed Equity Risk Premium (ERP)."
            macro_bear_point_hy = f"美国宏观周期约束 (US Headwinds): 处于 {cycle} 阶段，美联储 (Fed) 限制性利率与紧缩的股权风险溢价 (ERP) 加剧高估值承压。"

        # 4. Formulate Multi-Language Arguments
        if lang == "zh":
            bull_agent_name = "多头辩护人 🐂"
            bear_agent_name = "空头公诉人 🐻"
            cio_agent_name = "投委会主席 (CIO) 👨‍⚖️"

            if is_above_200:
                tech_bull_point = f"技术面支撑稳固：股价稳居 200日移动平均线支撑位 (${two_hundred_sma} {curr}) 之上。"
                tech_bear_point = f"下行回调风险：当前股价高出 200日均线支撑位 (${two_hundred_sma} {curr}) 达 {above_pct}%，面临均值回归回调压力。"
                tech_bear_risk = f"技术面支撑位于 200日均线 (${two_hundred_sma} {curr})，面临 {above_pct}% 的回调下行敞口。"
            else:
                tech_bull_point = f"均值回归折价契机：股价较 200日均线 (${two_hundred_sma} {curr}) 产生 {below_pct}% 折价，具备逆向均值回归修复空间。"
                tech_bear_point = f"技术面破位承压：股价处于 200日均线 (${two_hundred_sma} {curr}) 下方 {below_pct}%，均线已由支撑反转为上方强阻力位。"
                if price > safe_buy_min:
                    tech_bear_risk = f"200日均线 (${two_hundred_sma} {curr}) 构成上方阻力，下方关键估值底部支撑位于 ${safe_buy_min} {curr}（下行空间 {floor_gap_pct}%）。"
                else:
                    tech_bear_risk = f"200日均线 (${two_hundred_sma} {curr}) 构成上方阻力，股价正测试价值底部区间 (${safe_buy_min} {curr})，需警惕阴跌探底风险。"

            bull_points = [
                f"{company} ({symbol}) 当前实时市场价格为 ${price} {curr}。",
                f"基本面评级为 {moat}，自由现金流质量评价为 '{fcf_quality}'。",
                macro_bull_point_zh,
                tech_bull_point
            ]
            bull_catalyst = f"DCF 固有价值目标价为 ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% 上行安全边际)。"

            bear_points = [
                f"估值审视：当前市盈率为 {pe} ({pricing_data['valuation_status']})。",
                macro_bear_point_zh,
                tech_bear_point
            ]
            bear_risk = tech_bear_risk

        elif lang == "hybrid":
            bull_agent_name = "多头辩护人 (Bull Advocate 🐂)"
            bear_agent_name = "空头公诉人 (Bear Prosecutor 🐻)"
            cio_agent_name = "投委会主席 (CIO Agent 👨‍⚖️)"

            if is_above_200:
                tech_bull_point = f"技术面支撑稳固：股价稳居 200D SMA 支撑位 (${two_hundred_sma} {curr}) 之上。"
                tech_bear_point = f"下行回调风险 (Downside Risk)：股价高于 200D SMA 支撑位 ${two_hundred_sma} {curr} ({above_pct}%)，面临均值回归回调。"
                tech_bear_risk = f"技术支撑位位于 200D SMA (${two_hundred_sma} {curr})，面临 {above_pct}% 的回调下行敞口。"
            else:
                tech_bull_point = f"均值回归折价 (Mean-Reversion)：股价较 200D SMA (${two_hundred_sma} {curr}) 折价 {below_pct}%，具备均值回归修复空间。"
                tech_bear_point = f"技术破位承压 (Trend Breakdown)：股价处于 200D SMA (${two_hundred_sma} {curr}) 下方 {below_pct}%，均线已转化为上方强阻力位 (Overhead Resistance)。"
                if price > safe_buy_min:
                    tech_bear_risk = f"200D SMA (${two_hundred_sma} {curr}) 构成上方阻力，下方关键估值支撑位于 ${safe_buy_min} {curr}（下行空间 {floor_gap_pct}%）。"
                else:
                    tech_bear_risk = f"200D SMA (${two_hundred_sma} {curr}) 构成上方阻力，股价测试价值底部 (${safe_buy_min} {curr})，需警惕探底与飞刀风险。"

            bull_points = [
                f"{company} ({symbol}) 实时价格为 ${price} {curr}。",
                f"基本面评级为 {moat}，自由现金流评估 (FCF Quality): '{fcf_quality}'。",
                macro_bull_point_hy,
                tech_bull_point
            ]
            bull_catalyst = f"DCF 固有价值目标价为 ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% 上行空间)。"

            bear_points = [
                f"估值审查：当前 P/E 为 {pe} ({pricing_data['valuation_status']})。",
                macro_bear_point_hy,
                tech_bear_point
            ]
            bear_risk = tech_bear_risk

        else: # English
            bull_agent_name = "Bull Case Advocate 🐂"
            bear_agent_name = "Bear Case Prosecutor 🐻"
            cio_agent_name = "CIO Agent 👨‍⚖️"

            if is_above_200:
                tech_bull_point = f"Technical strength: Price is holding support above the 200-day moving average (${two_hundred_sma} {curr})."
                tech_bear_point = f"Downside pullback risk: Price is extended {above_pct}% above 200D MA support (${two_hundred_sma} {curr})."
                tech_bear_risk = f"Technical support lies at 200D SMA (${two_hundred_sma} {curr}) indicating {above_pct}% downside pullback exposure."
            else:
                tech_bull_point = f"Mean-reversion discount: Trading at a {below_pct}% discount below the 200-day moving average (${two_hundred_sma} {curr}), offering contrarian value."
                tech_bear_point = f"Trend breakdown: Trading {below_pct}% below 200D MA (${two_hundred_sma} {curr}), which now acts as overhead resistance rather than support."
                if price > safe_buy_min:
                    tech_bear_risk = f"200D MA (${two_hundred_sma} {curr}) forms overhead resistance; key value floor support lies at ${safe_buy_min} {curr} ({floor_gap_pct}% lower)."
                else:
                    tech_bear_risk = f"200D MA (${two_hundred_sma} {curr}) forms overhead resistance; price is testing deep value floor (${safe_buy_min} {curr}), watch for falling knife momentum."

            bull_points = [
                f"{company} ({symbol}) real-time market price is ${price} {curr}.",
                f"Fundamental positioning: {moat} with Free Cash Flow quality '{fcf_quality}'.",
                macro_bull_point_en,
                tech_bull_point
            ]
            bull_catalyst = f"DCF Fair Value target is ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% target margin)."

            bear_points = [
                f"Valuation scrutiny: Current P/E is {pe} ({pricing_data['valuation_status']}).",
                macro_bear_point_en,
                tech_bear_point
            ]
            bear_risk = tech_bear_risk

        # 5. Risk-Reward Ratio Calculation
        if dcf_fair_value > price:
            upside_potential = max(0.1, dcf_fair_value - price)
        else:
            upside_potential = max(0.1, price * 0.03)

        support_floor = min(two_hundred_sma, safe_buy_min)
        if price > support_floor:
            downside_exposure = max(price * 0.03, price - support_floor)
        else:
            downside_exposure = max(price * 0.08, support_floor * 0.10)

        calculated_rr = round(upside_potential / max(0.1, downside_exposure), 1)
        rr_ratio = max(0.2, min(9.9, calculated_rr))

        # 6. Real-Stock Mianji Taxonomy Diagnosis & Soul Check Parameters
        fomo_warning = is_above_200 and above_pct > 18.0
        fomo_status = "CAUTION" if fomo_warning else "PASS"

        tax_label_zh = "🌲 种树股 (自由现金流复利)" if taxonomy == "TREE" else ("🌾 种粮股 (周期春播秋收+高股息)" if taxonomy == "GRAIN" else "🥬 种菜股 (仅限趋势交易)")
        tax_label_en = "🌲 Tree (FCF Compounder)" if taxonomy == "TREE" else ("🌾 Grain (Cyclical / Dividend Value)" if taxonomy == "GRAIN" else "🥬 Vegetable (Trend Only)")

        prior_confidence = 70 if (has_buy_bracket and price <= buy_max) else 45
        
        # Quantify the decisive break below 200D MA: -3.0% buffer floor
        bottom_threshold = round(two_hundred_sma * 0.97, 2) if two_hundred_sma > 0 else round(price * 0.95, 2)
        is_falsified = bool(price < bottom_threshold)

        falsification_zh = f"有效跌破底线阈值 ${bottom_threshold} {curr}（200日均线 ${two_hundred_sma} 下方 -3.0% 且连续3日无法收复），或季度自由现金流质量转负"
        falsification_en = f"Decisive break below bottom threshold ${bottom_threshold} {curr} (-3.0% buffer under 200D MA ${two_hundred_sma} for 3 sessions), or quarterly FCF turning negative"

        # Extract concrete stock fundamentals for genuine asset diagnosis
        fcf_val = stock_data.get("free_cash_flow") or fundamental_data.get("free_cash_flow") or 0
        roic_val = stock_data.get("roic") or 0.0
        div_yield = stock_data.get("dividend_yield_pct") or 0.0
        buyback_yield = stock_data.get("net_buyback_yield_pct") or 0.0
        total_sh_yield = round(float(div_yield) + float(buyback_yield), 1)
        dilution_val = stock_data.get("dilution_3y_pct") or 0.0

        if abs(fcf_val) >= 1e9:
            fcf_display = f"${round(fcf_val / 1e9, 1)}B"
        elif abs(fcf_val) >= 1e6:
            fcf_display = f"${round(fcf_val / 1e6, 1)}M"
        else:
            fcf_display = f"${fcf_val}"
        roic_display = f"{round(float(roic_val) * 100, 1)}%"

        if taxonomy == "TREE":
            diagnosis_zh = (
                f"{company} 判定为【种树资产】：公司具备 {moat} 竞争壁垒，ROIC 达 {roic_display}，年化自由现金流规模达 {fcf_display} {curr} 且股权未见恶性稀释（3年稀释率 {dilution_val}%）。"
                f"其长期内在价值由内生自由现金流的持续复利驱动，而非单纯依赖宏观景气度周期。适合合格持有人以 80% 核心底仓跨周期持有，不因短期估值波动轻易被震荡洗出。"
            )
            diagnosis_en = (
                f"{company} diagnosed as [Tree Asset]: Possesses {moat} with ROIC of {roic_display}, robust annual FCF of {fcf_display} {curr}, and disciplined share count ({dilution_val}% 3Y dilution). "
                f"Value creation is powered by durable compounding cash flows rather than macro cycles. Suitable as core 80% SAA compounding anchor."
            )
            diagnosis_hy = (
                f"{company} 判定为【种树资产 (Tree)】：具备 {moat}，ROIC 达 {roic_display}，自由现金流规模 {fcf_display} {curr}，无恶性稀释。内在价值由内生现金流复利驱动，定位为 80% Core SAA 核心底仓，穿越周期长期持有。"
            )
        elif taxonomy == "GRAIN":
            diagnosis_zh = (
                f"{company} 判定为【种粮资产】：年产自由现金流规模达 {fcf_display} {curr}，综合股东回报率（股息+净回购）达 {total_sh_yield}%，但盈利能力强依赖大宗商品价格或宏观周期波动。"
                f"投资策略严格遵循‘春播秋收’纪律：在估值折价与周期低谷建仓吃股息，在估值中枢修复进入过热期必须果断兑现收割，切忌将其误判为长青树而承受剧烈回撤。"
            )
            diagnosis_en = (
                f"{company} diagnosed as [Grain Asset]: Generates {fcf_display} {curr} in cash flow with {total_sh_yield}% total shareholder return, but remains structurally cyclical. "
                f"Follow 'Spring Sowing, Autumn Harvest' discipline: accumulate during valuation troughs for dividends, harvest into valuation peaks; never mistake cyclicals for secular compounders."
            )
            diagnosis_hy = (
                f"{company} 判定为【种粮资产 (Grain)】：现金流规模达 {fcf_display} {curr}，股东综合回报率 {total_sh_yield}%，盈利受宏观周期约束。恪守‘春播秋收’纪律：估值折价期低估买入享股息，估值中枢修复时果断止盈收割。"
            )
        else:
            veg_reason_zh = "自由现金流尚未转正或存在股权稀释" if fcf_val <= 0 else "估值倍数严重透支远期预期，缺乏 DCF 安全垫"
            veg_reason_en = "unprofitable FCF or ongoing share dilution" if fcf_val <= 0 else "elevated valuation multiple lacking durable DCF anchor"
            diagnosis_zh = (
                f"{company} 判定为【种菜资产】：当前{veg_reason_zh}（年化FCF {fcf_display} {curr}）。标的无长期确定性自由现金流锚，不能左侧越跌越买死扛。"
                f"策略严格定位为 20% 战术卫星轻仓（试仓上限2%）：依托技术均线温度进行右侧顺势博弈，必须预设硬止损底线，破位果断离场。"
            )
            diagnosis_en = (
                f"{company} diagnosed as [Vegetable Asset]: Reflects {veg_reason_en} (FCF {fcf_display} {curr}). Lacks a predictable long-term FCF anchor. "
                f"Restricted to 20% tactical satellite TAA: follow right-side trend momentum with mandatory hard stop-loss; never average down on negative momentum."
            )
            diagnosis_hy = (
                f"{company} 判定为【种菜资产 (Vegetable)】：现金流尚未稳固（FCF {fcf_display} {curr}）且缺乏 DCF 价值锚。定位为 20% Satellite 战术卫星仓位，严格顺应右侧趋势温度并预设硬止损，严禁左侧加仓抄底。"
            )
        tax_diagnosis = diagnosis_zh if lang == "zh" else (diagnosis_hy if lang == "hybrid" else diagnosis_en)

        # 7. 👨‍⚖️ CIO Agent Executive Verdict & Position Sizing (No static checklist duplication)
        if is_prosperity_trap:
            verdict = "PASS_PROSPERITY_TRAP" if lang == "en" else ("景气度陷阱否决" if lang == "zh" else "景气度陷阱否决 (PASS - Trap)")
            position_size = "0% (Multiple compression risk due to terminal saturation)." if lang == "en" else "0% 仓位（触发景气度陷阱，高增速无法外推，估值面临大幅压缩）。"
            rationale_zh = (
                f"综合多空审议，{company} ({symbol}) 当前估值过度透支远期预期，逆向DCF隐含利润倍数达 {ceiling_mult}x，已触发终局景气度陷阱预警（{trap_reason or '高增速外推不可持续'}）。"
                f"尽管当前财务报表短期亮眼，但未来面临估值中枢大幅下修风险，投委会一致决定一票否决暂不建仓。"
            )
            rationale_en = (
                f"Weighing the debate, {company} ({symbol}) triggered a terminal saturation prosperity trap warning ({trap_reason or 'growth multiple compression'}). "
                f"Reverse-DCF implies an elevated 10Y ceiling multiple of {ceiling_mult}x. The CIO committee recommends passing to protect against valuation multiple derating."
            )
            rationale_hy = (
                f"综合多空审议，{company} ({symbol}) 触发 Prosperity Trap 景气度陷阱预警（{trap_reason or '终局增速见顶'}）。"
                f"逆向DCF隐含天花板倍数达 {ceiling_mult}x，估值存在大幅压缩风险，投委会决定 Pass 暂不建仓。"
            )
        elif has_buy_bracket and price <= buy_max:
            verdict = "ACCUMULATE IN BRACKETS" if lang == "en" else ("建议买入 (分批建仓)" if lang == "zh" else "建议买入 (BUY - Accumulate)")
            if taxonomy == "TREE":
                position_size = "80/20 Core SAA: Allocate 3% - 5% core compounding weight." if lang == "en" else "80/20 哑铃策略：配置 3% - 5% 核心 SAA 种树复利仓位。"
            elif taxonomy == "GRAIN":
                position_size = "80/20 Core/Satellite: Allocate 2% - 4% cyclical/dividend value position." if lang == "en" else "春播秋收策略：配置 2% - 4% 种粮周期高股息仓位，估值达到上限及时收割。"
            else:
                position_size = "Satellite TAA: Max 2% trial position with right-side trend & hard stop." if lang == "en" else "种菜股卫星仓位：试仓上限 2%，严格依托右侧温度与 -7% 硬止损。"

            rationale_zh = (
                f"综合多空审议，{company} ({symbol}) 当前实时股价 ${price} {curr} 稳居理想买入区间 (${buy_min} - ${buy_max} {curr}) 内，风险收益比达 {rr_ratio}:1。"
                f"公司具备 {moat} 竞争壁垒与 {fcf_quality}，当前价位相比 DCF 固有价值 (${dcf_fair_value} {curr}) 具备充沛安全边际，投委会建议按纪律分批建仓吸纳。"
            )
            rationale_en = (
                f"Synthesizing the debate, {company} (${price} {curr}) is trading favorably within the safe buy bracket (${buy_min} - ${buy_max} {curr}) with an attractive {rr_ratio}:1 Risk-Reward ratio. "
                f"Backed by {moat} and {fcf_quality}, entry at current levels provides adequate margin of safety towards fair value (${dcf_fair_value} {curr})."
            )
            rationale_hy = (
                f"综合多空研报，{company} 实时价格 ${price} {curr} 稳居安全买入区间 (${buy_min} - ${buy_max} {curr})，Risk-Reward 为 {rr_ratio}:1。"
                f"依托 {moat} 护城河与 {fcf_quality}，当前估值相比 DCF 目标价 (${dcf_fair_value} {curr}) 安全边际充足，投委会建议按纪律分批建仓。"
            )
        elif not has_buy_bracket:
            verdict = "TREND_ONLY_NO_DCF" if lang == "en" else ("仅限趋势交易" if lang == "zh" else "仅限趋势 (TREND_ONLY)")
            position_size = "Satellite TAA: Max 2% satellite position strictly with hard stop-loss." if lang == "en" else "卫星仓位上限2%，严格按趋势温度与硬止损操作。"
            rationale_zh = f"{pricing_data.get('timing_advice', '')} 该标的当前缺乏确定性长期自由现金流估值模型，投委会建议仅限顺势战术交易，严格依托技术均线与止损纪律执行，严禁左侧盲目死扛。"
            rationale_en = f"{pricing_data.get('timing_advice', '')} The stock lacks a predictable long-term DCF model. Capital allocation must remain tactical and disciplined, strictly anchored to moving averages and risk parameters."
            rationale_hy = f"{pricing_data.get('timing_advice', '')} 标的缺乏确定性 DCF 模型，投委会建议仅限顺势战术交易，严格执行均线与止损纪律。"
        elif price <= pricing_data.get("fifty_day_sma", price * 1.05):
            verdict = "HOLD / WATCH PULLBACK" if lang == "en" else ("观望等待 (等待回调)" if lang == "zh" else "观望等待 (HOLD - Watch)")
            position_size = "0% new capital (Hold existing position if owned)." if lang == "en" else "0% 新增资金（已持仓者按纪律继续持有）。"
            rationale_zh = (
                f"{company} 当前股价 ${price} {curr} 高于安全买入上限 (${buy_max} {curr})，风险收益比为 {rr_ratio}:1。"
                f"尽管基本面 ({moat}) 依然稳健，但当前缺乏足够估值折价，投委会建议保持耐心，等待价格回调至理想区间 (${buy_min} - ${buy_max} {curr}) 再行分批建仓。"
            )
            rationale_en = (
                f"Price ${price} {curr} for {company} is above safe buy zone (${buy_max} {curr}). Risk-Reward Ratio is {rr_ratio}:1. "
                f"While fundamental quality ({moat}) remains sound, the CIO committee advises patience: wait for price consolidation back into target zone (${buy_min} - ${buy_max} {curr}) before expanding position."
            )
            rationale_hy = (
                f"{company} 当前股价 ${price} {curr} 高于安全买入上限 (${buy_max} {curr})，R/R 为 {rr_ratio}:1。"
                f"基本面虽然扎实，但当前缺乏足够安全垫，投委会建议耐心等待价格回调企稳至安全区间 (${buy_min} - ${buy_max} {curr}) 再行介入。"
            )
        else:
            verdict = "PASS / OVERVALUED" if lang == "en" else ("暂不建仓 (估值偏高)" if lang == "zh" else "暂不建仓 (PASS - Overvalued)")
            position_size = "0% (Avoid buying at current extended valuation)." if lang == "en" else "0% 仓位（避免在当前过度拉升的估值位追高）。"
            if is_above_200:
                rationale_zh = (
                    f"{company} 股价在 200日均线 (${two_hundred_sma} {curr}) 上方过度拉升，风险收益比为 {rr_ratio}:1。"
                    f"当前估值倍数偏高且缺乏足够安全边际，投委会建议暂不追高建仓，等待估值中枢理性回调至 ${buy_max} {curr} 附近。"
                )
                rationale_en = (
                    f"Stock {company} is overextended above 200D SMA (${two_hundred_sma} {curr}) with Risk-Reward Ratio of {rr_ratio}:1. "
                    f"Current multiple lacks sufficient margin of safety against potential mean-reversion pullbacks. The committee recommends passing at current extended levels."
                )
                rationale_hy = (
                    f"{company} 当前股价在 200D SMA (${two_hundred_sma} {curr}) 上方过度拉升，R/R 为 {rr_ratio}:1。"
                    f"缺乏安全边际，投委会建议暂不建仓，等待估值中枢理性回归。"
                )
            else:
                rationale_zh = (
                    f"{company} 股价高于安全买入上限 (${buy_max} {curr}) 且受制于 200日均线阻力位 (${two_hundred_sma} {curr})，风险收益比为 {rr_ratio}:1。"
                    f"投委会建议暂不建仓，耐心等待上方均线阻力消化或价格企稳于 ${buy_max} {curr}。"
                )
                rationale_en = (
                    f"Stock {company} is trading above safe buy ceiling (${buy_max} {curr}) while below 200D SMA resistance (${two_hundred_sma} {curr}). Risk-Reward Ratio is {rr_ratio}:1. "
                    f"Wait for price stabilization near ${buy_max} {curr} before considering position entry."
                )
                rationale_hy = (
                    f"{company} 股价高于安全买入上限且受制于 200D SMA 阻力位 (${two_hundred_sma} {curr})，R/R 为 {rr_ratio}:1。"
                    f"投委会建议暂不建仓，等待上方均线阻力化解或价格企稳。"
                )

        judge_summary = rationale_zh if lang == "zh" else (rationale_hy if lang == "hybrid" else rationale_en)

        cio_verdict = {
            "agent": cio_agent_name,
            "verdict": verdict,
            "position_sizing_advice": position_size,
            "recommended_buy_bracket": f"${buy_min} - ${buy_max} {curr}" if has_buy_bracket else "TREND_ONLY_NO_DCF",
            "risk_reward_ratio": rr_ratio,
            "judge_summary": judge_summary,
            "empirical_proof_verified": True,
            "mianji_framework": {
                "taxonomy": taxonomy,
                "taxonomy_label": tax_label_zh if lang == "zh" else tax_label_en,
                "taxonomy_diagnosis": tax_diagnosis,
                "soul_check": {
                    "urgency_fomo_check": fomo_status,
                    "trend_temperature": trend_temp,
                    "hitting_zone": hitting_zone,
                    "variant_view_penetration": (
                        f"Implied 10Y Ceiling: {ceiling_mult}x | Prosperity Trap: {'YES' if is_prosperity_trap else 'NO'}"
                        if lang == "en" else
                        f"逆向10年利润天花板: {ceiling_mult}x | 景气度陷阱预警: {'已触发' if is_prosperity_trap else '安全'}"
                    ),
                    "bayesian_prior": f"{prior_confidence}% (Cap <=95%)",
                    "mandatory_falsification_trigger": falsification_en if lang == "en" else falsification_zh,
                    "bottom_threshold": bottom_threshold,
                    "is_falsified": is_falsified,
                    "threshold_currency": curr,
                    "implied_ceiling_mult": ceiling_mult,
                    "is_prosperity_trap": is_prosperity_trap
                },
                "barbell_allocation": "Core SAA (80%)" if taxonomy in ["TREE", "GRAIN"] else "Satellite TAA (20%)",
                "qualified_holder_creed": "只做合格持有人：不是人在做投资，是纪律在做投资。" if lang != "en" else "Qualified Holder Mindset: Discipline executes trades, not human emotion."
            }
        }

        return {
            "symbol": symbol,
            "bull_argument": {
                "agent": bull_agent_name,
                "key_points": bull_points,
                "upside_catalyst": bull_catalyst
            },
            "bear_argument": {
                "agent": bear_agent_name,
                "key_points": bear_points,
                "downside_risk": bear_risk
            },
            "cio_verdict": cio_verdict
        }
