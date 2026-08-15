import React from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Compass, TrendingUp, AlertTriangle, Cpu } from 'lucide-react';

interface MacroScannerBarProps {
  macroData: any;
  isPlainTalk?: boolean;
}

export const MacroScannerBar: React.FC<MacroScannerBarProps> = ({ macroData, isPlainTalk = false }) => {
  const { t } = useLanguage();
  if (!macroData) return null;

  const cycle = macroData.cycle_stage || "Overheat / Late Expansion";
  const fed = macroData.fed_sentiment || {};
  const overweights = macroData.recommended_overweights || [];
  const underweights = macroData.recommended_underweights || [];

  return (
    <div className={`w-full bg-white dark:bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-sm dark:shadow-xl mb-6 transition-all ${
      isPlainTalk 
        ? 'border-amber-400 dark:border-amber-500/40 ring-1 ring-amber-400/20 dark:ring-amber-500/20' 
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4 mb-4">
        
        {/* Economic Cycle Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <BilingualHoverCard termKey="MacroCycle" isPlainTalk={isPlainTalk}>
                {t.macroTitle}
              </BilingualHoverCard>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-500/30">
                {t.liveMacroStream}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              {t.cycleStage}: <span className="text-emerald-600 dark:text-emerald-400">{cycle}</span>
            </h2>
          </div>
        </div>

        {/* Central Bank Sentiment Badge */}
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs">
          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <div className="text-slate-500 dark:text-slate-400">
              <BilingualHoverCard termKey="FedSentiment" isPlainTalk={isPlainTalk}>
                {t.fedSentiment}
              </BilingualHoverCard>:
            </div>
            <div className="font-semibold text-indigo-700 dark:text-indigo-300">{fed.tone || "Hawkish"}</div>
          </div>
        </div>
      </div>

      {/* Summary Explanation */}
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 leading-relaxed">
        💡 <span className="font-semibold text-amber-600 dark:text-amber-300">{t.macroInsight}</span> {macroData.plain_explanation}
      </p>

      {/* Sector Rotation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Overweight */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>{t.overweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overweights.map((sector: string, idx: number) => (
              <span key={idx} className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/40 px-2.5 py-1 rounded-lg font-medium">
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Underweight */}
        <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.underweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {underweights.map((sector: string, idx: number) => (
              <span key={idx} className="text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700/40 px-2.5 py-1 rounded-lg font-medium">
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
