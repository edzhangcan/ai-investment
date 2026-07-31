import React from 'react';
import { JargonTooltip } from './JargonTooltip';
import { Compass, TrendingUp, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface MacroScannerBarProps {
  macroData: any;
}

export const MacroScannerBar: React.FC<MacroScannerBarProps> = ({ macroData }) => {
  if (!macroData) return null;

  const cycle = macroData.cycle_stage || "Overheat / Late Expansion";
  const fed = macroData.fed_sentiment || {};
  const overweights = macroData.recommended_overweights || [];
  const underweights = macroData.recommended_underweights || [];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
        
        {/* Economic Cycle Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium flex items-center gap-2">
              <span>宏观经济周期扫描仪 (US & CA)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                实时更新
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 mt-0.5">
              当前阶段：<span className="text-emerald-400">{cycle}</span>
            </h2>
          </div>
        </div>

        {/* Central Bank Sentiment Badge */}
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 text-xs">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <div>
            <div className="text-slate-400">美联储 (Fed) 央行情绪解码:</div>
            <div className="font-semibold text-indigo-300">{fed.tone || "Hawkish (偏鹰派)"}</div>
          </div>
        </div>
      </div>

      {/* Plain Language Summary */}
      <p className="text-sm text-slate-300 mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
        💡 <span className="font-semibold text-amber-300">白话解说：</span> {macroData.plain_explanation}
      </p>

      {/* Sector Rotation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Overweight */}
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>资金流向与建议超配板块 (Recommended Overweight)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overweights.map((sector: string, idx: number) => (
              <span key={idx} className="text-xs bg-emerald-900/40 text-emerald-200 border border-emerald-700/40 px-2.5 py-1 rounded-lg">
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Underweight */}
        <div className="bg-rose-950/20 border border-rose-800/30 rounded-xl p-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>避坑/建议低配板块 (Recommended Underweight)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {underweights.map((sector: string, idx: number) => (
              <span key={idx} className="text-xs bg-rose-900/40 text-rose-200 border border-rose-700/40 px-2.5 py-1 rounded-lg">
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
