import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { FileText, Search, TrendingUp, AlertTriangle, ShieldCheck, Database, FileDiff } from 'lucide-react';

interface SecTextMiningViewerProps {
  symbol: string;
  isPlainTalk?: boolean;
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

export const SecTextMiningViewer: React.FC<SecTextMiningViewerProps> = ({ symbol, isPlainTalk = false }) => {
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
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 backdrop-blur-xl animate-pulse flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs">
          <FileText className="w-5 h-5 animate-spin text-sky-600 dark:text-emerald-400" />
          <span>Mining 5-Year Historical SEC 10-K & SEDAR+ Filings...</span>
        </div>
      </div>
    );
  }

  if (!data || data.text_mining_timeline.length === 0) return null;

  const currentEntry = data.text_mining_timeline[activeYearIndex] || data.text_mining_timeline[0];

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-sm dark:shadow-2xl mb-8 transition-colors duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileDiff className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              <BilingualHoverCard termKey="SEC10K" isPlainTalk={isPlainTalk}>
                {t.secTitle}
              </BilingualHoverCard>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.secSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{data.filing_repository}</span>
          </span>
        </div>
      </div>

      {/* Summary Note Banner */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-6 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed flex items-start gap-2.5 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>{data.summary_note}</div>
      </div>

      {/* Timeline Selector Buttons */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {data.text_mining_timeline.map((entry, idx) => (
          <button
            key={entry.year}
            onClick={() => setActiveYearIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeYearIndex === idx
                ? 'bg-sky-500 dark:bg-gradient-to-r dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 shadow-md'
                : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>{entry.year}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
              activeYearIndex === idx ? 'bg-white/20 dark:bg-slate-950/30 text-white dark:text-slate-950' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
            }`}>
              Similarity: {Math.round(entry.similarity_score * 100)}%
            </span>
          </button>
        ))}
      </div>

      {/* Timeline Detail Card */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{t.comparisonPeriod}:</span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{currentEntry.year}</span>
          </div>
          <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold">
            {currentEntry.severity}
          </span>
        </div>

        {/* Added vs Removed Disclaimers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Added Disclaimer */}
          <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.insertedDisclaimer}</span>
            </div>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {currentEntry.added_disclaimer}
            </p>
          </div>

          {/* Removed Disclaimer */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.removedDisclaimer}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {currentEntry.removed_disclaimer}
            </p>
          </div>
        </div>

        {/* Extracted Keyword Trend Cloud */}
        <div>
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{t.extractedKeywordTrends}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentEntry.keywords_trend.map((kw, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 shadow-sm"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{kw.keyword}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">({kw.count}x)</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  kw.trend.startsWith('+')
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30'
                    : kw.trend.startsWith('-')
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
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
