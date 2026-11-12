import React, { useState, useEffect, useMemo } from 'react';
import { StockRecommendation, CategorizedRecommendationsPayload } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Award, Coins, Compass, Star, ChevronLeft, ChevronRight, RefreshCw, ArrowLeft, Filter } from 'lucide-react';

// Helper to cleanly format action statuses and batting zone tags without any dashes or underscores in English
export const formatStatusTag = (status?: string, lang: string = 'en'): string => {
  if (!status) return '';
  if (lang === 'zh') {
    if (status === 'IN_BUY_ZONE') return '买入区间';
    if (status === 'LEFT_SIDE_WATCH') return '左侧观察';
    if (status === 'PULLBACK_WATCH') return '回调观察';
    if (status === 'GROWTH_PREMIUM') return '成长溢价';
    if (status === 'OVEREXTENDED') return '估值偏高';
    if (status === 'RIGHT_SIDE') return '右侧击球区';
    if (status === 'LEFT_SIDE') return '左侧观察';
    if (status === 'TREND_CONTINUATION') return '趋势延续';
    if (status === 'SUPPORT_BOUNCE') return '均线支撑反弹';
    if (status === 'BOTTOM_REVERSAL') return '底部反转突破';
  }
  // English: strictly remove all dashes and underscores
  return status.replace(/[-_]/g, ' ').trim();
};

interface RecommendedStocksGridProps {
  recommendations: CategorizedRecommendationsPayload | StockRecommendation[];
  onSelectStock: (symbol: string) => void;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (symbol: string, companyName: string, targetPrice?: number) => void;
  onRefreshRecommendations?: (category: 'SECTOR' | 'OVERALL' | 'GOLD', offset: number) => Promise<void> | void;
  cycleStage?: string;
  onBackToMacro?: () => void;
  selectedCountry?: 'US' | 'CA';
  onSelectCountry?: (country: 'US' | 'CA') => void;
}

