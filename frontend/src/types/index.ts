export interface StockData {
  symbol: string;
  company_name: string;
  market: 'US' | 'CA';
  currency: 'USD' | 'CAD';
  current_price: number;
  previous_close: number;
  fifty_day_sma: number;
  two_hundred_day_sma: number;
  pe_ratio: number;
  ps_ratio: number;
  ev_ebitda: number;
  free_cash_flow: number;
  operating_cash_flow: number;
  net_income: number;
  total_revenue: number;
  revenue_growth: number;
  rsi_14: number;
  source: string;
}

export interface SentimentData {
  score: number;
  tone: string;
  hawkish_signals_detected: number;
  dovish_signals_detected: number;
}

export interface MacroData {
  cycle_stage: string;
  cycle_code: string;
  plain_explanation: string;
  us_indicators: Record<string, any>;
  ca_indicators: Record<string, any>;
  fed_sentiment: SentimentData;
  boc_sentiment: SentimentData;
  recommended_overweights: string[];
  recommended_underweights: string[];
}

export interface GuidanceDelta {
  year: string;
  added_disclaimer: string;
  severity: string;
}

export interface FundamentalData {
  symbol: string;
  free_cash_flow: number;
  fcf_yield_pct: number;
  cash_conversion_ratio: number;
  fcf_quality: string;
  moat_rating: string;
  moat_sources: string[];
  guidance_shift_deltas: GuidanceDelta[];
  arr_nrr_metrics: Record<string, string>;
}

export interface PricingData {
  symbol: string;
  current_price: number;
  currency: string;
  fifty_day_sma: number;
  two_hundred_day_sma: number;
  pe_ratio: number;
  valuation_status: string;
  valuation_percentile: number;
  dcf_fair_value: number;
  ideal_buy_range_min: number;
  ideal_buy_range_max: number;
  action_status: string;
  timing_advice: string;
  rsi_14: number;
}

export interface BullArgument {
  agent: string;
  key_points: string[];
  upside_catalyst: string;
}

export interface BearArgument {
  agent: string;
  key_points: string[];
  downside_risk: string;
}

export interface CIOVerdict {
  agent: string;
  verdict: string;
  position_sizing_advice: string;
  recommended_buy_bracket: string;
  risk_reward_ratio: number;
  judge_summary: string;
  empirical_proof_verified: boolean;
}

export interface DebateData {
  symbol: string;
  bull_argument: BullArgument;
  bear_argument: BearArgument;
  cio_verdict: CIOVerdict;
}

export interface StockAnalysisResponse {
  stock: StockData;
  macro: MacroData;
  fundamentals: FundamentalData;
  pricing: PricingData;
  debate: DebateData;
}
