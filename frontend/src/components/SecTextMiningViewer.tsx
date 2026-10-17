import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { FileText, TrendingUp, AlertTriangle, ShieldCheck, Database, FileDiff, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { EarningsQuality, DataProvenance } from '../types';

interface SecTextMiningViewerProps {
  symbol: string;
  earningsQuality?: EarningsQuality | null;
  provenance?: DataProvenance | null;
}

interface MiningTimelineEntry {
  year: string;
  similarity_score: number;
  severity: string;
  added_disclaimer: string;
  removed_disclaimer: string;
  keywords_trend: { keyword: string; count: number; trend: string }[];
}

interface MiningDataPayload {
  symbol: string;
  filing_repository: string;
  historical_years_parsed: number;
  summary_note: string;
  text_mining_timeline: MiningTimelineEntry[];
  source_mode?: string;
  provenance?: DataProvenance;
  earnings_quality?: EarningsQuality;
}

export const SecTextMiningViewer: React.FC<SecTextMiningViewerProps> = ({
  symbol,
  earningsQuality,
  provenance
}) => {
  const { language, t } = useLanguage();
  const [data, setData] = useState<MiningDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeYearIndex, setActiveYearIndex] = useState(0);

  useEffect(() => {
    const fetchMiningData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://${window.location.hostname || '127.0.0.1'}:8000/api/stock/${symbol}/filings/mining?lang=${language}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.warn("Text mining fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchMiningData();
  }, [symbol, language]);

  if (loading) {
    return (
      <div className="prism-card p-6 flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-3 text-content-muted text-xs">
          <FileText className="w-5 h-5 animate-spin text-brand" />
          <span>Mining 5-Year Historical SEC 10-K & SEDAR+ Filings...</span>
        </div>
      </div>
    );
  }

  if (!data || data.text_mining_timeline.length === 0) return null;

  const currentEntry = data.text_mining_timeline[activeYearIndex] || data.text_mining_timeline[0];
  const effectiveProvenance = provenance || data.provenance;
  const effectiveEarningsQuality = earningsQuality || data.earnings_quality;
  const isFallback = effectiveProvenance?.source_mode === 'SIMULATED_FALLBACK';

  return (
    <div className="prism-card p-6 md:p-8 mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <span className="p-2 prism-badge-brand rounded-xl">
              <FileDiff className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-content-primary">
              <BilingualHoverCard termKey="SEC10K">
                {t.secTitle}
              </BilingualHoverCard>
            </h3>
            <ProvenanceBadge provenance={effectiveProvenance} />
          </div>
          <p className="text-xs text-content-muted">
            {t.secSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-secondary flex items-center gap-1.5 bg-surface-subtle px-3 py-1.5 rounded-xl border border-border-subtle shadow-sm">
            <Database className="w-3.5 h-3.5 text-positive shrink-0" />
            <BilingualHoverCard termKey={data.filing_repository.includes("SEDAR") ? "SEDAR" : "SEC10K"}>
              {data.filing_repository}
            </BilingualHoverCard>
          </span>
        </div>
      </div>

      {/* Fallback Warning Callout Banner */}
      {isFallback && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-start gap-3 text-xs text-rose-900 dark:text-rose-200 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-extrabold flex items-center gap-2">
              <span>{language === 'zh' ? '⚠️ 模拟降级模式警示 (Simulated Fallback)' : '⚠️ Simulated Fallback Warning'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-200 dark:bg-rose-900/60 font-mono">UNLISTED / MOCK</span>
            </div>
            <p className="leading-relaxed opacity-90">
              {effectiveProvenance?.warning_banner || (language === 'zh'
                ? '此标的缺少真实的 SEC EDGAR 10-K 或 SEDAR+ 年度 MD&A 归档文本，当前展示基于同业基准与动量特征生成的模拟 MD&A 风险警示，请勿作为单一审计依据。'
                : 'Live regulatory filings are unavailable for this ticker. Displaying dynamically calibrated heuristic MD&A risk shifts. Verify with audited statutory filings.')}
            </p>
          </div>
        </div>
      )}

      {/* Accounting Forensics & Earnings Quality Summary Bar */}
      {effectiveEarningsQuality && (
        <div className="mb-6 p-4 rounded-xl bg-surface-subtle border border-border-subtle shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold text-content-primary">
                {language === 'zh' ? '会计法证与财报质量审计 (Earnings Quality Forensics)' : 'Accounting Forensics & Earnings Quality Audit'}
              </span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
              effectiveEarningsQuality.quality_rating === 'HIGH'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : effectiveEarningsQuality.quality_rating === 'MODERATE'
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
            }`}>
              Rating: {effectiveEarningsQuality.quality_rating}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Cash Conversion */}
            <div className="p-3 rounded-xl bg-surface border border-border-subtle">
              <span className="text-[10px] text-content-muted block mb-1">
                {language === 'zh' ? '现金转换率 (OCF / 净利润)' : 'Cash Conversion (OCF / NI)'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-base font-extrabold font-mono ${
                  effectiveEarningsQuality.cash_conversion_ratio >= 1.0
                    ? 'text-positive'
                    : effectiveEarningsQuality.cash_conversion_ratio >= 0.7
                    ? 'text-warning'
                    : 'text-negative'
                }`}>
                  {effectiveEarningsQuality.cash_conversion_ratio.toFixed(2)}x
                </span>
                <span className="text-[10px] text-content-muted">
                  {effectiveEarningsQuality.cash_conversion_ratio >= 1.0 ? '✓ High Quality Cash' : '⚠ Accrual Drag'}
                </span>
              </div>
            </div>

            {/* Sloan Accruals Ratio */}
            <div className="p-3 rounded-xl bg-surface border border-border-subtle">
              <span className="text-[10px] text-content-muted block mb-1">
                {language === 'zh' ? '斯隆应计比率 (Sloan Accruals)' : 'Sloan Accruals Ratio'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-base font-extrabold font-mono ${
                  Math.abs(effectiveEarningsQuality.sloan_accruals_ratio) <= 0.10
                    ? 'text-positive'
                    : Math.abs(effectiveEarningsQuality.sloan_accruals_ratio) <= 0.15
                    ? 'text-warning'
                    : 'text-negative'
                }`}>
                  {(effectiveEarningsQuality.sloan_accruals_ratio * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-content-muted">
                  {Math.abs(effectiveEarningsQuality.sloan_accruals_ratio) <= 0.10 ? '✓ Low Accrual Risk' : '⚠ Manipulative Risk'}
                </span>
              </div>
            </div>

            {/* SBC % of FCF */}
            <div className="p-3 rounded-xl bg-surface border border-border-subtle">
              <span className="text-[10px] text-content-muted block mb-1">
                {language === 'zh' ? '股权激励占 FCF 比重 (SBC / FCF)' : 'SBC % of Free Cash Flow'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-base font-extrabold font-mono ${
                  effectiveEarningsQuality.sbc_pct_of_fcf <= 0.20
                    ? 'text-positive'
                    : effectiveEarningsQuality.sbc_pct_of_fcf <= 0.40
                    ? 'text-warning'
                    : 'text-negative'
                }`}>
                  {(effectiveEarningsQuality.sbc_pct_of_fcf * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-content-muted">
                  {effectiveEarningsQuality.sbc_pct_of_fcf > 0.35 ? '⚠ Heavy Dilution' : '✓ Manageable'}
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Warning Badges */}
          {effectiveEarningsQuality.forensic_flags && effectiveEarningsQuality.forensic_flags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {effectiveEarningsQuality.forensic_flags.map((flag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 flex items-center gap-1"
                >
                  <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                  <span>{flag.replace(/_/g, ' ').toUpperCase()}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary Note Banner */}
      <div className="prism-surface-subtle p-4 mb-6 text-xs text-content-secondary font-medium leading-relaxed flex items-start gap-2.5 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-positive shrink-0 mt-0.5" />
        <div>{data.summary_note}</div>
      </div>

      {/* Timeline Selector Buttons */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {data.text_mining_timeline.map((entry, idx) => (
          <button
            key={entry.year}
            onClick={() => setActiveYearIndex(idx)}
            className={`h-8 px-4 rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-2 cursor-pointer shrink-0 box-border ${
              activeYearIndex === idx
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface border border-border-subtle text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
            }`}
          >
            <span>{entry.year}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              activeYearIndex === idx ? 'bg-white/20 text-white' : 'bg-surface-subtle text-content-muted'
            }`}>
              Similarity: {Math.round(entry.similarity_score * 100)}%
            </span>
          </button>
        ))}
      </div>

      {/* Timeline Detail Card */}
      <div className="prism-surface-subtle p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-content-primary">{t.comparisonPeriod}:</span>
            <span className="text-xs font-extrabold text-positive font-mono">{currentEntry.year}</span>
          </div>
          <span className="prism-badge-warning text-xs">
            {currentEntry.severity}
          </span>
        </div>

        {/* Added vs Removed Disclaimers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Added Disclaimer */}
          <div className="prism-surface-subtle p-4 border-l-4 border-l-negative shadow-sm">
            <div className="text-xs font-bold text-negative mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.insertedDisclaimer}</span>
            </div>
            <p className="text-xs text-content-primary leading-relaxed font-medium">
              {currentEntry.added_disclaimer}
            </p>
          </div>

          {/* Removed Disclaimer */}
          <div className="prism-surface-subtle p-4 border-l-4 border-l-positive shadow-sm">
            <div className="text-xs font-bold text-positive mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.removedDisclaimer}</span>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed font-medium">
              {currentEntry.removed_disclaimer}
            </p>
          </div>
        </div>

        {/* Extracted Keyword Trend Cloud */}
        <div>
          <div className="text-xs font-bold text-content-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand" />
            <span>{t.extractedKeywordTrends}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentEntry.keywords_trend.map((kw, idx) => (
              <div
                key={idx}
                className="bg-surface border border-border-subtle px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <span className="font-semibold text-content-primary">{kw.keyword}</span>
                <span className="font-mono font-bold text-brand">({kw.count}x)</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  kw.trend.startsWith('+')
                    ? 'prism-badge-negative text-[10px]'
                    : kw.trend.startsWith('-')
                    ? 'prism-badge-positive text-[10px]'
                    : 'prism-badge-neutral text-[10px]'
                }`}>
                  {kw.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
