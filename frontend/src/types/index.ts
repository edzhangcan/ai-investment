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
  dividend_yield_pct?: number | null;
  net_buyback_yield_pct?: number | null;
  total_shareholder_yield_pct?: number | null;
  roic?: number | null;
  dilution_3y_pct?: number | null;
  source: string;
}

export type StockTaxonomyType = 'TREE' | 'GRAIN' | 'VEGETABLE';

export interface TaxonomyResult {
  taxonomy: StockTaxonomyType;
  badge_en: string;
  badge_zh: string;
  holding_rule_en: string;
  holding_rule_zh: string;
  total_shareholder_yield_pct: number;
  net_buyback_yield_pct: number;
  dilution_3y_pct: number;
}

export interface ReverseDcfCell {
  discount_rate_pct: number;
  ceiling_multiple: number;
  fair_pe: number;
}

export interface ReverseDcfResult {
  current_pe: number;
  implied_10y_ceiling_multiple: number;
  implied_10y_profit_usd?: number | null;
  is_prosperity_trap: boolean;
  prosperity_trap_note?: string | null;
  matrix: ReverseDcfCell[];
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
  taxonomy?: TaxonomyResult;
  total_shareholder_yield_pct?: number;
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
  ideal_buy_range_min?: number | null;
  ideal_buy_range_max?: number | null;
  ideal_sell_range_min?: number | null;
  ideal_sell_range_max?: number | null;
  dcf_applicable?: boolean;
  action_status: string;
  timing_advice: string;
  rsi_14: number;
  reverse_dcf?: ReverseDcfResult;
  taxonomy?: TaxonomyResult;
  total_shareholder_yield_pct?: number;
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
    ideal_buy_range_min?: number;
    ideal_buy_range_max?: number;
    ideal_buy_range: string;
  };
  downside_risk_summary: string;
  action_status: string;
  taxonomy?: TaxonomyResult;
  taxonomy_badge?: string;
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
