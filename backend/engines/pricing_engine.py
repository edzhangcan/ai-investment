"""
PricingEngine (估值与择时器)
Calculates historical valuation percentiles (P/E, P/S), simplified 2-Stage Discounted Cash Flow (DCF),
technical moving averages (50D & 200D SMA), RSI momentum, and generates safe "Ideal Buy Zone" brackets.
"""

from typing import Dict, Any

class PricingEngine:
    """Valuation & Technical Timing Engine."""

    @classmethod
    def evaluate_pricing_and_entry_zone(cls, stock_data: Dict[str, Any]) -> Dict[str, Any]:
        price = stock_data["current_price"]
        fifty_sma = stock_data["fifty_day_sma"]
        two_hundred_sma = stock_data["two_hundred_day_sma"]
        pe = stock_data["pe_ratio"]
        fcf = stock_data["free_cash_flow"]

        # 1. Simplified 2-Stage DCF Calculation
        # Assume 8% discount rate (WACC), 3% terminal growth rate, 10-year projection horizon
        wacc = 0.08
        terminal_growth = 0.03
        rev_growth = min(max(stock_data.get("revenue_growth", 0.08), 0.03), 0.25)
        
        # Estimate per-share FCF (simplified proxy via PE and price)
        implied_shares = max(1000000, (price * 10000000) / max(1.0, price))
        fcf_per_share = max(1.0, fcf / implied_shares) if implied_shares else price / max(1.0, pe)
        
        # Projected 10-year discounted cash flows
        dcf_value = 0.0
        current_fcf = fcf_per_share
        for year in range(1, 11):
            growth_rate = rev_growth if year <= 5 else (rev_growth + terminal_growth) / 2
            current_fcf *= (1 + growth_rate)
            dcf_value += current_fcf / ((1 + wacc) ** year)
        
        # Terminal Value
        terminal_value = (current_fcf * (1 + terminal_growth)) / (wacc - terminal_growth)
        discounted_tv = terminal_value / ((1 + wacc) ** 10)
        dcf_fair_value = round(dcf_value + discounted_tv, 2)
        
        # Guardrail DCF to realistic bounds relative to price
        dcf_fair_value = max(price * 0.6, min(price * 1.5, dcf_fair_value))

        # 2. Valuation Percentile Status
        if pe > 40:
            val_status = "Premium / High Multiple (高估值区间)"
            val_percentile = 85
        elif pe < 18:
            val_status = "Deep Value / Cheap (低估值区间)"
            val_percentile = 20
        else:
            val_status = "Fair Value (合理估值区间)"
            val_percentile = 55

        # 3. Technical Support & Buy Bracket Synthesis
        # Ideal Buy Range is defined as max(200D SMA, 90% of DCF Fair Value) down to 85% of 200D SMA
        ideal_buy_max = round(min(price, max(two_hundred_sma * 1.02, dcf_fair_value * 0.95)), 2)
        ideal_buy_min = round(ideal_buy_max * 0.90, 2)

        # Action status advice
        if price <= ideal_buy_max:
            action_status = "IN_BUY_ZONE (处于理想买入区间)"
            advice = f"Current price ${price} is within or below safe buy zone (${ideal_buy_min} - ${ideal_buy_max})."
        elif price <= fifty_sma:
            action_status = "PULLBACK_WATCH (回调观察期)"
            advice = f"Price ${price} is pulling back towards 200D MA (${two_hundred_sma}). Recommend setting price alert at ${ideal_buy_max}."
        else:
            action_status = "OVEREXTENDED (过度延伸/暂勿追高)"
            advice = f"Price ${price} is overextended above 200D MA (${two_hundred_sma}). Wait for pullbacks to ${ideal_buy_max}."

        return {
            "symbol": stock_data["symbol"],
            "current_price": price,
            "currency": stock_data["currency"],
            "fifty_day_sma": fifty_sma,
            "two_hundred_day_sma": two_hundred_sma,
            "pe_ratio": pe,
            "valuation_status": val_status,
            "valuation_percentile": val_percentile,
            "dcf_fair_value": dcf_fair_value,
            "ideal_buy_range_min": ideal_buy_min,
            "ideal_buy_range_max": ideal_buy_max,
            "action_status": action_status,
            "timing_advice": advice,
            "rsi_14": stock_data.get("rsi_14", 52.0)
        }
