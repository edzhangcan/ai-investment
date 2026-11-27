"""
Human-Readable Explainer & Decision-Guide Builders for TooBusyEngine ("Too Busy" Tool - Tab 5).

Separates bilingual plain-English / everyday-analogy UI payloads from core quantitative execution
so both modules stay focused, readable, and easy to maintain.
"""

from typing import Dict, Any, List


# Static ETF families & structural US vs. Canada comparisons kept in a single data table
# rather than hardcoding conditional branches in multiple endpoints.
EQUIVALENT_ETF_FAMILIES: List[Dict[str, str]] = [
    {
        "family_id": "NDX_3X",
        "index_name_en": "Nasdaq-100 (^NDX)",
        "index_name_zh": "纳斯达克100 (^NDX)",
        "leverage": "3x Daily",
        "market": "US",
        "currency": "USD",
        "long_etf": "TQQQ",
        "short_etf": "SQQQ",
        "cash_etf": "SGOV",
        "best_for_en": "Primary Growth Engine: Highest liquid 3x beta; ideal for both Dual Attack and Balanced Long-Only.",
        "best_for_zh": "首选核心成长引擎：流动性最强、价差最小，同时完美适配双工激进与长多稳健模式。",
    },
    {
        "family_id": "SP500_3X",
        "index_name_en": "S&P 500 (^GSPC)",
        "index_name_zh": "标普500指数 (^GSPC)",
        "leverage": "3x Daily",
        "market": "US",
        "currency": "USD",
        "long_etf": "UPRO / SPXL",
        "short_etf": "SPXU / SPXS",
        "cash_etf": "SGOV / BIL",
        "best_for_en": "Broader 500-company US blend with slightly lower volatility and lower tech concentration than TQQQ.",
        "best_for_zh": "全美500强均衡盘：行业更分散，单日波动率略低于纯科技权重较高的纳指3倍。",
    },
    {
        "family_id": "SEMIS_3X",
        "index_name_en": "ICE Semiconductor Index",
        "index_name_zh": "费城/ICE 半导体指数",
        "leverage": "3x Daily",
        "market": "US",
        "currency": "USD",
        "long_etf": "SOXL",
        "short_etf": "SOXS",
        "cash_etf": "SGOV",
        "best_for_en": "Extreme-beta tactical satellite ONLY — huge swings (-85%+ drops); do NOT use as core beginner sleeve.",
        "best_for_zh": "极高波动战术卫星：半导体周期剧烈（回撤常达 -85%+），切勿用作新手底仓主仓。",
    },
    {
        "family_id": "NDX_1X_CORE",
        "index_name_en": "Nasdaq-100 Unleveraged (^NDX)",
        "index_name_zh": "纳斯达克100 无杠杆 (^NDX)",
        "leverage": "1x Spot",
        "market": "US / CA",
        "currency": "USD / CAD",
        "long_etf": "QQQ / QQQM (HXQ.TO)",
        "short_etf": "SGOV / CASH.TO",
        "cash_etf": "SGOV / CASH.TO",
        "best_for_en": "Low-stress 1x foundation for sleepy accounts where leverage decay and swap financing must be zero.",
        "best_for_zh": "零杠杆安心底仓：零融券成本与每日复利损耗，适合极低风险偏好的慢速复利账户。",
    },
    {
        "family_id": "CA_TSX_2X",
        "index_name_en": "Nasdaq-100 CAD-Hedged (TSX)",
        "index_name_zh": "加股 TSX 纳指100对冲 (CAD)",
        "leverage": "2x Daily (IIROC Cap)",
        "market": "CA",
        "currency": "CAD",
        "long_etf": "HQU.TO (BetaPro 2x)",
        "short_etf": "HQD.TO (-2x)",
        "cash_etf": "CASH.TO / PSA.TO",
        "best_for_en": "Native CAD TFSA/RRSP pod: avoids 1.5% FX fees & IRS 15% US dividend withholding.",
        "best_for_zh": "原生加元 TFSA/RRSP 账户专属：免 1.5% 换汇损费及美股股息预扣税，原生 2倍加元护航。",
    },
]

US_VS_CANADA_DIFFERENCES: List[Dict[str, str]] = [
    {
        "id": "max_leverage_cap",
        "title_en": "1. 3x vs 2x Leverage Ceiling (SEC vs. CIRO/IIROC)",
        "title_zh": "1. 杠杆上限差异：美国 3倍 vs 加拿大法定 2倍封顶",
        "detail_en": "US exchanges allow 3x daily ETFs (TQQQ / SQQQ). Canadian regulators cap TSX daily leveraged ETFs at 2x (HQU.TO / HQD.TO).",
        "detail_zh": "美国交易所允许 3倍杠杆 ETF (TQQQ / SQQQ)；加拿大监管机构规定多伦多 TSX 上市杠杆 ETF 最高只能 2倍 (HQU.TO / HQD.TO)。",
    },
    {
        "id": "currency_and_fx",
        "title_en": "2. Hidden 1.5% Currency Conversion Trap in CAD Accounts",
        "title_zh": "2. 加元账户直接买美股 ETF 的 1.5% 隐藏换汇杀手",
        "detail_en": "Buying TQQQ in a pure CAD broker account triggers ~1.5% FX spread each trade (~3% round-trip), eating small-account profits. Trade TSX ETFs in CAD or use a USD sub-account.",
        "detail_zh": "如果在纯加元账户频繁买卖美股 TQQQ，单边约 1.5% 的换汇点差会吞噬小账户收益。加元请留在 TSX (HQU.TO/CASH.TO)，美元请用独立美元账户。",
    },
    {
        "id": "tax_sheltered_accounts",
        "title_en": "3. Tax-Sheltered Matchmaking (Roth IRA vs. TFSA & RRSP)",
        "title_zh": "3. 避税账户精确配对（US Roth IRA / CA TFSA & RRSP）",
        "detail_en": "Frequent 15:50 EST rotations trigger short-term capital gains & wash-sales in taxable accounts. Keep US 3x Dual inside a Roth IRA / Tax-Sheltered account, and CAD inside TFSA/RRSP (1 trade/day max avoids CRA business-income flags).",
        "detail_zh": "高频尾盘调仓在应税账户易产生短期税负与洗售问题。美股建议放 Roth IRA 或免税账户，加元放入 TFSA/RRSP（每日收盘仅调仓一次，保持低换手以防 CRA 认定为高频商业日内交易）。",
    },
    {
        "id": "cash_yield_vehicle",
        "title_en": "4. Risk-Free Cash Parking (SGOV USD vs. CASH.TO CAD)",
        "title_zh": "4. 避险现金收息工具差异 (SGOV vs CASH.TO)",
        "detail_en": "When markets break down, US funds park in SGOV (0–3M US T-Bills); Canadian funds park in CASH.TO / PSA.TO (High-Interest Savings ETFs).",
        "detail_zh": "避险空仓期间，美元资金泊入 SGOV 短期美债，加元泊入 CASH.TO 高息储蓄 ETF，躺赚无风险利息。",
    },
]


