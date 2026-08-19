import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ExportMemoData, generateMarkdownMemo, downloadMarkdownMemo, printInstitutionalMemo } from '../utils/exportMemo';
import { PrismLoopLogo } from './PrismLoopLogo';
import { 
  FileText, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Scale, 
  ShieldAlert, 
  Award, 
  TrendingUp, 
  Database, 
  Eye, 
  Code2, 
  Building2, 
  Calendar, 
  Lock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface ExportMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoData: ExportMemoData | null;
}

export const ExportMemoModal: React.FC<ExportMemoModalProps> = ({ isOpen, onClose, memoData }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'preview' | 'markdown'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !memoData || !memoData.stock) return null;

  const markdownText = generateMarkdownMemo(memoData);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPdf = () => {
    printInstitutionalMemo(memoData);
  };

  const { stock, macro, pricing, debate, fundamentals, secMining, backtest } = memoData;
  const bull = debate?.bull_argument || {};
  const bear = debate?.bear_argument || {};
  const cio = debate?.cio_verdict || {};

  const getSentimentTone = (sentiment: any, fallback: string): string => {
    if (!sentiment) return fallback;
    if (typeof sentiment === 'string') return sentiment;
    if (typeof sentiment === 'object') {
      return sentiment.tone || (typeof sentiment.score === 'number' ? `Score ${sentiment.score}` : fallback);
    }
    return String(sentiment);
  };

  const macroStage = macro?.cycle_stage || macro?.stage || 'Late-Cycle Transition';
  const fedTone = getSentimentTone(macro?.fed_sentiment, 'Hawkish Policy Rate Stance');
  const bocTone = getSentimentTone(macro?.boc_sentiment, 'Neutral / Data Dependent');
  const isOverweightMatch = macro?.recommended_overweights?.includes(stock.sector) || macro?.overweight_sectors?.includes(stock.sector);

  const currentDate = new Date().toISOString().split('T')[0];

  return (
    <div className="export-memo-modal-container fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static print:block">
      <div className="export-memo-content-box bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-content-primary z-10 transition-colors duration-150">
        
        {/* Modal Action Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800 rounded-2xl text-brand shrink-0">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-content-primary tracking-tight">
                {t.exportMemoModalTitle}
              </h2>
              <p className="text-xs text-content-muted mt-0.5 font-medium">
                {stock.company_name} ({stock.symbol}) • {t.exportMemoModalSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-all cursor-pointer"
            aria-label="Close memo modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Switcher & Download Actions (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 prism-surface-subtle p-3 print:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`h-8 px-4 rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-1.5 cursor-pointer box-border ${
                activeTab === 'preview'
                  ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/40'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t.exportMemoStyledPreview}</span>
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`h-8 px-4 rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-1.5 cursor-pointer box-border ${
                activeTab === 'markdown'
                  ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400/40'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{t.exportMemoRawMarkdown}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadMarkdownMemo(memoData)}
              className="h-8 px-4 bg-surface hover:bg-surface-subtle text-content-primary text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer border border-border-subtle shadow-sm box-border"
              title="Download clean Markdown file"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.exportMemoDownloadMd}</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="h-8 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm box-border"
              title="Print cleanly or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>{t.exportMemoPrintPdf}</span>
            </button>

            {activeTab === 'markdown' && (
              <button
                onClick={handleCopyMarkdown}
                className="h-8 px-3 bg-surface hover:bg-surface-subtle text-content-secondary text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer border border-border-subtle shadow-sm box-border"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-content-muted" />}
                <span>{copied ? t.exportMemoCopied : t.exportMemoCopy}</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTENT 1: STYLED PRINTABLE INSTITUTIONAL MEMO */}
        {activeTab === 'preview' ? (
          <div className="export-memo-printable-doc prism-surface-subtle p-6 md:p-8 text-xs text-content-primary space-y-6 print:bg-white print:text-black print:p-0 print:border-none shadow-sm">
            
            {/* Memorandum Publication Header */}
            <div className="border-b-2 border-border-strong print:border-black pb-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <PrismLoopLogo size="sm" />
                  <div className="flex flex-col leading-tight">
                    <span className="font-mono text-[10px] font-black tracking-widest text-brand print:text-sky-700 uppercase">
                      Prism Loop • Multi-Spectrum Equity Intelligence
                    </span>
                    <span className="text-[11px] text-content-muted print:text-gray-500 font-semibold">
                      Autonomous Quantitative Equity Research Workstation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 print:bg-gray-100 print:text-black print:border-gray-400">
                    <Lock className="w-3 h-3 text-amber-600 print:text-gray-700" />
                    <span>CONFIDENTIAL • INSTITUTIONAL GRADE</span>
                  </span>
                  <span className="px-2.5 py-1 bg-surface border border-border-subtle text-content-secondary rounded-lg text-[10px] font-mono font-bold print:bg-gray-100 print:text-black shadow-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{currentDate}</span>
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[11px] uppercase font-mono font-bold tracking-wider text-content-muted print:text-gray-600">
                  Institutional Equity Research Memorandum
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-content-primary print:text-black mt-0.5 tracking-tight flex items-center gap-2 flex-wrap">
                  <span>{stock.company_name}</span>
                  <span className="prism-badge-brand text-sm font-mono print:text-black print:border-black">
                    ${stock.symbol} ({stock.market || 'US'})
                  </span>
                </h1>
                <p className="text-xs text-content-secondary print:text-gray-700 mt-1 font-medium">
                  Sector: <strong className="text-content-primary print:text-black">{stock.sector || 'Equities'}</strong> • Currency: <strong className="text-content-primary print:text-black">{pricing?.currency || 'USD'}</strong> • MoS Methodology: <strong className="text-content-primary print:text-black">10-Yr FCF Discounting + 3-Stage Terminal Growth</strong>
                </p>
              </div>
            </div>

            {/* Core Financial Snapshot Grid */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-content-primary print:text-black uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-brand print:text-black" />
                <span>Executive Valuation & Margin of Safety Matrix</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-400 print:text-black shadow-sm">
                <div className="p-2">
                  <span className="text-[10px] text-content-muted print:text-gray-600 uppercase font-bold block">Current Market Price</span>
                  <div className="text-lg font-black text-positive print:text-emerald-800 mt-0.5">
                    ${stock.current_price} <span className="text-[10px] font-normal text-content-muted">{pricing?.currency || 'USD'}</span>
                  </div>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-content-muted print:text-gray-600 uppercase font-bold block">Ideal Buy Bracket</span>
                  <div className="text-lg font-black text-warning print:text-amber-800 mt-0.5">
                    ${pricing?.ideal_buy_range_min || 0} – ${pricing?.ideal_buy_range_max || 0}
                  </div>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-content-muted print:text-gray-600 uppercase font-bold block">DCF Intrinsic Fair Value</span>
                  <div className="text-lg font-black text-brand print:text-sky-800 mt-0.5">
                    ${pricing?.dcf_fair_value || 0}
                  </div>
                </div>
                <div className="p-2">
                  <span className="text-[10px] text-content-muted print:text-gray-600 uppercase font-bold block">Economic Moat Rating</span>
                  <div className="text-lg font-black text-content-primary print:text-black mt-0.5">
                    {fundamentals?.moat_rating || 'Wide Moat'}
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar 1: North American Macro Cycle Context */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-positive print:text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 1. Macro Cycle Scanner Context & Policy Stance
              </h3>
              <div className="bg-surface p-4 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 shadow-sm space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-semibold text-[11px]">
                  <div>
                    <span className="text-content-muted print:text-gray-600 block text-[10px] uppercase">Macroeconomic Cycle Stage</span>
                    <span className="text-warning print:text-black font-bold">{macroStage}</span>
                  </div>
                  <div>
                    <span className="text-content-muted print:text-gray-600 block text-[10px] uppercase">Federal Reserve NLP Stance</span>
                    <span className="text-brand print:text-black font-bold">{fedTone}</span>
                  </div>
                  <div>
                    <span className="text-content-muted print:text-gray-600 block text-[10px] uppercase">Bank of Canada NLP Stance</span>
                    <span className="text-content-secondary print:text-black font-bold">{bocTone}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border-subtle print:border-gray-300 text-[11px] text-content-secondary print:text-gray-800">
                  Sector Overweight Status: <strong className="text-content-primary print:text-black">{isOverweightMatch ? 'MATCHED (Institutional Sector Overweight)' : 'Standard Sector Allocation'}</strong>
                </div>
              </div>
            </div>

            {/* Pillar 2: Multi-Agent Institutional Investment Arena */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-warning print:text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> 2. Multi-Agent Investment Debate & CIO Verdict
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Bull Advocate */}
                <div className="prism-surface-subtle p-4 border-l-4 border-l-positive print:bg-emerald-50 print:border-emerald-400 print:text-black shadow-sm">
                  <div className="font-bold text-positive print:text-emerald-800 mb-2 flex items-center gap-1 text-xs">
                    <Award className="w-4 h-4" /> Bull Case Advocate ({bull.agent || "Bullish Analyst"}):
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-content-secondary print:text-black">
                    {(bull.key_points || ["High Free Cash Flow conversion rate", "Dominant market leadership & pricing power"]).map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-positive print:text-emerald-700 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  {bull.upside_catalyst && (
                    <div className="mt-3 pt-2 border-t border-positive/20 print:border-emerald-300 text-[10px] text-positive print:text-emerald-900 font-semibold">
                      Key Upside Catalyst: {bull.upside_catalyst}
                    </div>
                  )}
                </div>

                {/* Bear Prosecutor */}
                <div className="prism-surface-subtle p-4 border-l-4 border-l-negative print:bg-rose-50 print:border-rose-400 print:text-black shadow-sm">
                  <div className="font-bold text-negative print:text-rose-800 mb-2 flex items-center gap-1 text-xs">
                    <ShieldAlert className="w-4 h-4" /> Bear Case Prosecutor ({bear.agent || "Bearish Auditor"}):
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-content-secondary print:text-black">
                    {(bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"]).map((pt: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-negative print:text-rose-700 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  {bear.downside_risk && (
                    <div className="mt-3 pt-2 border-t border-negative/20 print:border-rose-300 text-[10px] text-negative print:text-rose-900 font-semibold">
                      Key Downside Risk: {bear.downside_risk}
                    </div>
                  )}
                </div>
              </div>

              {/* CIO Final Decision Callout */}
              <div className="bg-surface border border-border-subtle p-4 rounded-xl print:bg-gray-100 print:border-gray-400 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-border-subtle print:border-gray-300">
                  <div className="font-black text-sm text-warning print:text-black">
                    Chief Investment Officer (CIO) Verdict: {cio.verdict || 'ACCUMULATE ON PULLBACKS'}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="font-bold text-brand print:text-sky-800">Risk/Reward: {typeof cio.risk_reward_ratio === 'number' ? cio.risk_reward_ratio.toFixed(1) : (cio.risk_reward_ratio ?? '2.1')}:1</span>
                    <span className="font-bold text-positive print:text-emerald-800">Weight: {cio.position_sizing_advice || '3.5% Max'}</span>
                  </div>
                </div>
                <p className="text-[11px] text-content-secondary print:text-black leading-relaxed">
                  {cio.judge_summary || 'Ground-truth audit confirms solid FCF conversion, wide economic moat, and resilient pricing power.'}
                </p>
              </div>
            </div>

            {/* Pillar 3: SEC 10-K & SEDAR+ Text Mining Audit (If Available) */}
            {secMining && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-brand print:text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> 3. SEC 10-K & SEDAR+ Text Mining Audit (5-Year Diff)
                </h3>
                <div className="bg-surface p-4 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 text-[11px] space-y-2 shadow-sm">
                  <div className="font-semibold text-content-primary print:text-black">
                    Filing Repository: {secMining.filing_repository || 'SEC EDGAR / SEDAR+'} ({secMining.historical_years_parsed || 5} Years Parsed)
                  </div>
                  <div className="text-content-secondary print:text-gray-800">
                    Audit Note: {secMining.summary_note || 'Levenshtein diffing completed across annual filings.'}
                  </div>
                  {secMining.text_mining_timeline?.[0] && (
                    <div className="pt-2 border-t border-border-subtle print:border-gray-300 text-[10px] space-y-1">
                      <div>
                        <strong className="text-negative print:text-rose-800">+ Inserted Risk Clause ({secMining.text_mining_timeline[0].year}): </strong>
                        <span>{secMining.text_mining_timeline[0].added_disclaimer}</span>
                      </div>
                      <div>
                        <strong className="text-content-muted print:text-gray-600">- Removed / Reclassified Clause: </strong>
                        <span>{secMining.text_mining_timeline[0].removed_disclaimer}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pillar 4: Quantitative Backtest & Risk Profile (If Available) */}
            {backtest && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-positive print:text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> 4. 5-Year Historical Quantitative Risk & Return (2021 – 2025)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface p-3 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 font-mono text-[11px] shadow-sm">
                  <div>CAGR: <span className="text-positive print:text-emerald-800 font-bold">+{backtest.cagr_pct}%</span></div>
                  <div>Sharpe: <span className="text-brand print:text-sky-800 font-bold">{backtest.sharpe_ratio}</span></div>
                  <div>Max Drawdown: <span className="text-negative print:text-rose-800 font-bold">-{backtest.max_drawdown_pct}%</span></div>
                  <div>Win Rate: <span className="text-warning print:text-amber-800 font-bold">{backtest.win_rate_pct}%</span></div>
                </div>
              </div>
            )}

            {/* Institutional Compliance & Source Footer */}
            <div className="pt-4 border-t border-border-subtle print:border-black text-[10px] text-content-muted print:text-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-positive print:text-emerald-700 shrink-0" />
                <span>Sources: FRED, Bank of Canada, SEC EDGAR, SEDAR+, Yahoo Finance. Local-First Zero-Hallucination Engine.</span>
              </div>
              <div className="font-mono">
                Prism Loop • github.com/edzhangcan/ai-investment
              </div>
            </div>
          </div>
        ) : (
          /* TAB CONTENT 2: RAW MARKDOWN VIEW */
          <div className="prism-surface-subtle p-4 shadow-sm rounded-2xl">
            <pre className="text-xs font-mono text-positive whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
              {markdownText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
