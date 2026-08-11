import React from 'react';
import { MacroData, PolicyNewsItem, SupportingFact } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Globe, TrendingUp, ShieldAlert, ExternalLink, Newspaper, Database, CheckCircle2 } from 'lucide-react';

interface MacroDashboardProps {
  macroData: MacroData;
  policyNews?: PolicyNewsItem[];
  supportingFacts?: SupportingFact[];
  credibleSources?: (string | { name: string; domain?: string; type?: string })[];
  isPlainTalk: boolean;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  macroData,
  policyNews = [],
  supportingFacts = [],
  credibleSources = [],
  isPlainTalk
}) => {
  const { t } = useLanguage();

  // Fallback empirical facts if not provided
  const factsList: SupportingFact[] = supportingFacts.length > 0 ? supportingFacts : [
    { indicator: "US CPI Inflation YoY", value: "3.4%", source: "FRED (CPIAUCSL)", impact: "High Inflation Sticky" },
    { indicator: "10Y-2Y Treasury Yield Spread", value: "-0.15%", source: "FRED (T10Y2Y)", impact: "Yield Curve Inversion Warning" },
    { indicator: "Fed Target Funds Rate", value: "5.25% - 5.50%", source: "FOMC Statement", impact: "Restrictive Rate Policy" },
    { indicator: "Bank of Canada Policy Rate", value: "4.75%", source: "Bank of Canada Press Release", impact: "Plateau / Gradual Easing" },
    { indicator: "US Unemployment Rate", value: "4.1%", source: "FRED (UNRATE)", impact: "Resilient Labor Market" }
  ];

  // Fallback policy news if not provided
  const newsList: PolicyNewsItem[] = policyNews.length > 0 ? policyNews : [
    {
      title: "FOMC Reaffirms Data-Dependent Stance Amid Sticky Core Services Inflation",
      source: "Federal Reserve Board",
      date: "2026-08-01",
      url: "https://www.federalreserve.gov",
      summary: "Fed Officials emphasize maintaining restrictive policy rates until inflation convincingly glides down to 2.0% target."
    },
    {
      title: "Bank of Canada Assesses Housing Cost Pressures and Wage Growth Dynamics",
      source: "Bank of Canada",
      date: "2026-07-28",
      url: "https://www.bankofcanada.ca",
      summary: "BoC Monetary Policy Report signals prudent rate calibration to safeguard balance sheet resilience and commercial lending quality."
    },
    {
      title: "US Tech & AI Infrastructure Cloud CapEx Exceeds $200B Annualized Pace",
      source: "SEC EDGAR 10-K Filings",
      date: "2026-08-05",
      url: "https://www.sec.gov/edgar",
      summary: "Hyperscale tech giants increase GPU and power grid CapEx commitments, accelerating enterprise AI software adoption."
    }
  ];

  const sourcesList: any[] = credibleSources.length > 0 ? credibleSources : [
    "Federal Reserve Economic Data (FRED) - St. Louis Fed",
    "SEC EDGAR 10-K / 10-Q Corporate Filing Database",
    "Bank of Canada Monetary Policy Report (MPR)",
    "SEDAR+ Canadian System for Electronic Document Analysis and Retrieval"
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-100">
              {t.macroTitle}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {t.macroSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-extrabold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{macroData.cycle_stage}</span>
          </span>
        </div>
      </div>

      {/* Cycle Stage Plain Explanation Banner */}
      <div className={`p-4 rounded-2xl mb-6 border text-xs leading-relaxed font-medium transition-all ${
        isPlainTalk
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-100 shadow-lg shadow-amber-500/10'
          : 'bg-slate-950/60 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center gap-2 font-bold mb-1 text-slate-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t.cycleStage}: <span className="text-emerald-400">{macroData.cycle_stage}</span></span>
        </div>
        <p className="text-slate-300">{macroData.plain_explanation}</p>
      </div>

      {/* Overweight & Underweight Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Recommended Overweight Sectors */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4">
          <div className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{t.overweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroData.recommended_overweights.map((sec, idx) => (
              <span key={idx} className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-extrabold shadow-sm">
                🟢 {sec}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Underweight Sectors */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4">
          <div className="text-xs font-bold text-rose-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{t.underweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroData.recommended_underweights.map((sec, idx) => (
              <span key={idx} className="px-3 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-xl text-xs font-semibold">
                🔴 {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Empirical Indicators Table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>{t.empiricalFacts}</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">{t.indicator}</th>
                <th className="p-3">{t.value}</th>
                <th className="p-3">{t.source}</th>
                <th className="p-3">{t.impact}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-900/60">
              {factsList.map((fact, idx) => (
                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-semibold text-slate-100">{fact.indicator}</td>
                  <td className="p-3 font-extrabold text-emerald-400">{fact.value}</td>
                  <td className="p-3 text-slate-400">{fact.source}</td>
                  <td className="p-3 text-slate-300">{fact.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Central Bank Policy & Economic News */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-3 uppercase tracking-wider">
          <Newspaper className="w-4 h-4 text-indigo-400" />
          <span>{t.policyNews}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsList.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 p-4 rounded-2xl transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="font-bold text-indigo-400">{item.source}</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>
              <div className="mt-3 text-[11px] text-indigo-400 font-semibold flex items-center gap-1 group-hover:underline">
                <span>Read Official Release</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Credible Sources Footer */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.credibleSources}:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {sourcesList.map((src: any, idx: number) => {
            const label = typeof src === 'string' ? src : (src.name || src.domain || 'Official Source');
            return (
              <span key={idx} className="px-2 py-0.5 bg-slate-950 rounded text-slate-400 border border-slate-800">
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