def build_equivalent_etf_matrix() -> Dict[str, Any]:
    """Returns global 1x/2x/3x ETF execution alternatives and US vs. Canada structural constraints."""
    return {
        "families": list(EQUIVALENT_ETF_FAMILIES),
        "us_vs_canada_differences": list(US_VS_CANADA_DIFFERENCES),
    }


def build_sub_strategy_cards(
    features: Dict[str, Any],
    scores: Dict[str, Any],
    vehicles: Dict[str, Any],
    mode: str,
) -> List[Dict[str, Any]]:
    """
    Formats the S1-S7 mechanical signals into beginner-friendly telemetry cards.
    Always emits all 7 cards; S6 & S7 clearly display 'would allocate' telemetry even when dormant in Long-Only mode.
    """
    c = float(features["current_close"])
    sma_20 = float(features["sma_20"])
    sma_50 = float(features["sma_50"])
    sma_250 = float(features["sma_250"])
    ext_50 = float(features["ext_50_pct"])
    ext_250 = float(features["ext_250_pct"])
    roc_5 = float(features["roc_5_pct"])
    roc_10 = float(features["roc_10_pct"])
    roc_20 = float(features["roc_20_pct"])
    d_roc_5 = float(features["d_roc_5_pct"])
    z_bb_20 = float(features["z_bb_20"])
    rsi_5 = float(features["rsi_5"])
    rsi_10 = float(features["rsi_10"])

    s1_state, s1_weight = scores["s1_state"], scores["s1_weight"]
    s2_state, s2_weight = scores["s2_state"], scores["s2_weight"]
    s3_state, s3_weight = scores["s3_state"], scores["s3_weight"]
    s4_state, s4_weight = scores["s4_state"], scores["s4_weight"]
    s5_state, s5_cap_pct, s5_effect = scores["s5_state"], scores["s5_cap_pct"], scores["s5_effect"]
    s6_weight, s7_weight = scores["s6_weight"], scores["s7_weight"]

    is_dual = mode == "TOO_BUSY_DUAL"
    long_etf = vehicles["long_etf"]
    short_etf = vehicles["short_etf"]

    return [
        {
            "id": "S1",
            "code": "TF_LONG_CORE",
            "term_key": "SMA250_Trend",
            "name_en": "S1: Core 50D/250D Trend Long",
            "name_zh": "S1: 50日/250日核心趋势长线多头",
            "category": "TREND_LONG",
            "status": s1_state,
            "status_human_en": "Green Light: Trend Engine Active" if s1_state == "ACTIVE" else "Sleeping (Safety Off: Index Below Main Averages)",
            "status_human_zh": "绿灯启动：顺势主引擎持仓中" if s1_state == "ACTIVE" else "休眠避险中（指数跌破主要均线）",
            "weight_pct": s1_weight,
            "effect_label": f"+{int(s1_weight)}% {long_etf}",
            "telemetry": f"NDX ${c:,.0f} vs 50D ${sma_50:,.0f} & 250D ${sma_250:,.0f}",
            "rule_en": "Holds core long position whenever ^NDX trades above its 250-day and 50-day moving averages.",
            "rule_zh": "当纳指100 (^NDX) 处于 250日 与 50日均线上方时坚定持有核心多头底仓。",
            "why_status_en": (
                f"Active (+{int(s1_weight)}%) because Nasdaq-100 (${c:,.0f}) is holding above trend support."
                if s1_state == "ACTIVE"
                else f"Standby (0%) because Nasdaq-100 (${c:,.0f}) is below both its 50-day (${sma_50:,.0f}) and 250-day (${sma_250:,.0f}) lines."
            ),
            "why_status_zh": (
                f"已触发 (+{int(s1_weight)}%)：纳指100 (${c:,.0f}) 位于核心趋势均线上方。"
                if s1_state == "ACTIVE"
                else f"未触发 (0%)：纳指100 (${c:,.0f}) 目前同时低于 50日 (${sma_50:,.0f}) 与 250日 (${sma_250:,.0f}) 均线，不盲目做多。"
            ),
            "analogy_en": "Sailing with the wind at your back: hoist full sails only when the ocean current flows forward.",
            "analogy_zh": "顺风扬帆：只有当大潮向前推进（站上均线）时才张开主帆，逆风时先收帆保船。",
        },
        {
            "id": "S2",
            "code": "MOM_LONG_ACCEL",
            "term_key": "Velocity_ROC",
            "name_en": "S2: Momentum Velocity Amplifier",
            "name_zh": "S2: 动量加速主升浪放大器",
            "category": "MOMENTUM_LONG",
            "status": s2_state,
            "status_human_en": "Green Light: Turbo Boost Active" if s2_state == "ACTIVE" else "Standby (Waiting for Positive Speed)",
            "status_human_zh": "绿灯开启：动量涡轮加速中" if s2_state == "ACTIVE" else "待命中（短期车速尚未转正）",
            "weight_pct": s2_weight,
            "effect_label": f"+{int(s2_weight)}% {long_etf}",
            "telemetry": f"ROC(10): {roc_10:+.2f}% | dROC(5): {d_roc_5:+.2f}%",
            "rule_en": "Scales trend position to 100% when 10-day momentum >= +1.5% and 5-day velocity is not decelerating.",
            "rule_zh": "当10日动量 >= +1.5% 且 5日速率未发生衰减时，将顺势多头仓位加满至 100%。",
            "why_status_en": (
                f"Active (+{int(s2_weight)}%): 10-day speed is positive ({roc_10:+.2f}%) and pushing forward."
                if s2_state == "ACTIVE"
                else f"Standby (0%): 10-day momentum is {roc_10:+.2f}% (needs positive upside speed >= +1.5% above 50D SMA)."
            ),
            "why_status_zh": (
                f"已触发 (+{int(s2_weight)}%)：10日涨速 {roc_10:+.2f}% 保持强劲向上。"
                if s2_state == "ACTIVE"
                else f"待命中 (0%)：10日动量为 {roc_10:+.2f}%，尚未满足站上50日线且稳定加速的条件。"
            ),
            "analogy_en": "Highway turbo boost: press the gas to 100% only after merging cleanly onto a fast, clear highway.",
            "analogy_zh": "高速涡轮增压：只有在车流顺畅的高速路上，才踩满油门到 100%。",
        },
        {
            "id": "S3",
            "code": "MR_LONG_UPTREND_DIP",
            "term_key": "Wilder_RSI",
            "name_en": "S3: Bull-Market Pullback & Golden-Cross Shakeout Buyer",
            "name_zh": "S3: 牛市回调与金叉深蹲企稳低吸",
            "category": "MEAN_REVERSION_LONG",
            "status": s3_state,
            "status_human_en": "Active: Buying Bull Dip / Golden-Cross Rebound" if s3_state == "ACTIVE" else "Standby (Not an Active Bull Dip)",
            "status_human_zh": "已触发：牛市回调 / 金叉深蹲企稳低吸" if s3_state == "ACTIVE" else "待命中（非牛市回调或尚未企稳）",
            "weight_pct": s3_weight,
            "effect_label": f"+{int(s3_weight)}% {long_etf}",
            "telemetry": f"50D vs 250D: {'Golden Cross' if sma_50 > sma_250 else 'Death Cross'} | RSI(10): {rsi_10:.1f} | dROC(5): {d_roc_5:+.2f}%",
            "rule_en": "Buys oversold pullbacks (>250D SMA, +30%) or Golden-Cross 250D shakeout rebounds (50D > 250D, RSI_10 < 45 & dROC_5 > 0, +40%).",
            "rule_zh": "在250日线上方超卖低吸 (+30%)，或在牛市金叉 (50日>250日线) 假摔跌破250日线且5日动量转正 (dROC_5 > 0) 时右侧回补 (+40%)。",
            "why_status_en": (
                f"Active (+{int(s3_weight)}%): Macro Golden Cross (50D ${sma_50:,.0f} > 250D ${sma_250:,.0f}) is intact while 5-day velocity turned positive ({d_roc_5:+.2f}%) from oversold RSI_10 ({rsi_10:.1f})."
                if s3_state == "ACTIVE"
                else f"Standby (0%): Requires either Index > 250D SMA (${sma_250:,.0f}) on an oversold dip, or a Golden-Cross (50D > 250D) rebound with dROC_5 > 0 (currently {d_roc_5:+.2f}%)."
            ),
            "why_status_zh": (
                f"已触发 (+{int(s3_weight)}%)：宏观牛市金叉 (50日 ${sma_50:,.0f} > 250日 ${sma_250:,.0f}) 完好，且短期超卖后 5日加速度已转正 ({d_roc_5:+.2f}%)，顺势捕捉反弹。"
                if s3_state == "ACTIVE"
                else f"待命中 (0%)：需处于250日线上方超卖回调，或在金叉结构下出现 5日动量转正 (当前 dROC_5 {d_roc_5:+.2f}%)。"
            ),
            "analogy_en": "Black Friday sale in a great neighborhood: when the macro Golden Cross is intact and momentum turns back up, buy the rebound instead of panicking.",
            "analogy_zh": "好地段的黄金深蹲：只要50日线仍高于250日线（宏观金叉未破）且下杀动能转正回升，就是黄金坑右侧上车点。",
        },
        {
            "id": "S4",
            "code": "MR_LONG_PIVOT_AND_FLUSH",
            "term_key": "Bollinger_Z",
            "name_en": "S4: 20D Pivot Reclaim & Panic Capitulation V-Bounce",
            "name_zh": "S4: 20日线右侧收复与极端恐慌 V 型反弹",
            "category": "MEAN_REVERSION_LONG",
            "status": s4_state,
            "status_human_en": "Active: Capitulation / Pivot Bounce Open" if s4_state == "ACTIVE" else "Standby (No Extreme Panic Flush Today)",
            "status_human_zh": "已触发：极值恐慌抄底 / 右侧拐点开启" if s4_state == "ACTIVE" else "待命中（今日非极端恐慌极值日）",
            "weight_pct": s4_weight,
            "effect_label": f"+{int(s4_weight)}% {long_etf}",
            "telemetry": f"RSI(5): {rsi_5:.1f} (<18 trigger) | Z_BB(20): {z_bb_20:+.2f}σ",
            "rule_en": "Adds +30% when a bull pullback reclaims 20D SMA, or +50% immediately at 15:50 EST on extreme panic capitulation flushes (RSI_5 < 18 or RSI_10 < 24.5 with Z_BB <= -2.2σ).",
            "rule_zh": "牛市回调重新站上20日线加仓 +30%；或当极端恐慌砸盘出现 (RSI_5 < 18 或 Z_BB <= -2.2σ) 时在当日尾盘立即抄底 +50% 博弈次日 V 型暴涨。",
            "why_status_en": (
                f"Active (+{int(s4_weight)}%): Extreme panic capitulation or 20D pivot reclaim triggered (RSI_5 {rsi_5:.1f}, Z_BB {z_bb_20:+.2f}σ)."
                if s4_state == "ACTIVE"
                else f"Standby (0%): Extreme panic flush fires when RSI_5 < 18.0 (currently {rsi_5:.1f}, as on Friday 2026-11-20 when RSI_5 hit 13.1 before Monday's +6.86% surge)."
            ),
            "why_status_zh": (
                f"已触发 (+{int(s4_weight)}%)：满足极端恐慌抛售抄底或20日线收复条件 (RSI_5 {rsi_5:.1f}, Z_BB {z_bb_20:+.2f}σ)。"
                if s4_state == "ACTIVE"
                else f"待命中 (0%)：极值恐慌抄底需 RSI_5 < 18.0（当前 {rsi_5:.1f}；例如上周五 11-20 RSI_5 跌至 13.1 触发 +50% 抄底，次日周一纳指暴涨 +6.86%）。"
            ),
            "analogy_en": "Rubber band pulled to breaking point (RSI_5 < 18): over 40 years, buying the close of extreme capitulation days wins 60% of the very next session (+2.64%/day on 3x).",
            "analogy_zh": "拉到极限的橡皮筋 (RSI_5 < 18)：40年回测显示，在极端恐慌日尾盘入场，次日反弹胜率达 60%（3倍ETF次日平均收益 +2.64%）。",
        },
        {
            "id": "S5",
            "code": "MR_OVEREXT_DECEL_TRIM",
            "term_key": "MA_Extension",
            "name_en": "S5: Overextension Velocity Decel Trimmer",
            "name_zh": "S5: 超涨速率衰减自动降仓锁利器",
            "category": "VELOCITY_TRIM_SHIELD",
            "status": s5_state,
            "status_human_en": f"Alert Active: Locking Profit ({s5_effect})" if s5_state == "ACTIVE_TRIM" else "Standby (Not Overstretched Above Averages)",
            "status_human_zh": f"已触发止盈：自动减仓锁利 ({s5_effect})" if s5_state == "ACTIVE_TRIM" else "待命中（当前未处于超涨过热状态）",
            "weight_pct": s5_cap_pct if s5_cap_pct is not None else 0.0,
            "effect_label": s5_effect,
            "telemetry": f"Ext(50D): {ext_50:+.2f}% | Ext(250D): {ext_250:+.2f}% | dROC(5): {d_roc_5:+.2f}%",
            "rule_en": "Velocity deceleration rule: when stretched >10% above 50D SMA and 5D velocity slows down, trims growth ETF to 30% and parks 70% in T-Bills.",
            "rule_zh": "趋势减速锁利规则：当偏离50日线超 +10% 且 5日动量减速转负时，自动将进攻仓位降至 30%，70% 转入国债锁利。",
            "why_status_en": (
                f"Active Trim: Index stretched {ext_50:+.1f}% above 50D SMA while velocity slowed ({d_roc_5:+.2f}%), capping risk to lock gains."
                if s5_state == "ACTIVE_TRIM"
                else f"Standby: Index is {ext_50:+.2f}% vs 50D SMA (only trims when overheated > +10% above 50D SMA and slowing down)."
            ),
            "why_status_zh": (
                f"已触发降仓：指数偏离 50日线达 {ext_50:+.1f}% 且速度放缓 ({d_roc_5:+.2f}%)，自动兑现部分利润进国债。"
                if s5_state == "ACTIVE_TRIM"
                else f"待命中：当前距 50日均线 {ext_50:+.2f}%（仅在高于50日线超 +10% 且开始减速时自动锁利）。"
            ),
            "analogy_en": "Taking chips off the table when a hot streak starts cooling down, before giving gains back.",
            "analogy_zh": "连胜滚大之后见好就收：当冲刺速度明显放缓时，提前把七成筹码换回保险箱。",
        },
        {
            "id": "S6",
            "code": "MR_BEAR_RALLY_SHORT",
            "term_key": "SQQQ_ETF",
            "name_en": "S6: Bear-Rally Exhaustion Short (Dual Mode)",
            "name_zh": "S6: 熊市超买反抽衰竭做空 (双工模式)",
            "category": "MEAN_REVERSION_SHORT",
            "status": ("ACTIVE" if s6_weight > 0 else "STANDBY") if is_dual else "DISABLED_IN_LONG_ONLY",
            "status_human_en": (
                "Active Short: Fading Weak Bear Bounce (+40%)" if (is_dual and s6_weight > 0)
                else ("Standby: Bear Bounce Not Exhausted Yet" if is_dual else "Long-Only Mode Offsets Shorts Into T-Bills")
            ),
            "status_human_zh": (
                "双工做空启动：逢高做空衰竭反弹 (+40%)" if (is_dual and s6_weight > 0)
                else ("待命中：暂无超买衰竭反弹" if is_dual else "稳健长多模式关闭做空，熊市全仓转国债收息")
            ),
            "weight_pct": s6_weight if is_dual else 0.0,
            "would_allocate_short_pct": s6_weight,
            "effect_label": (
                f"+{int(s6_weight)}% {short_etf}"
                if is_dual
                else f"Long-Only Shield Active (Dual would put +{int(s6_weight)}% {short_etf})"
            ),
            "telemetry": f"RSI(5): {rsi_5:.1f} | dROC(5): {d_roc_5:+.2f}%",
            "rule_en": "Shorts exhausted bear-market relief rallies below falling 250D & 50D SMAs.",
            "rule_zh": "在250日与50日均线下方，当熊市反弹出现 RSI(5) > 65 且减速时配置反向 ETF。",
            "why_status_en": (
                f"Shorting exhausted bounce above 20D SMA (RSI_5 {rsi_5:.1f} > 65) while primary trend remains down."
                if (is_dual and s6_weight > 0)
                else f"Requires NDX >= 20D SMA (${sma_20:,.0f}) with RSI_5 > 65 inside a downtrend (currently RSI_5 {rsi_5:.1f})."
            ),
            "why_status_zh": (
                f"熊市弱反弹触及短期超买衰竭 (RSI_5 {rsi_5:.1f} > 65)，配置反向 ETF 博弈回落。"
                if (is_dual and s6_weight > 0)
                else f"需指数低于50/250日线但反抽站上20日线且 RSI_5 > 65（当前 RSI_5 {rsi_5:.1f}）。"
            ),
            "analogy_en": "Profiting when a weak dead-cat bounce runs out of breath under a heavy ceiling.",
            "analogy_zh": "熊市天花板下的“假动作”：等弱势反抽喘不过气时反向做空。",
        },
        {
            "id": "S7",
            "code": "MOM_BEAR_BREAKDOWN_SHORT",
            "term_key": "SQQQ_ETF",
            "name_en": "S7: Bear Breakdown Velocity Short (Dual Mode)",
            "name_zh": "S7: 熊市破位加速顺势做空 (双工模式)",
            "category": "MOMENTUM_SHORT",
            "status": ("ACTIVE" if s7_weight > 0 else "STANDBY") if is_dual else "DISABLED_IN_LONG_ONLY",
            "status_human_en": (
                f"Active Bear Short: Riding Downtrend (+{int(s7_weight)}% {short_etf})" if (is_dual and s7_weight > 0)
                else (
                    "Safety Floor Triggered / Waiting for Breakdown" if is_dual
                    else f"Off in Long-Only (Dual Mode Would Put +{int(s7_weight)}% {short_etf})"
                )
            ),
            "status_human_zh": (
                f"双工引擎做空启动：顺势持有 +{int(s7_weight)}% {short_etf}" if (is_dual and s7_weight > 0)
                else (
                    "待命或触发防轧空底线 (RSI_10 < 30)" if is_dual
                    else f"当前稳健模式不开启（双工模式今日将配置 +{int(s7_weight)}% {short_etf}）"
                )
            ),
            "weight_pct": s7_weight if is_dual else 0.0,
            "would_allocate_short_pct": s7_weight,
            "effect_label": (
                f"+{int(s7_weight)}% {short_etf}"
                if is_dual
                else f"Long-Only Shield Active (Dual would put +{int(s7_weight)}% {short_etf})"
            ),
            "telemetry": f"50D vs 250D: {'Golden Cross' if sma_50 > sma_250 else 'Death Cross'} | Ext(50D): {ext_50:+.2f}% | dROC(5): {d_roc_5:+.2f}%",
            "rule_en": "Allocates 30%–50% inverse ETF only in confirmed Death Cross bear breakdowns (50D <= 250D, dROC_5 < 0, Ext_50 >= -9%, RSI_10 >= 35).",
            "rule_zh": "仅在死叉确认的熊市加速下破 (50日<=250日线、dROC_5 < 0、偏离50日线 >= -9%、RSI_10 >= 35) 时配置 30%–50% 反向 ETF；牛市金叉深蹲或动量转正时严禁做空。",
            "why_status_en": (
                f"Death Cross downtrend confirmed (50D <= 250D, Ext_50 {ext_50:+.2f}% >= -9%, dROC_5 {d_roc_5:+.2f}% < 0, RSI_10 {rsi_10:.1f} >= 35)."
                if s7_weight > 0
                else (
                    f"Anti-squeeze guardrail blocked SQQQ: macro Golden Cross is still intact (50D ${sma_50:,.0f} > 250D ${sma_250:,.0f}), index is stretched {ext_50:+.2f}% vs 50D SMA, or 5D velocity turned positive ({d_roc_5:+.2f}%)."
                    if (c <= sma_250 and c <= sma_50 and (sma_50 > sma_250 or ext_50 < -9.0 or d_roc_5 >= 0.0 or rsi_10 < 35.0))
                    else "Standby: Needs confirmed Death Cross bear breakdown below 20D/50D/250D SMAs with negative acceleration."
                )
            ),
            "why_status_zh": (
                f"死叉加速跌势确认（50日<=250日线，距50日线 {ext_50:+.2f}% >= -9%，5日加速度 {d_roc_5:+.2f}% < 0，RSI_10 {rsi_10:.1f} >= 35），适度配置 {int(s7_weight)}% 反向仓位。"
                if s7_weight > 0
                else (
                    f"防轧空护栏已拦截 SQQQ：当前宏观金叉未破 (50日 ${sma_50:,.0f} > 250日 ${sma_250:,.0f})、距 50日线已达 {ext_50:+.2f}% 或 5日动量已转正 ({d_roc_5:+.2f}%)，40年回测显示此时做空胜率仅 46.4%，极易遭遇暴力反弹。"
                    if (c <= sma_250 and c <= sma_50 and (sma_50 > sma_250 or ext_50 < -9.0 or d_roc_5 >= 0.0 or rsi_10 < 35.0))
                    else "待命中：仅在死叉确认且跌破20/50/250日所有均线并加速下行时开启。"
                )
            ),
            "analogy_en": "Wearing spiked boots on an icy slope, with an automatic brake if the rubber band gets pulled too tight (RSI < 30).",
            "analogy_zh": "在结冰下坡路换上冰爪借势下行，但一旦橡皮筋拉得太紧 (RSI < 30 防轧空线) 就立刻松刹车防暴弹。",
        },
    ]


