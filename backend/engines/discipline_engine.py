"""
DisciplineEngine: Personal Investment Constitution Rule Engine & Trade Auditor.
Evaluates trade proposals against the 《纪律.md》 Personal Investment Constitution,
strictly enforcing the Four Horsemen of Ruin (反破产四铁律) and binary entry/exit guardrails.
Multi-language support for 'en', 'zh', and 'hybrid' modes.
"""

import logging
import os
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

CONSTITUTION_DEFAULT_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "discipline.default.md"
)


class DisciplineEngine:
    """Audits investment decisions against the personal discipline constitution."""

    _cached_constitution_text: Optional[str] = None

    @classmethod
    def get_constitution_content(cls, file_path: Optional[str] = None) -> str:
        """Reads and caches constitution markdown text."""
        path = file_path or CONSTITUTION_DEFAULT_PATH
        if cls._cached_constitution_text and path == CONSTITUTION_DEFAULT_PATH:
            return cls._cached_constitution_text

        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if path == CONSTITUTION_DEFAULT_PATH:
                        cls._cached_constitution_text = content
                    return content
            except Exception as e:
                logger.warning("Failed to read discipline constitution from %s: %s", path, e)

        return "# 纪律.md (Personal Investment Constitution)\n- Default rules active."

    @classmethod
    def audit_trade(
        cls,
        stock_data: Dict[str, Any],
        pricing_data: Optional[Dict[str, Any]] = None,
        position_data: Optional[Dict[str, Any]] = None,
        trend_temperature: Optional[str] = None,
        lang: str = "en",
        regime_data: Optional[Dict[str, Any]] = None,
        action: str = "BUY"
    ) -> Dict[str, Any]:
        """
        Audits a proposed trade against the Constitution.
        Enforces:
        1. block_counter_trend_averaging_down: No adding to losing positions in FREEZE/FLAT.
        2. block_vegetable_left_side: No buying VEGETABLE stocks in FREEZE/FLAT.
        3. block_single_stock_above_max_pct: Max 4% finite bet cap on satellite holdings.
        4. block_prosperity_trap: No buying into terminal ceiling saturation traps.
        """
        veto_reasons_en: List[str] = []
        veto_reasons_zh: List[str] = []

        pricing_data = pricing_data or {}
        position_data = position_data or {}
        taxonomy_info = stock_data.get("taxonomy") or pricing_data.get("taxonomy") or {}
        taxonomy = taxonomy_info.get("taxonomy") if isinstance(taxonomy_info, dict) else str(taxonomy_info)
        taxonomy = str(taxonomy).upper()

        trend_temp = (trend_temperature or stock_data.get("trend_temperature") or "FLAT").upper()
        reverse_dcf = pricing_data.get("reverse_dcf") or {}
        is_prosperity_trap = reverse_dcf.get("is_prosperity_trap", False)

        curr_pnl_pct = position_data.get("current_pnl_pct", 0.0)
        curr_weight_pct = position_data.get("current_weight_pct", 0.0)

        # 1. Four Horsemen Rule 1: No counter-trend averaging down on losers
        if curr_pnl_pct <= -5.0 and trend_temp in ["FREEZE", "FLAT"]:
            veto_reasons_en.append(
                f"Four Horsemen Veto: Counter-trend averaging down prohibited while position is in drawdown ({curr_pnl_pct:.1f}%) and trend is {trend_temp}."
            )
            veto_reasons_zh.append(
                f"反破产铁律一票否决：持仓处于浮亏状态（{curr_pnl_pct:.1f}%）且趋势为【{trend_temp}】，严禁逆势摊薄成本（禁止抄底接飞刀）。"
            )

        # 2. Four Horsemen Rule 2: No buying VEGETABLE stocks on the left side
        if taxonomy == "VEGETABLE" and trend_temp in ["FREEZE", "FLAT"]:
            veto_reasons_en.append(
                f"Vegetable Discipline Veto: VEGETABLE assets lack fundamental compounding value and cannot be bought on left side (trend: {trend_temp})."
            )
            veto_reasons_zh.append(
                f"种菜股纪律否决：无基本面自由现金流复利价值，严禁在左侧（【{trend_temp}】温度）抄底，仅限右侧温/热趋势交易。"
            )

        # 3. Four Horsemen Rule 3: Single stock capped at 4% max portfolio weight
        if curr_weight_pct >= 4.0:
            veto_reasons_en.append(
                f"Finite Bet Cap Veto: Current position weight ({curr_weight_pct:.1f}%) has reached or exceeded the 4.0% finite bet ceiling."
            )
            veto_reasons_zh.append(
                f"有限下注上限否决：当前仓位占比（{curr_weight_pct:.1f}%）已达到或超过 4.0% 卫星仓位绝对上限，禁止继续加仓。"
            )

        # 4. Four Horsemen Rule 4: Prosperity Trap blocked from fundamental entry
        if is_prosperity_trap:
            reason = reverse_dcf.get("prosperity_trap_reason", "Terminal ceiling saturation")
            veto_reasons_en.append(
                f"Prosperity Trap Veto: Stock flagged as cyclical prosperity trap ({reason}). Multiple compression risk is elevated."
            )
            veto_reasons_zh.append(
                f"景气度陷阱否决：触发景气度见顶预警（{reason}），高增速无法外推，估值存在大幅压缩风险。"
            )

        # 5. PL-726.4.2 Rule 5: No buying left-side falling knives below 20D & 50D SMA
        curr_p = float(stock_data.get("current_price") or pricing_data.get("current_price") or 0.0)
        sma20 = float(stock_data.get("twenty_day_sma") or pricing_data.get("twenty_day_sma") or 0.0)
        sma50 = float(stock_data.get("fifty_day_sma") or pricing_data.get("fifty_day_sma") or 0.0)
        ret_5d = float(pricing_data.get("ret_5d_pct") or stock_data.get("ret_5d_pct") or 0.0)
        action_st = str(pricing_data.get("action_status") or stock_data.get("action_status") or "")
        vol_dist = bool(stock_data.get("is_high_volume_distribution") or pricing_data.get("is_high_volume_distribution") or False)
        vol_ratio = float(stock_data.get("vol_ratio_5d_20d") or pricing_data.get("vol_ratio") or 1.0)

        is_right_side_flag = bool(pricing_data.get("is_right_side") or stock_data.get("is_right_side") or False)
        rs_path = str(pricing_data.get("right_side_path") or stock_data.get("right_side_path") or "NONE").upper()

        if is_right_side_flag and rs_path in ("TREND_CONTINUATION", "SUPPORT_BOUNCE", "BOTTOM_REVERSAL") and action_st in ("IN_BUY_ZONE", "处于理想买入区间", "处于理想买入区间 (IN_BUY_ZONE)"):
            is_left_knife_violation = False
        else:
            is_left_knife_violation = (
                action_st in ["LEFT_SIDE_WATCH", "左侧观察期", "左侧观察期 (LEFT_SIDE_WATCH)"] or
                (curr_p > 0 and sma20 > 0 and sma50 > 0 and curr_p < sma20 and curr_p < sma50 and (ret_5d < 0.0 or vol_ratio >= 1.25 or vol_dist))
            )
        if action == "BUY" and is_left_knife_violation:
            veto_reasons_en.append(
                f"Falling Knife Veto: Buying prohibited while stock is below 20D (${sma20:.2f}) and 50D (${sma50:.2f}) SMA with negative momentum (5D: {ret_5d:+.1f}%) or in Left-Side Watch."
            )
            veto_reasons_zh.append(
                f"左侧飞刀否决：股价处于 20日均线（${sma20:.2f}）与 50日均线（${sma50:.2f}）下方且处于下跌趋势/左侧观察期（5日: {ret_5d:+.1f}%），严禁抄底建仓。"
            )

        # 6. PL-726.4.2 Rule 6: Pre-Earnings Binary Blackout Window Veto (<= 7 calendar days)
        days_to_earn = stock_data.get("days_to_earnings")
        is_earn_blackout = bool(stock_data.get("is_earnings_blackout", False))
        if action == "BUY" and (is_earn_blackout or (days_to_earn is not None and 0 <= int(days_to_earn) <= 7)):
            d_str = f"{days_to_earn} days" if days_to_earn is not None else "<= 7 days"
            veto_reasons_en.append(
                f"Earnings Blackout Veto: New buy prohibited within {d_str} of quarterly earnings release (binary gap risk)."
            )
            veto_reasons_zh.append(
                f"财报黑窗期否决：距离季度财报披露仅剩 {d_str}，存在业绩二元跳空风险，严禁新建仓位。"
            )

        # 7. PL-726.4.2 Rule 7: Sector / Commodity Tape Headwind Veto (driver 5D <= -5.0%)
        driver_ret_5d = float((regime_data or {}).get("driver_ret_5d_pct") or stock_data.get("driver_ret_5d_pct") or 0.0)
        driver_sym = str((regime_data or {}).get("driver_symbol") or stock_data.get("driver_symbol") or "")
        is_headwind = bool((regime_data or {}).get("is_sector_headwind") or stock_data.get("is_sector_headwind") or (driver_ret_5d <= -5.0))
        if action == "BUY" and (driver_ret_5d <= -5.0 or (is_headwind and driver_sym)):
            veto_reasons_en.append(
                f"Sector/Commodity Tape Headwind Veto: Primary benchmark driver {driver_sym} is in severe selloff ({driver_ret_5d:+.1f}% 5D <= -5.0%)."
            )
            veto_reasons_zh.append(
                f"板块商品逆风否决：核心驱动标的 {driver_sym} 遭遇严重抛售（5日: {driver_ret_5d:+.1f}% <= -5.0%），严禁逆势开仓。"
            )

        is_compliant = len(veto_reasons_en) == 0

        audit_summary_en = (
            "Discipline Audit Passed: Proposed trade strictly complies with all 《纪律.md》 constitutional guardrails."
            if is_compliant else
            f"DISCIPLINE BLOCKED: {len(veto_reasons_en)} constitutional vetoes triggered: {'; '.join(veto_reasons_en)}"
        )
        audit_summary_zh = (
            "《纪律.md》宪法审查通过：交易提案符合定战场、定进出场、定仓位管理的全部风控准则。"
            if is_compliant else
            f"《纪律.md》一票否决：触发 {len(veto_reasons_zh)} 项反破产违规准则：{'; '.join(veto_reasons_zh)}"
        )

        return {
            "is_compliant": is_compliant,
            "audit_verdict": "COMPLIANT" if is_compliant else "DISCIPLINE_BLOCKED",
            "veto_count": len(veto_reasons_en),
            "veto_reasons": veto_reasons_en,
            "veto_reasons_zh": veto_reasons_zh,
            "audit_summary_en": audit_summary_en,
            "audit_summary_zh": audit_summary_zh,
            "summary": audit_summary_zh if lang == "zh" else audit_summary_en,
            "constitution_file": "backend/data/discipline.default.md"
        }
