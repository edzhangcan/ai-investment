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

export interface GoldBoardData {
  gold_price_usd: number;
  gold_log_yoy_pct: number;
  tips_10y_real_yield_pct: number;
  is_fiscal_dominance_decoupled: boolean;
  regime_en: string;
  regime_zh: string;
}

export interface BigPictureMacro {
  modified_buffett_ratio: number;
  modified_buffett_pct: number;
  aiae_allocation_pct: number;
  equity_risk_premium_pct: number;
  dgs10_yield_pct: number;
  dfii10_tips_real_yield_pct: number;
  fed_walcl_trillion: number;
  us_debt_trillion: number;
  money_market_trillion: number;
  gold_board: GoldBoardData;
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
  big_picture?: BigPictureMacro;
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
  discipline_audit?: {
    is_compliant: boolean;
    audit_verdict: string;
    veto_count: number;
    veto_reasons: string[];
    veto_reasons_zh: string[];
    audit_summary_en: string;
    audit_summary_zh: string;
  };
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

// Phase 2: Kelly, Frontier & Liability
export interface KellyResult {
  win_prob: number;
  upside_pct: number;
  stop_loss_pct: number;
  payoff_ratio_b: number;
  full_kelly_pct: number;
  quarter_kelly_pct: number;
  recommended_weight_pct: number;
  is_positive_edge: boolean;
}

export interface CorrelationAlert {
  pair: [string, string];
  rho_3y: number;
  rho_60d: number;
  diff: number;
  alert_en: string;
  alert_zh: string;
}

export interface FrontierPoint {
  return_pct: number;
  volatility_pct: number;
  sharpe_ratio: number;
  weights: Record<string, number>;
}

export interface EfficientFrontierResponse {
  symbols: string[];
  correlation_matrix_3y: Record<string, Record<string, number>>;
  correlation_matrix_60d: Record<string, Record<string, number>>;
  correlation_decoupling_alerts: CorrelationAlert[];
  frontier_points: FrontierPoint[];
  max_sharpe_portfolio: FrontierPoint;
  min_variance_portfolio: FrontierPoint;
  equal_weight_portfolio: FrontierPoint;
}

export interface LiabilityStressResponse {
  total_capital: number;
  est_max_drawdown_pct: number;
  max_drawdown_usd: number;
  monthly_living_expense: number;
  drawdown_months_of_living_expenses: number;
  annual_passive_income: number;
  passive_income_coverage_pct: number;
  remaining_capital: number;
  runway_months: number;
  is_runway_secure: boolean;
  verdict_en: string;
  verdict_zh: string;
}

// Phase 3: Ergodicity Backtest
export interface DrawdownEvent {
  peak_date: string;
  trough_date: string;
  recovery_date?: string | null;
  depth_pct: number;
  drawdown_days: number;
  recovery_days?: number | null;
}

export interface UnderwaterPoint {
  date: string;
  year: string;
  drawdown_pct: number;
  portfolio_value: number;
  peak_value: number;
}

export interface RebalanceComparison {
  drift_cagr_pct: number;
  quarterly_rebalanced_cagr_pct: number;
  rebalancing_bonus_bps: number;
  explanation_en: string;
  explanation_zh: string;
}