def _build_action_verdict(regime: Dict[str, Any]) -> Dict[str, str]:
    """Synthesizes one unmistakable plain-English headline + everyday analogy for today's verdict."""
    f = regime["features"]
    v = regime["vehicles"]
    c, sma_50, sma_250 = float(f["current_close"]), float(f["sma_50"]), float(f["sma_250"])
    ext_50, roc_10, d_roc_5, rsi_10 = float(f["ext_50_pct"]), float(f["roc_10_pct"]), float(f["d_roc_5_pct"]), float(f["rsi_10"])
    long_pct, short_pct, cash_pct = float(regime["target_long_pct"]), float(regime["target_short_pct"]), float(regime["target_cash_pct"])
    would_short = float(regime.get("would_allocate_short_pct", short_pct))
    long_sym, short_sym, cash_sym = v["long_etf"], v["short_etf"], v["cash_etf"]

    if short_pct > 0:
        return {
            "verdict_color": "ROSE",
            "headline_en": f"ATTACK BEAR TREND: Hold {int(short_pct)}% {short_sym} + {int(cash_pct)}% {cash_sym}",
            "headline_zh": f"顺势做空熊市：配置 {int(short_pct)}% {short_sym} + {int(cash_pct)}% {cash_sym}",
            "why_plain_en": (
                f"Nasdaq-100 (${c:,.0f}) is below both its 2-month (${sma_50:,.0f}) and 1-year (${sma_250:,.0f}) averages with falling momentum ({roc_10:+.2f}%). "
                f"In Aggressive Dual mode, {short_sym} climbs when Nasdaq drops, while keeping {int(cash_pct)}% in safe {cash_sym} and enforcing the RSI_10 ({rsi_10:.1f} >= 30) anti-squeeze floor."
            ),
            "why_plain_zh": (
                f"纳指100 (${c:,.0f}) 当前位于2个月线 (${sma_50:,.0f}) 与1年生命线 (${sma_250:,.0f}) 下方，动量偏弱 ({roc_10:+.2f}%)。"
                f"在双工激进模式下，通过 {short_sym} 从下跌中获利，同时保留 {int(cash_pct)}% 现金 {cash_sym} 且严格遵守 RSI_10 ({rsi_10:.1f} >= 30) 防轧空底线。"
            ),
            "analogy_en": "Instead of sitting indoors during a storm, Dual mode flips into snow-tires (SQQQ) to profit from the downhill slide, with an airbag ready if RSI drops under 30.",
            "analogy_zh": "暴风雪下山时不再只是躲在屋里避险，而是换上防滑雪地胎 (SQQQ) 顺坡加速，同时一旦指标过冷 (RSI < 30) 自动弹出防反弹气囊。",
        }

    if long_pct == 0.0:
        return {
            "verdict_color": "AMBER",
            "headline_en": f"STAY IN SAFE T-BILL SHIELD: 100% {cash_sym} (0% {long_sym})",
            "headline_zh": f"开启国债安全护盾：100% 持有 {cash_sym} (0% {long_sym})",
            "why_plain_en": (
                f"Nasdaq-100 (${c:,.0f}) is trading under both its 2-month (${sma_50:,.0f}) and 1-year (${sma_250:,.0f}) safety lines. "
                f"Long-Only parks 100% in {cash_sym} earning steady interest instead of fighting a falling market."
            ),
            "why_plain_zh": (
                f"纳指100 (${c:,.0f}) 同时跌破 2个月 (${sma_50:,.0f}) 与 1年生命线 (${sma_250:,.0f})。"
                f"稳健长多模式拒绝接下跌飞刀，选择 100% 转入 {cash_sym} 货币/国债基金躺赚稳定利息（若想熊市做空可点击上方切换至双工激进模式，今日目标 {int(would_short)}% {short_sym}）。"
            ),
            "analogy_en": "Storm warning on the ocean: dock the sailboat in a safe harbor paying daily rent until sunshine returns.",
            "analogy_zh": "海上挂起风暴预警信号：先将帆船停进避风港收租生息，等风平浪静再重新出海。",
        }

    if regime["regime_code"] == "BULL_OVEREXTENDED_TRIM":
        return {
            "verdict_color": "SKY",
            "headline_en": f"LOCK IN PROFITS: Trim {long_sym} to {int(long_pct)}% + {int(cash_pct)}% {cash_sym}",
            "headline_zh": f"见好就收止盈：{long_sym} 降至 {int(long_pct)}% + {int(cash_pct)}% {cash_sym}",
            "why_plain_en": (
                f"The bull trend is still up, but price sprinted {ext_50:+.1f}% ahead of its 2-month average while 5-day acceleration cooled ({d_roc_5:+.2f}%). We bank {int(cash_pct)}% into {cash_sym} before snapbacks happen."
            ),
            "why_plain_zh": (
                f"大趋势依然向上，但价格已跑出2个月均线 {ext_50:+.1f}% 且最近冲刺减速 ({d_roc_5:+.2f}%)，自动兑现 {int(cash_pct)}% 收益入 {cash_sym}。"
            ),
            "analogy_en": "You ran way ahead of your teammates and started panting — slow down and lock your lead before cramping up.",
            "analogy_zh": "长跑甩开大部队太远开始气喘，主动放慢脚步锁定胜局，防止抽筋被反超。",
        }

    return {
        "verdict_color": "GREEN",
        "headline_en": f"RIDE GROWTH UPTREND: Hold {int(long_pct)}% {long_sym} + {int(cash_pct)}% {cash_sym}",
        "headline_zh": f"顺势做多进攻：持有 {int(long_pct)}% {long_sym} + {int(cash_pct)}% {cash_sym}",
        "why_plain_en": f"Nasdaq-100 (${c:,.0f}) is above trend support and momentum favors upside growth over the next trading session.",
        "why_plain_zh": f"纳指100 (${c:,.0f}) 站稳核心趋势均线，多头动能健康，顺势配置 {int(long_pct)}% {long_sym} 把握明天的上涨延续。",
        "analogy_en": "Clear green highway ahead with tail-winds: stay in the growth lane and let compounding work.",
        "analogy_zh": "前方绿灯顺风高速路：安心在快车道跟随趋势复利前行。",
    }


