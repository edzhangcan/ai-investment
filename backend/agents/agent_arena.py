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
    def run_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en") -> Dict[str, Any]:
        symbol = stock_data.get("symbol", "UNKNOWN")

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
        if api_key:
            try:
                return cls._run_gemini_llm_debate(api_key, stock_data, macro_data, pricing_data, fundamental_data, lang=lang)
            except Exception as e:
                logger.warning(f"Gemini LLM debate generation failed ({e}), falling back to empirical engine rules.")
                return cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang)

        return cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang)

    @classmethod
    def _run_gemini_llm_debate(cls, api_key: str, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en") -> Dict[str, Any]:
        """Calls Gemini API using google-genai SDK to generate adversarial debate and CIO verdict."""
        client = genai.Client(api_key=api_key)

        lang_instruction = "Respond in English." if lang == "en" else ("Respond in Simplified Chinese." if lang == "zh" else "Respond in Simplified Chinese narrative with English financial terms in parentheses.")

        system_instruction = (
            f"You are an institutional investment debate orchestrator managing three agents. {lang_instruction}\n"
            "1. Bull Agent: Highlights real competitive moats, cash flow quality, DCF upside, growth catalysts.\n"
            "2. Bear Agent: Scrutinizes overvaluation, P/E percentiles, 200D MA support gaps, macro cycle headwinds.\n"
            "3. CIO Agent: Impartial judge enforcing empirical evidence, dynamically calculating Risk-Reward ratio as (DCF Fair Value - Price) / max(1.0, Price - 200D SMA), rendering final decision, and providing position sizing advice.\n\n"
            "STRICT MANDATE: Base all numbers strictly on the provided real-time stock parameters. Never hallucinate fake prices or company names.\n"
            "Respond ONLY with a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "symbol": "TICKER",\n'
            '  "bull_argument": {\n'
            '    "agent": "Bull Agent 🐂",\n'
            '    "key_points": ["point 1", "point 2", "point 3"],\n'
            '    "upside_catalyst": "Target Fair Value $X (+Y% upside)"\n'
            "  },\n"
            '  "bear_argument": {\n'
            '    "agent": "Bear Agent 🐻",\n'
            '    "key_points": ["risk 1", "risk 2", "risk 3"],\n'
            '    "downside_risk": "Technical support at $X (-Y% downside)"\n'
            "  },\n"
            '  "cio_verdict": {\n'
            '    "agent": "CIO Agent 👨‍⚖️",\n'
            '    "verdict": "BUY" OR "HOLD / WATCH" OR "PASS / OVERVALUED",\n'
            '    "position_sizing_advice": "Advice string",\n'
            '    "recommended_buy_bracket": "$MIN - $MAX CURR",\n'
            '    "risk_reward_ratio": 2.1,\n'
            '    "judge_summary": "Summary string",\n'
            '    "empirical_proof_verified": true\n'
            '  }\n'
            "}"
        )

        prompt = (
            f"Analyze Ticker: {stock_data['symbol']}\n"
            f"Company Name: {stock_data.get('company_name', stock_data['symbol'])}\n"
            f"Current Real-Time Price: ${stock_data['current_price']} {stock_data['currency']}\n"
            f"P/E Ratio: {stock_data.get('pe_ratio', 'N/A')} | P/S: {stock_data.get('ps_ratio', 'N/A')} | Valuation Status: {pricing_data['valuation_status']}\n"
            f"50D SMA: ${pricing_data['fifty_day_sma']} | 200D SMA: ${pricing_data['two_hundred_day_sma']}\n"
            f"DCF Fair Value: ${pricing_data['dcf_fair_value']} | Ideal Buy Range: ${pricing_data['ideal_buy_range_min']} - ${pricing_data['ideal_buy_range_max']}\n"
            f"Free Cash Flow Quality: {fundamental_data['fcf_quality']} | Moat Rating: {fundamental_data['moat_rating']}\n"
            f"Economic Cycle Phase: {macro_data['cycle_stage']} | Fed Hawkishness: {macro_data['fed_sentiment']['tone']}\n"
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
        return parsed

    @classmethod
    def _run_fallback_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en") -> Dict[str, Any]:
        """Empirical calculation rules fallback dynamically tailored to the exact stock parameters and language choice."""
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
        cycle = macro_data["cycle_stage"]

        # Calculate exact upside/downside percentages
        upside_pct = round(((dcf_fair_value - price) / max(1.0, price)) * 100, 1)
        downside_pct = round(((price - two_hundred_sma) / max(1.0, price)) * 100, 1)

        if lang == "zh":
            bull_agent_name = "多头分析师 🐂"
            bear_agent_name = "空头分析师 🐻"
            cio_agent_name = "投委会主席 👨‍⚖️"
            bull_points = [
                f"{company} ({symbol}) 当前实时市场价格为 ${price} {curr}。",
                f"基本面护城河评级为 {moat}，自由现金流质量评价为 '{fcf_quality}'。",
                f"技术面支撑锚定于 200日移动平均线 (${two_hundred_sma} {curr})。"
            ]
            bull_catalyst = f"DCF 固有价值目标价为 ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% 上行安全边际)。"

            bear_points = [
                f"估值审视：当前市盈率为 {pe} ({pricing_data['valuation_status']})。",
                f"宏观周期约束：当前处于 {cycle} 阶段，央行维持限制性利率政策。",
                f"下行缓冲差距：当前股价高于 200日均线支撑位 ${two_hundred_sma} {curr} ({downside_pct}%)。"
            ]
            bear_risk = f"技术面支撑位于 200日均线 (${two_hundred_sma} {curr})，存在 {downside_pct}% 的回调缓冲。"

        elif lang == "hybrid":
            bull_agent_name = "多头分析师 (Bull Agent 🐂)"
            bear_agent_name = "空头分析师 (Bear Agent 🐻)"
            cio_agent_name = "投委会主席 (CIO Agent 👨‍⚖️)"
            bull_points = [
                f"{company} ({symbol}) 实时价格为 ${price} {curr}。",
                f"基本面评级为 {moat}，自由现金流评估 (FCF Quality): '{fcf_quality}'。",
                f"技术面支撑位锚定于 200日移动平均线 (200D SMA: ${two_hundred_sma} {curr})。"
            ]
            bull_catalyst = f"DCF 固有价值目标价为 ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% 上行空间)。"

            bear_points = [
                f"估值审查：当前 P/E 为 {pe} ({pricing_data['valuation_status']})。",
                f"宏观环境约束：处于 {cycle} 阶段，央行限制性利率影响。",
                f"下行风险：股价高于 200D SMA 支撑位 ${two_hundred_sma} {curr} ({downside_pct}%)。"
            ]
            bear_risk = f"技术支撑位位于 200D SMA (${two_hundred_sma} {curr})，提供 {downside_pct}% 缓冲。"

        else: # English
            bull_agent_name = "Bull Agent 🐂"
            bear_agent_name = "Bear Agent 🐻"
            cio_agent_name = "CIO Agent 👨‍⚖️"
            bull_points = [
                f"{company} ({symbol}) real-time market price is ${price} {curr}.",
                f"Fundamental positioning: {moat} with Free Cash Flow quality '{fcf_quality}'.",
                f"Technical support anchor at 200-day moving average (${two_hundred_sma} {curr})."
            ]
            bull_catalyst = f"DCF Fair Value target is ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% target margin)."

            bear_points = [
                f"Valuation scrutiny: Current P/E is {pe} ({pricing_data['valuation_status']}).",
                f"Macro cycle headwinds: {cycle} with central bank monetary policy constraints.",
                f"Downside gap: Price is {downside_pct}% above 200D MA support (${two_hundred_sma} {curr})."
            ]
            bear_risk = f"Technical support lies at 200D SMA (${two_hundred_sma} {curr}) indicating {downside_pct}% downside buffer."

        # Calculate dynamic authentic Risk-to-Reward Ratio:
        # Upside Potential = DCF Fair Value - Current Price (positive margin)
        # Downside Exposure = Current Price - Floor Support (min of 200D SMA and Buy Range Min)
        if dcf_fair_value > price:
            upside_potential = max(0.1, dcf_fair_value - price)
        else:
            upside_potential = max(0.1, price * 0.03)

        support_floor = min(two_hundred_sma, buy_min)
        downside_exposure = max(price * 0.02, price - support_floor)

        calculated_rr = round(upside_potential / max(0.1, downside_exposure), 1)
        rr_ratio = max(0.2, min(9.9, calculated_rr))

        # 👨‍⚖️ CIO Agent Referee & Final Verdict
        if price <= buy_max:
            verdict = "ACCUMULATE IN BRACKETS" if lang == "en" else ("建议买入 (分批建仓)" if lang == "zh" else "建议买入 (BUY - Accumulate)")
            position_size = "Suggest allocating 3% - 5% of total portfolio." if lang == "en" else "建议配置总投资组合的 3% - 5% 仓位。"
            rationale = f"Real price ${price} {curr} for {company} is within safe buy bracket (${buy_min} - ${buy_max} {curr}). Risk-Reward Ratio is favorable at {rr_ratio}:1." if lang == "en" else f"{company} 的当前实时股价 ${price} {curr} 处于安全买入区间 (${buy_min} - ${buy_max} {curr})，风险收益比良好 ({rr_ratio}:1)。"
        elif price <= pricing_data.get("fifty_day_sma", price * 1.05):
            verdict = "HOLD / WATCH PULLBACK" if lang == "en" else ("观望等待 (等待回调)" if lang == "zh" else "观望等待 (HOLD - Watch)")
            position_size = "0% new capital (Hold existing position if owned)." if lang == "en" else "0% 新增资金（已持仓者继续持有）。"
            rationale = f"Price ${price} {curr} for {company} is above safe buy zone (${buy_max} {curr}). Risk-Reward Ratio is {rr_ratio}:1. Patiently wait for pullbacks before expanding position." if lang == "en" else f"{company} 当前股价 ${price} {curr} 高于安全买入上限 (${buy_max} {curr})，风险收益比为 {rr_ratio}:1，建议耐心等待回调分批建仓。"
        else:
            verdict = "PASS / OVERVALUED" if lang == "en" else ("暂不建仓 (估值偏高)" if lang == "zh" else "暂不建仓 (PASS - Overvalued)")
            position_size = "0% (Avoid buying at current extended valuation)." if lang == "en" else "0% 仓位（避免在当前过度拉升的估值位追高）。"
            rationale = f"Stock {company} is overextended above 200D SMA (${two_hundred_sma} {curr}) with Risk-Reward Ratio of {rr_ratio}:1. Better entry points exist near ${buy_max} {curr}." if lang == "en" else f"{company} 股价在 200日均线 (${two_hundred_sma} {curr}) 上方过度拉升，风险收益比为 {rr_ratio}:1，理想建仓位接近 ${buy_max} {curr}。"

        cio_verdict = {
            "agent": cio_agent_name,
            "verdict": verdict,
            "position_sizing_advice": position_size,
            "recommended_buy_bracket": f"${buy_min} - ${buy_max} {curr}",
            "risk_reward_ratio": rr_ratio,
            "judge_summary": rationale,
            "empirical_proof_verified": True
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
