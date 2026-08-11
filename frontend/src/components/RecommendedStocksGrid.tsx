import React, { useState } from 'react';
import { StockRecommendation, CategorizedRecommendationsPayload } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { Sparkles, ArrowRight, TrendingUp, AlertTriangle, Layers, Award, Coins, Compass } from 'lucide-react';

interface RecommendedStocksGridProps {
  recommendations: CategorizedRecommendationsPayload | StockRecommendation[];
  onSelectStock: (symbol: string) => void;
  isPlainTalk: boolean;
}

export const RecommendedStocksGrid: React.FC<RecommendedStocksGridProps> = ({
  recommendations,
  onSelectStock,
  isPlainTalk
}) => {
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
              Top Macro-Driven Stock Recommendations (多维度股票推荐阵列)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Strictly categorized by Macro Overweight Sectors, Blue-Chip Leaders, and Hidden Gold Nuggets
          </p>
        </div>

        {/* Multi-Category Selector Buttons */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs w-full md:w-auto">
          <button
            onClick={() => setActiveCategory('SECTOR')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeCategory === 'SECTOR'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-950" />
            <span>🟢 超配板块精选 ({sectorStocks.length || 4})</span>
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
            <span>🔵 市场核心龙头 ({overallStocks.length || 4})</span>
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
            <span>🪙 隐形金矿股 ({goldNuggetStocks.length || 4})</span>
          </button>
        </div>
      </div>

      {/* Category Description Banner */}
      <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activeCategory === 'SECTOR' && (
            <>
              <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold">🟢 超配板块精选</span>
              <span>与当前宏观环境 Overweight 板块 100% 契合的强现金流领头羊。</span>
            </>
          )}
          {activeCategory === 'OVERALL' && (
            <>
              <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded-lg font-bold">🔵 核心龙头</span>
              <span>美股与加股大盘蓝筹核心标的，兼具宽护城河与真金白银现金流。</span>
            </>
          )}
          {activeCategory === 'GOLD' && (
            <>
              <span className="p-1 bg-amber-500/20 text-amber-300 rounded-lg font-bold">🪙 隐形金矿股</span>
              <span>非散户热搜的中小盘利基龙头，具高 FCF 转换率与强增长潜力。</span>
            </>
          )}
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">显示: {currentDisplayPool.length} 标的</span>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentDisplayPool.map((rec) => {
          const isCa = rec.symbol.endsWith('.TO');
          const flag = isCa ? '🇨🇦' : '🇺🇸';

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
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-xs font-bold border border-slate-700">
                        {rec.symbol} ({rec.market})
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[11px] font-semibold border border-emerald-500/30">
                        {rec.macro_alignment_tag}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xl font-extrabold text-slate-100">
                      ${rec.current_price} <span className="text-xs font-normal text-slate-400">{rec.currency}</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 mt-0.5">
                      Score: {Math.round(rec.total_recommendation_score * 100)}/100
                    </div>
                  </div>
                </div>

                {/* Company Business Background */}
                <div className="mb-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Company Core Business Background</span>
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
                    <span>Why Recommend Now (为什么现在推荐投资)</span>
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
                        Free Cash Flow
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-emerald-400">${rec.key_metrics.free_cash_flow_b}B</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">
                      <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
                        P/E Ratio
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-indigo-300">{rec.key_metrics.pe_ratio}x</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">
                      <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                        Moat Rating
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-slate-200">{rec.key_metrics.moat_rating}</span>
                  </div>

                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Buy Zone</span>
                    <span className="font-bold text-amber-300 truncate block">{rec.key_metrics.ideal_buy_range}</span>
                  </div>
                </div>

                {/* Core Catalysts list */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Growth Catalysts & Revenue Drivers
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
                  <span>Support: 200D SMA (${rec.key_metrics.two_hundred_day_sma} {rec.currency})</span>
                </span>

                <button
                  onClick={() => onSelectStock(rec.symbol)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <span>Drill Down Full Analysis</span>
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