def _build_key_signals_checklist(features: Dict[str, Any]) -> List[Dict[str, str]]:
    """Builds the 4-item traffic-light checklist explaining every signal driving today's decision."""
    c, sma_50, sma_250 = float(features["current_close"]), float(features["sma_50"]), float(features["sma_250"])
    ext_50, roc_10, d_roc_5 = float(features["ext_50_pct"]), float(features["roc_10_pct"]), float(features["d_roc_5_pct"])
    rsi_5, rsi_10 = float(features["rsi_5"]), float(features["rsi_10"])

    light_vel = "GREEN" if (roc_10 >= 1.5 and d_roc_5 >= -0.5) else ("AMBER" if roc_10 > -3.0 else "RED")
    light_rsi = "GREEN" if rsi_10 < 35.0 else ("AMBER" if rsi_10 <= 65.0 else "RED")

    return [
        {
            "id": "sig_250d",
            "term_key": "SMA250_Trend",
            "title_en": "1-Year Weather Line (250-Day Average)",
            "title_zh": "一年期大气候分界线 (250日均线)",
            "traffic_light": "GREEN" if c > sma_250 else "RED",
            "status_badge_en": "BULL SEASON (Above Line)" if c > sma_250 else "BEAR SEASON (Below Line)",
            "status_badge_zh": "牛市季节 (位于线上)" if c > sma_250 else "熊市防区 (跌破生命线)",
            "current_reading": f"NDX ${c:,.0f} vs 250D ${sma_250:,.0f} ({((c / sma_250 - 1) * 100):+.2f}%)",
            "plain_explanation_en": (
                f"Today's price (${c:,.0f}) is {'above' if c > sma_250 else 'below'} its 1-year average (${sma_250:,.0f}). "
                f"{'Long-term uptrend is healthy.' if c > sma_250 else 'Long-term season shifted defensive — Long-Only blocks full TQQQ exposure.'}"
            ),
            "plain_explanation_zh": (
                f"今日指数 (${c:,.0f}) {'高于' if c > sma_250 else '低于'} 过去一年平均价 (${sma_250:,.0f})。"
                f"{'大气候健康向上。' if c > sma_250 else '年度气候偏冷，稳健模式严禁满仓死扛 TQQQ。'}"
            ),
            "analogy_en": "Like checking the annual climate before planting crops: Summer (>250D) = grow; Winter (<250D) = protect your greenhouse.",
            "analogy_zh": "就像看四季气候种庄稼：夏天（250日线上）放心播种成长；冬天（线下）必须关窗保暖。",
        },
        {
            "id": "sig_50d",
            "term_key": "SMA50_Trend",
            "title_en": "2-Month Medium Traffic Light (50-Day Average)",
            "title_zh": "两月期中期交通灯 (50日均线)",
            "traffic_light": "GREEN" if c > sma_50 else "RED",
            "status_badge_en": "UPWARD LANE" if c > sma_50 else "DOWNWARD PRESSURE",
            "status_badge_zh": "中期上升通道" if c > sma_50 else "中期承压线下",
            "current_reading": f"NDX ${c:,.0f} vs 50D ${sma_50:,.0f} ({ext_50:+.2f}%)",
            "plain_explanation_en": (
                f"Price is {abs(ext_50):.2f}% {'above' if c > sma_50 else 'below'} its 2-month trend (${sma_50:,.0f}). "
                f"{'Buyers control the medium-term lane.' if c > sma_50 else 'Sellers currently control recent 2-month momentum.'}"
            ),
            "plain_explanation_zh": (
                f"指数目前{'高于' if c > sma_50 else '低于'}最近2个月平均成本线 (${sma_50:,.0f}) {abs(ext_50):.2f}%。"
                f"{'买方力量主导中期节奏。' if c > sma_50 else '卖方在近两个月占据上风，不可逆势硬顶。'}"
            ),
            "analogy_en": "Local traffic flow over the last 8 weeks — green means flowing uphill smoothly; red means brake lights ahead.",
            "analogy_zh": "如同最近两个月的高速路况：绿灯代表车流顺畅上坡，红灯代表前方全车踩刹车。",
        },
        {
            "id": "sig_velocity",
            "term_key": "Velocity_ROC",
            "title_en": "Speedometer & Acceleration (10-Day Speed)",
            "title_zh": "车速与加速度仪表盘 (10日涨跌幅)",
            "traffic_light": light_vel,
            "status_badge_en": "ACCELERATING UP" if light_vel == "GREEN" else ("COOLING / NEUTRAL" if light_vel == "AMBER" else "DOWNWARD SPEED"),
            "status_badge_zh": "加速上冲" if light_vel == "GREEN" else ("速度放缓/中性" if light_vel == "AMBER" else "惯性向下"),
            "current_reading": f"10D Speed: {roc_10:+.2f}% | 5D Accel: {d_roc_5:+.2f}%",
            "plain_explanation_en": (
                f"Over the past 2 weeks, the Nasdaq moved {roc_10:+.2f}% with 5-day acceleration at {d_roc_5:+.2f}%. "
                f"{'Positive velocity triggers full turbo.' if light_vel == 'GREEN' else 'Negative speed stops us from adding leverage blindly.'}"
            ),
            "plain_explanation_zh": (
                f"过去两周纳指累计变化 {roc_10:+.2f}%，近5天加速度变化 {d_roc_5:+.2f}%。"
                f"{'车速强劲向上时才踩满油门。' if light_vel == 'GREEN' else '车速偏负时防止迎头撞车，拒绝加杠杆。'}"
            ),
            "analogy_en": "Your car's speedometer + gas pedal: even on an open road, check whether speed is picking up or fading.",
            "analogy_zh": "就是汽车的速度表：先看车是在向前加速还是已经踩下倒车挡。",
        },
        {
            "id": "sig_rsi",
            "term_key": "Wilder_RSI",
            "title_en": "Rubber-Band Tension Meter (10-Day RSI)",
            "title_zh": "皮筋紧绷度表 (10日强弱指数 RSI)",
            "traffic_light": light_rsi,
            "status_badge_en": "OVERSOLD BOUNCE ZONE (<35)" if rsi_10 < 35 else ("NORMAL ZONE (35–65)" if rsi_10 <= 65 else "OVERHEATED (>65)"),
            "status_badge_zh": "超卖将弹区域 (<35)" if rsi_10 < 35 else ("温和常规区间 (35–65)" if rsi_10 <= 65 else "过热超买 (>65)"),
            "current_reading": f"RSI(10): {rsi_10:.1f} | RSI(5): {rsi_5:.1f} | Safety Floor: >= 30",
            "plain_explanation_en": (
                f"RSI(10) measures stretch on a 0–100 scale. Below 30 = extreme panic (violent short-squeeze risk); "
                f"currently {rsi_10:.1f}, so {'SQQQ safety floor passes (>= 30)' if rsi_10 >= 30 else 'SQQQ is paused (< 30)'} while deep bounce buyers wait below 18 on RSI(5) ({rsi_5:.1f})."
            ),
            "plain_explanation_zh": (
                f"RSI 是 0-100 的橡皮筋拉力计。当前 RSI(10) 为 {rsi_10:.1f}："
                f"{'处于 >= 30 安全区（未过度超卖引发暴涨轧空）' if rsi_10 >= 30 else '已低于 30 极限红线，暂停 SQQQ 防暴弹'}；"
                f"而多头极值抄底需要更惨烈的 RSI(5) < 18（目前 {rsi_5:.1f}）。"
            ),
            "analogy_en": "Pulling a rubber band too far back (<30) means it snaps upward sharply; around 35–60 leaves room for trend inertia.",
            "analogy_zh": "像拉橡皮筋：拉得太狠 (<30) 会瞬间猛烈回弹打手；在 35–60 之间则还留有顺势延续的空间。",
        },
    ]


