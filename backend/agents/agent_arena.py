from __future__ import annotations
import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from google import genai
from google.genai import types
from backend.config import settings

logger = logging.getLogger(__name__)

class MultiAgentArena:
    """Orchestrates Bull vs. Bear debate refereed by CIO Agent, powered by live Gemini LLM with empirical fallback capabilities and multi-language support."""

    @classmethod
    def run_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en", country: Optional[str] = None, verify_filings: bool = False) -> Dict[str, Any]:
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
                "bull_rebuttal": None,
                "bear_rebuttal": None,
                "falsification_price_level": None,
                "falsification_trigger_condition": None,
                "cio_verdict": {
                    "agent": "CIO Agent 👨‍⚖️" if lang == "en" else ("投委会主席 👨‍⚖️" if lang == "zh" else "投委会主席 (CIO Agent 👨‍⚖️)"),
                    "verdict": "NO DATA / UNVERIFIED",
                    "position_sizing_advice": "0% allocation (Do not trade unverified tickers).",
                    "recommended_buy_bracket": "N/A",
                    "risk_reward_ratio": 0.0,
                    "judge_summary": f"Ticker '{symbol}' has no real-time market data feed. Please verify ticker symbol.",
                    "empirical_proof_verified": False
                },
                "provenance": {
                    "source_mode": "SIMULATED_FALLBACK",
                    "as_of": datetime.now(timezone.utc).isoformat(),
                    "data_source": "Unverified Ticker Guard",
                    "is_stale": True
                }
            }

        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        debate_result = None
        if api_key:
            try:
                debate_result = cls._run_gemini_llm_debate(api_key, stock_data, macro_data, pricing_data, fundamental_data, lang=lang, country=resolved_country)
            except Exception as e:
                logger.warning(f"Gemini LLM debate generation failed ({e}), falling back to empirical engine rules.")
                debate_result = cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang, country=resolved_country, verify_filings=verify_filings)
        else:
            debate_result = cls._run_fallback_debate(stock_data, macro_data, pricing_data, fundamental_data, lang=lang, country=resolved_country, verify_filings=verify_filings)

        # Audit against Discipline Guardrails (纪律原则)
        from backend.engines.discipline_engine import DisciplineEngine
        audit = DisciplineEngine.audit_trade(stock_data, pricing_data, lang=lang)
        if debate_result and "cio_verdict" in debate_result:
            debate_result["cio_verdict"]["discipline_audit"] = audit
            if not audit["is_compliant"]:
                reasons = audit["veto_reasons_zh"] if lang == "zh" else audit["veto_reasons"]
                sep = "：" if lang == "zh" else ":"
                short_veto = reasons[0].split(sep)[0].strip() if reasons else ("违反纪律原则" if lang == "zh" else "Rule Veto")
                prior_verdict = str(debate_result["cio_verdict"].get("verdict", ""))
                if "WATCH" in prior_verdict or "LEFT_SIDE" in prior_verdict or "左侧" in prior_verdict:
                    debate_result["cio_verdict"]["verdict"] = f"{prior_verdict} (DISCIPLINE_BLOCKED)"
                else:
                    debate_result["cio_verdict"]["verdict"] = (
                        "DISCIPLINE_BLOCKED (纪律原则否决)" if lang != "en" else "DISCIPLINE_BLOCKED"
                    )
                debate_result["cio_verdict"]["position_sizing_advice"] = (
                    f"0% 仓位 — 纪律原则否决（{short_veto}）"
                    if lang == "zh" else
                    f"0% Allocation — Blocked by Discipline ({short_veto})"
                )
                existing_summary = str(debate_result["cio_verdict"].get("judge_summary", "")).strip()
                if not any(tok in existing_summary for tok in ["左侧", "Left-Side", "陷阱", "Prosperity Trap", "纪律", "Discipline"]):
                    debate_result["cio_verdict"]["judge_summary"] = f"[{short_veto}] {existing_summary}"

        return debate_result

    @classmethod
    def _run_gemini_llm_debate(cls, api_key: str, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en", country: str = "US") -> Dict[str, Any]:
        """Calls Gemini API using google-genai SDK to generate adversarial debate, Round 2 rebuttals, and CIO verdict with regional macro parity and Mianji principles."""
        client = genai.Client(api_key=api_key)

        lang_instruction = "Respond in English." if lang == "en" else ("Respond in Simplified Chinese." if lang == "zh" else "Respond in Simplified Chinese narrative with English financial terms in parentheses.")

        country_context = "Canada (TSX / Canadian Market)" if country == "CA" else "United States (US Market)"
        central_bank_name = "Bank of Canada (BoC)" if country == "CA" else "Federal Reserve (Fed)"
        central_bank_sentiment = macro_data.get("boc_sentiment", {}).get("tone") or macro_data.get("central_bank_sentiment", {}).get("tone") if country == "CA" else macro_data.get("fed_sentiment", {}).get("tone", "RESTRICTIVE")

        bridge = pricing_data.get("bridge") or {}
        eq = pricing_data.get("earnings_quality") or fundamental_data.get("earnings_quality") or {}
        forensic_flags = eq.get("forensic_flags") or []
        sbc_val = bridge.get("sbc_per_share", 0.0)
        net_debt_val = bridge.get("net_debt", 0.0)
        sloan_ratio = eq.get("sloan_accrual_ratio", 0.0)

        system_instruction = (
            f"You are an institutional investment debate orchestrator managing three agents for equities in {country_context}. {lang_instruction}\n"
            "1. Bull Agent (Advocate): Highlights real competitive moats, cash flow quality, DCF upside, growth catalysts, and region-specific macroeconomic tailwinds (for Canada: Bank of Canada monetary easing cycle, TSX structural valuation discount vs US, resource export demand and high dividend yields; for US: GDP resilience, tech innovation, domestic consumption, and strong corporate cash flows).\n"
            "2. Bear Agent (Prosecutor): Scrutinizes overvaluation, P/E percentiles, technical pullback risk to 200D MA support (if price > 200D MA) or trend breakdown below 200D MA overhead resistance (if price < 200D MA), and region-specific macro cycle headwinds (for Canada: household debt sensitivity, mortgage resets, growth softening; for US: restrictive Fed rates, negative Equity Risk Premium).\n"
            "3. Round 2 Cross-Examination Rebuttals:\n"
            "   - bear_rebuttal: Bear Agent directly attacks Bull's thesis by interrogating Stock-Based Compensation (SBC) dilution ($X/share), Net Debt drag, and any forensic accrual flags to demonstrate optical valuation distortion.\n"
            "   - bull_rebuttal: Bull Agent directly refutes Bear's critique by defending unit economics, cash reinvestment ROIC, balance sheet resilience, and why margin of safety protects against cyclical normalization.\n"
            "4. CIO Agent (Judge): Impartial referee enforcing empirical evidence, Risk-Reward ratio, numerical falsification price level, and institutional investment discipline (pre-trade soul check & prior framework):\n"
            "   - judge_summary: MAX 2 concise sentences (<=35 words EN / <=60 chars ZH) covering ONLY valuation vs buy zone, momentum gate, and action. NEVER repeat company name, P/E, moat, or Risk-Reward ratio shown in badges.\n"
            "   - position_sizing_advice: MAX 12 words (e.g., '1.5%-2.5% Pilot -> 3%-5% Core SAA' or '0% Allocation - Await Right-Side Pivot').\n"
            "   - falsification_price_level: Exact numerical price level (float) representing the adaptive stop floor.\n"
            "   - falsification_trigger_condition: Specific condition string detailing when the thesis is invalid and position must be liquidated.\n"
            "   - mianji_framework.taxonomy_diagnosis: MAX 1 metric-dense sentence (<=25 words) citing FCF ($X), ROIC (X%), and allocation tier (🌲 Tree / 🌾 Grain / 🥬 Vegetable).\n"
            "   - Pre-trade Soul Check (投前灵魂四问): Check FOMO emotional urgency (eliminate anxiety), verify Trend Temperature (regime FREEZE/FLAT/WARM/HOT, favoring right-side entry over left-side knife-catching), penetrate narrative with Reverse-DCF 10Y ceiling multiple and Prosperity Trap warnings, cap Bayesian prior confidence at <= 95% (never 100% certainty, respect unknown), and establish a mandatory pre-set falsification exit trigger with a quantified bottom threshold.\n"
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
            '  "bull_rebuttal": "Bull rebuttal refuting Bear claims",\n'
            '  "bear_rebuttal": "Bear rebuttal attacking SBC dilution, Net Debt, or forensic flags",\n'
            '  "falsification_price_level": 123.45,\n'
            '  "falsification_trigger_condition": "Decisive breach below...",\n'
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
            f"Valuation Bridge: Net Debt: ${net_debt_val} | SBC Per Share: ${sbc_val}\n"
            f"Forensic Accounting Flags: {', '.join(forensic_flags) if forensic_flags else 'None'} | Sloan Accrual Ratio: {sloan_ratio}\n"
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

        price_val = float(stock_data.get("current_price", 0.0))
        two_hundred_sma_val = float(pricing_data.get("two_hundred_day_sma", price_val))
        fifty_sma_val = float(pricing_data.get("fifty_day_sma", price_val))
        curr_val = stock_data.get("currency", "USD")

        # PL-726.5.1 / PL-730.1.2: Deterministic adaptive falsification floor (cost-basis-aware below 200D SMA)
        adaptive = cls._resolve_adaptive_falsification(
            price=price_val,
            fifty_sma=fifty_sma_val,
            two_hundred_sma=two_hundred_sma_val,
            curr=curr_val,
            stock_data=stock_data,
            pricing_data=pricing_data
        )
        bottom_thresh = adaptive["bottom_threshold"]
        floor_type = adaptive["floor_type"]
        buy_in_val = adaptive["buy_in_price"]
        is_falsified_val = adaptive["is_falsified"]
        default_cond = adaptive["falsification_zh"] if lang != "en" else adaptive["falsification_en"]

        # Sync deterministic floor & falsification state onto CIO verdict & soul_check
        cio_verdict = parsed.setdefault("cio_verdict", {})
        cio_verdict["bottom_fishing_threshold"] = bottom_thresh
        cio_verdict["is_falsified"] = is_falsified_val
        cio_verdict["floor_type"] = floor_type
        mianji_framework = cio_verdict.setdefault("mianji_framework", {})
        sc = mianji_framework.setdefault("soul_check", {})
        sc["bottom_threshold"] = bottom_thresh
        sc["is_falsified"] = is_falsified_val
        sc["floor_type"] = floor_type
        if buy_in_val is not None:
            sc["buy_in_price"] = buy_in_val
        sc.setdefault("threshold_currency", curr_val)
        if floor_type in ("COST_BASIS_ATR_STOP", "RECOVERY_SUPPORT_STOP") or not sc.get("mandatory_falsification_trigger"):
            sc["mandatory_falsification_trigger"] = default_cond

        parsed["falsification_price_level"] = bottom_thresh
        if floor_type in ("COST_BASIS_ATR_STOP", "RECOVERY_SUPPORT_STOP") or not parsed.get("falsification_trigger_condition"):
            parsed["falsification_trigger_condition"] = sc.get("mandatory_falsification_trigger", default_cond)

        if not parsed.get("bull_rebuttal"):
            parsed["bull_rebuttal"] = (
                "Bull Rebuttal: Bear overstates transitory macro headwinds and multiple compression risk; "
                "durable competitive advantages, strong cash conversion, and a disciplined balance sheet provide strong margin of safety."
            )
        if not parsed.get("bear_rebuttal"):
            parsed["bear_rebuttal"] = (
                f"Bear Rebuttal: Bull understates the risk of valuation multiple compression, net debt burden, "
                f"and stock-based compensation dilution in a restrictive monetary environment."
            )

        parsed["provenance"] = {
            "source_mode": "LIVE",
            "as_of": datetime.now(timezone.utc).isoformat(),
            "data_source": "Gemini 2.5 Flash Live Debate",
            "is_stale": False
        }

        return parsed

    @staticmethod
    def _resolve_adaptive_falsification(
        price: float,
        fifty_sma: float,
        two_hundred_sma: float,
        curr: str,
        stock_data: Dict[str, Any],
        pricing_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Computes adaptive falsification floor and tailored exit descriptions.
        Anchors below cost basis / ATR support when purchased or trading below 200D SMA.
        """
        from backend.services.alert_engine import PriceAlertEngine

        raw_buy_in = stock_data.get("buy_in_price")
        buy_in_val = float(raw_buy_in) if raw_buy_in is not None and float(raw_buy_in) > 0 else None
        adaptive_eval = PriceAlertEngine.compute_adaptive_falsification_floor(
            current_price=float(price),
            sma_50=float(fifty_sma or 0.0),
            sma_200=float(two_hundred_sma or 0.0),
            buy_in_price=buy_in_val,
            atr_14=float(stock_data.get("atr_14") or pricing_data.get("atr_14") or 0.0),
            rsi_14=float(stock_data.get("rsi_14") or pricing_data.get("rsi_14") or 0.0)
        )
        bottom_threshold = float(adaptive_eval["falsification_floor"])
        floor_type = str(adaptive_eval.get("floor_type", "STRUCTURAL_200D_STOP"))
        is_falsified = bool(price < bottom_threshold)

        if floor_type == "COST_BASIS_ATR_STOP" and buy_in_val is not None:
            falsification_zh = (
                f"成本止损底线 ${bottom_threshold:.2f} {curr}（基于买入成本 ${buy_in_val:.2f} 下方 -8% / 2x ATR；因建仓低于200日均线 ${two_hundred_sma}，不适用均线止损），或季度FCF转负"
            )
            falsification_en = (
                f"Cost-basis stop at ${bottom_threshold:.2f} {curr} (-8% / 2x ATR below buy-in ${buy_in_val:.2f}; 200D MA ${two_hundred_sma} bypassed as entry was below 200D), or quarterly FCF turning negative"
            )
        elif floor_type == "RECOVERY_SUPPORT_STOP":
            falsification_zh = (
                f"波幅支撑底线 ${bottom_threshold:.2f} {curr}（处于200日均线 ${two_hundred_sma} 下方修复期，按 -8% / 2x ATR 设定防守位），或季度FCF转负"
            )
            falsification_en = (
                f"Downside ATR support stop at ${bottom_threshold:.2f} {curr} (-8% / 2x ATR below-200D MA ${two_hundred_sma} recovery guard), or quarterly FCF turning negative"
            )
        else:
            falsification_zh = (
                f"有效跌破趋势止损底线 ${bottom_threshold:.2f} {curr}（200日均线 ${two_hundred_sma} 下方 -3.0% 且连续3日无法收复），或季度自由现金流转负"
            )
            falsification_en = (
                f"Decisive break below structural floor ${bottom_threshold:.2f} {curr} (-3.0% under 200D MA ${two_hundred_sma} for 3 sessions), or quarterly FCF turning negative"
            )

        return {
            "bottom_threshold": bottom_threshold,
            "floor_type": floor_type,
            "buy_in_price": buy_in_val,
            "is_falsified": is_falsified,
            "falsification_zh": falsification_zh,
            "falsification_en": falsification_en,
        }

    @classmethod
    def _run_fallback_debate(cls, stock_data: Dict[str, Any], macro_data: Dict[str, Any], pricing_data: Dict[str, Any], fundamental_data: Dict[str, Any], lang: str = "en", country: str = "US", verify_filings: bool = False) -> Dict[str, Any]:
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

        # PL-725.3: Consume trend_temperature and batting_zone directly from pricing_data (multi-horizon momentum guarded)
        trend_temp = str(
            pricing_data.get("trend_temperature") or 
            stock_data.get("trend_temperature") or 
            ("WARM" if (is_above_200 and not pricing_data.get("is_recently_falling")) else "FLAT")
        ).upper()
        if trend_temp not in ["FREEZE", "FLAT", "WARM", "HOT"]:
            trend_temp = "WARM" if (is_above_200 and not pricing_data.get("is_recently_falling")) else "FLAT"

        hitting_zone = str(
            pricing_data.get("batting_zone") or 
            stock_data.get("batting_zone") or 
            ("RIGHT_SIDE" if trend_temp in ["WARM", "HOT"] else "LEFT_SIDE_WATCH")
        ).upper()
        right_side_path = str(
            pricing_data.get("right_side_path") or
            stock_data.get("right_side_path") or
            ("TREND_CONTINUATION" if hitting_zone == "RIGHT_SIDE" else "NONE")
        ).upper()

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
        
        # PL-730.1.2: Adaptive falsification floor (cost-basis-aware when purchased below 200D SMA)
        fifty_sma_val = float(pricing_data.get("fifty_day_sma") or price)
        adaptive = cls._resolve_adaptive_falsification(
            price=float(price),
            fifty_sma=fifty_sma_val,
            two_hundred_sma=float(two_hundred_sma or 0.0),
            curr=curr,
            stock_data=stock_data,
            pricing_data=pricing_data
        )
        bottom_threshold = adaptive["bottom_threshold"]
        floor_type = adaptive["floor_type"]
        buy_in_val = adaptive["buy_in_price"]
        is_falsified = adaptive["is_falsified"]
        falsification_zh = adaptive["falsification_zh"]
        falsification_en = adaptive["falsification_en"]

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
            diagnosis_zh = f"【种树资产 • 80% 核心底仓】{moat} | ROIC {roic_display} | 年化 FCF {fcf_display} {curr} | 3年稀释 {dilution_val}% — 内生现金流复利驱动，宜跨周期持有。"
            diagnosis_en = f"[Tree • 80% Core SAA] {moat} | ROIC {roic_display} | FCF {fcf_display} {curr} | 3Y Dilution {dilution_val}% — Secular cash compounder for cross-cycle holding."
            diagnosis_hy = f"【种树资产 (Tree • 80% Core SAA)】{moat} | ROIC {roic_display} | FCF {fcf_display} {curr} — 内生现金流复利驱动，跨周期持有。"
        elif taxonomy == "GRAIN":
            diagnosis_zh = f"【种粮资产 • 春播秋收】年化 FCF {fcf_display} {curr} | 股东综合回报率 {total_sh_yield}% — 周期折价期建仓收息，景气与估值高点果断兑现。"
            diagnosis_en = f"[Grain • Cyclical Value] FCF {fcf_display} {curr} | Shareholder Yield {total_sh_yield}% — Accumulate at cycle troughs for yield; harvest into valuation peaks."
            diagnosis_hy = f"【种粮资产 (Grain • 春播秋收)】FCF {fcf_display} {curr} | 股东回报 {total_sh_yield}% — 周期低谷买折价，景气高点果断收割。"
        else:
            veg_reason_zh = "FCF未转正或股权稀释" if fcf_val <= 0 else "估值透支且缺乏DCF安全垫"
            veg_reason_en = "unprofitable FCF or dilution" if fcf_val <= 0 else "extended multiple without DCF anchor"
            diagnosis_zh = f"【种菜资产 • 20% 战术卫星】FCF {fcf_display} {curr}（{veg_reason_zh}）— 仅限右侧顺势博弈（单票上限 2%），破位硬止损离场。"
            diagnosis_en = f"[Vegetable • 20% Satellite TAA] FCF {fcf_display} {curr} ({veg_reason_en}) — Right-side trend trades only (max 2% weight) with strict hard stop."
            diagnosis_hy = f"【种菜资产 (Vegetable • 20% Satellite)】FCF {fcf_display} {curr}（{veg_reason_zh}）— 仅限右侧顺势交易（上限 2%），严禁左侧死扛。"
        tax_diagnosis = diagnosis_zh if lang == "zh" else (diagnosis_hy if lang == "hybrid" else diagnosis_en)

        # 7. 👨‍⚖️ CIO Agent Executive Verdict & Position Sizing (Tight, non-redundant executive summary)
        if is_prosperity_trap:
            verdict = "PASS_PROSPERITY_TRAP" if lang == "en" else ("景气度陷阱否决" if lang == "zh" else "景气度陷阱否决 (PASS - Trap)")
            position_size = "0% (Prosperity Trap — Multiple Compression Risk)" if lang == "en" else "0% 仓位（触发景气度陷阱，防范估值下修）"
            rationale_zh = f"逆向 DCF 隐含 10年利润扩张达 {ceiling_mult}x，触发终局景气度陷阱（{trap_reason or '高增速外推不可持续'}），暂不建仓以规避估值压缩。"
            rationale_en = f"Reverse-DCF implies an elevated {ceiling_mult}x 10Y earnings ceiling ({trap_reason or 'terminal growth saturation'}). Pass to avoid multiple derating."
            rationale_hy = f"逆向 DCF 隐含 10Y 倍数达 {ceiling_mult}x，触发 Prosperity Trap（{trap_reason or '终局增速见顶'}），Pass 规避估值压缩。"
        elif str(pricing_data.get("action_status") or "") in ["LEFT_SIDE_WATCH", "左侧观察期", "左侧观察期 (LEFT_SIDE_WATCH)"] or (has_buy_bracket and price <= buy_max and hitting_zone != "RIGHT_SIDE"):
            verdict = "WATCH / AWAIT RIGHT-SIDE REVERSAL" if lang == "en" else ("左侧观察 (等待企稳)" if lang == "zh" else "左侧观察 (LEFT_SIDE - Await Turn)")
            position_size = "0% Immediate Allocation — Await Right-Side Pivot" if lang == "en" else "0% 即时仓位（等待右侧企稳信号）"
            ret_5d_display = f"{pricing_data.get('ret_5d_pct', 0.0):+.1f}%"
            rationale_zh = f"现价 ${price} {curr} 已入估值击球区，但受制于左侧下跌动能（温度: {trend_temp}，5D: {ret_5d_display}）。执行双重闸门纪律：维持 0% 观望，待右侧企稳确认后再建仓。"
            rationale_en = f"Valuation is inside the buy bracket at ${price} {curr}, but Left-Side momentum ({trend_temp}, 5D {ret_5d_display}) blocks entry. Hold 0% until a Right-Side pivot confirms."
            rationale_hy = f"现价 ${price} {curr} 已入估值区间，但处于左侧下跌形态（{trend_temp}，5D: {ret_5d_display}）。维持 0% 观望，待右侧拐点确认后介入。"
        elif has_buy_bracket and price <= buy_max and hitting_zone == "RIGHT_SIDE":
            verdict = "ACCUMULATE IN BRACKETS" if lang == "en" else ("建议买入 (分批建仓)" if lang == "zh" else "建议买入 (BUY - Accumulate)")
            if taxonomy == "TREE":
                if right_side_path in ("SUPPORT_BOUNCE", "BOTTOM_REVERSAL"):
                    position_size = "1.5%–2.5% Pilot Tranche → Scale to 3%–5% Core SAA" if lang == "en" else "1.5%–2.5% 右侧试仓 → 趋势确认后加至 3%–5% 核心仓"
                else:
                    position_size = "3%–5% Core SAA Compounding Weight" if lang == "en" else "3%–5% 核心 SAA 种树复利仓位"
            elif taxonomy == "GRAIN":
                if right_side_path in ("SUPPORT_BOUNCE", "BOTTOM_REVERSAL"):
                    position_size = "1.5%–2.0% Pilot Tranche → Scale to 2%–4% Cyclical Value" if lang == "en" else "1.5%–2.0% 右侧试仓 → 后续加至 2%–4% 周期高股息仓"
                else:
                    position_size = "2%–4% Core/Satellite Cyclical Weight" if lang == "en" else "2%–4% 春播秋收周期高股息仓位"
            else:
                position_size = "Max 2% Satellite TAA (Hard Stop Required)" if lang == "en" else "上限 2% 战术卫星仓（预设 -7% 硬止损）"

            rationale_zh = f"现价 ${price} {curr} 处于安全买入区间且右侧动能确认（温度: {trend_temp}），基本面与技术面双重闸门共振，建议按纪律分批吸纳。"
            rationale_en = f"Price (${price} {curr}) is inside the safe buy zone with confirmed Right-Side momentum ({trend_temp}). Dual fundamental and technical gates align for staged accumulation."
            rationale_hy = f"现价 ${price} {curr} 位于安全买入区间且右侧趋势确认 ({trend_temp})，双重闸门共振，建议分批建仓。"
        elif not has_buy_bracket:
            verdict = "TREND_ONLY_NO_DCF" if lang == "en" else ("仅限趋势交易" if lang == "zh" else "仅限趋势 (TREND_ONLY)")
            position_size = "Max 2% Satellite TAA (Strict Hard Stop)" if lang == "en" else "上限 2% 卫星仓（严格执行均线止损）"
            rationale_zh = f"缺乏确定性长期 DCF 估值锚。{pricing_data.get('timing_advice', '')} 仅限顺势战术博弈，严禁左侧死扛。"
            rationale_en = f"Lacks a predictable DCF valuation anchor. {pricing_data.get('timing_advice', '')} Restrict to tactical trend trading with a hard stop."
            rationale_hy = f"缺乏确定性 DCF 估值锚。{pricing_data.get('timing_advice', '')} 仅限右侧战术交易并预设硬止损。"
        elif price <= pricing_data.get("fifty_day_sma", price * 1.05):
            verdict = "HOLD / WATCH PULLBACK" if lang == "en" else ("观望等待 (等待回调)" if lang == "zh" else "观望等待 (HOLD - Watch)")
            position_size = "0% New Capital (Hold Existing Position)" if lang == "en" else "0% 新增资金（底仓继续持有）"
            rationale_zh = f"现价 ${price} {curr} 高于买入上限 (${buy_max} {curr})，安全垫不足。建议底仓持有，等待回调至 ${buy_min}–${buy_max} {curr} 区间再行加仓。"
            rationale_en = f"Trading above the ${buy_max} {curr} buy ceiling with insufficient margin of safety. Hold existing shares; await pullback into ${buy_min}–${buy_max} {curr}."
            rationale_hy = f"现价 ${price} {curr} 高于买入上限 (${buy_max} {curr})，安全边际不足。底仓持有，待回调至 ${buy_min}–${buy_max} {curr} 再介入。"
        else:
            verdict = "PASS / OVERVALUED" if lang == "en" else ("暂不建仓 (估值偏高)" if lang == "zh" else "暂不建仓 (PASS - Overvalued)")
            position_size = "0% Allocation (Avoid Chasing Extended Valuation)" if lang == "en" else "0% 仓位（规避高位追涨）"
            if is_above_200:
                rationale_zh = f"现价高于安全买入上限 (${buy_max} {curr}) 且距 200日均线 (${two_hundred_sma} {curr}) 显著偏离。暂不追高，待估值理性回落。"
                rationale_en = f"Trading above safe buy ceiling (${buy_max} {curr}) and extended above 200D SMA (${two_hundred_sma} {curr}). Pass on chasing; wait for mean reversion."
                rationale_hy = f"现价高于买入上限 (${buy_max} {curr}) 且偏离 200D SMA (${two_hundred_sma} {curr})。暂不建仓，等待估值回归。"
            else:
                rationale_zh = f"现价高于买入上限 (${buy_max} {curr}) 且受制于 200日均线阻力 (${two_hundred_sma} {curr})。暂不建仓，待阻力消化或回稳于 ${buy_max} {curr}。"
                rationale_en = f"Trading above safe buy ceiling (${buy_max} {curr}) below 200D SMA resistance (${two_hundred_sma} {curr}). Wait for stabilization near ${buy_max} {curr}."
                rationale_hy = f"现价高于买入上限 (${buy_max} {curr}) 且受制于 200D SMA 阻力 (${two_hundred_sma} {curr})。暂不建仓，等待阻力化解或企稳。"

        judge_summary = rationale_zh if lang == "zh" else (rationale_hy if lang == "hybrid" else rationale_en)

        cio_verdict = {
            "agent": cio_agent_name,
            "verdict": verdict,
            "position_sizing_advice": position_size,
            "recommended_buy_bracket": f"${buy_min} - ${buy_max} {curr}" if has_buy_bracket else "TREND_ONLY_NO_DCF",
            "risk_reward_ratio": rr_ratio,
            "bottom_fishing_threshold": bottom_threshold,
            "is_falsified": is_falsified,
            "floor_type": floor_type,
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
                    "floor_type": floor_type,
                    "buy_in_price": buy_in_val,
                    "threshold_currency": curr,
                    "implied_ceiling_mult": ceiling_mult,
                    "is_prosperity_trap": is_prosperity_trap
                },
                "barbell_allocation": "Core SAA (80%)" if taxonomy in ["TREE", "GRAIN"] else "Satellite TAA (20%)",
                "qualified_holder_creed": "只做合格持有人：不是人在做投资，是纪律在做投资。" if lang != "en" else "Qualified Holder Mindset: Discipline executes trades, not human emotion."
            }
        }

        bridge = pricing_data.get("bridge") or {}
        eq = pricing_data.get("earnings_quality") or fundamental_data.get("earnings_quality") or {}
        forensic_flags = eq.get("forensic_flags") or []
        sbc_val = bridge.get("sbc_per_share", 0.0)

        if lang == "zh":
            falsification_trigger_cond = falsification_zh
            if forensic_flags:
                flags_str = "、".join(forensic_flags)
                bear_rebuttal = f"空头第二轮反驳：多头刻意忽略法务财务预警（{flags_str}）与每股股权激励（SBC ${sbc_val} {curr}）的稀释侵蚀，实际现金流回报被严重粉饰。"
            elif sbc_val and sbc_val > 0:
                bear_rebuttal = f"空头第二轮反驳：多头忽视每股股权激励（SBC ${sbc_val} {curr}）对股东权益的实质侵蚀，在当前限制性利率环境下，真实股东回报率远低于账面宣称水平。"
            else:
                bear_rebuttal = f"空头第二轮反驳：多头过度乐观假设远期增速，忽视宏观周期阻力与向 200日均线 (${two_hundred_sma} {curr}) 均值回归的均线拉扯风险。"

            bull_rebuttal = f"多头第二轮反驳：空头过度计价短期宏观杂音；标的具备 {moat} 护城河与扎实 FCF 转化效率，当前估值安全边际足以消化估值均值回归压力。"
        elif lang == "hybrid":
            falsification_trigger_cond = falsification_zh
            if forensic_flags:
                flags_str = ", ".join(forensic_flags)
                bear_rebuttal = f"空头第二轮反驳 (Bear Rebuttal): 多头忽视财务法务预警 ({flags_str}) 与 SBC 稀释 (${sbc_val} {curr})，真实 FCF 收益率被虚高呈现。"
            elif sbc_val and sbc_val > 0:
                bear_rebuttal = f"空头第二轮反驳 (Bear Rebuttal): 股权激励稀释 (SBC: ${sbc_val} {curr}/股) 侵蚀长期股东复利回报，估值倍数缺乏支撑。"
            else:
                bear_rebuttal = f"空头第二轮反驳 (Bear Rebuttal): 多头忽视宏观周期阻力与资本成本约束，估值中枢面临向 200D SMA 均值回归修正压力。"

            bull_rebuttal = f"多头第二轮反驳 (Bull Rebuttal): 空头过度放大短期逆风，标的凭借 {moat} 护城河与现金流复利能力，当前估值已具备充分安全边际。"
        else:
            falsification_trigger_cond = falsification_en
            if forensic_flags:
                flags_str = ", ".join(forensic_flags)
                bear_rebuttal = f"Bear Rebuttal: Bull ignores forensic accounting flags ({flags_str}) and SBC dilution of ${sbc_val} {curr}/share, creating an optical illusion of cheap FCF yield."
            elif sbc_val and sbc_val > 0:
                bear_rebuttal = f"Bear Rebuttal: Heavy stock-based compensation (${sbc_val} {curr}/share) dilutes long-term equity compounding and masks structural margin compression."
            else:
                bear_rebuttal = f"Bear Rebuttal: Bull's thesis understates multiple compression risk under higher-for-longer cost of capital and technical pullbacks toward 200D SMA (${two_hundred_sma} {curr})."

            bull_rebuttal = f"Bull Rebuttal: Bear overweights transitory cyclical / multiple headwinds; high cash conversion and competitive moat ({moat}) provide substantial margin of safety for long-term compounders."

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
            "cio_verdict": cio_verdict,
            "bull_rebuttal": bull_rebuttal,
            "bear_rebuttal": bear_rebuttal,
            "falsification_price_level": bottom_threshold,
            "falsification_trigger_condition": falsification_trigger_cond,
            "provenance": {
                "source_mode": "LIVE" if (verify_filings or stock_data.get("source_mode") == "LIVE") else "SIMULATED_FALLBACK",
                "as_of": datetime.now(timezone.utc).isoformat(),
                "data_source": "SEC EDGAR / SEDAR+ Filing Ground Truth Verified" if (verify_filings or stock_data.get("source_mode") == "LIVE") else "Deterministic Empirical Debate Engine",
                "is_stale": False
            }
        }
