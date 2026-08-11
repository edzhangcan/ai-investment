"""
Pydantic Data Schemas & Strongly-Typed Domain Models
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class StockDataSchema(BaseModel):
    symbol: str
    company_name: str
    market: str  # "US" or "CA"
    currency: str  # "USD" or "CAD"
    current_price: float
    previous_close: float
    fifty_day_sma: float
    two_hundred_day_sma: float
    pe_ratio: float
    ps_ratio: float
    ev_ebitda: float
    free_cash_flow: float
    operating_cash_flow: float
    net_income: float
    total_revenue: float
    revenue_growth: float
    rsi_14: float
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

class MoatFactorScoreSchema(BaseModel):
    factor_name: str
    score: float  # 0.0 to 10.0
    status: str   # "Strong Moat", "Moderate Moat", "Weak / None"

class FundamentalAnalysisSchema(BaseModel):
    symbol: str
    free_cash_flow: float
    fcf_yield_pct: float
    cash_conversion_ratio: float
    fcf_quality: str
    moat_rating: str
    moat_sources: List[str]
    moat_scores: List[MoatFactorScoreSchema] = Field(default_factory=list)
    guidance_shift_deltas: List[GuidanceDeltaSchema]
    guidance_drift_score: float = 0.0
    arr_nrr_metrics: Dict[str, str]

class PricingAnalysisSchema(BaseModel):
    symbol: str
    current_price: float
    currency: str
    fifty_day_sma: float
    two_hundred_day_sma: float
    pe_ratio: float
    valuation_status: str
    valuation_percentile: int
    dcf_fair_value: float
    ideal_buy_range_min: float
    ideal_buy_range_max: float
    action_status: str
    timing_advice: str
    rsi_14: float

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

class DebateSchema(BaseModel):
    symbol: str
    bull_argument: BullArgumentSchema
    bear_argument: BearArgumentSchema
    cio_verdict: CIOVerdictSchema

class StockAnalysisResponseSchema(BaseModel):
    stock: StockDataSchema
    macro: MacroAnalysisSchema
    fundamentals: FundamentalAnalysisSchema
    pricing: PricingAnalysisSchema
    debate: DebateSchema
