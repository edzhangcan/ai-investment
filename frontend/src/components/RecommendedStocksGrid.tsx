import React, { useState } from 'react';
import { StockRecommendation, CategorizedRecommendationsPayload } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ArrowRight, Award, Coins, Compass, Star, ChevronRight, RefreshCw } from 'lucide-react';

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
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'SECTOR' | 'OVERALL' | 'GOLD'>('SECTOR');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshOffset, setRefreshOffset] = useState(0);

  // Extract categorization pools with fallbacks
  let sectorStocks: StockRecommendation[] = [];
  let overallStocks: StockRecommendation[] = [];
  let goldNuggetStocks: StockRecommendation[] = [];

  if (Array.isArray(recommendations)) {
    overallStocks = recommendations;
    sectorStocks = recommendations.slice(0, 8);
    goldNuggetStocks = recommendations.slice(0, 8);
  } else if (recommendations) {
    sectorStocks = recommendations.sector_overweight_stocks || [];
    overallStocks = recommendations.overall_recommended_stocks || recommendations.recommended_stocks || [];
    goldNuggetStocks = recommendations.gold_nugget_stocks || [];
  }

  const currentDisplayPool =
    activeCategory === 'SECTOR'
      ? sectorStocks.length > 0 ? sectorStocks : overallStocks
      : activeCategory === 'GOLD'
      ? goldNuggetStocks.length > 0 ? goldNuggetStocks : overallStocks
      : overallStocks;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const nextOffset = refreshOffset + 1;
    setRefreshOffset(nextOffset);
    try {
      if (onRefreshRecommendations) {
        await onRefreshRecommendations(activeCategory, nextOffset);
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-xl text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              {t.recsTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {t.recsSubtitle}
          </p>
        </div>

        {/* Multi-Category Selector Buttons */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs w-full md:w-auto flex-wrap gap-1">
          <button
            onClick={() => setActiveCategory('SECTOR')}
            className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'SECTOR'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-950" />
            <span>{t.catSectorChampions} ({sectorStocks.length || 40})</span>
          </button>

          <button
            onClick={() => setActiveCategory('OVERALL')}
            className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'OVERALL'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.catMarketLeaders} ({overallStocks.length || 40})</span>
          </button>

          <button
            onClick={() => setActiveCategory('GOLD')}
            className={`flex-1 md:flex-none px-3.5 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'GOLD'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-950" />
            <span>{t.catGoldNuggets} ({goldNuggetStocks.length || 40})</span>
          </button>
        </div>
      </div>

      {/* Category Description Banner */}
      <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {activeCategory === 'SECTOR' && (
            <>
              <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">{t.catSectorChampions}</span>
              <span>{t.catSectorDesc}</span>
            </>
          )}
          {activeCategory === 'OVERALL' && (
            <>
              <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded-lg font-bold">{t.catMarketLeaders}</span>
              <span>{t.catLeaderDesc}</span>
            </>
          )}
          {activeCategory === 'GOLD' && (
            <>
              <span className="p-1 bg-amber-500/20 text-amber-300 rounded-lg font-bold">{t.catGoldNuggets}</span>
              <span>{t.catGoldDesc}</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400 hidden sm:inline">{t.showingStocks}: {currentDisplayPool.length}</span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            title={t.refreshRecommendations}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isRefreshing ? t.refreshingPicks : t.refreshRecommendations}</span>
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
              className={`bg-slate-900/90 border rounded-2xl p-4 backdrop-blur-xl shadow-lg hover:border-emerald-500/50 hover:scale-[1.01] transition-all flex flex-col justify-between group/card cursor-pointer ${
                activeCategory === 'GOLD' ? 'border-amber-500/30 ring-1 ring-amber-500/10' : isPlainTalk ? 'border-amber-500/30' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header Row: Symbol, Flag, Market & Star Watchlist Toggle */}
                <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{flag}</span>
                    <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-xs font-mono font-bold border border-slate-700">
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
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-amber-500/40 hover:text-amber-300'
                    }`}
                    title={isStarred ? "Starred" : "Add Star"}
                  >
                    <Star className={`w-3 h-3 ${isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                    <span>{isStarred ? t.starred : t.addStar}</span>
                  </button>
                </div>

                {/* Company Name & Score Row */}
                <div className="mb-3">
                  <h3 className="text-sm font-extrabold text-slate-100 group-hover/card:text-emerald-400 transition-colors line-clamp-1 mb-1">
                    {rec.company_name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-extrabold text-slate-100">
                      ${rec.current_price} <span className="text-[10px] font-normal text-slate-400">{rec.currency}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded text-[11px] font-mono font-bold">
                      {Math.round(rec.total_recommendation_score * 100)}/100
                    </span>
                  </div>
                </div>

                {/* Compact Metrics Grid */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] mb-3">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block truncate">
                      <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                        {t.freeCashFlow}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-emerald-400">
                      {rec.key_metrics.free_cash_flow || (rec.key_metrics.free_cash_flow_b ? `$${rec.key_metrics.free_cash_flow_b}B` : 'N/A')}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block truncate">
                      <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
                        {t.peRatio}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-indigo-300">{rec.key_metrics.pe_ratio}x</span>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block truncate">
                      <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                        {t.moatRating}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-slate-200 truncate block">{rec.key_metrics.moat_rating}</span>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block truncate">
                      <BilingualHoverCard termKey="IdealBuyZone" isPlainTalk={isPlainTalk}>
                        {t.buyZone}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-amber-300 truncate block">{rec.key_metrics.ideal_buy_range}</span>
                  </div>
                </div>
              </div>

              {/* Drill-down Footer Link */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-400 group-hover/card:text-emerald-400 transition-colors">
                  {t.drillDownAnalysis}
                </span>
                <span className="p-1 bg-slate-800 text-slate-300 group-hover/card:bg-emerald-500 group-hover/card:text-slate-950 rounded-lg transition-all">
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
