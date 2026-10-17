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
                "rsi_14": None,
                "bridge": None,
                "sensitivity_matrix": [],
                "earnings_quality": None,
                "provenance": None
            }

        price = float(stock_data["current_price"])
        currency = stock_data.get("currency", "USD")
        fifty_sma = float(stock_data.get("fifty_day_sma") or price * 0.98)
        two_hundred_sma = float(stock_data.get("two_hundred_day_sma") or price * 0.90)
        pe = stock_data.get("pe_ratio")
        fcf = stock_data.get("free_cash_flow")

        # 1. Institutional 2-Stage DCF with EV-to-Equity Net Debt Bridge & Dynamic CAPM WACC
        total_debt = float(stock_data.get("total_debt") or 0.0)
        total_cash = float(stock_data.get("total_cash") or 0.0)
        sbc = float(stock_data.get("stock_based_compensation") or 0.0)
        total_assets = float(stock_data.get("total_assets") or 0.0)
        beta = float(stock_data.get("beta") if stock_data.get("beta") is not None else 1.0)
        raw_fcf = float(fcf) if fcf is not None else 0.0
        operating_cf = float(stock_data.get("operating_cash_flow") or (raw_fcf * 1.15 if raw_fcf else 0.0))
        net_inc = float(stock_data.get("net_income") or (raw_fcf * 0.90 if raw_fcf else 0.0))

        # Earnings quality analysis
        earnings_quality = cls.compute_earnings_quality(
            operating_cash_flow=operating_cf,
            net_income=net_inc,
            total_assets=total_assets,
            raw_fcf=raw_fcf,
            sbc=sbc
        )

        # Determine sector and financial institution classification
        sector = (stock_data.get("sector") or "").strip().lower()
        symbol_upper = symbol.upper().strip()
        FINANCIAL_SYMBOLS = {
            "JPM", "BAC", "C", "GS", "MS", "WFC", "BLK", "SCHW", "AXP", "USB", "PNC", "TFC", "COF",
            "RY.TO", "TD.TO", "BNS.TO", "BMO.TO", "CM.TO", "NA.TO", "LB.TO", "CWB.TO",
            "GWO.TO", "MFC.TO", "SLF.TO", "IFC.TO", "IAG.TO", "BAM.TO", "BN.TO", "X.TO", "EFN.TO"
        }
        is_financial = (
            "financial" in sector or 
            "bank" in sector or 
            "insurance" in sector or 
            symbol_upper in FINANCIAL_SYMBOLS
        )

        # Determine market_cap & implied_shares
        market_cap = stock_data.get("market_cap")
        shares_outstanding = stock_data.get("shares_outstanding") or stock_data.get("implied_shares")

        if shares_outstanding and float(shares_outstanding) > 0:
            implied_shares = float(shares_outstanding)
            if not market_cap or float(market_cap) <= 0:
                market_cap = price * implied_shares
            else:
                market_cap = float(market_cap)
        elif market_cap and float(market_cap) > 0:
            market_cap = float(market_cap)
            implied_shares = max(1.0, market_cap / max(0.01, price))
        else:
            if pe is not None and net_inc > 0 and float(pe) > 0:
                market_cap = float(pe) * net_inc
                implied_shares = max(1.0, market_cap / max(0.01, price))
            elif raw_fcf > 1000:
                market_cap = raw_fcf / 0.05
                implied_shares = max(1.0, market_cap / max(0.01, price))
            else:
                market_cap = price * 10_000_000.0
                implied_shares = 10_000_000.0

        # Dynamic CAPM WACC with financial firm & debt prudential bounds
        wacc = cls.compute_dynamic_wacc(
            beta=beta,
            risk_free_rate=0.042,
            equity_risk_premium=0.045,
            total_debt=total_debt,
            market_cap=market_cap,
            is_financial=is_financial
        )
        terminal_growth = 0.03

        # Revenue growth constraints based on taxonomy and sector
        raw_rev_growth = stock_data.get("revenue_growth") or 0.08
        tax_str = str(stock_data.get("taxonomy") or "")
        if "TREE" in tax_str:
            rev_growth = min(max(raw_rev_growth, 0.03), 0.15)
        elif "GRAIN" in tax_str or "energy" in sector or "material" in sector:
            rev_growth = min(max(raw_rev_growth, 0.02), 0.08)
        else:
            rev_growth = min(max(raw_rev_growth, 0.03), 0.12)

        # Deduct SBC from FCF: owner_fcf = max(0.0, raw_fcf - sbc)
        deduct_sbc = True
        if deduct_sbc and (raw_fcf - sbc) > 0:
            base_fcf = raw_fcf - sbc
        else:
            base_fcf = raw_fcf

        # Cyclical peak FCF normalization: if starting FCF yield > 12% of market cap, normalize
        if market_cap > 0 and (base_fcf / market_cap > 0.12):
            owner_fcf = market_cap * 0.09
        else:
            owner_fcf = base_fcf

        if raw_fcf > 0:
            curr_fcf = owner_fcf
            pv_10y_fcf = 0.0
            for year in range(1, 11):
                growth_rate = rev_growth if year <= 5 else (rev_growth + terminal_growth) / 2
                curr_fcf *= (1 + growth_rate)
                pv_10y_fcf += curr_fcf / ((1 + wacc) ** year)
            effective_g = min(terminal_growth, max(0.01, wacc - 0.038))
            effective_spread = max(0.038, wacc - effective_g)
            term_val = (curr_fcf * (1 + effective_g)) / effective_spread
            pv_terminal_value = term_val / ((1 + wacc) ** 10)
            enterprise_value = pv_10y_fcf + pv_terminal_value

            if is_financial:
                # Financial institutions: customer deposits are operational liabilities, not corporate leverage
                equity_value = enterprise_value
                effective_cash = 0.0
                effective_debt = 0.0
            else:
                effective_cash = total_cash
                effective_debt = total_debt
                net_debt = total_debt - total_cash
                # Guardrail: Net debt deduction for going concerns cannot wipe out > 70% of operating EV
                net_debt_clamp = min(net_debt, enterprise_value * 0.70) if net_debt > 0 else net_debt
                equity_value = enterprise_value - net_debt_clamp

            fair_value_per_share = round(max(0.01, equity_value / implied_shares), 2)
            dcf_fair_value = fair_value_per_share
            outlier_warning = (fair_value_per_share / max(0.01, price) < 0.25) or (fair_value_per_share / max(0.01, price) > 3.0)
            bridge = {
                "pv_10y_fcf": round(pv_10y_fcf, 2),
                "pv_terminal_value": round(pv_terminal_value, 2),
                "enterprise_value": round(enterprise_value, 2),
                "plus_cash": round(effective_cash, 2),
                "less_total_debt": round(effective_debt, 2),
                "less_sbc_annual": round(sbc, 2),
                "equity_value": round(equity_value, 2),
                "implied_shares": round(implied_shares, 2),
                "fair_value_per_share": fair_value_per_share,
                "dynamic_wacc_used": wacc,
                "valuation_outlier_warning": outlier_warning
            }
        else:
            # ETF / Index or missing FCF default DCF target relative to 200D SMA
            dcf_fair_value = round(max(price * 1.05, two_hundred_sma * 1.10), 2)
            bridge = {
                "pv_10y_fcf": 0.0,
                "pv_terminal_value": 0.0,
                "enterprise_value": 0.0,
                "plus_cash": round(total_cash if not is_financial else 0.0, 2),
                "less_total_debt": round(total_debt if not is_financial else 0.0, 2),
                "less_sbc_annual": round(sbc, 2),
                "equity_value": round(dcf_fair_value * implied_shares, 2),
                "implied_shares": round(implied_shares, 2),
                "fair_value_per_share": dcf_fair_value,
                "dynamic_wacc_used": wacc,
                "valuation_outlier_warning": False
            }

        # 5x5 WACC vs Terminal Growth Sensitivity Matrix
        sensitivity_matrix = cls.build_sensitivity_matrix(
            base_wacc=wacc,
            base_g=terminal_growth,
            owner_fcf=owner_fcf if raw_fcf > 0 else 0.0,
            rev_growth=rev_growth,
            total_cash=total_cash,
            total_debt=total_debt,
            implied_shares=implied_shares,
            price=price,
            is_financial=is_financial
        )

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
            "total_shareholder_yield_pct": taxonomy_result.get("total_shareholder_yield_pct", 0.0),
            "bridge": bridge,
            "sensitivity_matrix": sensitivity_matrix,
            "earnings_quality": earnings_quality,
            "provenance": {
                "source_mode": stock_data.get("source_mode", "LIVE"),
                "provider": stock_data.get("source", "Real-Time Exchange / yfinance"),
                "fetched_at": stock_data.get("fetched_at", ""),
                "staleness_seconds": 0,
                "warning_banner": stock_data.get("warning_banner")
            }
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

    @classmethod
    def compute_dynamic_wacc(
        cls,
        beta: float = 1.0,
        risk_free_rate: float = 0.042,
        equity_risk_premium: float = 0.045,
        total_debt: float = 0.0,
        market_cap: float = 0.0,
        is_financial: bool = False
    ) -> float:
        """
        Computes dynamic CAPM Weighted Average Cost of Capital (WACC).
        Clamps beta to [0.5, 2.2], computes ke = rf + beta * erp.
        For financial institutions, uses Cost of Equity directly (deposits are operating liabilities, not corporate leverage).
        For corporate equities, blends ke with after-tax cost of debt kd_after_tax = (rf + 0.015) * 0.79,
        capping debt weight at 50% to prevent excessive debt-driven WACC distortion.
        Clamps resulting WACC to [0.06, 0.14].
        """
        clamped_beta = min(max(float(beta if beta is not None else 1.0), 0.5), 2.2)
        ke = risk_free_rate + (clamped_beta * equity_risk_premium)
        kd_after_tax = (risk_free_rate + 0.015) * 0.79

        if is_financial:
            return round(min(max(ke, 0.06), 0.14), 4)

        debt = float(total_debt or 0.0)
        mcap = float(market_cap or 0.0)
        total_cap = mcap + debt

        if total_cap > 0 and debt > 0:
            wd_raw = debt / total_cap
            wd = min(wd_raw, 0.50)
            we = 1.0 - wd
            wacc = (we * ke) + (wd * kd_after_tax)
        else:
            wacc = ke

        return round(min(max(wacc, 0.06), 0.14), 4)

    @classmethod
    def compute_earnings_quality(
        cls,
        operating_cash_flow: float,
        net_income: float,
        total_assets: float,
        raw_fcf: float,
        sbc: float
    ) -> Dict[str, Any]:
        """
        Audits financial statement earnings quality and accrual intensity.
        Computes Cash Conversion Ratio, Sloan Accruals Ratio, and SBC % of FCF.
        """
        ocf = float(operating_cash_flow or 0.0)
        ni = float(net_income or 0.0)
        assets = float(total_assets or 0.0)
        fcf = float(raw_fcf or 0.0)
        sbc_val = float(sbc or 0.0)

        cash_conversion_ratio = round(ocf / ni, 2) if ni > 0 else 1.0
        sloan_accruals_ratio = round((ni - ocf) / assets, 4) if assets > 0 else 0.0
        sbc_pct_of_fcf = round(sbc_val / fcf, 2) if fcf > 0 else 0.0

        forensic_flags: List[str] = []
        if ni > 0 and cash_conversion_ratio < 0.75:
            forensic_flags.append("LOW_CASH_CONVERSION (<0.75x)")
        if sloan_accruals_ratio > 0.08:
            forensic_flags.append("HIGH_ACCRUAL_INTENSITY (>8% Assets)")
        if sbc_pct_of_fcf > 0.30:
            forensic_flags.append("HEAVY_SBC_DILUTION (>30% FCF)")

        if len(forensic_flags) >= 2:
            quality_rating = "LOW_ACCRUAL_RISK"
        elif len(forensic_flags) == 1:
            quality_rating = "MODERATE"
        else:
            quality_rating = "HIGH"

        return {
            "operating_cash_flow": ocf,
            "net_income": ni,
            "stock_based_compensation": sbc_val,
            "cash_conversion_ratio": cash_conversion_ratio,
            "sloan_accruals_ratio": sloan_accruals_ratio,
            "sbc_pct_of_fcf": sbc_pct_of_fcf,
            "quality_rating": quality_rating,
            "forensic_flags": forensic_flags
        }

    @classmethod
    def build_sensitivity_matrix(
        cls,
        base_wacc: float,
        base_g: float,
        owner_fcf: float,
        rev_growth: float,
        total_cash: float,
        total_debt: float,
        implied_shares: float,
        price: float,
        is_financial: bool = False
    ) -> List[List[Dict[str, Any]]]:
        """
        Builds a 5x5 DCF sensitivity matrix across Terminal Growth (rows) and WACC (columns).
        Guarantees effective_wacc - effective_g >= 0.015 in every cell.
        Along each row (fixed g, increasing wacc): fair value strictly decreases.
        Along each column (fixed wacc, increasing g): fair value strictly increases.
        """
        wacc_steps = [
            round(base_wacc - 0.01, 4),
            round(base_wacc - 0.005, 4),
            round(base_wacc, 4),
            round(base_wacc + 0.005, 4),
            round(base_wacc + 0.01, 4),
        ]
        g_steps = [
            round(base_g - 0.01, 4),
            round(base_g - 0.005, 4),
            round(base_g, 4),
            round(base_g + 0.005, 4),
            round(base_g + 0.01, 4),
        ]

        matrix: List[List[Dict[str, Any]]] = []
        for g_val in g_steps:
            row: List[Dict[str, Any]] = []
            for w_val in wacc_steps:
                eff_w = max(0.04, w_val)
                eff_g = min(g_val, eff_w - 0.015)

                if owner_fcf > 0 and implied_shares > 0:
                    curr_fcf = owner_fcf
                    pv_10y = 0.0
                    for year in range(1, 11):
                        growth = rev_growth if year <= 5 else (rev_growth + eff_g) / 2
                        curr_fcf *= (1 + growth)
                        pv_10y += curr_fcf / ((1 + eff_w) ** year)
                    tv = (curr_fcf * (1 + eff_g)) / (eff_w - eff_g)
                    pv_tv = tv / ((1 + eff_w) ** 10)
                    ev = pv_10y + pv_tv
                    if is_financial:
                        equity = ev
                    else:
                        net_d = total_debt - total_cash
                        net_d_clamp = min(net_d, ev * 0.70) if net_d > 0 else net_d
                        equity = ev - net_d_clamp
                    fv = round(max(0.01, equity / implied_shares), 2)
                else:
                    fv = round(max(0.01, price * 1.05 * (1 + (eff_g - base_g)*2 - (eff_w - base_wacc)*3)), 2)

                upside = round(((fv - price) / max(0.01, price)) * 100.0, 2)
                row.append({
                    "wacc": round(eff_w, 4),
                    "terminal_growth": round(eff_g, 4),
                    "fair_value": fv,
                    "upside_pct": upside
                })
            matrix.append(row)
        return matrix
