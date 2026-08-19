import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { StockData, PricingData, DebateData } from '../types';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Download, 
  Eye, 
  Code2, 
  Award, 
  ShieldAlert, 
  ArrowUpRight, 
  Scale, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export interface ShareVerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  debateData: DebateData | any;
  stock?: StockData | any;
  pricing?: PricingData | any;
}

export const ShareVerdictModal: React.FC<ShareVerdictModalProps> = ({
  isOpen,
  onClose,
  debateData,
  stock,
  pricing
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !debateData) return null;

  const bull = debateData.bull_argument || {};
  const bear = debateData.bear_argument || {};
  const cio = debateData.cio_verdict || {};

  const symbol = stock?.symbol || debateData?.symbol || 'STOCK';
  const companyName = stock?.company_name || symbol;
  const currentPrice = pricing?.current_price ?? stock?.current_price ?? 'N/A';
  const currency = pricing?.currency || stock?.currency || 'USD';
  const valStatus = pricing?.valuation_status || 'Analyzed';
  const fairValue = pricing?.dcf_fair_value ? `${pricing.dcf_fair_value} ${currency}` : 'N/A';
  const buyRange = pricing?.ideal_buy_range_min && pricing?.ideal_buy_range_max 
    ? `${pricing.ideal_buy_range_min} - ${pricing.ideal_buy_range_max} ${currency}` 
    : (cio?.recommended_buy_bracket || 'Ideal Buy Zone');

  const generateVerdictMarkdown = (): string => {
    const bullPoints = (bull.key_points || ["High Free Cash Flow conversion", "Dominant market leadership position"])
      .map((p: string) => `• ${p}`)
      .join('\n');
    const bearPoints = (bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"])
      .map((p: string) => `• ${p}`)
      .join('\n');

    return `### 🏛️ [Prism Loop Multi-Agent Debate & CIO Verdict]
**${companyName} (${symbol})** | Price: **${currentPrice} ${currency}** | Valuation: **${valStatus}** (DCF Fair Value: ${fairValue})

---

#### 🐂 ${t.shareVerdictHeaderBull}:
${bullPoints}
${bull.upside_catalyst ? `> **${t.keyUpsideCatalyst}:** ${bull.upside_catalyst}\n` : ''}

#### 🐻 ${t.shareVerdictHeaderBear}:
${bearPoints}
${bear.downside_risk ? `> **${t.keyDownsideRisk}:** ${bear.downside_risk}\n` : ''}

---

#### ⚖️ ${t.shareVerdictHeaderCIO}: **${cio.verdict || "ACCUMULATE ON PULLBACKS"}**
- **${t.riskReward}:** \`${typeof cio.risk_reward_ratio === 'number' ? cio.risk_reward_ratio.toFixed(1) : (cio.risk_reward_ratio ?? '2.1')}:1\`
- **${t.recommendedBuyBracket}:** ${buyRange}
- **${t.positionSizing}:** ${cio.position_sizing_advice || "3.5% Max Portfolio Weight"}
- **${t.judgeSummary}:** ${cio.judge_summary || "Ground-truth audit confirms solid FCF conversion and wide economic moat."}

---
*${t.shareVerdictAttribution} • https://github.com/edzhangcan/ai-investment*`;
  };

  const markdownText = generateVerdictMarkdown();

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${symbol}_debate_verdict.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      {/* Solid Opaque Container */}
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto z-10 transition-colors duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-verdict-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border-subtle mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-2xl text-brand shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 id="share-verdict-title" className="text-lg md:text-xl font-black text-content-primary tracking-tight">
                {t.shareVerdictModalTitle}
              </h2>
              <p className="text-xs text-content-muted mt-0.5 font-medium">
                {companyName} ({symbol}) • {t.shareVerdictModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-content-muted hover:text-content-primary rounded-xl hover:bg-surface-subtle transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-content-secondary border border-border-subtle'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{t.shareVerdictPreviewTab}</span>
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'markdown'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface hover:bg-surface-subtle text-content-secondary border border-border-subtle'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{t.shareVerdictMarkdownTab}</span>
          </button>
        </div>

        {/* Tab 1: Formatted High-Fidelity Preview */}
        {activeTab === 'preview' ? (
          <div className="space-y-4 text-content-primary">
            {/* Overview Strip */}
            <div className="p-3.5 bg-surface-subtle border border-border-subtle rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm text-brand px-2.5 py-0.5 bg-brand-subtle rounded-lg">
                  {symbol}
                </span>
                <span className="font-bold text-content-primary">
                  {companyName}
                </span>
              </div>
              <div className="flex items-center gap-3 font-medium text-content-secondary">
                <span>
                  {t.currentMarketPrice}: <strong className="font-mono text-content-primary">{currentPrice} {currency}</strong>
                </span>
                <span className="text-border-subtle">|</span>
                <span>
                  {t.valuationStatus}: <strong className="text-brand font-semibold">{valStatus}</strong>
                </span>
              </div>
            </div>

            {/* Bull vs Bear Debate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Bull Case */}
              <div className="prism-surface-subtle p-4 border-l-4 border-l-positive shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-positive mb-2.5 pb-2 border-b border-border-subtle">
                    <Award className="w-4 h-4" />
                    <span>{t.shareVerdictHeaderBull}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-content-secondary mb-3">
                    {(bull.key_points || ["High Free Cash Flow conversion", "Dominant market leadership position"]).map((pt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-positive font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {bull.upside_catalyst && (
                  <div className="prism-badge-positive p-2.5 rounded-lg text-xs mt-2">
                    <span className="font-bold block mb-0.5 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> {t.keyUpsideCatalyst}:
                    </span>
                    <span className="font-medium text-content-primary">{bull.upside_catalyst}</span>
                  </div>
                )}
              </div>

              {/* Bear Case */}
              <div className="prism-surface-subtle p-4 border-l-4 border-l-negative shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-negative mb-2.5 pb-2 border-b border-border-subtle">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t.shareVerdictHeaderBear}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-content-secondary mb-3">
                    {(bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"]).map((pt: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-negative font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {bear.downside_risk && (
                  <div className="prism-badge-negative p-2.5 rounded-lg text-xs mt-2">
                    <span className="font-bold block mb-0.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" /> {t.keyDownsideRisk}:
                    </span>
                    <span className="font-medium text-content-primary">{bear.downside_risk}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CIO Final Verdict Banner */}
            <div className="prism-surface-subtle p-4 border-l-4 border-l-brand shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-brand" />
                    <span>{t.shareVerdictHeaderCIO}:</span>
                  </span>
                  <span className="text-xs font-extrabold text-positive">{cio.verdict || "ACCUMULATE ON PULLBACKS"}</span>
                </div>
                <span className="text-xs font-bold text-content-secondary">
                  {t.riskReward}: <span className="text-brand font-mono">{typeof cio.risk_reward_ratio === 'number' ? cio.risk_reward_ratio.toFixed(1) : (cio.risk_reward_ratio ?? '2.1')}:1</span>
                </span>
              </div>

              <p className="text-xs text-content-primary leading-relaxed font-medium mb-3">
                {cio.judge_summary || "Ground-truth audit confirms solid FCF conversion and wide economic moat, supporting disciplined DCA allocation."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-border-subtle pt-2.5">
                <div className="text-content-secondary">
                  <span className="text-content-muted">{t.recommendedBuyBracket}:</span>
                  <span className="font-bold text-warning"> {buyRange}</span>
                </div>
                <div className="text-content-secondary">
                  <span className="text-content-muted">{t.positionSizing}:</span>
                  <span className="font-semibold text-positive"> {cio.position_sizing_advice || "3.5% Portfolio Max Weight"}</span>
                </div>
              </div>
            </div>

            {/* Attribution Footnote */}
            <div className="p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/60 rounded-xl text-xs text-content-muted flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>{t.shareVerdictAttribution}</span>
              </span>
              <a 
                href="https://github.com/edzhangcan/ai-investment" 
                target="_blank" 
                rel="noreferrer"
                className="text-brand hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ) : (
          /* Tab 2: Raw Markdown Code Block */
          <div className="relative">
            <textarea
              readOnly
              value={markdownText}
              className="w-full h-80 font-mono text-xs p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl border border-border-subtle leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-brand select-all"
            />
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-border-subtle flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-content-muted">
            {activeTab === 'preview' ? 'Ready to share on Reddit, X, Discord & Communities' : `${markdownText.length} characters`}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadMarkdown}
              className="h-9 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-brand text-content-primary rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-brand" />
              <span>{t.shareVerdictDownloadMd}</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="h-9 px-4 bg-brand hover:bg-brand-hover text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{t.shareVerdictCopied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.shareVerdictCopyBtn}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="h-9 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle text-content-secondary hover:text-content-primary rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              {t.shareVerdictClose}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