export const RecommendedStocksGrid: React.FC<RecommendedStocksGridProps> = ({
  recommendations,
  onSelectStock,
  watchlistSymbols = new Set(),
  onToggleWatchlist,
  onRefreshRecommendations,
  cycleStage,
  onBackToMacro,
  selectedCountry,
  onSelectCountry,
}) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'SECTOR' | 'OVERALL' | 'GOLD'>('SECTOR');
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const activeCountry: 'US' | 'CA' = selectedCountry || (
    recommendations && !Array.isArray(recommendations) && recommendations.country === 'CA' ? 'CA' : 'US'
  );

  // Extract categorization pools with fallbacks
  let sectorStocks: StockRecommendation[] = [];
  let overallStocks: StockRecommendation[] = [];
  let goldNuggetStocks: StockRecommendation[] = [];

  if (Array.isArray(recommendations)) {
    overallStocks = recommendations;
    sectorStocks = recommendations.slice(0, 32);
    goldNuggetStocks = recommendations.slice(0, 32);
  } else if (recommendations) {
    sectorStocks = recommendations.sector_overweight_stocks || [];
    overallStocks = recommendations.overall_recommended_stocks || recommendations.recommended_stocks || [];
    goldNuggetStocks = recommendations.gold_nugget_stocks || [];
  }

  const getActivePool = () => {
    if (activeCategory === 'SECTOR') return sectorStocks.length > 0 ? sectorStocks : overallStocks;
    if (activeCategory === 'GOLD') return goldNuggetStocks.length > 0 ? goldNuggetStocks : overallStocks;
    return overallStocks;
  };

  const activePool = getActivePool();

  // Batting zone & action status counts for active pool
  const zoneCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: activePool.length,
      IN_BUY_ZONE: 0,
      LEFT_SIDE_WATCH: 0,
      PULLBACK_WATCH: 0,
      GROWTH_PREMIUM: 0,
      OVEREXTENDED: 0,
      RIGHT_SIDE: 0,
      LEFT_SIDE: 0,
    };
    activePool.forEach((r) => {
      if (r.batting_zone === 'RIGHT_SIDE') counts.RIGHT_SIDE += 1;
      if (r.batting_zone === 'LEFT_SIDE') counts.LEFT_SIDE += 1;
      const status = r.action_status;
      if (status) {
        counts[status] = (counts[status] || 0) + 1;
      }
    });
    return counts;
  }, [activePool]);

  // Standard filter options list (order: ALL, specific action statuses, then high-level zones)
  const filterOptions = useMemo(() => {
    const list: { key: string; label: string; count: number }[] = [
      {
        key: 'ALL',
        label: language === 'zh' ? '全部' : 'All',
        count: zoneCounts.ALL,
      },
      {
        key: 'IN_BUY_ZONE',
        label: language === 'zh' ? '买入区间' : 'IN BUY ZONE',
        count: zoneCounts.IN_BUY_ZONE || 0,
      },
      {
        key: 'LEFT_SIDE_WATCH',
        label: language === 'zh' ? '左侧观察' : 'LEFT SIDE WATCH',
        count: zoneCounts.LEFT_SIDE_WATCH || 0,
      },
      {
        key: 'PULLBACK_WATCH',
        label: language === 'zh' ? '回调观察' : 'PULLBACK WATCH',
        count: zoneCounts.PULLBACK_WATCH || 0,
      },
      {
        key: 'GROWTH_PREMIUM',
        label: language === 'zh' ? '成长溢价' : 'GROWTH PREMIUM',
        count: zoneCounts.GROWTH_PREMIUM || 0,
      },
      {
        key: 'OVEREXTENDED',
        label: language === 'zh' ? '估值偏高' : 'OVEREXTENDED',
        count: zoneCounts.OVEREXTENDED || 0,
      },
      {
        key: 'RIGHT_SIDE',
        label: language === 'zh' ? '🎯 右侧击球区' : '🎯 Right Side',
        count: zoneCounts.RIGHT_SIDE || 0,
      },
      {
        key: 'LEFT_SIDE',
        label: language === 'zh' ? '👀 左侧区域' : '👀 Left Side',
        count: zoneCounts.LEFT_SIDE || 0,
      },
    ];

    return list.filter((opt) => opt.key === 'ALL' || opt.count > 0);
  }, [zoneCounts, language]);

  // Reset to page 1 when switching market, category, or filter
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCountry, activeCategory, activeZoneFilter]);

  // Reset filter when switching category or country if current filter has 0 items
  useEffect(() => {
    if (activeZoneFilter !== 'ALL' && (zoneCounts[activeZoneFilter] || 0) === 0) {
      setActiveZoneFilter('ALL');
    }
  }, [activeCategory, activeCountry, zoneCounts, activeZoneFilter]);

  const filteredPool = useMemo(() => {
    if (activeZoneFilter === 'ALL') return activePool;
    if (activeZoneFilter === 'RIGHT_SIDE') {
      return activePool.filter((r) => r.batting_zone === 'RIGHT_SIDE');
    }
    if (activeZoneFilter === 'LEFT_SIDE') {
      return activePool.filter((r) => r.batting_zone === 'LEFT_SIDE');
    }
    return activePool.filter((r) => r.action_status === activeZoneFilter);
  }, [activePool, activeZoneFilter]);

  // Page size is 16 stocks (2x8 grid layout)
  const PAGE_SIZE = 16;
  const totalPages = Math.max(1, Math.ceil(filteredPool.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const currentDisplayPool = filteredPool.slice(startIndex, startIndex + PAGE_SIZE);

  // PL-723.3: Periodic real-time price & DCF polling every 60 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isRefreshing && onRefreshRecommendations) {
        onRefreshRecommendations(activeCategory, startIndex);
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [activeCategory, startIndex, isRefreshing, onRefreshRecommendations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRefreshRecommendations) {
        await onRefreshRecommendations(activeCategory, startIndex);
      }
    } catch (e) {
      console.warn("Failed to refresh recommendations:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  // Helper to format ideal buy zone without any clipping/truncation
  const formatBuyZone = (rec: StockRecommendation): string => {
    if (
      typeof rec.key_metrics?.ideal_buy_range_min === 'number' &&
      typeof rec.key_metrics?.ideal_buy_range_max === 'number'
    ) {
      return `$${rec.key_metrics.ideal_buy_range_min.toFixed(2)} - $${rec.key_metrics.ideal_buy_range_max.toFixed(2)}`;
    }
    if (rec.key_metrics?.ideal_buy_range) {
      const cleaned = rec.key_metrics.ideal_buy_range.replace(/\s*(USD|CAD)\s*/gi, '').trim();
      return cleaned.startsWith('$') ? cleaned : `$${cleaned}`;
    }
    if (typeof rec.key_metrics?.dcf_fair_value === 'number') {
      const lower = (rec.key_metrics.dcf_fair_value * 0.8).toFixed(2);
      const upper = rec.key_metrics.dcf_fair_value.toFixed(2);
      return `$${lower} - $${upper}`;
    }
    return 'N/A';
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Section Header */}
      <div className="space-y-4 border-b border-border-subtle pb-4">
        {/* Row 1: Back Navigation, Title, Subtitle, Segmented Market Switcher & Page Status */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {onBackToMacro && (
              <button
                onClick={onBackToMacro}
                className="h-8 px-3 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-sky-500 text-content-secondary hover:text-sky-600 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm group shrink-0"
                title={t.backToMacro}
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-sky-600" />
                <span>{t.backToMacro}</span>
              </button>
            )}
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="p-1.5 prism-badge-brand rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h2 className="text-xl md:text-2xl font-extrabold text-content-primary tracking-tight">
                  {t.recsTitle}
                </h2>
                {cycleStage && (
                  <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shadow-sm ml-1">
                    {cycleStage}
                  </span>
                )}
              </div>
              <p className="text-xs text-content-muted">
                {t.recsSubtitle}
              </p>
            </div>
          </div>

          {/* Right side: Segmented Market Switcher & Pool Count */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {/* Segmented Market Switcher: US Market (32 Pool) vs CA Market (16 Pool) */}
            <div 
              className="flex items-center p-1 bg-surface-subtle border border-border-subtle rounded-xl shadow-2xs"
              role="group"
              aria-label="Market Jurisdiction Selector"
            >
              <button
                type="button"
                onClick={() => {
                  if (onSelectCountry) onSelectCountry('US');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCountry === 'US'
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface'
                }`}
              >
                <span>🇺🇸</span>
                <span>{language === 'zh' ? '美股市场 (32只池)' : 'US Market (32 Pool)'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onSelectCountry) onSelectCountry('CA');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCountry === 'CA'
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface'
                }`}
              >
                <span>🇨🇦</span>
                <span>{language === 'zh' ? '加股市场 (32只池)' : 'CA Market (32 Pool)'}</span>
              </button>
            </div>

            <span className="text-xs text-content-muted font-bold bg-surface-subtle px-3 py-1.5 rounded-xl border border-border-subtle shadow-sm whitespace-nowrap">
              {totalPages > 1
                ? (language === 'zh'
                    ? `第 ${safePage} / ${totalPages} 页 (共 ${filteredPool.length} 标的)`
                    : `Page ${safePage} of ${totalPages} (${filteredPool.length} Pool)`)
                : (language === 'zh'
                    ? `全部 ${filteredPool.length} 标的 (单页全览)`
                    : `All ${filteredPool.length} Pool (Single Page)`)}
            </span>
          </div>
        </div>

        {/* Row 2: Multi-Category Selector Buttons (Placed Under Title, Occupying Full Width, Zero Wrapping) */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full bg-surface border border-border-subtle p-1.5 rounded-2xl shadow-sm"
          role="tablist"
          aria-label="Stock Recommendation Categories"
        >
          {/* 1. Sector Champions (Emerald Theme) */}
          <button
            role="tab"
            aria-selected={activeCategory === 'SECTOR'}
            aria-controls="recommended-stocks-grid-panel"
            id="tab-category-sector"
            onClick={() => setActiveCategory('SECTOR')}
            className={`w-full px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
              activeCategory === 'SECTOR'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400/40 border border-emerald-600'
                : 'bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t.catSectorChampions}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              activeCategory === 'SECTOR' ? 'bg-emerald-700/80 text-white' : 'bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200'
            }`}>
              {sectorStocks.length || 32}
            </span>
          </button>

          {/* 2. Core Market Leaders (Sky Blue Theme) */}
          <button
            role="tab"
            aria-selected={activeCategory === 'OVERALL'}
            aria-controls="recommended-stocks-grid-panel"
            id="tab-category-overall"
            onClick={() => setActiveCategory('OVERALL')}
            className={`w-full px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none ${
              activeCategory === 'OVERALL'
                ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md ring-2 ring-sky-400/40 border border-sky-600'
                : 'bg-sky-50/80 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-900/50'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t.catMarketLeaders}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              activeCategory === 'OVERALL' ? 'bg-sky-700/80 text-white' : 'bg-sky-200 dark:bg-sky-800 text-sky-900 dark:text-sky-200'
            }`}>
              {overallStocks.length || 32}
            </span>
          </button>

          {/* 3. Hidden Gold Nuggets (Warm Gold Theme) */}
          <button
            role="tab"
            aria-selected={activeCategory === 'GOLD'}
            aria-controls="recommended-stocks-grid-panel"
            id="tab-category-gold"
            onClick={() => setActiveCategory('GOLD')}
            className={`w-full px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              activeCategory === 'GOLD'
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md ring-2 ring-amber-400/40 border border-amber-500'
                : 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50'
            }`}
          >
            <Coins className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t.catGoldNuggets}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              activeCategory === 'GOLD' ? 'bg-amber-600/80 text-white' : 'bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200'
            }`}>
              {goldNuggetStocks.length || 32}
            </span>
          </button>
        </div>
      </div>

      {/* Category Strategy Description & Pagination/Refresh Bar */}
      <div className="prism-surface-subtle p-3.5 rounded-2xl text-xs text-content-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-border-subtle">
        <div className="flex items-center gap-2 flex-wrap">
          {activeCategory === 'SECTOR' && (
            <>
              <span className="prism-badge-positive">{t.catSectorChampions}</span>
              <span className="text-[11px] text-content-secondary">{t.catSectorDesc}</span>
            </>
          )}
          {activeCategory === 'OVERALL' && (
            <>
              <span className="prism-badge-brand">{t.catMarketLeaders}</span>
              <span className="text-[11px] text-content-secondary">{t.catLeaderDesc}</span>
            </>
          )}
          {activeCategory === 'GOLD' && (
            <>
              <span className="prism-badge-warning">{t.catGoldNuggets}</span>
              <span className="text-[11px] text-content-secondary">{t.catGoldDesc}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end flex-wrap">
          {/* 2-page pagination controls for US (hidden when totalPages <= 1, e.g. CA) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 mr-1" role="navigation" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="h-8 px-2.5 bg-surface border border-border-subtle hover:border-brand rounded-xl text-xs font-bold text-content-secondary hover:text-brand transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'zh' ? '上一页' : 'Prev'}</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 min-w-[32px] px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                    safePage === pageNum
                      ? 'bg-brand text-white shadow-sm ring-2 ring-brand/30'
                      : 'bg-surface border border-border-subtle text-content-secondary hover:border-brand hover:text-brand'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="h-8 px-2.5 bg-surface border border-border-subtle hover:border-brand rounded-xl text-xs font-bold text-content-secondary hover:text-brand transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">{language === 'zh' ? '下一页' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 px-3.5 bg-surface border border-border-subtle hover:border-brand rounded-xl text-xs font-bold text-brand hover:text-brand transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm focus-visible:ring-2 focus-visible:ring-brand box-border"
            title={t.refreshRecommendations}
            aria-label={t.refreshRecommendations}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>
              {isRefreshing
                ? t.refreshingPicks
                : (language === 'zh' ? '刷新推荐排序' : 'Refresh Ranking')}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Filter: Batting Zone & Action Status Selector */}
      <div 
        className="flex items-center gap-2 p-2.5 bg-surface border border-border-subtle rounded-2xl overflow-x-auto scrollbar-none shadow-2xs"
        role="group"
        aria-label="Batting Zone Quick Filters"
      >
        <div className="flex items-center gap-1.5 text-xs font-black text-content-muted px-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-brand" />
          <span>{language === 'zh' ? '击球区筛选:' : 'Filter Batting Zone:'}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto">
          {filterOptions.map((opt) => {
            const isActive = activeZoneFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setActiveZoneFilter(opt.key)}
                className={`h-7 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-brand text-white shadow-sm ring-2 ring-brand/30'
                    : 'bg-surface-subtle border border-border-subtle text-content-secondary hover:text-content-primary hover:bg-surface'
                }`}
              >
                <span>{opt.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-surface border border-border-subtle text-content-muted'
                }`}>
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Column x 8-Row (2x8) Wider Stock Cards Grid (Up to 16 Stocks) */}
      <div 
        id="recommended-stocks-grid-panel"
        role="region"
        aria-label="Stock Recommendation Grid"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {currentDisplayPool.length === 0 ? (
          <div className="prism-card p-12 text-center col-span-full border border-dashed border-border-subtle rounded-2xl">
            <Filter className="w-8 h-8 text-content-muted mx-auto mb-2 opacity-60" />
            <h4 className="text-sm font-bold text-content-primary mb-1">
              {language === 'zh' ? '当前筛选下无匹配标的' : 'No Stocks Match Selected Filter'}
            </h4>
            <p className="text-xs text-content-muted mb-4">
              {language === 'zh'
                ? `在当前板块中未找到处于「${formatStatusTag(activeZoneFilter, language)}」状态的标的。`
                : `No tickers currently in "${formatStatusTag(activeZoneFilter, language)}" status within this category.`}
            </p>
            <button
              type="button"
              onClick={() => setActiveZoneFilter('ALL')}
              className="px-3.5 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {language === 'zh' ? '重置为全部标的' : 'Reset to All Stocks'}
            </button>
          </div>
        ) : (
          currentDisplayPool.map((rec) => {
          const isCa = rec.symbol.endsWith('.TO');
          const flag = isCa ? '🇨🇦' : '🇺🇸';
          const isStarred = watchlistSymbols.has(rec.symbol.toUpperCase());
          const buyZoneText = formatBuyZone(rec);

          return (
            <div
              key={rec.symbol}
              role="button"
              tabIndex={0}
              aria-label={`Select ${rec.company_name} (${rec.symbol})`}
              onClick={() => onSelectStock(rec.symbol)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectStock(rec.symbol);
                }
              }}
              className={`prism-card p-5 sm:p-6 rounded-2xl flex flex-col justify-between group/card cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 border border-border-subtle hover:border-brand ${
                activeCategory === 'GOLD' ? 'border-amber-400/60 dark:border-amber-600/60 hover:border-amber-500' : ''
              }`}
            >
              <div>
                {/* Header Row: Symbol, Country Flag, Market, Taxonomy Badge & Star Watchlist Toggle */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-3.5 border-b border-border-subtle">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{flag}</span>
                    <span className="prism-badge-brand text-xs font-mono font-bold px-2 py-0.5">
                      {rec.symbol}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-subtle border border-border-subtle text-content-muted">
                      {rec.market || (isCa ? 'TSX' : 'US')}
                    </span>
                    {(rec.taxonomy || rec.taxonomy_badge) && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        (rec.taxonomy?.taxonomy === 'TREE' || rec.taxonomy_badge?.includes('树') || rec.taxonomy_badge?.includes('Tree'))
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                          : (rec.taxonomy?.taxonomy === 'GRAIN' || rec.taxonomy_badge?.includes('粮') || rec.taxonomy_badge?.includes('Grain'))
                          ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                          : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                      }`}>
                        {language === 'zh'
                          ? (rec.taxonomy?.badge_zh || rec.taxonomy_badge)
                          : (rec.taxonomy?.badge_en || rec.taxonomy_badge)}
                      </span>
                    )}
                    {rec.macro_alignment_tag && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand/10 text-brand border border-brand/20">
                        {rec.macro_alignment_tag}
                      </span>
                    )}

                    {/* Batting Zone Pill */}
                    {rec.batting_zone && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        rec.batting_zone === 'RIGHT_SIDE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        {rec.batting_zone === 'RIGHT_SIDE'
                          ? (language === 'zh' ? '🎯 右侧击球区' : '🎯 Right Side')
                          : (language === 'zh' ? '👀 左侧观察' : '👀 Left Side')}
                      </span>
                    )}

                    {/* Trend Temperature Badge (FREEZE / WARM / FLAT / HOT) */}
                    {rec.trend_temperature && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        rec.trend_temperature === 'HOT'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : rec.trend_temperature === 'WARM'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                          : rec.trend_temperature === 'FREEZE'
                          ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        {rec.trend_temperature === 'FREEZE' ? '❄️ FREEZE' :
                         rec.trend_temperature === 'WARM' ? '⚡ WARM' :
                         rec.trend_temperature === 'HOT' ? '🔥 HOT' : '⚖️ FLAT'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleWatchlist) {
                        const targetVal = typeof rec.key_metrics?.ideal_buy_range_max === 'number'
                          ? rec.key_metrics.ideal_buy_range_max
                          : (typeof rec.key_metrics?.dcf_fair_value === 'number' ? rec.key_metrics.dcf_fair_value : undefined);
                        onToggleWatchlist(rec.symbol, rec.company_name, targetVal);
                      }
                    }}
                    className={`h-7 px-3 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer box-border shrink-0 shadow-sm ${
                      isStarred
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/80'
                        : 'bg-surface-subtle text-content-muted border-border-subtle hover:border-warning hover:text-warning'
                    }`}
                    title={isStarred ? t.starred : t.addStar}
                  >
                    <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-warning text-warning' : 'text-content-muted'}`} />
                    <span>{isStarred ? t.starred : t.addStar}</span>
                  </button>
                </div>

                {/* Company Name, Price & Score Row */}
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-black text-content-primary group-hover/card:text-brand transition-colors line-clamp-1 tracking-tight">
                        {rec.company_name}
                      </h3>
                      {rec.action_status && (
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                            rec.action_status.includes('BUY_ZONE')
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              : rec.action_status.includes('LEFT_SIDE')
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                              : rec.action_status.includes('PULLBACK')
                              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800'
                              : 'bg-surface-subtle text-content-muted border-border-subtle'
                          }`}>
                            {formatStatusTag(rec.action_status, language)}
                          </span>
                          {rec.timing_path && rec.timing_path !== 'N/A' && (
                            <span className="text-[10px] font-semibold text-content-muted">
                              • {formatStatusTag(rec.timing_path, language)}
                            </span>
                          )}
                          {rec.pilot_tranche_size && (
                            <span className="text-[10px] font-bold text-brand bg-brand/10 px-1.5 py-0.2 rounded">
                              Pilot {rec.pilot_tranche_size}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-black text-content-primary">
                          ${rec.current_price}
                        </span>
                        <span className="text-xs font-semibold text-content-muted ml-1">
                          {rec.currency}
                        </span>
                      </div>
                      <span className="prism-badge-positive text-xs font-mono font-bold px-2.5 py-0.5 shadow-sm">
                        {Math.round(rec.total_recommendation_score * 100)}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macro Rationale Snippet */}
                {rec.why_recommend_rationale && (
                  <div className="mb-4 bg-surface-subtle/80 p-3 rounded-xl border border-border-subtle">
                    <p className="text-xs text-content-secondary line-clamp-2 leading-relaxed">
                      <span className="font-extrabold text-brand mr-1">
                        {language === 'zh' ? '【选股逻辑】' : '[Rationale]'}
                      </span>
                      {rec.why_recommend_rationale}
                    </p>
                  </div>
                )}

                {/* Key Metrics Grid - 4 Columns with Guaranteed No Cut-Off for Ideal Buy Zone */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                  {/* Metric 1: Free Cash Flow */}
                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle flex flex-col justify-between">
                    <span className="text-[10px] text-content-muted block truncate font-bold uppercase tracking-wider">
                      <BilingualHoverCard termKey="FCF">
                        {t.freeCashFlow}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-black text-positive text-xs sm:text-sm block truncate mt-1">
                      {rec.key_metrics?.free_cash_flow || (rec.key_metrics?.free_cash_flow_b ? `$${rec.key_metrics.free_cash_flow_b}B` : 'N/A')}
                    </span>
                  </div>

                  {/* Metric 2: P/E Ratio */}
                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle flex flex-col justify-between">
                    <span className="text-[10px] text-content-muted block truncate font-bold uppercase tracking-wider">
                      <BilingualHoverCard termKey="PE">
                        {t.peRatio}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-black text-brand text-xs sm:text-sm block truncate mt-1">
                      {rec.key_metrics?.pe_ratio ? `${rec.key_metrics.pe_ratio}x` : 'N/A'}
                    </span>
                  </div>

                  {/* Metric 3: Moat Rating */}
                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle flex flex-col justify-between">
                    <span className="text-[10px] text-content-muted block truncate font-bold uppercase tracking-wider">
                      <BilingualHoverCard termKey="MoatRating">
                        {t.moatRating}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-black text-content-primary text-xs sm:text-sm block truncate mt-1">
                      {rec.key_metrics?.moat_rating || 'STANDARD'}
                    </span>
                  </div>

                  {/* Metric 4: Ideal Buy Zone (Guaranteed No Cut Off, upper limit fully visible) */}
                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-warning/40 bg-warning/5 dark:bg-warning/10 flex flex-col justify-between shadow-sm">
                    <span className="text-[10px] text-warning dark:text-warning/90 font-black block truncate uppercase tracking-wider">
                      <BilingualHoverCard termKey="IdealBuyZone">
                        {t.buyZone}
                      </BilingualHoverCard>
                    </span>
                    <span 
                      className="font-black text-warning text-xs sm:text-sm block whitespace-nowrap overflow-visible mt-1 tracking-tight"
                      title={buyZoneText}
                    >
                      {buyZoneText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drill-down Footer Link */}
              <div className="pt-3.5 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-xs font-bold text-content-muted group-hover/card:text-brand transition-colors flex items-center gap-1.5">
                  <span>{t.drillDownAnalysis}</span>
                  {(rec.dcf_fair_value ?? rec.key_metrics?.dcf_fair_value) && (
                    <span className="text-content-secondary font-medium ml-1">
                      (DCF Fair: ${rec.dcf_fair_value ?? rec.key_metrics?.dcf_fair_value})
                    </span>
                  )}
                </span>
                <span className="p-1.5 prism-badge-brand rounded-xl transition-all group-hover/card:scale-110 shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Bottom Pagination Bar for US (hidden when totalPages <= 1, e.g. CA) */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border-subtle">
          <span className="text-xs text-content-muted font-medium">
            {language === 'zh'
              ? `第 ${safePage} / ${totalPages} 页 · 显示第 ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, filteredPool.length)} 支标的 (共 ${filteredPool.length} 支)`
              : `Page ${safePage} of ${totalPages} · Showing ${startIndex + 1}-${Math.min(startIndex + PAGE_SIZE, filteredPool.length)} of ${filteredPool.length} Tickers`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={safePage <= 1}
              className="h-8 px-3 bg-surface border border-border-subtle hover:border-brand rounded-xl text-xs font-bold text-content-secondary hover:text-brand transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '上一页 (1-16)' : 'Previous (1-16)'}</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={safePage >= totalPages}
              className="h-8 px-3 bg-surface border border-border-subtle hover:border-brand rounded-xl text-xs font-bold text-content-secondary hover:text-brand transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              aria-label="Next Page"
            >
              <span>{language === 'zh' ? '下一页 (17-32)' : 'Next (17-32)'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
