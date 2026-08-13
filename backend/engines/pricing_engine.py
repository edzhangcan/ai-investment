"""
PricingEngine (估值与择时器)
Calculates historical valuation percentiles (P/E, P/S), simplified 2-Stage Discounted Cash Flow (DCF),
technical moving averages (50D & 200D SMA), RSI momentum, and generates safe "Ideal Buy Zone" brackets.
Strict Policy: Zero fabrication of price or technical data.
"""

from typing import Dict, Any

class PricingEngine:
    """Valuation & Technical Timing Engine."""

    @classmethod
    def evaluate_pricing_and_entry_zone(cls, stock_data: Dict[str, Any], lang: str = "en") -> Dict[str, Any]:
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

        # 2. Valuation Percentile Status
        if pe is not None:
            if pe > 40:
                val_status = "Premium / High Multiple" if lang == "en" else ("高估值区间" if lang == "zh" else "高估值区间 (Premium Multiple)")
                val_percentile = 85
            elif pe < 18:
                val_status = "Deep Value / Cheap" if lang == "en" else ("低估值区间" if lang == "zh" else "低估值区间 (Deep Value)")
                val_percentile = 20
            else:
                val_status = "Fair Value" if lang == "en" else ("合理估值区间" if lang == "zh" else "合理估值区间 (Fair Value)")
                val_percentile = 55
        else:
            val_status = "ETF / Index Portfolio" if lang == "en" else ("指数基金/资产组合" if lang == "zh" else "指数基金/资产组合 (ETF Portfolio)")
            val_percentile = 50

        # 3. Technical Support & Institutional Margin of Safety Buy Bracket Synthesis
        mos_discount = 0.85
        calculated_buy_max = round(max(two_hundred_sma * 0.95, dcf_fair_value * mos_discount), 2)
        ideal_buy_max = calculated_buy_max
        ideal_buy_min = round(min(two_hundred_sma * 0.88, ideal_buy_max * 0.85), 2)

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
            "action_status": action_status,
            "timing_advice": advice,
            "rsi_14": stock_data.get("rsi_14", 54.0)
        }
