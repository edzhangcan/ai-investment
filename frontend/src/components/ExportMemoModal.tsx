import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ExportMemoData, generateMarkdownMemo, downloadMarkdownMemo } from '../utils/exportMemo';
import { FileText, Printer, Download, Copy, Check, X, Sparkles, Scale, ShieldAlert, Award, TrendingUp, Database, Eye, Code2 } from 'lucide-react';

interface ExportMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoData: ExportMemoData | null;
}

export const ExportMemoModal: React.FC<ExportMemoModalProps> = ({ isOpen, onClose, memoData }) => {
  const { language } = useLanguage();
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
    window.print();
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
  const fedTone = getSentimentTone(macro?.fed_sentiment, 'Hawkish');
  const bocTone = getSentimentTone(macro?.boc_sentiment, 'Neutral');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-content-primary z-10 print:shadow-none print:border-none print:max-w-full print:max-h-full print:bg-white print:text-black transition-colors duration-150">
        
        {/* Modal Action Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border-subtle print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-3 prism-badge-brand rounded-2xl">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-content-primary">
                Institutional Investment Memo Export
              </h2>
              <p className="text-xs text-content-muted">
                1-Click Export for {stock.company_name} (${stock.symbol}) in Markdown (.md) or Printable PDF (.pdf)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Switcher & Download Actions (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 prism-surface-subtle p-3 print:hidden shadow-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Styled Preview</span>
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'markdown'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw Markdown</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadMarkdownMemo(memoData)}
              className="px-4 py-2 bg-surface hover:bg-surface-subtle text-content-primary text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-border-subtle shadow-sm"
            >
              <Download className="w-4 h-4 text-positive" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-brand hover:opacity-90 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {activeTab === 'markdown' && (
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-2 bg-surface hover:bg-surface-subtle text-content-secondary text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-border-subtle shadow-sm"
              >
                {copied ? <Check className="w-4 h-4 text-positive" /> : <Copy className="w-4 h-4 text-content-muted" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTENT 1: STYLED PRINTABLE PREVIEW */}
        {activeTab === 'preview' ? (
          <div className="prism-surface-subtle p-6 md:p-8 text-xs text-content-primary space-y-6 print:bg-white print:text-black print:p-0 print:border-none shadow-sm">
            
            {/* Header Title Block */}
            <div className="border-b border-border-subtle print:border-black pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-brand print:text-emerald-700">
                    Institutional Research Memorandum
                  </span>
                  <h1 className="text-2xl font-extrabold text-content-primary print:text-black mt-1">
                    {stock.company_name} (${stock.symbol})
                  </h1>
                </div>
                <span className="px-3 py-1 bg-surface border border-border-subtle text-content-secondary rounded-xl text-xs font-mono font-bold print:bg-gray-100 print:text-black shadow-sm">
                  {new Date().toISOString().split('T')[0]}
                </span>
              </div>
              <p className="text-content-muted print:text-gray-600">
                Quantitative Stock Evaluation • Macro Alignment • Multi-Agent CIO Verdict • SEC 10-K Text Mining Audit
              </p>
            </div>

            {/* Core Financial Snapshot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 print:text-black shadow-sm">
              <div>
                <span className="text-[10px] text-content-muted print:text-gray-500 uppercase font-semibold">Current Price</span>
                <div className="text-base font-extrabold text-positive print:text-emerald-700">${stock.current_price} {pricing?.currency || 'USD'}</div>
              </div>
              <div>
                <span className="text-[10px] text-content-muted print:text-gray-500 uppercase font-semibold">Ideal Entry Bracket</span>
                <div className="text-base font-extrabold text-warning print:text-amber-700">${pricing?.ideal_buy_range_min} - ${pricing?.ideal_buy_range_max}</div>
              </div>
              <div>
                <span className="text-[10px] text-content-muted print:text-gray-500 uppercase font-semibold">DCF Fair Value</span>
                <div className="text-base font-extrabold text-brand print:text-indigo-700">${pricing?.dcf_fair_value}</div>
              </div>
              <div>
                <span className="text-[10px] text-content-muted print:text-gray-500 uppercase font-semibold">Moat Rating</span>
                <div className="text-base font-extrabold text-content-primary print:text-black">{fundamentals?.moat_rating || 'Wide Moat'}</div>
              </div>
            </div>

            {/* Macro Alignment */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-positive print:text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 1. Macro Cycle Scanner Context
              </h3>
              <div className="bg-surface p-4 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 font-semibold">
                  <div>Macro Stage: <span className="text-warning print:text-black">{macroStage}</span></div>
                  <div>Fed Sentiment: <span className="text-brand print:text-black">{fedTone}</span></div>
                  <div>BoC Sentiment: <span className="text-content-secondary print:text-black">{bocTone}</span></div>
                </div>
              </div>
            </div>

            {/* CIO Multi-Agent Arena */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-warning print:text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> 2. Multi-Agent Investment Debate & CIO Verdict
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="prism-surface-subtle p-3.5 border-l-4 border-l-positive print:bg-emerald-50 print:border-emerald-300 shadow-sm">
                  <div className="font-bold text-positive print:text-emerald-800 mb-1 flex items-center gap-1">
                    <Award className="w-4 h-4" /> Bull Case Advocate:
                  </div>
                  <ul className="space-y-1 text-[11px] text-content-secondary print:text-black">
                    {(bull.key_points || ["High Free Cash Flow conversion", "Dominant market leadership position"]).map((pt: string, i: number) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="prism-surface-subtle p-3.5 border-l-4 border-l-negative print:bg-rose-50 print:border-rose-300 shadow-sm">
                  <div className="font-bold text-negative print:text-rose-800 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> Bear Case Prosecutor:
                  </div>
                  <ul className="space-y-1 text-[11px] text-content-secondary print:text-black">
                    {(bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"]).map((pt: string, i: number) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CIO Final Decision Callout */}
              <div className="bg-surface border border-border-subtle p-4 rounded-xl print:bg-gray-100 print:border-gray-400 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-warning print:text-black">CIO Final Decision: {cio.verdict || 'ACCUMULATE ON PULLBACKS'}</span>
                  <span className="font-bold text-brand print:text-black">Risk/Reward: {cio.risk_reward_ratio || 2.4}:1</span>
                </div>
                <p className="text-[11px] text-content-secondary print:text-black leading-relaxed">
                  {cio.judge_summary || 'Ground-truth audit confirms solid FCF conversion and wide economic moat.'}
                </p>
              </div>
            </div>

            {/* SEC Text Mining */}
            {secMining && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand print:text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> 3. SEC 10-K & SEDAR+ Text Mining Audit
                </h3>
                <div className="bg-surface p-4 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 text-[11px] space-y-2 shadow-sm">
                  <div className="font-semibold">Audit Summary: {secMining.summary_note}</div>
                  {secMining.text_mining_timeline?.[0] && (
                    <div className="text-content-secondary print:text-black">
                      <span className="text-negative font-bold">+ Inserted Disclaimer: </span>
                      {secMining.text_mining_timeline[0].added_disclaimer}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantitative Backtest */}
            {backtest && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-positive print:text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> 4. 5-Year Quantitative Backtest (2021-2025)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface p-3 rounded-xl border border-border-subtle print:bg-gray-50 print:border-gray-300 font-mono text-[11px] shadow-sm">
                  <div>CAGR: <span className="text-positive print:text-black font-bold">+{backtest.cagr_pct}%</span></div>
                  <div>Sharpe: <span className="text-brand print:text-black font-bold">{backtest.sharpe_ratio}</span></div>
                  <div>Max Drawdown: <span className="text-negative print:text-black font-bold">-{backtest.max_drawdown_pct}%</span></div>
                  <div>Win Rate: <span className="text-warning print:text-black font-bold">{backtest.win_rate_pct}%</span></div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-border-subtle print:border-black text-[10px] text-content-muted print:text-gray-500 text-center">
              Generated via Prism Loop Institutional Intelligence Engine. Confidential institutional report.
            </div>
          </div>
        ) : (
          /* TAB CONTENT 2: RAW MARKDOWN VIEW */
          <div className="prism-surface-subtle p-4 shadow-sm">
            <pre className="text-xs font-mono text-positive whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
              {markdownText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
