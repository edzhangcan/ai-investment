import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { FileText, TrendingUp, AlertTriangle, ShieldCheck, Database, FileDiff } from 'lucide-react';

interface SecTextMiningViewerProps {
  symbol: string;
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
}

export const SecTextMiningViewer: React.FC<SecTextMiningViewerProps> = ({ symbol }) => {
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

  return (
    <div className="prism-card p-6 md:p-8 mb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 prism-badge-brand rounded-xl">
              <FileDiff className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-content-primary">
              <BilingualHoverCard termKey="SEC10K">
                {t.secTitle}
              </BilingualHoverCard>
            </h3>
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
