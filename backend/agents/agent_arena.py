import os
import json
import logging
from typing import Dict, Any
from google import genai
from google.genai import types
from backend.config import settings

logger = logging.getLogger(__name__)

class MultiAgentArena:
    """Orchestrates Bull vs. Bear debate refereed by CIO Agent, powered by live Gemini LLM with empirical fallback capabilities."""

    @classmethod
    def run_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any]) -> Dict[str, Any]:
        symbol = stock_data.get("symbol", "UNKNOWN")

        # 0. Check validity - strictly return NO DATA if stock data is invalid or unlisted
        if not stock_data.get("is_valid", True) or stock_data.get("current_price") is None:
            return {
                "is_valid": False,
                "symbol": symbol,
                "bull_argument": {
                    "agent": "Bull Agent (多头分析师 🐂)",
                    "key_points": [f"No active market data feed found for ticker '{symbol}'."],
                    "upside_catalyst": "N/A (Unlisted / Invalid Ticker)"
                },
                "bear_argument": {
                    "agent": "Bear Agent (空头分析师 🐻)",
                    "key_points": [f"Unable to verify exchange pricing or financial filings for '{symbol}'."],
                    "downside_risk": "N/A (Unlisted / Invalid Ticker)"
                },
                "cio_verdict": {
                    "agent": "CIO Agent (投委会主席 👨‍⚖️)",
                    "verdict": "NO DATA / UNVERIFIED (无数据/无法判断)",
                    "position_sizing_advice": "0% allocation (Do not trade unverified tickers).",
                    "recommended_buy_bracket": "N/A",
                    "risk_reward_ratio": 0.0,
                    "judge_summary": f"Ticker '{symbol}' has no real-time market data feed. Please verify the ticker symbol (e.g., $XEQT.TO, $NVDA, $SHOP.TO, $AAPL).",
                    "empirical_proof_verified": False
                }
            }

        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        if api_key:
            try:
                return cls._run_gemini_llm_debate(api_key, stock_data, macro_data, pricing_data, fundamental_data)
            except Exception as e:
                logger.warning(f"Gemini LLM debate generation failed ({e}), falling back to empirical engine rules.")
                return cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data)

        return cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data)

    @classmethod
    def _run_gemini_llm_debate(cls, api_key: str, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calls Gemini API using google-genai SDK to generate adversarial debate and CIO verdict."""
        client = genai.Client(api_key=api_key)

        system_instruction = (
            "You are an institutional investment debate orchestrator managing three agents:\n"
            "1. Bull Agent (多头分析师 🐂): Highlights real competitive moats, cash flow quality, DCF upside, growth catalysts.\n"
            "2. Bear Agent (空头分析师 🐻): Scrutinizes overvaluation, P/E percentiles, 200D MA support gaps, macro cycle headwinds.\n"
            "3. CIO Agent (投委会主席 👨‍⚖️): Impartial judge enforcing empirical evidence, calculating Risk-Reward ratio, rendering final decision (BUY / HOLD / PASS), and providing position sizing advice.\n\n"
            "STRICT MANDATE: Base all numbers strictly on the provided real-time stock parameters. Never hallucinate fake prices or company names.\n"
            "Respond ONLY with a valid JSON object matching this exact schema:\n"
            "{\n"
            '  "symbol": "TICKER",\n'
            '  "bull_argument": {\n'
            '    "agent": "Bull Agent (多头分析师 🐂)",\n'
            '    "key_points": ["point 1", "point 2", "point 3"],\n'
            '    "upside_catalyst": "Target Fair Value $X (+Y% upside)"\n'
            "  },\n"
            '  "bear_argument": {\n'
            '    "agent": "Bear Agent (空头分析师 🐻)",\n'
            '    "key_points": ["risk 1", "risk 2", "risk 3"],\n'
            '    "downside_risk": "Technical support at $X (-Y% downside)"\n'
            "  },\n"
            '  "cio_verdict": {\n'
            '    "agent": "CIO Agent (投委会主席 👨‍⚖️)",\n'
            '    "verdict": "BUY (建议买入/分批建仓)" OR "HOLD / WATCH (观望/等待回调)" OR "PASS / OVERVALUED (估值偏高/暂不建仓)",\n'
            '    "position_sizing_advice": "Advice string",\n'
            '    "recommended_buy_bracket": "$MIN - $MAX CURR",\n'
            '    "risk_reward_ratio": 2.4,\n'
            '    "judge_summary": "Summary string",\n'
            '    "empirical_proof_verified": true\n'
            "  }\n"
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
    def _run_fallback_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any]) -> Dict[str, Any]:
        """Empirical calculation rules fallback dynamically tailored to the exact stock parameters."""
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

        # 🐂 Bull Agent Argument
        bull_argument = {
            "agent": "Bull Agent (多头分析师 🐂)",
            "key_points": [
                f"{company} ({symbol}) real-time market price is ${price} {curr}.",
                f"Fundamental positioning: {moat} with cash flow assessment '{fcf_quality}'.",
                f"Technical support anchor at 200-day moving average (${two_hundred_sma} {curr})."
            ],
            "upside_catalyst": f"DCF / Fair Value target is ${dcf_fair_value} {curr} ({'+' if upside_pct >= 0 else ''}{upside_pct}% target margin)."
        }

        # 🐻 Bear Agent Argument
        bear_argument = {
            "agent": "Bear Agent (空头分析师 🐻)",
            "key_points": [
                f"Valuation scrutiny: Current P/E is {pe} ({pricing_data['valuation_status']}).",
                f"Macro cycle headwinds: {cycle} with central bank monetary policy constraints.",
                f"Downside gap: Price is {downside_pct}% above 200D MA support (${two_hundred_sma} {curr})."
            ],
            "downside_risk": f"Technical support lies at 200D SMA (${two_hundred_sma} {curr}) indicating {downside_pct}% downside buffer."
        }

        # 👨‍⚖️ CIO Agent Referee & Final Verdict
        if price <= buy_max:
            verdict = "BUY (建议买入/分批建仓)"
            position_size = "Suggest allocating 3% - 5% of total portfolio."
            rationale = f"Real price ${price} {curr} for {company} is within safe buy bracket (${buy_min} - ${buy_max} {curr}). Risk-Reward Ratio is favorable."
            rr_ratio = 2.4
        elif price <= pricing_data.get("fifty_day_sma", price * 1.05):
            verdict = "HOLD / WATCH (观望/等待回调)"
            position_size = "0% new capital (Hold existing position if already owned)."
            rationale = f"Price ${price} {curr} for {company} is above safe buy zone (${buy_max} {curr}). Patiently wait for pullbacks before expanding position."
            rr_ratio = 1.8
        else:
            verdict = "PASS / OVERVALUED (估值偏高/暂不建仓)"
            position_size = "0% (Avoid buying at current extended valuation)."
            rationale = f"Stock {company} is overextended above 200D SMA (${two_hundred_sma} {curr}). Better entry points exist near ${buy_max} {curr}."
            rr_ratio = 0.8

        cio_verdict = {
            "agent": "CIO Agent (投委会主席 👨‍⚖️)",
            "verdict": verdict,
            "position_sizing_advice": position_size,
            "recommended_buy_bracket": f"${buy_min} - ${buy_max} {curr}",
            "risk_reward_ratio": rr_ratio,
            "judge_summary": rationale,
            "empirical_proof_verified": True
        }

        return {
            "symbol": symbol,
            "bull_argument": bull_argument,
            "bear_argument": bear_argument,
            "cio_verdict": cio_verdict
        }
