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
  HelpCircle,
  Clock,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { LanguageMode } from '../i18n/translations';
import { ProvenanceBadge } from './ProvenanceBadge';
import { fetchPortfolioNewsAnalysis } from '../api/client';
import {
  PortfolioNewsAnalysisResponse,
  PortfolioNewsItem,
  KeyInvestorPost,
  TacticalAdviceItem,
  ActionSignalTag
} from '../types';

export const ACTION_SIGNAL_META: Record<
  ActionSignalTag,
  {
    label: string;
    labelZh: string;
    labelHybrid: string;
    shortTitle: string;
    shortTitleZh: string;
    shortTitleHybrid: string;
    badgeClass: string;
    explanation: string;
    explanationZh: string;
    explanationHybrid: string;
    ruleFormula: string;
    ruleFormulaZh: string;
  }
> = {
  HOLD_CORE: {
    label: 'HOLD CORE',
    labelZh: '核心持有',
    labelHybrid: '核心持有 (HOLD CORE)',
    shortTitle: 'Intact Compounder — Hold Position',
    shortTitleZh: '基本面完好 — 稳健持有复利',
    shortTitleHybrid: '核心复利持有 (Hold Position)',
    badgeClass:
      'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30',
    explanation:
      'Active holding is trading safely above its falsification floor with intact fundamentals. Hold your core position without over-trading and let free cash flow compound.',
    explanationZh:
      '当前持仓安全运行于证伪底线之上且基本面完好，建议继续核心持有，避免频繁交易，让自由现金流自然复利。',
    explanationHybrid:
      '持仓安全运行于证伪底线之上且基本面完好。建议稳健持有 (Hold Core)，避免过度交易。',
    ruleFormula: 'Rule: Price > (200D SMA × 0.97) × 1.03 & P&L < +25%',
    ruleFormulaZh: '规则：现价 > 证伪底线 × 1.03 且 浮盈 < +25%',
  },
  WATCH_PULLBACK: {
    label: 'WATCH PULLBACK',
    labelZh: '等待回调',
    labelHybrid: '等待回调 (WATCH PULLBACK)',
    shortTitle: 'Wait Patiently for Buy Zone Pullback',
    shortTitleZh: '耐心等待价格回落至击球买入区',
    shortTitleHybrid: '等待买入区间回调 (Wait Pullback)',
    badgeClass:
      'bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30',
    explanation:
      'Watchlist target is trading above its 95% Ideal Buy Ceiling or remains in a Left Side (Freeze/Flat) trend. Do not chase green days; wait patiently for a pullback into the buy zone with Right Side stabilization.',
    explanationZh:
      '关注标的当前高于 95% 理想买入上限或仍处于左侧弱势震荡，切忌追涨，耐心等待回调至买入区并确认右侧企稳。',
    explanationHybrid:
      '关注标的高于买入上限或处于左侧趋势 (Left Side)。切勿追高，耐心等待回调企稳。',
    ruleFormula: 'Rule: Price > 95% Buy Ceiling OR Trend = Left Side (Freeze/Flat)',
    ruleFormulaZh: '规则：现价 > 95%买入上限 或 处于左侧趋势',
  },
  DEFEND_FLOOR: {
    label: 'DEFEND FLOOR',
    labelZh: '守卫底线',
    labelHybrid: '守卫底线 (DEFEND FLOOR)',
    shortTitle: 'Critical Floor Guard — Prepare Stop-Loss',
    shortTitleZh: '触及证伪警戒线 — 严禁左侧补仓',
    shortTitleHybrid: '证伪底线警戒 (Floor Guard)',
    badgeClass:
      'bg-rose-600 text-white border border-rose-700',
    explanation:
      'Critical Risk Guard: Price is within 3% of or has breached the 200D SMA × 0.97 falsification floor. Never average down on a falling knife; prepare mechanical stop-loss exit if the daily close breaks below the floor.',
    explanationZh:
      '高危风控警戒：现价距离或已跌破证伪底线。严禁在左侧下跌趋势中摊低成本；若收盘有效跌破底线，须严格执行机械止损。',
    explanationHybrid:
      '风控警戒 (Risk Guard)：价格接近或跌破证伪底线。切勿摊平亏损，收盘破位须严格执行止损。',
    ruleFormula: 'Rule: Price ≤ (200D SMA × 0.97) × 1.03 (Holding Only)',
    ruleFormulaZh: '规则：现价 ≤ 证伪底线 × 1.03 (仅限持仓)',
  },
  SCALE_IN_READY: {
    label: 'SCALE IN READY',
    labelZh: '右侧可建仓',
    labelHybrid: '右侧可加仓 (SCALE IN READY)',
    shortTitle: 'Right Side Entry Window Active',
    shortTitleZh: '右侧击球窗口已开启 — 可小仓位切入',
    shortTitleHybrid: '右侧买点就绪 (Right-Side Window)',
    badgeClass:
      'bg-emerald-600 text-white border border-emerald-700',
    explanation:
      'Watchlist target has pulled back to or below its 95% Buy Ceiling while confirming Right Side (Warm/Hot) trend momentum. Eligible for a disciplined 2%–4% satellite entry after Pre-Trade Soul Check.',
    explanationZh:
      '关注标的已回落至 95% 买入上限以内且确认右侧趋势动量转强。完成交易前灵魂拷问后，可按 2%–4% 卫星仓位纪律建仓。',
    explanationHybrid:
      '已回调至 95% 买入上限以内且确认右侧趋势 (RIGHT_SIDE)。完成灵魂拷问后可按 2%-4% 仓位介入。',
    ruleFormula: 'Rule: Price ≤ 95% Buy Ceiling AND Batting Zone = RIGHT_SIDE',
    ruleFormulaZh: '规则：现价 ≤ 95%买入上限 且 右侧击球区',
  },
  TRIM_EXTENDED: {
    label: 'TRIM EXTENDED',
    labelZh: '止盈保护',
    labelHybrid: '逢高保护 (TRIM EXTENDED)',
    shortTitle: 'Protect Extended Open Gains',
    shortTitleZh: '锁定大幅浮盈 — 上移止损或减仓',
    shortTitleHybrid: '保护丰厚浮盈 (Protect Gains)',
    badgeClass:
      'bg-amber-600 text-white border border-amber-700',
    explanation:
      'Holding has surged +25% or more above cost basis. Maintain core position, trail your stop-loss floor upward, or trim excess weight if allocation exceeds the 4% satellite cap.',
    explanationZh:
      '持仓较成本价已录得 +25% 以上浮盈。建议保持核心仓位并上移跟踪止损位，若单一卫星仓位超出 4% 上限可适度减仓锁利。',
    explanationHybrid:
      '浮盈已超 +25% (Extended Gains)。建议上移追踪止损，若单只卫星仓位超 4% 上限可适当止盈。',
    ruleFormula: 'Rule: Unrealized P&L ≥ +25% above Buy-In Cost Basis',
    ruleFormulaZh: '规则：未实现浮盈 ≥ +25% (相对买入成本)',
  },
};

