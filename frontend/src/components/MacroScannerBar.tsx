import React from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Compass, TrendingUp, AlertTriangle, Cpu, Info } from 'lucide-react';

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
    <div className={`prism-card p-5 mb-6 transition-all ${
      isPlainTalk ? 'border-warning' : ''
    }`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border-subtle pb-4 mb-4">
        
        {/* Economic Cycle Badge */}
        <div className="flex items-center gap-3">
          <div className="p-3 prism-badge-positive rounded-xl shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-content-muted font-medium flex items-center gap-2">
              <BilingualHoverCard termKey="MacroCycle" isPlainTalk={isPlainTalk}>
                {t.macroTitle}
              </BilingualHoverCard>
              <span className="prism-badge-positive text-[10px]">
                {t.liveMacroStream}
              </span>
            </div>
            <h2 className="text-lg font-bold text-content-primary mt-0.5">
              {t.cycleStage}: <span className="text-positive">{cycle}</span>
            </h2>
          </div>
        </div>

        {/* Central Bank Sentiment Badge */}
        <div className="flex items-center gap-3 prism-surface-subtle p-3 text-xs">
          <Cpu className="w-5 h-5 text-brand" />
          <div>
            <div className="text-content-muted">
              <BilingualHoverCard termKey="FedSentiment" isPlainTalk={isPlainTalk}>
                {t.fedSentiment}
              </BilingualHoverCard>:
            </div>
            <div className="font-semibold text-brand">{fed.tone || "Hawkish"}</div>
          </div>
        </div>
      </div>

      {/* Summary Explanation */}
      <div className="text-sm text-content-secondary mb-4 prism-surface-subtle p-3 leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-warning shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-warning">{t.macroInsight} </span>
          <span>{macroData.plain_explanation}</span>
        </div>
      </div>

      {/* Sector Rotation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended Overweight */}
        <div className="prism-surface-subtle p-3.5 border-l-4 border-l-positive">
          <div className="flex items-center gap-2 text-xs font-bold text-positive mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>{t.overweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {overweights.map((sector: string, idx: number) => (
              <span key={idx} className="prism-badge-positive text-xs">
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Underweight */}
        <div className="prism-surface-subtle p-3.5 border-l-4 border-l-negative">
          <div className="flex items-center gap-2 text-xs font-bold text-negative mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.underweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {underweights.map((sector: string, idx: number) => (
              <span key={idx} className="prism-badge-negative text-xs">
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