def build_execution_timeline_explainer() -> Dict[str, Any]:
    """Explains at a high-school level why measuring TODAY at 15:50 EST positions capital for TOMORROW."""
    return {
        "headline_en": "Why We Check TODAY's Live Market at 3:50 PM EST to Position for TOMORROW's Performance",
        "headline_zh": "为什么在今天下午 3:50 查看实时市场，却是在为“明天的收益”布局？",
        "steps": [
            {
                "step": "1",
                "time_est": "09:30 – 15:45 EST",
                "title_en": "Ignore Intraday Fakeouts (Do Zero Work)",
                "title_zh": "白盘 9:30 – 15:45 忽略杂波",
                "detail_en": "Morning spikes often reverse by afternoon. Go live your busy day — checking mid-day signals wastes willpower and triggers $25K PDT traps.",
                "detail_zh": "早盘波动经常下午反转，您无需盯盘；频繁盘中买卖还会触发 $25K 美股日内交易次数限制。",
            },
            {
                "step": "2",
                "time_est": "15:50 EST",
                "title_en": "Read Today's True Closing Scoreboard",
                "title_zh": "下午 15:50 读取今日真实战况",
                "detail_en": "At 3:50 PM, 97% of today's institutional buying/selling is settled. We measure live ^NDX against its 250D/50D trends & speed right now — zero stale yesterday data.",
                "detail_zh": "收盘前10分钟，今天机构多空博弈大局已定。引擎使用此刻真实的盘中现价做体检，绝不用过时的昨天数据。",
            },
            {
                "step": "3",
                "time_est": "15:50 – 16:00 EST",
                "title_en": "Place 1 Clean Order Before Bell",
                "title_zh": "15:50 – 16:00 执行唯一一笔尾盘单",
                "detail_en": "Position TQQQ, SQQQ, or SGOV right before the closing bell so you hold across the close cleanly as an overnight swing.",
                "detail_zh": "在敲钟前把仓位换好并隔夜持有，整个操作只需不到 10 分钟。",
            },
            {
                "step": "4",
                "time_est": "16:00 → Tomorrow",
                "title_en": "Your Money Rides Tonight's Futures + Tomorrow's Session",
                "title_zh": "16:00 之后 → 吃满今晚与明天的行情",
                "detail_en": "Today's EOD trade positions you cleanly for overnight futures gaps and tomorrow's regular trading session.",
                "detail_zh": "今天尾盘下班前换到位的钱，正是用来迎接今晚隔夜跳空和明天全天的市场表现。",
            },
        ],
        "why_today_predicts_tomorrow": [
            {
                "title_en": "1. Trend Inertia (Heavy Freight Train)",
                "title_zh": "1. 趋势惯性（大卡车刹车需要距离）",
                "detail_en": "Just like a moving train keeps rolling tomorrow, big multi-week bull rallies and bear slumps statistically continue the next session (~60–70% persistence).",
                "detail_zh": "就像高速行驶的重卡不会瞬间掉头，机构持续数周的资金流入或撤离，在绝大多数交易日都会在明天惯性延续。",
            },
            {
                "title_en": "2. Rubber-Band Snapback (RSI & Extension)",
                "title_zh": "2. 极端超跌反弹与超涨减速规律",
                "detail_en": "When everyone panics together (RSI_5 < 18) or chases too hard (+10% above 50D SMA), tomorrow often snaps back — so we trim winners or block dangerous SQQQ shorts beforehand.",
                "detail_zh": "当全市场集体恐慌抛售或过热拉升后，第二天极易发生反向回弹，因此我们在今天尾盘提前设好止盈或防轧空护栏。",
            },
            {
                "title_en": "3. Overnight Gap Capture (+Free Alpha)",
                "title_zh": "3. 锁定关键的“隔夜跳空”主收益段",
                "detail_en": "Historically, a large share of Nasdaq-100 long-term gains happened overnight between 4:00 PM close and 9:30 AM open. Entering at 3:50 PM captures every overnight gap.",
                "detail_zh": "统计上纳指 100 很大一部分长期回报都来自盘后至次日开盘前的财报与宏观隔夜跳空，3:50 建仓让您完整拥有今晚收益。",
            },
        ],
        "honest_lag_note_en": (
            "Honest High-School Catch: No indicator predicts surprise overnight shocks (like a sudden emergency Fed announcement). "
            "On surprise V-turn days the model adjusts 1 day later at tomorrow's 3:50 PM close — trading a small 1-day turn lag to capture the big multi-month trends."
        ),
        "honest_lag_note_zh": (
            "坦诚的高中生大白话提醒：策略并没有水晶球！如果明天早上突发黑天鹅或意外大逆转，它会慢一拍并在明天下午 3:50 才纠正仓位；"
            "但在多年统计中，吃下大牛市中间最肥美的 80% 并躲过漫长熊冬，长期胜率远胜盲目猜明天。"
        ),
    }


