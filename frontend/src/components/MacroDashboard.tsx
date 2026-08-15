import React, { useState } from 'react';
import { MacroData, PolicyNewsItem, SupportingFact } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Globe, TrendingUp, ShieldAlert, ExternalLink, Newspaper, Database, CheckCircle2, RefreshCw } from 'lucide-react';

interface MacroDashboardProps {
  macroData: MacroData;
  policyNews?: PolicyNewsItem[];
  supportingFacts?: SupportingFact[];
  credibleSources?: (string | { name: string; domain?: string; type?: string })[];
  isPlainTalk: boolean;
  onRefreshMacro?: () => Promise<void>;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  macroData,
  policyNews = [],
  supportingFacts = [],
  credibleSources = [],
  isPlainTalk,
  onRefreshMacro
}) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (!onRefreshMacro || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshToast(null);
    try {
      await onRefreshMacro();
      setRefreshToast('✅ Macro data & policy news refreshed successfully!');
    } catch {
      setRefreshToast('⚠️ Refresh encountered an issue. Using cached data.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(null), 4000);
    }
  };

  const factsList: SupportingFact[] = supportingFacts.length > 0 ? supportingFacts : [
    { indicator: "US CPI Inflation YoY", value: "3.4%", source: "FRED (CPIAUCSL)", impact: "High Inflation Sticky" },
    { indicator: "10Y-2Y Treasury Yield Spread", value: "-0.15%", source: "FRED (T10Y2Y)", impact: "Yield Curve Inversion Warning" },
    { indicator: "Fed Target Funds Rate", value: "5.25% - 5.50%", source: "FOMC Statement", impact: "Restrictive Rate Policy" },
    { indicator: "Bank of Canada Policy Rate", value: "4.75%", source: "Bank of Canada Press Release", impact: "Plateau / Gradual Easing" },
    { indicator: "US Unemployment Rate", value: "4.1%", source: "FRED (UNRATE)", impact: "Resilient Labor Market" }
  ];

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
    <div className="prism-card p-6 md:p-8 mb-8">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 prism-badge-positive rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-content-primary">
              {t.macroTitle}
            </h2>
          </div>
          <p className="text-xs text-content-muted">
            {t.macroSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="prism-badge-brand text-xs flex items-center gap-1.5 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{macroData.cycle_stage}</span>
          </span>
        </div>
      </div>

      {/* Cycle Stage Plain Explanation Banner */}
      <div className={`p-4 rounded-2xl mb-6 border text-xs leading-relaxed font-medium transition-all ${
        isPlainTalk
          ? 'prism-card border-warning text-warning shadow-sm'
          : 'prism-surface-subtle text-content-secondary'
      }`}>
        <div className="flex items-center gap-2 font-bold mb-1 text-content-primary">
          <CheckCircle2 className="w-4 h-4 text-positive" />
          <span>
            <BilingualHoverCard termKey="MacroCycle" isPlainTalk={isPlainTalk}>
              {t.cycleStage}
            </BilingualHoverCard>: <span className="text-positive font-bold">{macroData.cycle_stage}</span>
          </span>
        </div>
        <p className="text-content-secondary">{macroData.plain_explanation}</p>
      </div>

      {/* Overweight & Underweight Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Recommended Overweight Sectors */}
        <div className="prism-surface-subtle p-4 border-l-4 border-l-positive">
          <div className="text-xs font-bold text-positive mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{t.overweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroData.recommended_overweights.map((sec, idx) => (
              <span key={idx} className="prism-badge-positive text-xs">
                {sec}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Underweight Sectors */}
        <div className="prism-surface-subtle p-4 border-l-4 border-l-negative">
          <div className="text-xs font-bold text-negative mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{t.underweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroData.recommended_underweights.map((sec, idx) => (
              <span key={idx} className="prism-badge-negative text-xs">
                {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Empirical Indicators Table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-bold text-content-primary mb-3 uppercase tracking-wider">
          <Database className="w-4 h-4 text-brand" />
          <span>{t.empiricalFacts}</span>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-content-muted font-bold border-b border-border-subtle">
              <tr>
                <th className="p-3">{t.indicator}</th>
                <th className="p-3">{t.value}</th>
                <th className="p-3">{t.source}</th>
                <th className="p-3">{t.impact}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface">
              {factsList.map((fact, idx) => {
                let key = "YieldSpread";
                if (fact.indicator.toLowerCase().includes("fed") || fact.indicator.toLowerCase().includes("rate")) key = "FedSentiment";
                else if (fact.indicator.toLowerCase().includes("cpi") || fact.indicator.toLowerCase().includes("gdp")) key = "MacroCycle";
                
                return (
                  <tr key={idx} className="hover:bg-surface-subtle transition-colors">
                    <td className="p-3 font-semibold text-content-primary">
                      <BilingualHoverCard termKey={key} isPlainTalk={isPlainTalk}>
                        {fact.indicator}
                      </BilingualHoverCard>
                    </td>
                    <td className="p-3 font-extrabold text-positive">{fact.value}</td>
                    <td className="p-3 text-content-muted">{fact.source}</td>
                    <td className="p-3 text-content-secondary">{fact.impact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Toast Notification */}
      {refreshToast && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
          refreshToast.startsWith('✅')
            ? 'prism-badge-positive'
            : 'prism-badge-warning'
        }`}>
          {refreshToast}
        </div>
      )}

      {/* Central Bank Policy & Economic News */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-content-primary uppercase tracking-wider">
            <Newspaper className="w-4 h-4 text-brand" />
            <span>{t.policyNews}</span>
          </div>
          {onRefreshMacro && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-subtle hover:border-brand text-content-primary hover:text-brand rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title="Refresh Macro Data & Policy News"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh News'}</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsList.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="prism-surface-subtle hover:border-brand p-4 transition-all group flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-content-muted mb-1.5">
                  <span className="font-bold text-brand">{item.source}</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-xs font-bold text-content-primary group-hover:text-brand transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-content-secondary leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>
              <div className="mt-3 text-[11px] text-brand font-semibold flex items-center gap-1 group-hover:underline">
                <span>Read Official Release</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Credible Sources Footer */}
      <div className="pt-4 border-t border-border-subtle text-[11px] text-content-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-positive" />
          <span>{t.credibleSources}:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {sourcesList.map((src: any, idx: number) => {
            const label = typeof src === 'string' ? src : (src.name || src.domain || 'Official Source');
            return (
              <span key={idx} className="px-2 py-0.5 prism-badge-neutral text-[10px]">
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
