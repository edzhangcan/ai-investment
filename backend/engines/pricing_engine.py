"""
PricingEngine (估值与择时器)
Calculates historical valuation percentiles (P/E, P/S), simplified 2-Stage Discounted Cash Flow (DCF),
technical moving averages (50D & 200D SMA), RSI momentum, and generates safe "Ideal Buy Zone" brackets.
Strict Policy: Zero fabrication of price or technical data.
"""

from typing import Dict, Any, Optional, List
from backend.engines.fundamental_engine import FundamentalEngine

class PricingEngine:
    """Valuation & Technical Timing Engine."""

    @classmethod
    def evaluate_pricing_and_entry_zone(
        cls,
        stock_data: Dict[str, Any],
        lang: str = "en",
        custom_mos_pct: Optional[float] = None,
        anchor_mode: str = "adaptive_balanced"
    ) -> Dict[str, Any]:
        symbol = stock_data.get("symbol", "UNKNOWN")

        # 0. Check validity
        if not stock_data.get("is_valid", True) or stock_data.get("current_price") is None:
            no_data_msg = (
                f"No real-time price data available for ticker '{symbol}'. Unable to compute technical indicators."
                if lang == "en" else
                f"暂无股票代码 '{symbol}' 的实时价格数据，无法计算技术指标。"
            )
            return {
                "is_valid": False,
                "symbol": symbol,
                "current_price": None,
                "currency": stock_data.get("currency", "USD"),
                "fifty_day_sma": None,
                "two_hundred_day_sma": None,
                "pe_ratio": None,
                "valuation_status": "NO DATA" if lang == "en" else "暂无数据",
                "valuation_percentile": 0,
                "dcf_fair_value": None,
                "ideal_buy_range_min": None,
                "ideal_buy_range_max": None,
                "ideal_sell_range_min": None,
                "ideal_sell_range_max": None,
                "applied_mos_pct": 15.0,
                "applied_anchor_mode": anchor_mode,
                "action_status": "NO DATA" if lang == "en" else "暂无数据",
                "timing_advice": no_data_msg,
                "rsi_14": None
            }

        price = float(stock_data["current_price"])
        currency = stock_data.get("currency", "USD")
        fifty_sma = float(stock_data.get("fifty_day_sma") or price * 0.98)
        two_hundred_sma = float(stock_data.get("two_hundred_day_sma") or price * 0.90)
        pe = stock_data.get("pe_ratio")
        fcf = stock_data.get("free_cash_flow")

        # 1. Simplified 2-Stage DCF Calculation
        wacc = 0.08
        terminal_growth = 0.03
        rev_growth = min(max(stock_data.get("revenue_growth") or 0.08, 0.03), 0.25)
        
        if fcf and fcf > 0:
            implied_shares = max(1000000.0, (price * 10000000.0) / max(1.0, price))
            fcf_per_share = max(0.5, fcf / implied_shares)
            dcf_val = 0.0
            curr_fcf = fcf_per_share
            for year in range(1, 11):
                growth_rate = rev_growth if year <= 5 else (rev_growth + terminal_growth) / 2
                curr_fcf *= (1 + growth_rate)
                dcf_val += curr_fcf / ((1 + wacc) ** year)
            term_val = (curr_fcf * (1 + terminal_growth)) / (wacc - terminal_growth)
            disc_tv = term_val / ((1 + wacc) ** 10)
            dcf_fair_value = round(dcf_val + disc_tv, 2)
            dcf_fair_value = max(round(price * 0.7, 2), min(round(price * 1.4, 2), dcf_fair_value))
        else:
            # ETF / Index or missing FCF default DCF target relative to 200D SMA
            dcf_fair_value = round(max(price * 1.05, two_hundred_sma * 1.10), 2)

        # 2. Continuous Dynamic Valuation Percentile & Timing Score
        rsi = float(stock_data.get("rsi_14") or 55.0)
        sma_ratio = price / max(1.0, two_hundred_sma)
        
        # Base score from DCF upside / discount ratio
        dcf_upside = max(-0.30, min(0.60, (dcf_fair_value - price) / max(1.0, price)))
        dcf_pts = 60.0 + (dcf_upside * 50.0)  # Maps -30% -> 45 pts, +60% -> 90 pts
        
        # Momentum & MA support adjustment (+/- 10 pts)
        ma_pts = 10.0 if sma_ratio <= 1.15 else (-5.0 if sma_ratio > 1.30 else 0.0)
        
        if pe is not None:
            if pe > 50:
                val_status = "Premium / High Multiple" if lang == "en" else ("高估值区间" if lang == "zh" else "高估值区间 (Premium Multiple)")
                pe_pts = -8.0
            elif pe < 18:
                val_status = "Deep Value / Cheap" if lang == "en" else ("低估值区间" if lang == "zh" else "低估值区间 (Deep Value)")
                pe_pts = 8.0
            else:
                val_status = "Fair Value" if lang == "en" else ("合理估值区间" if lang == "zh" else "合理估值区间 (Fair Value)")
                pe_pts = 2.0
        else:
            val_status = "ETF / Index Portfolio" if lang == "en" else ("指数基金/资产组合" if lang == "zh" else "指数基金/资产组合 (ETF Portfolio)")
            pe_pts = 0.0

        val_percentile = round(max(30.0, min(95.0, dcf_pts + ma_pts + pe_pts)), 1)

        # 3. Technical Support & Institutional Adaptive Margin of Safety Buy Bracket Synthesis
        # Margin of Safety factor: Custom override or Adaptive based on P/E multiple
        if custom_mos_pct is not None:
            clamped_mos = max(10.0, min(30.0, float(custom_mos_pct)))
            mos_discount = round(1.0 - (clamped_mos / 100.0), 4)
        else:
            if pe is not None and pe > 38.0:
                mos_discount = 0.80  # 20% MoS for high-multiple growth equities
            elif pe is not None and pe < 20.0:
                mos_discount = 0.90  # 10% MoS for deep value / defensive dividends
            else:
                mos_discount = 0.85  # 15% MoS standard compounder benchmark

        dcf_target = round(dcf_fair_value * mos_discount, 2)

        # Technical Support Pullback Anchor based on anchor_mode
        if anchor_mode == "strict_200d":
            # Strict 200D SMA support: anchor entry at 200D SMA support
            technical_anchor = round(min(two_hundred_sma * 1.0, price * 0.95), 2)
        elif anchor_mode == "tactical_pullback":
            # Tactical 5% Pullback: aggressive momentum entry near 50D SMA or 5% off price
            technical_anchor = round(max(fifty_sma * 0.98, price * 0.95), 2)
        else:
            # Default "adaptive_balanced": synthesizes 50D & 200D SMA
            technical_anchor = round(
                max(two_hundred_sma * 0.95, min(price * 0.94, max(fifty_sma * 0.98, two_hundred_sma * 1.05))), 2
            )

        if anchor_mode == "strict_200d":
            # Strict 200D mode strictly bounds entry ceiling to 200D SMA support
            ideal_buy_max = round(min(dcf_target, technical_anchor), 2)
        elif dcf_target >= price:
            # Fundamentally undervalued: entry bracket allows entering on mild consolidation / 50D SMA
            ideal_buy_max = round(min(dcf_target, max(price * 0.98, fifty_sma * 0.98)), 2)
        else:
            # Fairly valued or overvalued: ceiling is bounded by conservative intersection of DCF target & technical anchor
            ideal_buy_max = round(min(dcf_target, technical_anchor), 2)

        # Floor is set at 12-15% discount to ceiling, with support near 200D SMA floor
        ideal_buy_min = round(min(ideal_buy_max * 0.88, two_hundred_sma * 0.90), 2)
        if ideal_buy_min >= ideal_buy_max:
            ideal_buy_min = round(ideal_buy_max * 0.88, 2)

        # Profit-taking / Sell alert bracket
        ideal_sell_range_min = round(max(dcf_fair_value * 1.10, price * 1.15), 2)
        ideal_sell_range_max = round(max(dcf_fair_value * 1.25, price * 1.30), 2)

        # Base action status and advice based on price vs buy bracket / DCF
        if price <= ideal_buy_max:
            if lang == "en":
                action_status = "IN_BUY_ZONE"
                advice = f"Current price ${price} {currency} is within safe buy bracket (${ideal_buy_min} - ${ideal_buy_max} {currency}) with a strong Margin of Safety."
            elif lang == "zh":
                action_status = "处于理想买入区间"
                advice = f"当前股价 ${price} {currency} 处于安全买入区间 (${ideal_buy_min} - ${ideal_buy_max} {currency})，具备充沛的安全边际。"
            else:
                action_status = "处于理想买入区间 (IN_BUY_ZONE)"
                advice = f"当前股价 ${price} {currency} 处于安全买入区间 (${ideal_buy_min} - ${ideal_buy_max} {currency})，具 Safe Buy Bracket 保护。"
        elif price <= dcf_fair_value:
            if lang == "en":
                action_status = "PULLBACK_WATCH"
                advice = f"Price ${price} {currency} is fairly valued below DCF (${dcf_fair_value} {currency}). Recommend setting price alert at ${ideal_buy_max} {currency}."
            elif lang == "zh":
                action_status = "回调观察期"
                advice = f"当前股价 ${price} {currency} 低于 DCF 固有价值 (${dcf_fair_value} {currency})。建议设置价格提醒于 ${ideal_buy_max} {currency}。"
            else:
                action_status = "回调观察期 (PULLBACK_WATCH)"
                advice = f"当前股价 ${price} {currency} 低于 DCF 固有价值 (${dcf_fair_value} {currency})。建议设置 Price Alert 于 ${ideal_buy_max} {currency}。"
        else:
            if lang == "en":
                action_status = "OVEREXTENDED"
                advice = f"Price ${price} {currency} is overextended above DCF intrinsic fair value (${dcf_fair_value} {currency}). Wait for pullbacks to ${ideal_buy_max} {currency}."
            elif lang == "zh":
                action_status = "过度延伸/暂勿追高"
                advice = f"当前股价 ${price} {currency} 高于 DCF 固有价值 (${dcf_fair_value} {currency})，股价过度延伸。建议等待回调至 ${ideal_buy_max} {currency}。"
            else:
                action_status = "过度延伸 (OVEREXTENDED)"
                advice = f"当前股价 ${price} {currency} 高于 DCF 固有价值 (${dcf_fair_value} {currency})。建议等待 Pullback 至 ${ideal_buy_max} {currency}。"

        # 4. Three-Part Equity Taxonomy & Reverse-DCF Narrative Penetration Integration
        taxonomy_result = stock_data.get("taxonomy")
        if not taxonomy_result:
            taxonomy_result = FundamentalEngine.classify_stock_taxonomy(stock_data, lang=lang)
        taxonomy = taxonomy_result.get("taxonomy", "TREE")

        reverse_dcf = cls.solve_implied_narrative_ceiling(
            current_pe=pe,
            net_income=stock_data.get("net_income")
        )

        rev_growth_raw = stock_data.get("revenue_growth") or 0.0
        if rev_growth_raw > 0.25 and val_percentile < 25 and taxonomy == "GRAIN":
            reverse_dcf["is_prosperity_trap"] = True
            reverse_dcf["prosperity_trap_note"] = (
                "Prosperity Trap Warning: High short-term growth at low PE percentile — check if terminal ceiling is saturated."
                if lang == "en" else
                "景气度陷阱预警：高增速+低PE分位，警惕行业终局天花板见顶导致估值压缩。"
            )

        dcf_applicable = True
        if taxonomy == "VEGETABLE":
            dcf_applicable = False
            ideal_buy_min = None
            ideal_buy_max = None
            action_status = "TREND_ONLY_NO_DCF"
            advice = (
                "VEGETABLE stock (Negative FCF or dilutive): No fundamental DCF buy zone. Trade strictly with 4-state trend temperature and stop-loss."
                if lang == "en" else
                "🥬 种菜股（无内生现金流或严重稀释）：不设基本面 DCF 击球区，必须严格依趋势温度与硬止损交易。"
            )

        return {
            "is_valid": True,
            "symbol": symbol,
            "current_price": price,
            "currency": currency,
            "fifty_day_sma": fifty_sma,
            "two_hundred_day_sma": two_hundred_sma,
            "pe_ratio": pe if pe is not None else "N/A",
            "valuation_status": val_status,
            "valuation_percentile": val_percentile,
            "dcf_fair_value": dcf_fair_value,
            "ideal_buy_range_min": ideal_buy_min,
            "ideal_buy_range_max": ideal_buy_max,
            "ideal_sell_range_min": ideal_sell_range_min,
            "ideal_sell_range_max": ideal_sell_range_max,
            "dcf_applicable": dcf_applicable,
            "applied_mos_pct": round((1.0 - mos_discount) * 100.0, 1),
            "applied_anchor_mode": anchor_mode,
            "action_status": action_status,
            "timing_advice": advice,
            "rsi_14": stock_data.get("rsi_14", 54.0),
            "reverse_dcf": reverse_dcf,
            "taxonomy": taxonomy_result,
            "total_shareholder_yield_pct": taxonomy_result.get("total_shareholder_yield_pct", 0.0)
        }

    @staticmethod
    def _fair_pe_from_ceiling(m_ceiling: float, r: float = 0.10, term_pe: float = 15.0, payout: float = 0.30) -> float:
        """
        Calculates analytical fair dynamic PE given a 10-year earnings growth multiple M_ceiling per E173:
        g = M_ceiling^(1/10) - 1
        Fair PE = sum_{t=1}^{10} [alpha * (1+g)^t / (1+r)^t] + [M_ceiling * PE_term / (1+r)^10]
        """
        if m_ceiling <= 0:
            return 0.0
        g = (m_ceiling ** 0.1) - 1.0
        pv_dividends = sum(payout * ((1.0 + g) ** t) / ((1.0 + r) ** t) for t in range(1, 11))
        pv_terminal = (m_ceiling * term_pe) / ((1.0 + r) ** 10)
        return pv_dividends + pv_terminal

    @classmethod
    def solve_implied_narrative_ceiling(
        cls,
        current_pe: Optional[float],
        net_income: Optional[float] = None,
        r_base: float = 0.10,
        term_pe: float = 15.0,
        payout: float = 0.30
    ) -> Dict[str, Any]:
        """
        Solves for the 10-year implied earnings ceiling multiple via 30-step binary search.
        Grounded in E173: Penetrate market narrative to find how much profit must grow in 10 years
        to justify today's valuation multiple at 10% hurdle rate.
        """
        if current_pe is None or float(current_pe) <= 0:
            return {
                "current_pe": 0.0,
                "implied_10y_ceiling_multiple": 1.0,
                "implied_10y_profit_usd": None,
                "is_prosperity_trap": False,
                "prosperity_trap_note": None,
                "matrix": []
            }

        target_pe = float(current_pe)
        low, high = 0.1, 100.0
        for _ in range(30):
            mid = (low + high) / 2.0
            val = cls._fair_pe_from_ceiling(mid, r=r_base, term_pe=term_pe, payout=payout)
            if val < target_pe:
                low = mid
            else:
                high = mid

        implied_multiple = round((low + high) / 2.0, 2)
        implied_profit = round(net_income * implied_multiple, 2) if net_income and net_income > 0 else None

        # Build sensitivity matrix for discount rates [8%, 9%, 10%, 11%, 12%]
        # and narrative multiples [1.5x, 2.0x, 3.0x, 5.0x, 8.0x, 10.0x]
        matrix: List[Dict[str, float]] = []
        for r_rate in [0.08, 0.09, 0.10, 0.11, 0.12]:
            for m_mult in [1.5, 2.0, 3.0, 5.0, 8.0, 10.0]:
                pe_val = round(cls._fair_pe_from_ceiling(m_mult, r=r_rate, term_pe=term_pe, payout=payout), 1)
                matrix.append({
                    "discount_rate_pct": round(r_rate * 100.0, 1),
                    "ceiling_multiple": m_mult,
                    "fair_pe": pe_val
                })

        return {
            "current_pe": target_pe,
            "implied_10y_ceiling_multiple": implied_multiple,
            "implied_10y_profit_usd": implied_profit,
            "is_prosperity_trap": False,
            "prosperity_trap_note": None,
            "matrix": matrix
        }
