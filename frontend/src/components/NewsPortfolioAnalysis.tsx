import React, { useState, useEffect, useRef } from 'react';
import {
  Newspaper,
  ShieldCheck,
  TrendingUp,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Briefcase,
  Star,
  DollarSign,
  AlertTriangle,
  Compass,
  ArrowUpRight,
  Building2,
  UserCheck,
  Activity,
  Info,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProvenanceBadge } from './ProvenanceBadge';
import { fetchPortfolioNewsAnalysis } from '../api/client';
import {
  PortfolioNewsAnalysisResponse,
  PortfolioNewsItem,
  KeyInvestorPost,
  TacticalAdviceItem,
  TrackedPositionPulse,
  ActionSignalTag
} from '../types';

export const ACTION_SIGNAL_META: Record<
  ActionSignalTag,
  {
    label: string;
    shortTitle: string;
    badgeClass: string;
    explanation: string;
    ruleFormula: string;
  }
> = {
  HOLD_CORE: {
    label: 'HOLD CORE',
    shortTitle: 'Intact Compounder — Hold Position',
    badgeClass:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    explanation:
      'Active holding is trading safely above its falsification floor with intact fundamentals. Hold your core position without over-trading and let free cash flow compound.',
    ruleFormula: 'Rule: Price > (200D SMA × 0.97) × 1.03 & P&L < +25%',
  },
  WATCH_PULLBACK: {
    label: 'WATCH PULLBACK',
    shortTitle: 'Wait Patiently for Buy Zone Pullback',
    badgeClass:
      'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
    explanation:
      'Watchlist target is trading above its 95% Ideal Buy Ceiling or remains in a Left-Side (Freeze/Flat) trend. Do not chase green days; wait patiently for a pullback into the buy zone with Right-Side stabilization.',
    ruleFormula: 'Rule: Price > 95% Buy Ceiling OR Trend = Left-Side (Freeze/Flat)',
  },
  DEFEND_FLOOR: {
    label: 'DEFEND FLOOR',
    shortTitle: 'Critical Floor Guard — Prepare Stop-Loss',
    badgeClass:
      'bg-rose-600 text-white border border-rose-700',
    explanation:
      'Critical Risk Guard: Price is within 3% of or has breached the 200D SMA × 0.97 falsification floor. Never average down on a falling knife; prepare mechanical stop-loss exit if the daily close breaks below the floor.',
    ruleFormula: 'Rule: Price ≤ (200D SMA × 0.97) × 1.03 (Holding Only)',
  },
  SCALE_IN_READY: {
    label: 'SCALE IN READY',
    shortTitle: 'Right-Side Entry Window Active',
    badgeClass:
      'bg-emerald-600 text-white border border-emerald-700',
    explanation:
      'Watchlist target has pulled back to or below its 95% Buy Ceiling while confirming Right-Side (Warm/Hot) trend momentum. Eligible for a disciplined 2%–4% satellite entry after Pre-Trade Soul Check.',
    ruleFormula: 'Rule: Price ≤ 95% Buy Ceiling AND Batting Zone = RIGHT_SIDE',
  },
  TRIM_EXTENDED: {
    label: 'TRIM EXTENDED',
    shortTitle: 'Protect Extended Open Gains',
    badgeClass:
      'bg-amber-600 text-white border border-amber-700',
    explanation:
      'Holding has surged +25% or more above cost basis. Maintain core position, trail your stop-loss floor upward, or trim excess weight if allocation exceeds the 4% satellite cap.',
    ruleFormula: 'Rule: Unrealized P&L ≥ +25% above Buy-In Cost Basis',
  },
};

interface NewsPortfolioAnalysisProps {
  onSelectTicker: (symbol: string) => void;
  onOpenWatchlistDrawer?: () => void;
  watchlistCount?: number;
}

