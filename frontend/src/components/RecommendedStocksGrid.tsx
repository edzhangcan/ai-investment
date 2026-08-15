import React, { useState } from 'react';
import { StockRecommendation, CategorizedRecommendationsPayload } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Award, Coins, Compass, Star, ChevronRight, RefreshCw } from 'lucide-react';

interface RecommendedStocksGridProps {
  recommendations: CategorizedRecommendationsPayload | StockRecommendation[];
  onSelectStock: (symbol: string) => void;
  isPlainTalk: boolean;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (symbol: string, companyName: string, targetPrice?: number) => void;
  onRefreshRecommendations?: (category: 'SECTOR' | 'OVERALL' | 'GOLD', offset: number) => Promise<void> | void;
}

export const RecommendedStocksGrid: React.FC<RecommendedStocksGridProps> = ({
  recommendations,
  onSelectStock,
  isPlainTalk,
  watchlistSymbols = new Set(),
  onToggleWatchlist,
  onRefreshRecommendations,
}) => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'SECTOR' | 'OVERALL' | 'GOLD'>('SECTOR');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sampleOffset, setSampleOffset] = useState<{ SECTOR: number; OVERALL: number; GOLD: number }>({
    SECTOR: 0,
    OVERALL: 0,
    GOLD: 0,
  });

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

  // Sample exactly 8 non-overlapping stocks from the 32-candidate pool
  const getDisplayedSample = (): StockRecommendation[] => {
    if (activePool.length <= 8) return activePool;
    const offset = sampleOffset[activeCategory];
    const startIndex = (offset * 8) % activePool.length;
    let sample = activePool.slice(startIndex, startIndex + 8);
    if (sample.length < 8) {
      sample = [...sample, ...activePool.slice(0, 8 - sample.length)];
    }
    return sample;
  };

  const currentDisplayPool = getDisplayedSample();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setSampleOffset(prev => ({
      ...prev,
      [activeCategory]: prev[activeCategory] + 1
    }));
    try {
      if (onRefreshRecommendations) {
        await onRefreshRecommendations(activeCategory, sampleOffset[activeCategory] + 1);
      }
    } catch (e) {
      console.warn("Failed to refresh recommendations:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 prism-badge-brand rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-content-primary">
              {t.recsTitle}
            </h2>
          </div>
          <p className="text-xs text-content-muted">
            {t.recsSubtitle}
          </p>
        </div>

        {/* Multi-Category Selector Buttons */}
        <div className="flex bg-surface border border-border-subtle p-1.5 rounded-2xl text-xs w-full md:w-auto flex-wrap gap-1.5 shadow-sm">
          <button
            onClick={() => setActiveCategory('SECTOR')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'SECTOR'
                ? 'bg-brand text-white shadow-md ring-2 ring-brand/30 border border-brand'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface border border-border-subtle'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{t.catSectorChampions}</span>
          </button>

          <button
            onClick={() => setActiveCategory('OVERALL')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'OVERALL'
                ? 'bg-brand text-white shadow-md ring-2 ring-brand/30 border border-brand'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface border border-border-subtle'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.catMarketLeaders}</span>
          </button>

          <button
            onClick={() => setActiveCategory('GOLD')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'GOLD'
                ? 'bg-warning text-white shadow-md ring-2 ring-warning/30 border border-warning'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface border border-border-subtle'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{t.catGoldNuggets}</span>
          </button>
        </div>
      </div>

      {/* Category Description Banner */}
      <div className="prism-surface-subtle p-3.5 text-xs text-content-secondary flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {activeCategory === 'SECTOR' && (
            <>
              <span className="prism-badge-positive">{t.catSectorChampions}</span>
              <span>{t.catSectorDesc}</span>
            </>
          )}
          {activeCategory === 'OVERALL' && (
            <>
              <span className="prism-badge-brand">{t.catMarketLeaders}</span>
              <span>{t.catLeaderDesc}</span>
            </>
          )}
          {activeCategory === 'GOLD' && (
            <>
              <span className="prism-badge-warning">{t.catGoldNuggets}</span>
              <span>{t.catGoldDesc}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-surface border border-border-subtle hover:border-brand rounded-xl text-xs font-bold text-brand hover:text-brand transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title={t.refreshRecommendations}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t.refreshingPicks : (language === 'zh' ? '换一批精选' : t.refreshRecommendations)}</span>
          </button>
        </div>
      </div>

      {/* Compact 4-Column Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentDisplayPool.map((rec) => {
          const isCa = rec.symbol.endsWith('.TO');
          const flag = isCa ? '🇨🇦' : '🇺🇸';
          const isStarred = watchlistSymbols.has(rec.symbol.toUpperCase());

          return (
            <div
              key={rec.symbol}
              onClick={() => onSelectStock(rec.symbol)}
              className={`prism-card p-4 hover:border-brand transition-all flex flex-col justify-between group/card cursor-pointer ${
                activeCategory === 'GOLD' 
                  ? 'border-warning' 
                  : isPlainTalk 
                    ? 'border-warning' 
                    : ''
              }`}
            >
              <div>
                {/* Header Row: Symbol, Flag, Market & Star Watchlist Toggle */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{flag}</span>
                    <span className="prism-badge-brand text-xs font-mono">
                      {rec.symbol}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleWatchlist) {
                        onToggleWatchlist(
                          rec.symbol,
                          rec.company_name,
                          typeof rec.key_metrics.dcf_fair_value === 'number' ? rec.key_metrics.dcf_fair_value : undefined
                        );
                      }
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                      isStarred
                        ? 'prism-badge-warning'
                        : 'bg-surface-subtle text-content-muted border-border-subtle hover:border-warning hover:text-warning'
                    }`}
                    title={isStarred ? "Starred" : "Add Star"}
                  >
                    <Star className={`w-3 h-3 ${isStarred ? 'fill-warning text-warning' : 'text-content-muted'}`} />
                    <span>{isStarred ? t.starred : t.addStar}</span>
                  </button>
                </div>

                {/* Company Name & Score Row */}
                <div className="mb-3">
                  <h3 className="text-sm font-extrabold text-content-primary group-hover/card:text-brand transition-colors line-clamp-1 mb-1">
                    {rec.company_name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-extrabold text-content-primary">
                      ${rec.current_price} <span className="text-[10px] font-normal text-content-muted">{rec.currency}</span>
                    </div>
                    <span className="prism-badge-positive text-[11px] font-mono">
                      {Math.round(rec.total_recommendation_score * 100)}/100
                    </span>
                  </div>
                </div>

                {/* Compact Metrics Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
                  <div className="prism-surface-subtle p-2">
                    <span className="text-[10px] text-content-muted block truncate">
                      <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                        {t.freeCashFlow}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-positive">
                      {rec.key_metrics.free_cash_flow || (rec.key_metrics.free_cash_flow_b ? `$${rec.key_metrics.free_cash_flow_b}B` : 'N/A')}
                    </span>
                  </div>

                  <div className="prism-surface-subtle p-2">
                    <span className="text-[10px] text-content-muted block truncate">
                      <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
                        {t.peRatio}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-brand">{rec.key_metrics.pe_ratio}x</span>
                  </div>

                  <div className="prism-surface-subtle p-2">
                    <span className="text-[10px] text-content-muted block truncate">
                      <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                        {t.moatRating}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-content-primary truncate block">{rec.key_metrics.moat_rating}</span>
                  </div>

                  <div className="prism-surface-subtle p-2">
                    <span className="text-[10px] text-content-muted block truncate">
                      <BilingualHoverCard termKey="IdealBuyZone" isPlainTalk={isPlainTalk}>
                        {t.buyZone}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-warning truncate block">{rec.key_metrics.ideal_buy_range}</span>
                  </div>
                </div>
              </div>

              {/* Drill-down Footer Link */}
              <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-content-muted group-hover/card:text-brand transition-colors">
                  {t.drillDownAnalysis}
                </span>
                <span className="p-1 prism-badge-brand rounded-lg transition-all">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