def build_beginner_decision_guide(regime: Dict[str, Any]) -> Dict[str, Any]:
    """Assembles the complete Beginner Decision Guide payload from a regime evaluation."""
    mode = regime["strategy_mode"]
    v = regime["vehicles"]
    long_pct = float(regime["target_long_pct"])
    cash_pct = float(regime["target_cash_pct"])
    would_short = float(regime.get("would_allocate_short_pct", regime["target_short_pct"]))
    dual_cash_in_bear = max(0.0, 100.0 - would_short)

    dual_today_en = (
        f"{int(would_short)}% {v['short_etf']} + {int(dual_cash_in_bear)}% {v['cash_etf']}"
        if (long_pct == 0.0 and would_short > 0)
        else f"{int(long_pct)}% {v['long_etf']} + {int(cash_pct)}% {v['cash_etf']}"
    )
    long_only_today_en = f"{int(long_pct)}% {v['long_etf']} + {int(cash_pct)}% {v['cash_etf']}"

    return {
        "recommended_strategy": {
            "mode": mode,
            "badge_en": "DUAL ATTACK VS BALANCED SHIELD TRACKS" if mode == "TOO_BUSY_DUAL" else "SIDE-BY-SIDE BEGINNER TRACKS",
            "badge_zh": "激进双向 vs 稳健护盾双路线对比" if mode == "TOO_BUSY_DUAL" else "新手双路线清晰对比",
            "title_en": (
                "Aggressive Dual Attack (TQQQ + SQQQ + SGOV) — Bear Profit Enabled"
                if mode == "TOO_BUSY_DUAL"
                else "Balanced Long-Only Shield (TQQQ + SGOV) — Zero Short-Squeeze Risk"
            ),
            "title_zh": (
                "激进双向攻击 (TQQQ + SQQQ + SGOV) — 允许熊市顺势做空"
                if mode == "TOO_BUSY_DUAL"
                else "稳健长多护盾 (TQQQ + SGOV) — 新手免轧空默认护航"
            ),
            "why_en": f"Right now in Dual mode your plan is {dual_today_en}; in Long-Only Shield your plan is {long_only_today_en}.",
            "why_zh": f"按今日真实行情，激进双向模式建议 {dual_today_en}；稳健长多护盾建议 {long_only_today_en}。",
            "analogy_en": "Long-Only is a sailboat anchored in harbor (SGOV) during storms; Dual Attack flips into reverse turbines (SQQQ) to ride downhill waves too.",
            "analogy_zh": "稳健长多护盾是暴风雨时停进避风港收租；激进双向模式则是装上反推引擎，下坡浪头也能赚差价，但颠簸更大。",
            "aggressive_dual_track": {
                "mode": "TOO_BUSY_DUAL",
                "badge_en": "HIGHER RISK / HIGH UPSIDE",
                "badge_zh": "高风险 / 高弹性收益",
                "title_en": "Dual Attack: TQQQ + SQQQ + SGOV",
                "title_zh": "激进双向引擎：TQQQ + SQQQ + SGOV",
                "why_en": "Includes SQQQ (3x inverse) in confirmed bear downtrends while keeping an RSI_10 >= 30 anti-squeeze floor.",
                "why_zh": "在确诊熊市下跌时派出 SQQQ 反手做空获利，并内置 RSI_10 >= 30 防暴弹安全刹车。",
                "today_target_en": f"Today Target: {dual_today_en}",
                "today_target_zh": f"今日目标：{dual_today_en}",
            },
            "balanced_long_only_track": {
                "mode": "TOO_BUSY_LONG_ONLY",
                "badge_en": "BEGINNER RECOMMENDED <$10K",
                "badge_zh": "<$10K 新手首选护盾",
                "title_en": "Long-Only Shield: TQQQ + SGOV",
                "title_zh": "稳健长多护盾：TQQQ + SGOV",
                "why_en": "Never shorts! Parks in interest-earning SGOV T-Bills during bear seasons to eliminate violent bear-rally whipsaws.",
                "why_zh": "绝不做空！熊市全额躲进生息国债 SGOV，零轧空爆仓风险，省心度最高。",
                "today_target_en": f"Today Target: {long_only_today_en}",
                "today_target_zh": f"今日目标：{long_only_today_en}",
            },
        },
        "execution_timeline_explainer": build_execution_timeline_explainer(),
        "action_verdict": _build_action_verdict(regime),
        "key_signals_checklist": _build_key_signals_checklist(regime["features"]),
    }