function getLocalizedSignalText(tagKey: ActionSignalTag, language: LanguageMode) {
  const meta = ACTION_SIGNAL_META[tagKey] || ACTION_SIGNAL_META.HOLD_CORE;
  if (language === 'zh') {
    return {
      label: meta.labelZh,
      shortTitle: meta.shortTitleZh,
      explanation: meta.explanationZh,
      ruleFormula: meta.ruleFormulaZh,
      badgeClass: meta.badgeClass,
    };
  }
  if (language === 'hybrid') {
    return {
      label: meta.labelHybrid,
      shortTitle: meta.shortTitleHybrid,
      explanation: meta.explanationHybrid,
      ruleFormula: meta.ruleFormula,
      badgeClass: meta.badgeClass,
    };
  }
  return {
    label: meta.label,
    shortTitle: meta.shortTitle,
    explanation: meta.explanation,
    ruleFormula: meta.ruleFormula,
    badgeClass: meta.badgeClass,
  };
}

function formatLocalizedBucket(bucket: string, language: LanguageMode): string {
  if (language === 'zh') {
    if (bucket === 'HOLDING') return '持仓';
    if (bucket === 'WATCHLIST') return '关注';
    return '全市场';
  }
  if (language === 'hybrid') {
    if (bucket === 'HOLDING') return '持仓 (HOLDING)';
    if (bucket === 'WATCHLIST') return '关注 (WATCHLIST)';
    return '市场 (MARKET)';
  }
  return bucket;
}

