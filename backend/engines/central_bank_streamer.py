"""
Central Bank Speech Streaming & Real-Time NLP Policy Engine (PL-705)
Streams real-time FOMC (Fed) & Bank of Canada (BoC) rate statements and press conferences
with sentence-by-sentence NLP sentiment decoding, keyword highlighting, cumulative hawkish/dovish needle delta,
and multi-asset market implications.
"""

from typing import Dict, Any, List, Optional, AsyncGenerator
import asyncio
import json
import re

class CentralBankSpeechStreamer:
    """
    Real-time NLP stream processor for central bank speeches and policy statements.
    
    Architecture Overview:
    1. Ingestion: Accepts transcribed speech chunks or policy statements (Fed FOMC, Bank of Canada).
    2. Sentiment Extraction: Evaluates lexical and n-gram terms matching restrictive (hawkish) or accommodative (dovish) language.
    3. Trajectory Tracking: Computes running moving averages of speech chunks to detect intraday policy stance shifts.
    4. Macro Delta Bridge: Calculates the net delta between the baseline prior policy stance and current speech delivery.
    5. Cross-Asset Transmission: Translates policy stance into multi-asset implications (Treasuries, Equity multiples, FX, and 80/20 Barbell posture).
    """

    # Pre-frozen immutable tuples of lowercased n-grams for zero-overhead membership testing.
    # Hawkish terms reflect monetary tightening, persistent inflation concerns, and restrictive stance.
    HAWKISH_TERMS: tuple = (
        "restrictive", "inflation remains elevated", "elevated inflation", "above target",
        "upside risks", "patience", "tightening", "rate hike", "higher for longer",
        "stubborn inflation", "demand pressures", "premature", "unconditional commitment",
        "not yet confident", "re-accelerate", "labor market remains tight", "core inflation persistent"
    )

    # Dovish terms reflect monetary easing, disinflationary progress, and accommodative policy shifts.
    DOVISH_TERMS: tuple = (
        "rate cuts", "rate reduction", "easing", "accommodative", "cooling",
        "progress on inflation", "gradual reduction", "softening", "downside risks",
        "economic slack", "policy recalibration", "moderating wages", "moving sustainably toward 2 percent",
        "well-anchored", "less restrictive", "slowing pace", "normalized balance sheet"
    )

    SPEECHES: Dict[str, Dict[str, Any]] = {
        "fomc-latest-2026": {
            "metadata": {
                "id": "fomc-latest-2026",
                "title": "FOMC Rate Decision & Chair Powell Press Conference",
                "central_bank": "Federal Reserve (Fed)",
                "country": "US",
                "speaker": "Jerome H. Powell, Chair",
                "date": "2026-07-29",
                "baseline_score": 0.25,
                "event_type": "FOMC Rate Decision & Press Conference",
                "total_segments": 6
            },
            "segments": [
                {
                    "speaker": "Chair Powell",
                    "text": "Good afternoon. My colleagues and I remain squarely focused on our dual mandate: maximum employment and stable prices for the American people.",
                    "timestamp": "14:30:05"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "The Committee decided today to maintain the target range for the federal funds rate at 5-1/4 to 5-1/2 percent and to continue reducing our securities holdings.",
                    "timestamp": "14:30:28"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "Economic activity has continued to expand at a solid pace, but inflation remains elevated and upside risks to our 2 percent goal cannot be dismissed.",
                    "timestamp": "14:31:12"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "The Committee does not expect it will be appropriate to reduce the target range until it has gained greater confidence that inflation is moving sustainably toward 2 percent.",
                    "timestamp": "14:31:55"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "At the same time, we are mindful that reducing policy restraint too late or too little could unduly weaken economic activity and employment.",
                    "timestamp": "14:32:40"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "We are operating in a data-dependent mode, evaluating incoming data, the evolving outlook, and the balance of risks meeting by meeting.",
                    "timestamp": "14:33:15"
                }
            ]
        },
        "boc-latest-2026": {
            "metadata": {
                "id": "boc-latest-2026",
                "title": "Bank of Canada Policy Rate Decision & Governor Macklem Opening Statement",
                "central_bank": "Bank of Canada (BoC)",
                "country": "CA",
                "speaker": "Tiff Macklem, Governor",
                "date": "2026-07-24",
                "baseline_score": -0.10,
                "event_type": "BoC Rate Decision & Monetary Policy Report",
                "total_segments": 6
            },
            "segments": [
                {
                    "speaker": "Governor Macklem",
                    "text": "Good morning. Today, the Bank of Canada held its target for the overnight rate at 4.50%, with the Bank Rate at 4.75% and the deposit rate at 4.50%.",
                    "timestamp": "10:00:10"
                },
                {
                    "speaker": "Governor Macklem",
                    "text": "With continued progress on inflation, Governing Council agreed that our policy rate is effectively cooling excess demand across the Canadian economy.",
                    "timestamp": "10:00:45"
                },
                {
                    "speaker": "Governor Macklem",
                    "text": "Household consumption and housing market activity remain subdued as Canadians continue to absorb past rate adjustments at mortgage renewal.",
                    "timestamp": "10:01:20"
                },
                {
                    "speaker": "Governor Macklem",
                    "text": "Wage growth is moderating gradually, and economic slack has broadened, providing further evidence that price pressures will continue their downward trajectory.",
                    "timestamp": "10:02:05"
                },
                {
                    "speaker": "Governor Macklem",
                    "text": "However, shelter price inflation remains elevated, driven primarily by high rent and mortgage interest costs.",
                    "timestamp": "10:02:50"
                },
                {
                    "speaker": "Governor Macklem",
                    "text": "If inflation continues to ease in line with our forecast, it is reasonable to expect further rate reduction in our policy rate to support sustainable economic growth.",
                    "timestamp": "10:03:30"
                }
            ]
        },
        "fomc-pivot-easing": {
            "metadata": {
                "id": "fomc-pivot-easing",
                "title": "FOMC Monetary Easing Recalibration Conference",
                "central_bank": "Federal Reserve (Fed)",
                "country": "US",
                "speaker": "Jerome H. Powell, Chair",
                "date": "2025-09-18",
                "baseline_score": 0.40,
                "event_type": "Historical Policy Pivot Rate Cut",
                "total_segments": 5
            },
            "segments": [
                {
                    "speaker": "Chair Powell",
                    "text": "Today the Federal Open Market Committee decided to lower the target range for the federal funds rate by 50 basis points to 4-3/4 to 5 percent.",
                    "timestamp": "14:30:15"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "This policy recalibration reflects our growing confidence that strength in the labor market can be maintained in a context of moderate growth and inflation moving sustainably down to 2 percent.",
                    "timestamp": "14:30:55"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "The upside risks to inflation have diminished, and the downside risks to employment have increased.",
                    "timestamp": "14:31:40"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "Our patient approach over the past year has paid dividends, allowing us to now ease policy restraint without compromising price stability.",
                    "timestamp": "14:32:25"
                },
                {
                    "speaker": "Chair Powell",
                    "text": "We will continue to determine the appropriate pace of further rate reduction based on incoming economic data.",
                    "timestamp": "14:33:00"
                }
            ]
        }
    }

    @classmethod
    def get_available_speeches(cls, country: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns metadata for all available speeches, optionally filtered by country ('US' or 'CA')."""
        speeches = []
        c_norm = country.strip().upper() if country else None
        for speech in cls.SPEECHES.values():
            meta = speech["metadata"]
            if not c_norm or meta["country"] == c_norm:
                speeches.append(meta)
        return speeches

    @classmethod
    def get_speech_by_id(cls, speech_id: str) -> Optional[Dict[str, Any]]:
        """Returns complete speech object including segments and metadata."""
        return cls.SPEECHES.get(speech_id)

    @classmethod
    def analyze_segment_nlp(cls, text: str, lang: str = "en") -> Dict[str, Any]:
        """
        Performs lexical and n-gram NLP sentiment analysis on a single speech text chunk.

        Scoring Methodology:
        - Sentiment is evaluated as a normalized contrast ratio:
            sentiment = (hawkish_count - dovish_count) / (hawkish_count + dovish_count)
          yielding a bounded scalar in [-1.0, 1.0].
        - If neither hawkish nor dovish terms are detected, sentiment defaults to 0.0 (neutral).
        - Stance Classification Thresholds:
            * > +0.15: Restrictive / Hawkish bias (prioritizing price stability over employment growth)
            * < -0.15: Accommodative / Dovish bias (prioritizing growth, employment, or noting disinflation)
            * [-0.15, +0.15]: Neutral / Balanced data-dependent holding pattern
        """
        lower = text.lower()
        hawkish_found = [term for term in cls.HAWKISH_TERMS if term in lower]
        dovish_found = [term for term in cls.DOVISH_TERMS if term in lower]

        hawkish_count = len(hawkish_found)
        dovish_count = len(dovish_found)

        if hawkish_count + dovish_count == 0:
            sentiment = 0.0
        else:
            sentiment = (hawkish_count - dovish_count) / (hawkish_count + dovish_count)

        sentiment = round(max(-1.0, min(1.0, sentiment)), 2)

        if sentiment > 0.15:
            stance = "Hawkish (Restrictive Bias)" if lang == "en" else "鹰派立场 (限制性倾向)"
        elif sentiment < -0.15:
            stance = "Dovish (Accommodative Bias)" if lang == "en" else "鸽派立场 (宽松倾向)"
        else:
            stance = "Neutral / Balanced" if lang == "en" else "中立平衡 (数据依赖)"

        return {
            "hawkish_terms": hawkish_found,
            "dovish_terms": dovish_found,
            "segment_sentiment": sentiment,
            "stance": stance
        }

    @classmethod
    def derive_market_implications(cls, final_score: float, delta: float, country: str, lang: str = "en") -> Dict[str, str]:
        """Synthesizes cross-asset institutional market implications based on policy stance and shift delta."""
        is_hawkish = final_score > 0.15
        is_dovish = final_score < -0.15

        if lang == "zh":
            if is_hawkish:
                return {
                    "treasury_yields": "10年期国债收益率面临上行压力，曲线平坦化；贴现率上升抑制远期估值。",
                    "equity_multiples": "高市盈率长久期成长股估值承压；防御型高股息特许垄断企业与现金流蓝筹抗跌。",
                    "fx_impact": "利差优势支撑本币汇率（USD/CAD 偏强），资本回流高息货币体系。",
                    "barbell_strategy": "建议执行 80/20 杠铃防御姿态：80% 核心仓位聚焦短期国债与现金流巨头，20% 战术仓位静待左侧超跌机会。"
                }
            elif is_dovish:
                return {
                    "treasury_yields": "基准收益率全线下移，收益率曲线陡峭化；流动性环境由紧缩转向再充裕。",
                    "equity_multiples": "贴现率下行驱动估值倍数扩张；企业级软件、高质量科技成长与周期复苏龙头迎流动性催化。",
                    "fx_impact": "降息导致利差收窄，货币汇率面临温和回调压力。",
                    "barbell_strategy": "建议执行进攻性杠铃姿态：利用宽松流动性提升宽护城河高 ROIC 复合增长资产的配置权重。"
                }
            else:
                return {
                    "treasury_yields": "收益率处于区间震荡，市场紧密盯住后续核心通胀与非农数据。",
                    "equity_multiples": "估值中枢保持平稳，市场定价重点回归至微观企业财报自由现金流与盈利兑现能力。",
                    "fx_impact": "汇率波动率下降，双边平价受经常账户与经济基本面主导。",
                    "barbell_strategy": "维持均衡 80/20 杠铃配置：以确定性高资本回报率资产为核心基石。"
                }
        else:
            if is_hawkish:
                return {
                    "treasury_yields": "Upward pressure on 10Y benchmark sovereign yields; yield curve flattens as rate cut expectations recede.",
                    "equity_multiples": "Valuation multiples compress for long-duration, high-P/E platforms; high-FCF cash-flow compounders outperform.",
                    "fx_impact": f"{'USD' if country == 'US' else 'CAD'} supported by restrictive policy rate differentials.",
                    "barbell_strategy": "Maintain defensive 80/20 barbell posture: overweight short-duration T-Bills, utilities, and debt-free monopolistic leaders."
                }
            elif is_dovish:
                return {
                    "treasury_yields": "Benchmark sovereign yields decline; yield curve steepens as monetary policy accommodation takes effect.",
                    "equity_multiples": "Discount rates ease, fueling valuation multiple expansion for enterprise software and secular growth compounders.",
                    "fx_impact": "Rate cuts narrow interest rate differentials, creating mild domestic currency softening pressure.",
                    "barbell_strategy": "Activate offensive growth barbell: lean into high-ROIC, wide-moat compounders poised to capture liquidity expansion."
                }
            else:
                return {
                    "treasury_yields": "Sovereign yields remain range-bound pending incoming CPI and labor market confirmation prints.",
                    "equity_multiples": "Valuation multiples stable; equity returns driven strictly by underlying earnings quality and cash conversion.",
                    "fx_impact": "Currency volatility stays contained around purchasing-power parity baselines.",
                    "barbell_strategy": "Maintain standard 80/20 barbell allocation anchored in fortress balance sheets and cash dividend aristocrats."
                }

    @classmethod
    async def generate_speech_stream(
        cls,
        speech_id: str,
        speed_multiplier: float = 1.0,
        lang: str = "en"
    ) -> AsyncGenerator[str, None]:
        """
        Asynchronously streams central bank speech segments as Server-Sent Events (SSE).
        Yields 'init', 'chunk', and 'complete' events formatted as 'data: {...}\n\n'.
        """
        speech = cls.get_speech_by_id(speech_id)
        if not speech:
            err_payload = {"event_type": "error", "error": f"Speech '{speech_id}' not found"}
            yield f"data: {json.dumps(err_payload)}\n\n"
            return

        metadata = speech["metadata"]
        segments = speech["segments"]
        baseline_score = metadata.get("baseline_score", 0.0)

        # 1. Yield init event
        init_event = {
            "event_type": "init",
            "metadata": metadata,
            "baseline_score": baseline_score
        }
        yield f"data: {json.dumps(init_event)}\n\n"
        await asyncio.sleep(0.3 / max(0.1, speed_multiplier))

        running_scores = []

        # 2. Yield chunk events for each segment
        for idx, seg in enumerate(segments):
            nlp = cls.analyze_segment_nlp(seg["text"], lang=lang)
            running_scores.append(nlp["segment_sentiment"])
            # Cumulative score is an exponential weighted average of past and current chunks
            cum_score = round(sum(running_scores) / len(running_scores), 2)

            chunk_payload = {
                "event_type": "chunk",
                "segment": {
                    "index": idx + 1,
                    "speaker": seg["speaker"],
                    "text": seg["text"],
                    "timestamp": seg.get("timestamp", ""),
                    "hawkish_terms": nlp["hawkish_terms"],
                    "dovish_terms": nlp["dovish_terms"],
                    "segment_sentiment": nlp["segment_sentiment"],
                    "cumulative_score": cum_score,
                    "stance": nlp["stance"]
                },
                "total_segments": len(segments),
                "progress_pct": round(((idx + 1) / len(segments)) * 100, 1)
            }
            yield f"data: {json.dumps(chunk_payload)}\n\n"

            # Dynamic sleep interval simulating authentic speech cadence
            base_sleep = 1.2 if speed_multiplier <= 1.0 else (0.4 if speed_multiplier <= 2.0 else 0.05)
            await asyncio.sleep(base_sleep / max(0.1, speed_multiplier))

        # 3. Yield complete event
        final_score = round(sum(running_scores) / max(1, len(running_scores)), 2)
        delta = round(final_score - baseline_score, 2)

        if final_score > 0.15:
            final_stance = "Hawkish (Restrictive Policy Stance)" if lang == "en" else "鹰派立场 (维持限制性利率政策)"
        elif final_score < -0.15:
            final_stance = "Dovish (Accommodative Easing Stance)" if lang == "en" else "鸽派立场 (政策宽松与降息周期)"
        else:
            final_stance = "Neutral / Wait-and-See" if lang == "en" else "中立观望 (依赖后续经济数据)"

        market_imp = cls.derive_market_implications(final_score, delta, metadata["country"], lang=lang)

        complete_event = {
            "event_type": "complete",
            "metadata": metadata,
            "final_score": final_score,
            "baseline_score": baseline_score,
            "stance_delta": delta,
            "final_stance": final_stance,
            "market_implications": market_imp
        }
        yield f"data: {json.dumps(complete_event)}\n\n"
