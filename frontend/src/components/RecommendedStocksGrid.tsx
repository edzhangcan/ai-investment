import React, { useState } from 'react';
import { StockRecommendation, CategorizedRecommendationsPayload } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, Layers, Award, Coins, Compass, Star } from 'lucide-react';

interface RecommendedStocksGridProps {
  recommendations: CategorizedRecommendationsPayload | StockRecommendation[];
  onSelectStock: (symbol: string) => void;
  isPlainTalk: boolean;
  watchlistSymbols?: Set<string>;
  onToggleWatchlist?: (symbol: string, companyName: string, targetPrice?: number) => void;
}

export const RecommendedStocksGrid: React.FC<RecommendedStocksGridProps> = ({
  recommendations,
  onSelectStock,
  isPlainTalk,
  watchlistSymbols = new Set(),
  onToggleWatchlist,
}) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'SECTOR' | 'OVERALL' | 'GOLD'>('SECTOR');

  // Extract categorization pools with fallbacks
  let sectorStocks: StockRecommendation[] = [];
  let overallStocks: StockRecommendation[] = [];
  let goldNuggetStocks: StockRecommendation[] = [];

  if (Array.isArray(recommendations)) {
    overallStocks = recommendations;
    sectorStocks = recommendations.slice(0, 4);
    goldNuggetStocks = recommendations.slice(0, 4);
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
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs w-full md:w-auto flex-wrap">
          <button
            onClick={() => setActiveCategory('SECTOR')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'SECTOR'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-950" />
            <span>{t.catSectorChampions} ({sectorStocks.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveCategory('OVERALL')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'OVERALL'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{t.catMarketLeaders} ({overallStocks.length || 4})</span>
          </button>

          <button
            onClick={() => setActiveCategory('GOLD')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'GOLD'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-950" />
            <span>{t.catGoldNuggets} ({goldNuggetStocks.length || 4})</span>
          </button>
        </div>
      </div>

      {/* Category Description Banner */}
      <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
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
        <span className="text-[11px] text-slate-400 hidden sm:inline">{t.showingStocks}: {currentDisplayPool.length}</span>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentDisplayPool.map((rec) => {
          const isCa = rec.symbol.endsWith('.TO');
          const flag = isCa ? '🇨🇦' : '🇺🇸';
          const isStarred = watchlistSymbols.has(rec.symbol.toUpperCase());

          return (
            <div
              key={rec.symbol}
              className={`bg-slate-900/90 border rounded-3xl p-6 backdrop-blur-xl shadow-xl hover:border-emerald-500/50 transition-all flex flex-col justify-between group/card ${
                activeCategory === 'GOLD' ? 'border-amber-500/40 ring-1 ring-amber-500/20' : isPlainTalk ? 'border-amber-500/30' : 'border-slate-800'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{flag}</span>
                      <h3 className="text-xl font-bold text-slate-100 group-hover/card:text-emerald-400 transition-colors">
                        {rec.company_name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-xs font-bold border border-slate-700">
                        {rec.symbol} ({rec.market})
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[11px] font-semibold border border-emerald-500/30">
                        {rec.macro_alignment_tag}
                      </span>
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
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
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
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-extrabold text-slate-100">
                      ${rec.current_price} <span className="text-xs font-normal text-slate-400">{rec.currency}</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                      {t.score}: {Math.round(rec.total_recommendation_score * 100)}/100
                    </div>
                  </div>
                </div>

                {/* Company Business Background */}
                <div className="mb-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.companyBackground}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {rec.company_background}
                  </p>
                </div>

                {/* Why Invest Now Rationale */}
                <div className={`mb-4 border p-3.5 rounded-2xl ${
                  activeCategory === 'GOLD'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                }`}>
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>{t.whyInvestNow}</span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    {rec.why_recommend_rationale}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-4">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">
                      <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                        {t.freeCashFlow}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-emerald-400">${rec.key_metrics.free_cash_flow_b}B</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">
                      <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
                        {t.peRatio}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-indigo-300">{rec.key_metrics.pe_ratio}x</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">
                      <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                        {t.moatRating}
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-slate-200">{rec.key_metrics.moat_rating}</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">{t.buyZone}</span>
                    <span className="font-bold text-amber-300 truncate block">{rec.key_metrics.ideal_buy_range}</span>
                  </div>
                </div>

                {/* Core Catalysts list */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    {t.growthCatalysts}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.key_catalysts.map((cat, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-slate-800/80 text-slate-300 rounded-lg text-[11px]">
                        • {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.supportLevel}: 200D SMA (${rec.key_metrics.two_hundred_day_sma} {rec.currency})</span>
                </span>

                <button
                  onClick={() => onSelectStock(rec.symbol)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>{t.drillDownAnalysis}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
