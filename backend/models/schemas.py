"""
Pydantic Data Schemas & Strongly-Typed Domain Models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal

class DataProvenanceSchema(BaseModel):
    source_mode: Literal["LIVE", "CACHED", "SIMULATED_FALLBACK"] = "LIVE"
    provider: str = "yfinance"
    fetched_at: str = ""
    staleness_seconds: int = 0
    warning_banner: Optional[str] = None

class EarningsQualitySchema(BaseModel):
    operating_cash_flow: float = 0.0
    net_income: float = 0.0
    stock_based_compensation: float = 0.0
    cash_conversion_ratio: float = 1.0
    sloan_accruals_ratio: float = 0.0
    sbc_pct_of_fcf: float = 0.0
    quality_rating: Literal["HIGH", "MODERATE", "LOW_ACCRUAL_RISK"] = "HIGH"
    forensic_flags: List[str] = Field(default_factory=list)

class SensitivityCellSchema(BaseModel):
    wacc: float
    terminal_growth: float
    fair_value: float
    upside_pct: float

class ValuationBridgeSchema(BaseModel):
    pv_10y_fcf: float = 0.0
    pv_terminal_value: float = 0.0
    enterprise_value: float = 0.0
    plus_cash: float = 0.0
    less_total_debt: float = 0.0
    less_sbc_annual: float = 0.0
    equity_value: float = 0.0
    implied_shares: float = 1.0
    implied_shares_effective: Optional[float] = None
    terminal_exit_multiple_used: Optional[float] = None
    net_buyback_yield_used: Optional[float] = None
    fair_value_per_share: float = 0.0
    dynamic_wacc_used: float = 0.08
    valuation_outlier_warning: bool = False
    currency_conversion_note: Optional[str] = None

class HistoricalPricePointSchema(BaseModel):
    date: str
    close: float
    volume: Optional[float] = None

class StockDataSchema(BaseModel):
    symbol: str
    company_name: str
    market: str  # "US" or "CA"
    currency: str  # "USD" or "CAD"
    financial_currency: Optional[str] = None
    current_price: float
    previous_close: float
    fifty_day_sma: float
    two_hundred_day_sma: float
    pe_ratio: Optional[float] = None
    ps_ratio: Optional[float] = None
    ev_ebitda: Optional[float] = None
    free_cash_flow: Optional[float] = None
    operating_cash_flow: Optional[float] = None
    net_income: Optional[float] = None
    total_revenue: Optional[float] = None
    revenue_growth: Optional[float] = None
    volume: Optional[float] = None
    average_volume: Optional[float] = None
    historical_series: Optional[List[HistoricalPricePointSchema]] = None
    rsi_14: float = 50.0
    dividend_yield_pct: Optional[float] = 0.0
    net_buyback_yield_pct: Optional[float] = 0.0
    total_shareholder_yield_pct: Optional[float] = 0.0
    roic: Optional[float] = 0.0
    dilution_3y_pct: Optional[float] = 0.0
    source: str

class SentimentSchema(BaseModel):
    score: float
    tone: str
    hawkish_signals_detected: int
    dovish_signals_detected: int

class MacroAnalysisSchema(BaseModel):
    cycle_stage: str
    cycle_code: str
    plain_explanation: str
    us_indicators: Dict[str, Any]
    ca_indicators: Dict[str, Any]
    fed_sentiment: SentimentSchema
    boc_sentiment: SentimentSchema
    recommended_overweights: List[str]
    recommended_underweights: List[str]

class GuidanceDeltaSchema(BaseModel):
    year: str
    added_disclaimer: str
    severity: str
    key_hedging_phrases: List[str] = Field(default_factory=list)
    sentiment_delta_score: float = 0.0
    source_mode: Optional[Literal["LIVE", "CACHED", "SIMULATED_FALLBACK"]] = "LIVE"

class MoatFactorScoreSchema(BaseModel):
    factor_name: str
    score: float  # 0.0 to 10.0
    status: str   # "Strong Moat", "Moderate Moat", "Weak / None"

from enum import Enum

class StockTaxonomyEnum(str, Enum):
    TREE = "TREE"           # 种树: High-ROIC secular FCF compounder (~5% of equities)
    GRAIN = "GRAIN"         # 种粮: Cyclical/Value/Dividend cash cow (~15% of equities)
    VEGETABLE = "VEGETABLE" # 种菜: Negative-FCF or dilutive stock (~80% of equities)

class TaxonomyResult(BaseModel):
    taxonomy: StockTaxonomyEnum
    badge_en: str
    badge_zh: str
    holding_rule_en: str
    holding_rule_zh: str
    total_shareholder_yield_pct: float = 0.0
    net_buyback_yield_pct: float = 0.0
    dilution_3y_pct: float = 0.0

class ReverseDcfCell(BaseModel):
    discount_rate_pct: float
    ceiling_multiple: float
    fair_pe: float

class ReverseDcfResult(BaseModel):
    current_pe: float
    implied_10y_ceiling_multiple: float = Field(..., description="E_10 / E_0 implied at 10% discount rate")
    implied_10y_profit_usd: Optional[float] = None
    is_prosperity_trap: bool = False
    prosperity_trap_note: Optional[str] = None
    matrix: List[ReverseDcfCell] = Field(default_factory=list)

class FundamentalAnalysisSchema(BaseModel):
    symbol: str
    free_cash_flow: Optional[float] = None
    fcf_yield_pct: float
    cash_conversion_ratio: float
    fcf_quality: str
    moat_rating: str
    moat_sources: List[str]
    moat_scores: List[MoatFactorScoreSchema] = Field(default_factory=list)
    guidance_shift_deltas: List[GuidanceDeltaSchema]
    guidance_drift_score: float = 0.0
    arr_nrr_metrics: Dict[str, Any] = Field(default_factory=dict)
    taxonomy: Optional[TaxonomyResult] = None
    total_shareholder_yield_pct: Optional[float] = 0.0

class PricingAnalysisSchema(BaseModel):
    symbol: str
    current_price: float
    currency: str
    fifty_day_sma: float
    two_hundred_day_sma: float
    volume: Optional[float] = None
    average_volume: Optional[float] = None
    historical_series: Optional[List[HistoricalPricePointSchema]] = None
    pe_ratio: Optional[float] = None
    valuation_status: str
    valuation_percentile: int
    dcf_fair_value: float
    ideal_buy_range_min: Optional[float] = None
    ideal_buy_range_max: Optional[float] = None
    ideal_sell_range_min: Optional[float] = None
    ideal_sell_range_max: Optional[float] = None
    dcf_applicable: bool = True
    action_status: str
    timing_advice: str
    rsi_14: float
    reverse_dcf: Optional[ReverseDcfResult] = None
    taxonomy: Optional[TaxonomyResult] = None
    total_shareholder_yield_pct: Optional[float] = None
    bridge: Optional[ValuationBridgeSchema] = None
    sensitivity_matrix: List[List[SensitivityCellSchema]] = Field(default_factory=list)
    earnings_quality: Optional[EarningsQualitySchema] = None
    provenance: Optional[DataProvenanceSchema] = None

ValuationResultSchema = PricingAnalysisSchema

class BullArgumentSchema(BaseModel):
    agent: str
    key_points: List[str]
    upside_catalyst: str

class BearArgumentSchema(BaseModel):
    agent: str
    key_points: List[str]
    downside_risk: str

class CIOVerdictSchema(BaseModel):
    agent: str
    verdict: str
    position_sizing_advice: str
    recommended_buy_bracket: str
    risk_reward_ratio: float
    judge_summary: str
    empirical_proof_verified: bool
    discipline_audit: Optional[Dict[str, Any]] = None

class DebateSchema(BaseModel):
    symbol: str
    bull_argument: BullArgumentSchema
    bear_argument: BearArgumentSchema
    cio_verdict: CIOVerdictSchema
    bull_rebuttal: Optional[str] = None
    bear_rebuttal: Optional[str] = None
    falsification_price_level: Optional[float] = None
    falsification_trigger_condition: Optional[str] = None
    provenance: Optional[DataProvenanceSchema] = None

DebateTranscriptSchema = DebateSchema

class PortfolioAllocationSchema(BaseModel):
    symbol: Optional[str] = None
    base_currency: Literal["USD", "CAD"] = "USD"
    active_macro_regime: str = "NEUTRAL"
    calibrated_win_prob: Optional[float] = None
    correlation_penalty_factor: float = 1.0
    recommended_weight_pct: float = 0.0
    full_kelly_pct: float = 0.0
    quarter_kelly_pct: float = 0.0
    core_holdings: List[Dict[str, Any]] = Field(default_factory=list)

class BacktestResultSchema(BaseModel):
    cagr_pct: float = 0.0
    sharpe_ratio: float = 0.0
    sortino_ratio: Optional[float] = None
    max_drawdown_pct: float = 0.0
    benchmark_alpha: Optional[float] = None
    benchmark_beta: Optional[float] = None
    slippage_bps_applied: float = 10.0
    survivorship_bias_notice: str = "Evaluated on current surviving constituent universe; historical delistings excluded."
    yearly_returns: Dict[str, float] = Field(default_factory=dict)

class StockRecommendationSchema(BaseModel):
    symbol: str
    company_name: str
    market: str
    currency: str
    current_price: float
    previous_close: float
    company_background: str
    why_recommend_rationale: str
    macro_alignment_tag: str
    category_badge: str  # "SECTOR_OVERWEIGHT", "OVERALL_LEADER", "GOLD_NUGGET"
    total_recommendation_score: float
    key_catalysts: List[str]
    key_metrics: Dict[str, Any]
    downside_risk_summary: str
    action_status: str
    taxonomy: Optional[TaxonomyResult] = None
    taxonomy_badge: Optional[str] = None

class CategorizedRecommendationsSchema(BaseModel):
    macro_context: Dict[str, Any]
    sector_overweight_stocks: List[StockRecommendationSchema]
    overall_recommended_stocks: List[StockRecommendationSchema]
    gold_nugget_stocks: List[StockRecommendationSchema]

class StockAnalysisResponseSchema(BaseModel):
    stock: StockDataSchema
    macro: MacroAnalysisSchema
    fundamentals: FundamentalAnalysisSchema
    pricing: PricingAnalysisSchema
    debate: DebateSchema

# Phase 2: Portfolio, Kelly & Risk Schemas
class KellyResult(BaseModel):
    win_prob: float
    calibrated_win_prob: Optional[float] = None
    correlation_penalty_factor: float = 1.0
    same_sector_count: int = 0
    upside_pct: float
    stop_loss_pct: float
    payoff_ratio_b: float
    full_kelly_pct: float
    quarter_kelly_pct: float
    recommended_weight_pct: float
    is_positive_edge: bool

class CorrelationAlert(BaseModel):
    pair: List[str]
    rho_3y: float
    rho_60d: float
    diff: float
    alert_en: str
    alert_zh: str

class FrontierPoint(BaseModel):
    return_pct: float
    volatility_pct: float
    sharpe_ratio: float
    weights: Dict[str, float]

class EfficientFrontierResponse(BaseModel):
    symbols: List[str]
    correlation_matrix_3y: Dict[str, Dict[str, float]]
    correlation_matrix_60d: Dict[str, Dict[str, float]]
    correlation_decoupling_alerts: List[CorrelationAlert]
    frontier_points: List[FrontierPoint]
    max_sharpe_portfolio: FrontierPoint
    min_variance_portfolio: FrontierPoint
    equal_weight_portfolio: FrontierPoint

class LiabilityStressResponse(BaseModel):
    total_capital: float
    est_max_drawdown_pct: float
    max_drawdown_usd: float
    monthly_living_expense: float
    drawdown_months_of_living_expenses: float
    annual_passive_income: float
    passive_income_coverage_pct: float
    remaining_capital: float
    runway_months: float
    is_runway_secure: bool
    verdict_en: str
    verdict_zh: str

# Phase 3: Ergodicity Backtest Schemas
class DrawdownEvent(BaseModel):
    peak_date: str
    trough_date: str
    recovery_date: Optional[str] = None
    depth_pct: float
    drawdown_days: int
    recovery_days: Optional[int] = None

class UnderwaterPoint(BaseModel):
    date: str
    drawdown_pct: float
    portfolio_value: float
    peak_value: float

class RebalancingComparison(BaseModel):
    drift_cagr_pct: float
    quarterly_rebalanced_cagr_pct: float
    rebalancing_bonus_bps: float
    explanation_en: str
    explanation_zh: str

# PL-705: Central Bank Speech Streaming Schemas
class SpeechSegmentSchema(BaseModel):
    index: int
    speaker: str
    text: str
    timestamp: str = ""
    hawkish_terms: List[str] = Field(default_factory=list)
    dovish_terms: List[str] = Field(default_factory=list)
    segment_sentiment: float = 0.0
    cumulative_score: float = 0.0
    stance: str = "Neutral"

class CentralBankSpeechMetadataSchema(BaseModel):
    id: str
    title: str
    central_bank: str
    country: str
    speaker: str
    date: str
    baseline_score: float = 0.0
    total_segments: int = 0
    event_type: str = "Policy Decision & Press Conference"

class CentralBankSpeechStreamEventSchema(BaseModel):
    event_type: Literal["init", "chunk", "complete", "heartbeat"] = "chunk"
    metadata: Optional[CentralBankSpeechMetadataSchema] = None
    segment: Optional[SpeechSegmentSchema] = None
    final_score: Optional[float] = None
    stance_delta: Optional[float] = None
    final_stance: Optional[str] = None
    market_implications: Optional[Dict[str, str]] = None


# PL-722: News & Portfolio Analysis Schemas
class PortfolioNewsItemSchema(BaseModel):
    id: str
    symbol: str
    company_name: str = ""
    market: Literal["US", "CA"] = "US"
    bucket: Literal["HOLDING", "WATCHLIST", "MARKET"] = "MARKET"
    title: str
    summary: str
    portfolio_impact_note: str
    source: str
    url: str = "https://finance.yahoo.com"
    published_at: str
    credibility_tier: str = "Tier-1 Institutional Media"
    sentiment: Literal["BULLISH", "BEARISH", "NEUTRAL", "RISK_ALERT"] = "NEUTRAL"
    relevance_score: float = 50.0

class KeyInvestorPostSchema(BaseModel):
    id: str
    investor_name: str
    institution: str
    market: Literal["US", "CA", "NORTH_AMERICA"] = "US"
    title: str
    commentary: str
    key_takeaway: str
    related_symbols: List[str] = Field(default_factory=list)
    matched_bucket: Literal["HOLDING", "WATCHLIST", "MARKET"] = "MARKET"
    stance: Literal["BULLISH", "CAUTIOUS", "DEFENSIVE", "HIGH_CONVICTION"] = "HIGH_CONVICTION"
    published_at: str
    source_url: str = "https://www.sec.gov/edgar/searchedgar/companysearch"

class TacticalAdviceItemSchema(BaseModel):
    symbol: str
    bucket: Literal["HOLDING", "WATCHLIST", "PORTFOLIO"] = "PORTFOLIO"
    market: Literal["US", "CA"] = "US"
    category: Literal["ACTION", "OPPORTUNITY", "RISK"] = "ACTION"
    urgency: Literal["HIGH", "MEDIUM", "LOW"] = "MEDIUM"
    headline: str
    rationale: str
    tactical_instruction: str
    time_horizon: str = "Today & Tomorrow"
    reference_price: Optional[float] = None
    threshold_price: Optional[float] = None
    source_url: str = "https://finance.yahoo.com"
    source_name: str = "Financial Media"
    action_tag: Optional[Literal["HOLD_CORE", "SCALE_IN_READY", "DEFEND_FLOOR", "WATCH_PULLBACK", "TRIM_EXTENDED"]] = None
    action_tag_explanation: Optional[str] = None

class DailyPortfolioBriefingSchema(BaseModel):
    date_label: str
    market_regime_context: str
    executive_summary: str
    action_advice: List[TacticalAdviceItemSchema] = Field(default_factory=list)
    opportunities: List[TacticalAdviceItemSchema] = Field(default_factory=list)
    risks: List[TacticalAdviceItemSchema] = Field(default_factory=list)

class TrackedPositionPulseSchema(BaseModel):
    symbol: str
    company_name: str
    market: Literal["US", "CA"] = "US"
    currency: str = "USD"
    bucket: Literal["HOLDING", "WATCHLIST"] = "WATCHLIST"
    current_price: float = 0.0
    buy_in_price: Optional[float] = None
    target_buy_price: Optional[float] = None
    falsification_floor: Optional[float] = None
    unrealized_pnl_pct: Optional[float] = None
    distance_to_target_pct: Optional[float] = None
    distance_to_floor_pct: Optional[float] = None
    portfolio_allocation_pct: float = 0.0
    batting_zone: str = "RIGHT_SIDE"
    trend_state: str = "WARM"
    related_news_count: int = 0
    latest_headline: Optional[str] = None
    latest_news_url: Optional[str] = None
    latest_news_source: Optional[str] = None
    day_signal: Literal["HOLD_CORE", "SCALE_IN_READY", "DEFEND_FLOOR", "WATCH_PULLBACK", "TRIM_EXTENDED"] = "HOLD_CORE"
    day_signal_explanation: str = ""

class PortfolioSummaryMetaSchema(BaseModel):
    holdings_count: int = 0
    watchlist_count: int = 0
    total_portfolio_value: float = 0.0
    active_catalyst_count: int = 0
    is_demo_portfolio: bool = False
    holding_symbols: List[str] = Field(default_factory=list)
    watchlist_symbols: List[str] = Field(default_factory=list)

class PortfolioNewsAnalysisResponseSchema(BaseModel):
    portfolio_summary: PortfolioSummaryMetaSchema
    briefing: DailyPortfolioBriefingSchema
    news_feed: List[PortfolioNewsItemSchema] = Field(default_factory=list)
    investor_posts: List[KeyInvestorPostSchema] = Field(default_factory=list)
    tracked_positions: List[TrackedPositionPulseSchema] = Field(default_factory=list)
    provenance: DataProvenanceSchema



