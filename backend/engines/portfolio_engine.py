"""
PortfolioEngine: Portfolio Position Sizing & Rebalancing Calculator Engine
Calculates risk-adjusted dollar allocations, target portfolio weights,
exact executable share counts, and residual cash buffers based on investor risk profiles.
Multi-language support for 'en', 'zh', and 'hybrid' modes.
"""

import logging
import math
from typing import Dict, Any, List, Optional
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.recommendation_engine import RecommendationEngine

logger = logging.getLogger(__name__)

# Risk Profile Allocation Parameters
RISK_PROFILES = {
    "CONSERVATIVE": {
        "label": {"en": "Conservative (🛡️ 保守型)", "zh": "🛡️ 保守型 (防守避险)", "hybrid": "🛡️ 保守型 (Conservative)"},
        "max_per_stock_pct": 3.0,
        "cash_buffer_pct": 40.0,
        "equity_allocation_pct": 60.0
    },
    "BALANCED": {
        "label": {"en": "Balanced (⚖️ 稳健型)", "zh": "⚖️ 稳健型 (攻守兼备)", "hybrid": "⚖️ 稳健型 (Balanced)"},
        "max_per_stock_pct": 5.0,
        "cash_buffer_pct": 20.0,
        "equity_allocation_pct": 80.0
    },
    "AGGRESSIVE": {
        "label": {"en": "Aggressive (🚀 激进型)", "zh": "🚀 激进型 (积极进攻)", "hybrid": "🚀 激进型 (Aggressive)"},
        "max_per_stock_pct": 8.0,
        "cash_buffer_pct": 10.0,
        "equity_allocation_pct": 90.0
    }
}

class PortfolioEngine:
    """Calculates risk-adjusted portfolio share counts and position sizing."""

    @classmethod
    def calculate_position_sizes(
        cls,
        cash_balance: float,
        risk_profile: str = "BALANCED",
        currency: str = "USD",
        selected_symbols: Optional[List[str]] = None,
        lang: str = "en"
    ) -> Dict[str, Any]:
        """
        Executes position sizing calculations for given capital and risk profile.
        Returns target weights, dollar allocations, exact share counts, and residual cash.
        """
        risk_profile = risk_profile.upper()
        if risk_profile not in RISK_PROFILES:
            risk_profile = "BALANCED"

        profile_params = RISK_PROFILES[risk_profile]
        max_stock_pct = profile_params["max_per_stock_pct"]
        cash_buffer_pct = profile_params["cash_buffer_pct"]
        equity_alloc_pct = profile_params["equity_allocation_pct"]

        # Default to top recommended stocks if no custom symbols provided
        if not selected_symbols or len(selected_symbols) == 0:
            recs_data = RecommendationEngine.get_top_recommendations(lang=lang)
            sector_stocks = [s["symbol"] for s in recs_data.get("sector_overweight_stocks", [])[:4]]
            leader_stocks = [s["symbol"] for s in recs_data.get("overall_recommended_stocks", [])[:4]]
            gold_stocks = [s["symbol"] for s in recs_data.get("gold_nugget_stocks", [])[:4]]
            selected_symbols = sector_stocks + leader_stocks + gold_stocks

        # Filter unique valid symbols
        unique_symbols = list(dict.fromkeys(selected_symbols))

        available_equity_capital = cash_balance * (equity_alloc_pct / 100.0)
        target_cash_reserve = cash_balance * (cash_buffer_pct / 100.0)

        raw_weight_per_stock = min(max_stock_pct, 100.0 / max(1, len(unique_symbols)))
        target_dollar_per_stock = cash_balance * (raw_weight_per_stock / 100.0)

        position_breakdown = []
        total_allocated_dollars = 0.0

        for symbol in unique_symbols:
            stock_data = DataProviderManager.get_stock_data(symbol)
            curr_price = stock_data.get("current_price", 100.0)
            comp_name = stock_data.get("company_name", symbol)
            mkt = stock_data.get("market", "US")
            curr = stock_data.get("currency", currency)

            # Exact Share Count (floor to integer)
            share_count = math.floor(target_dollar_per_stock / curr_price) if curr_price > 0 else 0
            actual_allocated_dollars = round(share_count * curr_price, 2)
            actual_weight_pct = round((actual_allocated_dollars / cash_balance) * 100.0, 2) if cash_balance > 0 else 0.0

            total_allocated_dollars += actual_allocated_dollars

            position_breakdown.append({
                "symbol": symbol,
                "company_name": comp_name,
                "market": mkt,
                "currency": curr,
                "current_price": curr_price,
                "target_weight_pct": round(raw_weight_per_stock, 2),
                "actual_weight_pct": actual_weight_pct,
                "target_dollar_amount": round(target_dollar_per_stock, 2),
                "actual_allocated_amount": actual_allocated_dollars,
                "executable_shares": share_count,
                "is_ca": symbol.endswith(".TO")
            })

        residual_unallocated_cash = round(cash_balance - total_allocated_dollars, 2)

        strategy_summary = (
            f"Calculated position sizing for {currency} ${cash_balance:,.2f} capital under {risk_profile} risk profile ({equity_alloc_pct}% equity, {cash_buffer_pct}% cash buffer)."
            if lang == "en" else
            (f"已完成 {currency} ${cash_balance:,.2f} 资金在【{profile_params['label']['zh']}】模型下的仓位配比计算（股票仓位 {equity_alloc_pct}%，预留现金 {cash_buffer_pct}%）。"
             if lang == "zh" else
             f"已完成 {currency} ${cash_balance:,.2f} 在【{profile_params['label']['hybrid']}】模型下的仓位配比 (Position Sizing)。")
        )

        return {
            "cash_balance": cash_balance,
            "currency": currency,
            "risk_profile": risk_profile,
            "risk_profile_label": profile_params["label"].get(lang, profile_params["label"]["en"]),
            "equity_allocation_pct": equity_alloc_pct,
            "cash_buffer_pct": cash_buffer_pct,
            "max_per_stock_pct": max_stock_pct,
            "total_allocated_dollars": round(total_allocated_dollars, 2),
            "residual_unallocated_cash": residual_unallocated_cash,
            "strategy_summary": strategy_summary,
            "position_breakdown": position_breakdown
        }
