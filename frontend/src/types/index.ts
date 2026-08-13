export interface StockData {
  is_valid?: boolean;
  error?: string;
  symbol: string;
  company_name: string;
  market: 'US' | 'CA';
  currency: 'USD' | 'CAD' | string;
  current_price?: number | null;
  previous_close?: number | null;
  fifty_day_sma?: number | null;
  two_hundred_day_sma?: number | null;
  pe_ratio?: number | null;
  ps_ratio?: number | null;
  ev_ebitda?: number | null;
  free_cash_flow?: number | null;
  operating_cash_flow?: number | null;
  net_income?: number | null;
  total_revenue?: number | null;
  revenue_growth?: number | null;
  rsi_14?: number | null;
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

export interface MoatFactorScore {
  factor_name: string;
  score: number;
  status: string;
}

export interface FundamentalData {
  symbol: string;
  free_cash_flow?: number | null;
  fcf_yield_pct: number;
  cash_conversion_ratio: number;
  fcf_quality: string;
  moat_rating: string;
  moat_sources: string[];
  moat_scores?: MoatFactorScore[];
  guidance_shift_deltas: GuidanceDelta[];
  arr_nrr_metrics: Record<string, any>;
}

export interface PricingData {
  symbol: string;
  current_price: number;
  currency: string;
  fifty_day_sma: number;
  two_hundred_day_sma: number;
  pe_ratio?: number | null;
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

export interface PolicyNewsItem {
  title: string;
  source: string;
  date: string;
  url: string;
  summary: string;
}

export interface SupportingFact {
  indicator: string;
  value: string;
  source: string;
  impact: string;
}

export interface StockRecommendation {
  symbol: string;
  company_name: string;
  market: 'US' | 'CA';
  currency: 'USD' | 'CAD';
  current_price: number;
  previous_close: number;
  company_background: string;
  why_recommend_rationale: string;
  macro_alignment_tag: string;
  category_badge?: string;
  total_recommendation_score: number;
  key_catalysts: string[];
  key_metrics: {
    pe_ratio: number | string;
    free_cash_flow?: string;
    free_cash_flow_b?: number | string;
    fcf_quality?: string;
    moat_rating: string;
    two_hundred_day_sma: number;
    dcf_fair_value: number;
    ideal_buy_range: string;
  };
  downside_risk_summary: string;
  action_status: string;
}

export interface CategorizedRecommendationsPayload {
  macro_context: {
    cycle_stage: string;
    cycle_code: string;
    plain_explanation: string;
  };
  sector_overweight_stocks?: StockRecommendation[];
  overall_recommended_stocks?: StockRecommendation[];
  gold_nugget_stocks?: StockRecommendation[];
  recommended_stocks?: StockRecommendation[];
}

export interface MacroDashboardResponse {
  macro_assessment: MacroData;
  policy_news: PolicyNewsItem[];
  empirical_supporting_facts: SupportingFact[];
  credible_sources: (string | { name: string; domain?: string; type?: string })[];
  recommendations: CategorizedRecommendationsPayload;
}

export interface CompanyProfile {
  symbol: string;
  company_name: string;
  sector: string;
  company_background: string;
  growth_catalysts: string[];
  key_catalysts: string[];
  revenue_drivers: string[];
  is_institutional_verified?: boolean;
}

export interface StockAnalysisResponse {
  stock: StockData;
  profile?: CompanyProfile;
  macro: MacroData;
  fundamentals: FundamentalData;
  pricing: PricingData;
  debate: DebateData;
  news: any[];
}