function formatLocalizedSentiment(sentiment: string, language: LanguageMode): string {
  if (language === 'zh') {
    if (sentiment === 'BULLISH') return '看涨 / 利好';
    if (sentiment === 'BEARISH') return '看空 / 承压';
    if (sentiment === 'RISK_ALERT') return '风险警示';
    return '中性';
  }
  if (language === 'hybrid') {
    if (sentiment === 'BULLISH') return '看涨 (BULLISH)';
    if (sentiment === 'BEARISH') return '承压 (BEARISH)';
    if (sentiment === 'RISK_ALERT') return '风控预警 (RISK)';
    return '中性 (NEUTRAL)';
  }
  return sentiment;
}

function formatLocalizedUrgency(urgency: string, language: LanguageMode): string {
  if (language === 'zh') {
    if (urgency === 'HIGH') return '高优先';
    if (urgency === 'MEDIUM') return '中优先';
    return '常规';
  }
  if (language === 'hybrid') {
    if (urgency === 'HIGH') return '高 (HIGH)';
    if (urgency === 'MEDIUM') return '中 (MED)';
    return '常规 (LOW)';
  }
  return urgency;
}

function formatLocalizedStance(stance: string, language: LanguageMode): string {
  if (language === 'zh') {
    if (stance === 'BULLISH') return '看多布局';
    if (stance === 'HIGH_CONVICTION') return '高确定性核心';
    if (stance === 'DEFENSIVE') return '防御保守';
    if (stance === 'CAUTIOUS') return '谨慎观望';
    return stance;
  }
  if (language === 'hybrid') {
    if (stance === 'BULLISH') return '看多 (BULLISH)';
    if (stance === 'HIGH_CONVICTION') return '高确定性 (HIGH_CONVICTION)';
    if (stance === 'DEFENSIVE') return '防御 (DEFENSIVE)';
    if (stance === 'CAUTIOUS') return '谨慎 (CAUTIOUS)';
    return stance;
  }
  return stance;
}