export const NewsPortfolioAnalysis: React.FC<NewsPortfolioAnalysisProps> = ({
  onSelectTicker,
  onOpenWatchlistDrawer,
  watchlistCount = 0,
}) => {
  const { t } = useLanguage();
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'US' | 'CA'>('ALL');
  const [focusFilter, setFocusFilter] = useState<'ALL' | 'HOLDING' | 'WATCHLIST' | 'INVESTORS'>('ALL');
  const [data, setData] = useState<PortfolioNewsAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadAnalysis = async (market: 'ALL' | 'US' | 'CA' = marketFilter, forceRefresh: boolean = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetchPortfolioNewsAnalysis(market, forceRefresh, controller.signal);
      setData(res);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Failed to load portfolio news analysis:", err);
      setError(err.message || 'Failed to load portfolio intelligence');
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    loadAnalysis(marketFilter, false);
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [marketFilter]);

  const handleRefresh = () => {
    loadAnalysis(marketFilter, true);
  };

  // Filtered feeds
  const filteredNews = (data?.news_feed || []).filter((item: PortfolioNewsItem) => {
    if (focusFilter === 'HOLDING') return item.bucket === 'HOLDING';
    if (focusFilter === 'WATCHLIST') return item.bucket === 'WATCHLIST';
    if (focusFilter === 'INVESTORS') return false; // Hide regular news when investors focus selected
    return true;
  });

  const filteredInvestors = (data?.investor_posts || []).filter((item: KeyInvestorPost) => {
    if (focusFilter === 'HOLDING') return item.matched_bucket === 'HOLDING';
    if (focusFilter === 'WATCHLIST') return item.matched_bucket === 'WATCHLIST';
    if (focusFilter === 'INVESTORS') return true;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-12">
      {/* Top Header Card */}
      <div className="bg-surface border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Newspaper className="w-5 h-5" />
              </span>
              <h2 className="text-xl md:text-2xl font-black text-content-primary tracking-tight">
                {t.newsPortfolioTitle}
              </h2>
              {data?.provenance && (
                <ProvenanceBadge
                  provenance={data.provenance}
                />
              )}
            </div>
            <p className="text-xs md:text-sm text-content-secondary mt-1 max-w-3xl leading-relaxed">
              {t.newsPortfolioSubtitle}
            </p>
          </div>

          {/* Action & Market Filters */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Market Segmented Switch */}
            <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs font-bold">
              <button
                onClick={() => setMarketFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  marketFilter === 'ALL'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                🌎 All Markets
              </button>
              <button
                onClick={() => setMarketFilter('US')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  marketFilter === 'US'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                🇺🇸 US
              </button>
              <button
                onClick={() => setMarketFilter('CA')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  marketFilter === 'CA'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                🇨🇦 CA (TSX)
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-border-subtle bg-surface-subtle hover:bg-surface text-content-primary transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
              <span>{t.refreshIntelligence}</span>
            </button>
          </div>
        </div>

        {/* Portfolio Snapshot KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5">
          <div className="bg-surface-subtle border border-border-subtle rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider block">
                Active Holdings
              </span>
              <span className="text-xl font-black text-content-primary">
                {data?.portfolio_summary.holdings_count ?? 0}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-surface-subtle border border-border-subtle rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider block">
                Watchlist Monitored
              </span>
              <span className="text-xl font-black text-content-primary">
                {data?.portfolio_summary.watchlist_count ?? 0}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-surface-subtle border border-border-subtle rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider block">
                Portfolio Total Value
              </span>
              <span className="text-xl font-black text-content-primary">
                ${data ? data.portfolio_summary.total_portfolio_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-brand/10 text-brand">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-surface-subtle border border-border-subtle rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-content-muted uppercase tracking-wider block">
                Active Catalysts
              </span>
              <span className="text-xl font-black text-content-primary">
                {data?.portfolio_summary.active_catalyst_count ?? 0}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Demo Mode Notice Banner if user has 0 tracked positions */}
        {data?.portfolio_summary.is_demo_portfolio && (
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-content-secondary">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>{t.demoPortfolioBanner}</span>
            </div>
            {onOpenWatchlistDrawer && (
              <button
                onClick={onOpenWatchlistDrawer}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                Manage Watchlist
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-8 text-center text-content-muted flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-xs font-bold">Synthesizing US & Canadian market intelligence and portfolio briefing...</span>
        </div>
      )}

      {error && !data && (
        <div className="bg-surface border border-rose-500/20 rounded-2xl p-6 text-center text-rose-500 text-xs font-bold">
          {error}
        </div>
      )}

      {data && (
        <>
          {/* TIER 1: Today & Tomorrow Tactical Executive Briefing */}
          <div className="bg-surface border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-500" />
                <h3 className="text-base md:text-lg font-black text-content-primary">
                  {t.briefingTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-content-muted">
                <span>{data.briefing.date_label}</span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400">{data.briefing.market_regime_context}</span>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div className="my-4 p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs md:text-sm text-content-primary leading-relaxed font-medium">
              {data.briefing.executive_summary}
            </div>

            {/* 3-Column Tactical Advice Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Column 1: Action Advice */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2 text-xs font-black text-content-primary">
                    <ShieldCheck className="w-4 h-4 text-indigo-500" />
                    <span>{t.actionAdviceTitle}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    {data.briefing.action_advice.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {data.briefing.action_advice.length === 0 ? (
                    <span className="text-xs text-content-muted italic py-4 text-center">No immediate actions required today.</span>
                  ) : (
                    data.briefing.action_advice.map((act: TacticalAdviceItem, idx: number) => {
                      const actSourceUrl = act.source_url || `https://finance.yahoo.com/quote/${act.symbol}/news`;
                      const actSourceName = act.source_name || `${act.symbol} Financial News`;
                      const sigKey = (act.action_tag || 'HOLD_CORE') as ActionSignalTag;
                      const sigMeta = ACTION_SIGNAL_META[sigKey] || ACTION_SIGNAL_META.HOLD_CORE;

                      return (
                        <div
                          key={`act-${idx}`}
                          onClick={() => window.open(actSourceUrl, '_blank', 'noopener,noreferrer')}
                          role="link"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              window.open(actSourceUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="p-3 rounded-lg bg-surface border border-border-subtle text-xs flex flex-col gap-1.5 hover:border-indigo-400 transition-colors shadow-2xs cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectTicker(act.symbol);
                                }}
                                title={`Open ${act.symbol} Deep-Dive Analysis`}
                                className="font-black text-brand hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>{act.symbol}</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                              {act.action_tag && (
                                <span
                                  title={act.action_tag_explanation || sigMeta.explanation}
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1 ${sigMeta.badgeClass}`}
                                >
                                  <span>{sigMeta.label}</span>
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                act.urgency === 'HIGH'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                                  : act.urgency === 'MEDIUM'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                  : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                              }`}
                            >
                              {act.urgency}
                            </span>
                          </div>
                          <h4 className="font-bold text-content-primary leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-start justify-between gap-1">
                            <span>{act.headline}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                          </h4>
                          <p className="text-[11px] text-content-secondary leading-relaxed">
                            {act.tactical_instruction}
                          </p>
                          <a
                            href={actSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 pt-1.5 border-t border-border-subtle flex items-center justify-between gap-2 text-[10px] font-bold text-content-muted group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                          >
                            <span className="truncate">Source: {actSourceName}</span>
                            <span className="inline-flex items-center gap-0.5 shrink-0 underline decoration-dotted underline-offset-2">
                              <span>Read Source</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 2: Opportunities & Catalysts */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2 text-xs font-black text-content-primary">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>{t.opportunitiesTitle}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {data.briefing.opportunities.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {data.briefing.opportunities.length === 0 ? (
                    <span className="text-xs text-content-muted italic py-4 text-center">All candidates currently within expected fair value.</span>
                  ) : (
                    data.briefing.opportunities.map((opp: TacticalAdviceItem, idx: number) => {
                      const firstSym = opp.symbol.split(',')[0].trim();
                      const oppSourceUrl = opp.source_url || `https://finance.yahoo.com/quote/${firstSym}/news`;
                      const oppSourceName = opp.source_name || 'Institutional Financial Media';

                      return (
                        <div
                          key={`opp-${idx}`}
                          onClick={() => window.open(oppSourceUrl, '_blank', 'noopener,noreferrer')}
                          role="link"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              window.open(oppSourceUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="p-3 rounded-lg bg-surface border border-border-subtle text-xs flex flex-col gap-1.5 hover:border-emerald-400 transition-colors shadow-2xs cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!opp.symbol.includes(',')) {
                                  onSelectTicker(opp.symbol);
                                } else if (firstSym && firstSym !== 'NORTH_AMERICA') {
                                  onSelectTicker(firstSym);
                                }
                              }}
                              title="Open Ticker Deep-Dive Analysis"
                              className="font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer text-left"
                            >
                              <span>{opp.symbol}</span>
                              {!opp.symbol.includes(',') && <ArrowUpRight className="w-3 h-3" />}
                            </button>
                            <span className="text-[9px] font-bold text-content-muted">
                              {opp.time_horizon}
                            </span>
                          </div>
                          <h4 className="font-bold text-content-primary leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-start justify-between gap-1">
                            <span>{opp.headline}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                          </h4>
                          <p className="text-[11px] text-content-secondary leading-relaxed">
                            {opp.rationale}
                          </p>
                          <a
                            href={oppSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 pt-1.5 border-t border-border-subtle flex items-center justify-between gap-2 text-[10px] font-bold text-content-muted group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                          >
                            <span className="truncate">Source: {oppSourceName}</span>
                            <span className="inline-flex items-center gap-0.5 shrink-0 underline decoration-dotted underline-offset-2">
                              <span>Read Source</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Column 3: Risks & Falsification Watchouts */}
              <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-2 text-xs font-black text-content-primary">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>{t.risksTitle}</span>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                    {data.briefing.risks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {data.briefing.risks.length === 0 ? (
                    <span className="text-xs text-content-muted italic py-4 text-center">No elevated risk flags or falsification breaches.</span>
                  ) : (
                    data.briefing.risks.map((risk: TacticalAdviceItem, idx: number) => {
                      const firstSym = risk.symbol.split(',')[0].trim();
                      const riskSourceUrl = risk.source_url || `https://finance.yahoo.com/quote/${firstSym}/news`;
                      const riskSourceName = risk.source_name || 'Official Risk Disclosure';

                      return (
                        <div
                          key={`risk-${idx}`}
                          onClick={() => window.open(riskSourceUrl, '_blank', 'noopener,noreferrer')}
                          role="link"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              window.open(riskSourceUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="p-3 rounded-lg bg-surface border border-border-subtle text-xs flex flex-col gap-1.5 hover:border-rose-400 transition-colors shadow-2xs cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!risk.symbol.includes(',')) {
                                  onSelectTicker(risk.symbol);
                                } else if (firstSym && firstSym !== 'MACRO') {
                                  onSelectTicker(firstSym);
                                }
                              }}
                              title="Open Ticker Deep-Dive Analysis"
                              className="font-black text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer text-left"
                            >
                              <span>{risk.symbol}</span>
                              {!risk.symbol.includes(',') && <ArrowUpRight className="w-3 h-3" />}
                            </button>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase">
                              {risk.urgency}
                            </span>
                          </div>
                          <h4 className="font-bold text-content-primary leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-start justify-between gap-1">
                            <span>{risk.headline}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                          </h4>
                          <p className="text-[11px] text-content-secondary leading-relaxed">
                            {risk.rationale}
                          </p>
                          <a
                            href={riskSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 pt-1.5 border-t border-border-subtle flex items-center justify-between gap-2 text-[10px] font-bold text-content-muted group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
                          >
                            <span className="truncate">Source: {riskSourceName}</span>
                            <span className="inline-flex items-center gap-0.5 shrink-0 underline decoration-dotted underline-offset-2">
                              <span>Read Source</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Key Action Signal Tags Reference Guide */}
            <div className="mt-5 pt-4 border-t border-border-subtle">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-black text-content-primary uppercase tracking-wider">
                  Key Action Signal Tags Guide (Execution Discipline Definitions)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {(['HOLD_CORE', 'WATCH_PULLBACK', 'DEFEND_FLOOR', 'SCALE_IN_READY', 'TRIM_EXTENDED'] as ActionSignalTag[]).map((tagKey) => {
                  const meta = ACTION_SIGNAL_META[tagKey];
                  return (
                    <div
                      key={tagKey}
                      className="p-2.5 rounded-xl bg-surface-subtle border border-border-subtle flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] font-bold text-content-primary truncate">
                          {meta.shortTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-content-secondary leading-snug">
                        {meta.explanation}
                      </p>
                      <span className="text-[9px] font-mono font-bold text-content-muted">
                        {meta.ruleFormula}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TIER 2: Two-Column Intelligence Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (8 cols): Credible News & Key Investor Feed */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <h3 className="text-base font-black text-content-primary">
                      {t.credibleNewsStreamTitle}
                    </h3>
                  </div>

                  {/* Focus Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold">
                    <button
                      onClick={() => setFocusFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        focusFilter === 'ALL'
                          ? 'bg-amber-600 text-white'
                          : 'bg-surface-subtle text-content-secondary hover:text-content-primary border border-border-subtle'
                      }`}
                    >
                      {t.filterAll}
                    </button>
                    <button
                      onClick={() => setFocusFilter('HOLDING')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        focusFilter === 'HOLDING'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-subtle text-content-secondary hover:text-content-primary border border-border-subtle'
                      }`}
                    >
                      💼 {t.filterHoldings}
                    </button>
                    <button
                      onClick={() => setFocusFilter('WATCHLIST')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        focusFilter === 'WATCHLIST'
                          ? 'bg-amber-600 text-white'
                          : 'bg-surface-subtle text-content-secondary hover:text-content-primary border border-border-subtle'
                      }`}
                    >
                      ⭐ {t.filterWatchlist}
                    </button>
                    <button
                      onClick={() => setFocusFilter('INVESTORS')}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                        focusFilter === 'INVESTORS'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-surface-subtle text-content-secondary hover:text-content-primary border border-border-subtle'
                      }`}
                    >
                      🏛️ {t.filterKeyInvestors}
                    </button>
                  </div>
                </div>

                {/* News & Investor Posts Feed */}
                <div className="flex flex-col gap-4 pt-4">
                  {/* Key Investor Posts Section */}
                  {filteredInvestors.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-xs font-black text-indigo-500 uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Key Institutional Investor & Superinvestor Commentary</span>
                      </div>
                      {filteredInvestors.map((post: KeyInvestorPost) => (
                        <div
                          key={post.id}
                          className="p-4 rounded-xl bg-surface-subtle border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col gap-2.5 shadow-2xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                <UserCheck className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="font-black text-xs text-content-primary block">
                                  {post.investor_name}
                                </span>
                                <span className="text-[10px] font-bold text-content-muted">
                                  {post.institution} ({post.market})
                                </span>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                                post.stance === 'BULLISH'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                                  : post.stance === 'DEFENSIVE' || post.stance === 'CAUTIOUS'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                  : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25'
                              }`}
                            >
                              {post.stance}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-xs md:text-sm text-content-primary leading-snug">
                            {post.title}
                          </h4>

                          <p className="text-xs text-content-secondary leading-relaxed">
                            "{post.commentary}"
                          </p>

                          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle text-[11px] text-content-primary">
                            <span className="font-bold text-indigo-500">Key Takeaway: </span>
                            <span>{post.key_takeaway}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-content-muted text-[10px] font-bold">Related:</span>
                              {post.related_symbols.map((sym: string) => (
                                <button
                                  key={sym}
                                  onClick={() => onSelectTicker(sym)}
                                  className="px-2 py-0.5 rounded bg-surface hover:bg-surface-subtle border border-border-subtle text-content-primary font-bold cursor-pointer transition-colors"
                                >
                                  ${sym}
                                </button>
                              ))}
                            </div>
                            <a
                              href={post.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-content-muted hover:text-indigo-500 inline-flex items-center gap-1 font-bold text-[10px]"
                            >
                              <span>Official Disclosure</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stock News Stream Section */}
                  {filteredNews.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-wider">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>Recent Corporate Disclosures & Financial Coverage</span>
                      </div>
                      {filteredNews.map((news: PortfolioNewsItem) => (
                        <div
                          key={news.id}
                          className="p-4 rounded-xl bg-surface-subtle border border-border-subtle hover:border-amber-400/50 transition-all flex flex-col gap-2.5 shadow-2xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                onClick={() => onSelectTicker(news.symbol)}
                                className="px-2 py-0.5 rounded bg-surface border border-border-subtle font-black text-xs text-brand hover:underline cursor-pointer"
                              >
                                {news.symbol}
                              </button>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                  news.bucket === 'HOLDING'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                                    : news.bucket === 'WATCHLIST'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25'
                                }`}
                              >
                                {news.bucket}
                              </span>
                              <span className="text-[10px] font-bold text-content-muted px-1.5 py-0.5 rounded bg-surface border border-border-subtle">
                                {news.credibility_tier}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                news.sentiment === 'BULLISH'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : news.sentiment === 'BEARISH' || news.sentiment === 'RISK_ALERT'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : 'bg-slate-500/10 text-slate-500'
                              }`}
                            >
                              {news.sentiment}
                            </span>
                          </div>

                          <h4 className="font-bold text-xs md:text-sm text-content-primary leading-snug">
                            {news.title}
                          </h4>

                          <p className="text-xs text-content-secondary leading-relaxed">
                            {news.summary}
                          </p>

                          {/* Portfolio Impact Callout Note */}
                          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle text-[11px] text-content-primary leading-relaxed font-medium">
                            <span className="font-bold text-amber-600 dark:text-amber-400">Why It Matters: </span>
                            <span>{news.portfolio_impact_note}</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-content-muted pt-1">
                            <span>{news.source} • {news.published_at}</span>
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-amber-500 inline-flex items-center gap-1 font-bold"
                            >
                              <span>Read Source</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredNews.length === 0 && filteredInvestors.length === 0 && (
                    <div className="p-8 text-center text-xs text-content-muted italic">
                      No headlines matching the active filter.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (4 cols): Tracked Holdings & Watchlist Pulse Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-sm font-black text-content-primary">
                      {t.trackedPulseTitle}
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-surface-subtle text-content-muted border border-border-subtle">
                    {data.tracked_positions.length} Active
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {data.tracked_positions.map((pos: TrackedPositionPulse) => {
                    const sigMeta = ACTION_SIGNAL_META[pos.day_signal] || ACTION_SIGNAL_META.HOLD_CORE;
                    const sigExplanation = pos.day_signal_explanation || sigMeta.explanation;

                    return (
                      <div
                        key={pos.symbol}
                        className="p-3.5 rounded-xl bg-surface-subtle border border-border-subtle hover:border-brand/40 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-content-primary">
                                {pos.symbol}
                              </span>
                              <span
                                className={`text-[9px] font-extrabold px-1 rounded uppercase ${
                                  pos.bucket === 'HOLDING'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}
                              >
                                {pos.bucket}
                              </span>
                            </div>
                            <span className="text-[10px] text-content-muted block truncate max-w-[170px]">
                              {pos.company_name}
                            </span>
                          </div>

                          {/* Action Signal Tag with 100% Solid Hover Popover Explanation */}
                          <div className="relative group/sig">
                            <span
                              tabIndex={0}
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1 cursor-help ${sigMeta.badgeClass}`}
                            >
                              <span>{sigMeta.label}</span>
                              <Info className="w-2.5 h-2.5 opacity-80" />
                            </span>

                            {/* 100% Solid Tooltip Card (Zero Bleed-Through) */}
                            <div className="hidden group-hover/sig:block group-focus-within/sig:block absolute right-0 top-full mt-1.5 w-64 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-xl z-30 text-left">
                              <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase">
                                  {sigMeta.label}
                                </span>
                                <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                                  {sigMeta.shortTitle}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mb-1.5">
                                {sigExplanation}
                              </p>
                              <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block">
                                {sigMeta.ruleFormula}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Inline Action Signal Explanation Box */}
                        <div className="p-2 rounded-lg bg-surface border border-border-subtle text-[10px] text-content-secondary leading-snug">
                          <span className="font-bold text-content-primary">{sigMeta.shortTitle}: </span>
                          <span>{sigExplanation}</span>
                        </div>

                        {/* Prices & Telemetry */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border-subtle">
                          <div>
                            <span className="text-content-muted block text-[10px]">Price:</span>
                            <span className="font-bold text-content-primary">
                              ${pos.current_price.toFixed(2)} {pos.currency}
                            </span>
                          </div>

                          <div>
                            {pos.bucket === 'HOLDING' ? (
                              <>
                                <span className="text-content-muted block text-[10px]">P&L:</span>
                                <span
                                  className={`font-black ${
                                    (pos.unrealized_pnl_pct ?? 0) >= 0
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {pos.unrealized_pnl_pct !== null ? `${pos.unrealized_pnl_pct > 0 ? '+' : ''}${pos.unrealized_pnl_pct.toFixed(1)}%` : '—'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-content-muted block text-[10px]">Buy Ceiling:</span>
                                <span className="font-bold text-amber-600 dark:text-amber-400">
                                  ${pos.target_buy_price?.toFixed(2) ?? '—'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Falsification Floor & Batting Zone */}
                        <div className="flex items-center justify-between text-[10px] text-content-muted pt-1">
                          {pos.bucket === 'HOLDING' ? (
                            <span>
                              Floor: <strong className="text-content-primary">${pos.falsification_floor?.toFixed(2) ?? '—'}</strong>
                            </span>
                          ) : (
                            <span>
                              Batting: <strong className="text-content-primary">{pos.batting_zone}</strong>
                            </span>
                          )}
                          {pos.latest_news_url ? (
                            <a
                              href={pos.latest_news_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded bg-surface hover:border-amber-400 border border-border-subtle text-content-muted hover:text-amber-600 dark:hover:text-amber-400 text-[9px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <span>{pos.related_news_count} news</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-surface text-content-muted text-[9px] font-bold">
                              {pos.related_news_count} news
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => onSelectTicker(pos.symbol)}
                          className="w-full mt-1 py-1.5 px-3 rounded-lg bg-surface hover:bg-surface-subtle border border-border-subtle text-[11px] font-bold text-content-primary flex items-center justify-center gap-1 transition-colors cursor-pointer group"
                        >
                          <span>Deep Dive Analysis</span>
                          <ChevronRight className="w-3 h-3 text-content-muted group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