function formatLocalizedBattingZone(zone: string | null | undefined, language: LanguageMode): string {
  const z = zone || 'RIGHT_SIDE';
  if (language === 'zh') {
    if (z === 'RIGHT_SIDE') return '右侧击球区';
    if (z === 'LEFT_SIDE') return '左侧观望区';
    if (z === 'IN_ZONE') return '命中买区';
    return z;
  }
  if (language === 'hybrid') {
    if (z === 'RIGHT_SIDE') return '右侧 (RIGHT_SIDE)';
    if (z === 'LEFT_SIDE') return '左侧 (LEFT_SIDE)';
    return z;
  }
  return z;
}

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
  const { t, language } = useLanguage();
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'US' | 'CA'>('ALL');
  const [focusFilter, setFocusFilter] = useState<'ALL' | 'HOLDING' | 'WATCHLIST' | 'INVESTORS'>('ALL');
  const [data, setData] = useState<PortfolioNewsAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignalGuidePinned, setIsSignalGuidePinned] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSignalGuidePinned(false);
      }
    };
    if (isSignalGuidePinned) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSignalGuidePinned]);

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
                {t.marketAll}
              </button>
              <button
                onClick={() => setMarketFilter('US')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  marketFilter === 'US'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {t.marketUS}
              </button>
              <button
                onClick={() => setMarketFilter('CA')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  marketFilter === 'CA'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary'
                }`}
              >
                {t.marketCA}
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
                {t.kpiActiveHoldings}
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
                {t.kpiWatchlistMonitored}
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
                {t.kpiPortfolioValue}
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
                {t.kpiActiveCatalysts}
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
                {t.manageWatchlistBtn}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !data && (
        <div className="bg-surface border border-border-subtle rounded-2xl p-8 text-center text-content-muted flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
          <span className="text-xs font-bold">{t.synthesizingBriefing}</span>
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
              <div className="flex items-center gap-2 flex-wrap">
                <Compass className="w-4 h-4 text-amber-500" />
                <h3 className="text-base md:text-lg font-black text-content-primary">
                  {t.briefingTitle}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>{t.recentWindowBadge}</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap text-[11px] font-bold text-content-muted">
                <span>{data.briefing.date_label}</span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400">{data.briefing.market_regime_context}</span>

                {/* Hover-to-Display Signal Tags Guide Modal Trigger */}
                <div className="relative group/sigguide">
                  <button
                    type="button"
                    onClick={() => setIsSignalGuidePinned(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-surface border border-border-subtle hover:border-amber-500/50 text-[11px] font-black text-content-primary hover:text-amber-500 transition-all cursor-help shadow-2xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t.signalTagsGuideBtn}</span>
                  </button>

                  {/* 100% Solid Hover Modal Overlay (Zero Bleed-Through) */}
                  <div
                    role="dialog"
                    aria-label="Key Action Signal Tags Reference Guide"
                    className="hidden group-hover/sigguide:block group-focus-within/sigguide:block absolute right-0 top-full mt-2 w-[320px] sm:w-[480px] lg:w-[600px] p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl z-50 text-left"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                          {t.signalTagsGuideTitle}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {t.hoverOrClickToPin}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(['HOLD_CORE', 'WATCH_PULLBACK', 'DEFEND_FLOOR', 'SCALE_IN_READY', 'TRIM_EXTENDED'] as ActionSignalTag[]).map((tagKey) => {
                        const sigLoc = getLocalizedSignalText(tagKey, language);
                        return (
                          <div
                            key={tagKey}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${sigLoc.badgeClass}`}>
                                {sigLoc.label}
                              </span>
                              <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 truncate">
                                {sigLoc.shortTitle}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug font-normal">
                              {sigLoc.explanation}
                            </p>
                            <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                              {sigLoc.ruleFormula}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Executive Summary Narrative */}
            <div className="my-4 p-4 rounded-xl bg-surface-subtle border border-border-subtle text-xs md:text-sm text-content-primary leading-relaxed font-medium">
              {data.briefing.executive_summary}
            </div>

            {/* TIER 1A: Full-Width Hero Action Advice & Consolidated Portfolio Direction (PL-732) */}
            <div
              data-testid="briefing-action-advice-box"
              className="flex flex-col gap-4 p-4 md:p-5 rounded-2xl bg-surface-subtle border border-indigo-500/25 mb-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm md:text-base font-black text-content-primary">
                        {t.actionAdviceTitle} {t.actionAdviceHeroTitleSuffix}
                      </h4>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {data.briefing.action_advice.length} {t.activePositionsLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-content-muted">
                      {t.actionAdviceHeroSub}
                    </p>
                  </div>
                </div>
              </div>

              {data.briefing.action_advice.length === 0 ? (
                <div className="text-xs text-content-muted italic py-6 text-center">
                  {t.noActionItems}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.briefing.action_advice.map((act: TacticalAdviceItem, idx: number) => {
                    const actSourceUrl = act.source_url || `https://finance.yahoo.com/quote/${act.symbol}/news`;
                    const actSourceName = act.source_name || `${act.symbol} Financial News`;
                    const sigKey = (act.action_tag || 'HOLD_CORE') as ActionSignalTag;
                    const sigLoc = getLocalizedSignalText(sigKey, language);
                    const currPrice = act.current_price ?? act.reference_price;
                    const isHolding = act.bucket === 'HOLDING';

                    return (
                      <div
                        key={`act-${act.symbol}-${idx}`}
                        className="p-4 rounded-xl bg-surface border border-border-subtle hover:border-indigo-400/70 transition-all shadow-2xs flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex flex-col gap-2.5">
                          {/* Card Header: Ticker, Bucket, Allocation & Action Signal Popover */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => onSelectTicker(act.symbol)}
                                  title={`${act.symbol} ${t.deepDiveBtn}`}
                                  className="font-black text-sm text-brand hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>{act.symbol}</span>
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                                <span
                                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                                    isHolding
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                  }`}
                                >
                                  {formatLocalizedBucket(act.bucket, language)}
                                </span>
                                {typeof act.portfolio_allocation_pct === 'number' && act.portfolio_allocation_pct > 0 && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-subtle border border-border-subtle text-content-muted">
                                    {act.portfolio_allocation_pct.toFixed(1)}% {t.weightShort}
                                  </span>
                                )}
                              </div>
                              {act.company_name && (
                                <span className="text-[11px] text-content-muted block truncate mt-0.5">
                                  {act.company_name}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {act.action_tag && (
                                <div
                                  className="relative group/acttag"
                                  onClick={() => setIsSignalGuidePinned(true)}
                                >
                                  <span
                                    tabIndex={0}
                                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1 cursor-help ${sigLoc.badgeClass}`}
                                  >
                                    <span>{sigLoc.label}</span>
                                    <Info className="w-2.5 h-2.5 opacity-80" />
                                  </span>

                                  <div className="hidden group-hover/acttag:block group-focus-within/acttag:block absolute right-0 top-full mt-1.5 w-64 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl z-40 text-left pointer-events-none">
                                    <div className="flex items-center justify-between gap-1.5 pb-1.5 mb-1.5 border-b border-slate-200 dark:border-slate-800">
                                      <span className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase">
                                        {sigLoc.label}
                                      </span>
                                      <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 truncate">
                                        {sigLoc.shortTitle}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed mb-1.5 font-normal">
                                      {language === 'en' && act.action_tag_explanation ? act.action_tag_explanation : sigLoc.explanation}
                                    </p>
                                    <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block">
                                      {sigLoc.ruleFormula}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                  act.urgency === 'HIGH'
                                    ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                                    : act.urgency === 'MEDIUM'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25'
                                    : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                                }`}
                              >
                                {formatLocalizedUrgency(act.urgency, language)}
                              </span>
                            </div>
                          </div>

                          {/* Consolidated Position Telemetry Grid */}
                          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-subtle border border-border-subtle text-[11px]">
                            <div>
                              <span className="text-[10px] text-content-muted block">{t.telemetryPrice}</span>
                              <span className="font-black text-content-primary">
                                {typeof currPrice === 'number' ? `$${currPrice.toFixed(2)}` : '—'}
                              </span>
                              <span className="text-[9px] text-content-muted ml-0.5">{act.currency || 'USD'}</span>
                            </div>
                            {isHolding ? (
                              <>
                                <div>
                                  <span className="text-[10px] text-content-muted block">{t.telemetryPnlCost}</span>
                                  <span
                                    className={`font-black ${
                                      (act.unrealized_pnl_pct ?? 0) >= 0
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-rose-600 dark:text-rose-400'
                                    }`}
                                  >
                                    {typeof act.unrealized_pnl_pct === 'number'
                                      ? `${act.unrealized_pnl_pct > 0 ? '+' : ''}${act.unrealized_pnl_pct.toFixed(1)}%`
                                      : '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-content-muted block">{t.telemetryKillFloor}</span>
                                  <span className="font-bold text-content-primary">
                                    {typeof (act.falsification_floor ?? act.threshold_price) === 'number'
                                      ? `$${(act.falsification_floor ?? act.threshold_price)!.toFixed(2)}`
                                      : '—'}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <span className="text-[10px] text-content-muted block">{t.telemetryBuyCeiling}</span>
                                  <span className="font-black text-amber-600 dark:text-amber-400">
                                    {typeof (act.target_buy_price ?? act.threshold_price) === 'number'
                                      ? `$${(act.target_buy_price ?? act.threshold_price)!.toFixed(2)}`
                                      : '—'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-content-muted block">{t.telemetryBattingTrend}</span>
                                  <span className="font-bold text-content-primary truncate block">
                                    {formatLocalizedBattingZone(act.batting_zone, language)}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Direction & Opportunity Guidance */}
                          <div>
                            <h4 className="font-bold text-xs text-content-primary leading-snug mb-1">
                              {act.headline}
                            </h4>
                            <p className="text-[11px] text-content-secondary leading-relaxed">
                              {act.tactical_instruction}
                            </p>
                          </div>
                        </div>

                        {/* Footer: Source & 1-Click Deep Dive */}
                        <div className="pt-2 border-t border-border-subtle flex items-center justify-between gap-2">
                          <a
                            href={actSourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-content-muted hover:text-indigo-600 dark:hover:text-indigo-400 truncate transition-colors"
                          >
                            <span className="truncate">{actSourceName}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                          <button
                            type="button"
                            onClick={() => onSelectTicker(act.symbol)}
                            className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-brand/10 border border-border-subtle hover:border-brand/40 text-[10px] font-bold text-content-primary hover:text-brand inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                          >
                            <span>{t.deepDiveBtn}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TIER 1B: 2-Column 5-Business-Day Portfolio Opportunities & Falsification Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              {/* Opportunities & Catalysts (5 Business Days, Portfolio-Tied) */}
              <div
                data-testid="briefing-opportunities-box"
                className="flex flex-col gap-3 p-4 rounded-xl bg-surface-subtle border border-border-subtle"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-black text-content-primary">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>{t.opportunitiesTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {t.fiveBizDayBadge}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {data.briefing.opportunities.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {data.briefing.opportunities.length === 0 ? (
                    <span className="text-xs text-content-muted italic py-4 text-center">{t.noOpportunities5d}</span>
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
                            <span className="truncate">{t.sourceLabel} {oppSourceName}</span>
                            <span className="inline-flex items-center gap-0.5 shrink-0 underline decoration-dotted underline-offset-2">
                              <span>{t.readSource}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Risks & Falsification Watchouts (5 Business Days, Portfolio-Tied) */}
              <div
                data-testid="briefing-risks-box"
                className="flex flex-col gap-3 p-4 rounded-xl bg-surface-subtle border border-border-subtle"
              >
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-border-subtle flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-black text-content-primary">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>{t.risksTitle}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                      {t.fiveBizDayBadge}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                      {data.briefing.risks.length}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1">
                  {data.briefing.risks.length === 0 ? (
                    <span className="text-xs text-content-muted italic py-4 text-center">{t.noRisks5d}</span>
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
                              {formatLocalizedUrgency(risk.urgency, language)}
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
                            <span className="truncate">{t.sourceLabel} {riskSourceName}</span>
                            <span className="inline-flex items-center gap-0.5 shrink-0 underline decoration-dotted underline-offset-2">
                              <span>{t.readSource}</span>
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
          </div>

          {/* TIER 2: Full-Width Credible News & Expanded US/CA Key Investor Workspace (Duplicate Pulse Sidebar Consolidated Above) */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-4">
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
                      <div className="flex items-center justify-between gap-2 text-xs font-black text-indigo-500 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{t.keyInvestorStreamTitle} ({filteredInvestors.length})</span>
                        </div>
                        <span className="text-[10px] font-bold text-content-muted normal-case">
                          {t.usCaDesksBadge}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
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
                              {formatLocalizedStance(post.stance, language)}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-xs md:text-sm text-content-primary leading-snug">
                            {post.title}
                          </h4>

                          <p className="text-xs text-content-secondary leading-relaxed">
                            "{post.commentary}"
                          </p>

                          <div className="p-2.5 rounded-lg bg-surface border border-border-subtle text-[11px] text-content-primary">
                            <span className="font-bold text-indigo-500">{t.keyTakeawayLabel}</span>
                            <span>{post.key_takeaway}</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-content-muted text-[10px] font-bold">{t.relatedLabel}</span>
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
                              <span>{t.officialDisclosure}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}

                  {/* Stock News Stream Section */}
                  {filteredNews.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2">
                      <div className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-wider">
                        <Newspaper className="w-3.5 h-3.5" />
                        <span>{t.corporateNewsStreamTitle} ({filteredNews.length})</span>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
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
                                {formatLocalizedBucket(news.bucket, language)}
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
                              {formatLocalizedSentiment(news.sentiment, language)}
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
                            <span className="font-bold text-amber-600 dark:text-amber-400">{t.whyItMattersLabel}</span>
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
                              <span>{t.readSource}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                      </div>
                    </div>
                  )}

                  {filteredNews.length === 0 && filteredInvestors.length === 0 && (
                    <div className="p-8 text-center text-xs text-content-muted italic">
                      {t.noFilterMatches}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pinned Interactive Signal Tags Reference Guide Modal Dialog */}
          {isSignalGuidePinned && (
            <div
              className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setIsSignalGuidePinned(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Key Action Signal Tags Guide"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-7 text-left opacity-100"
              >
                <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm md:text-base font-black text-slate-900 dark:text-slate-100">
                        {t.signalTagsGuideBtn}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.signalTagsGuideSub}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSignalGuidePinned(false)}
                    aria-label="Close Signal Tags Guide Modal"
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['HOLD_CORE', 'WATCH_PULLBACK', 'DEFEND_FLOOR', 'SCALE_IN_READY', 'TRIM_EXTENDED'] as ActionSignalTag[]).map((tagKey) => {
                    const sigLoc = getLocalizedSignalText(tagKey, language);
                    return (
                      <div
                        key={tagKey}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${sigLoc.badgeClass}`}>
                            {sigLoc.label}
                          </span>
                          <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate">
                            {sigLoc.shortTitle}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {sigLoc.explanation}
                        </p>
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                          {sigLoc.ruleFormula}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
