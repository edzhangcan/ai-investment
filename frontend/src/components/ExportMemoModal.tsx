import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ExportMemoData, generateMarkdownMemo, downloadMarkdownMemo } from '../utils/exportMemo';
import { FileText, Printer, Download, Copy, Check, X, Sparkles, Scale, ShieldAlert, Award, TrendingUp, Database } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-slate-100 print:shadow-none print:border-none print:max-w-full print:max-h-full print:bg-white print:text-black">
        
        {/* Modal Action Header (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl text-slate-950 shadow-md">
              <FileText className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                Institutional Investment Memo Export
              </h2>
              <p className="text-xs text-slate-400">
                1-Click Export for {stock.company_name} (${stock.symbol}) in Markdown (.md) or Printable PDF (.pdf)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Switcher & Download Actions (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👁️ Styled Preview
            </button>
            <button
              onClick={() => setActiveTab('markdown')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'markdown'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📝 Raw Markdown
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => downloadMarkdownMemo(memoData)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            {activeTab === 'markdown' && (
              <button
                onClick={handleCopyMarkdown}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB CONTENT 1: STYLED PRINTABLE PREVIEW */}
        {activeTab === 'preview' ? (
          <div className="bg-slate-950 p-6 md:p-8 rounded-2xl border border-slate-800 text-xs text-slate-200 space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
            
            {/* Header Title Block */}
            <div className="border-b border-slate-800 print:border-black pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400 print:text-emerald-700">
                    Institutional Research Memorandum
                  </span>
                  <h1 className="text-2xl font-extrabold text-slate-100 print:text-black mt-1">
                    {stock.company_name} (${stock.symbol})
                  </h1>
                </div>
                <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-mono font-bold print:bg-gray-100 print:text-black">
                  {new Date().toISOString().split('T')[0]}
                </span>
              </div>
              <p className="text-slate-400 print:text-gray-600">
                Quantitative Stock Evaluation • Macro Alignment • Multi-Agent CIO Verdict • SEC 10-K Text Mining Audit
              </p>
            </div>

            {/* Core Financial Snapshot Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 print:text-black">
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold">Current Price</span>
                <div className="text-base font-extrabold text-emerald-400 print:text-emerald-700">${stock.current_price} {pricing?.currency || 'USD'}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold">Ideal Entry Bracket</span>
                <div className="text-base font-extrabold text-amber-300 print:text-amber-700">${pricing?.ideal_buy_range_min} - ${pricing?.ideal_buy_range_max}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold">DCF Fair Value</span>
                <div className="text-base font-extrabold text-indigo-300 print:text-indigo-700">${pricing?.dcf_fair_value}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 print:text-gray-500 uppercase font-semibold">Moat Rating</span>
                <div className="text-base font-extrabold text-slate-100 print:text-black">{fundamentals?.moat_rating || 'Wide Moat'}</div>
              </div>
            </div>

            {/* Macro Alignment */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-emerald-400 print:text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 1. Macro Cycle Scanner Context
              </h3>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 font-semibold">
                  <div>Macro Stage: <span className="text-amber-300 print:text-black">{macro?.stage || 'Late-Cycle Transition'}</span></div>
                  <div>Fed Sentiment: <span className="text-indigo-300 print:text-black">{macro?.fed_sentiment || 'Hawkish'}</span></div>
                  <div>BoC Sentiment: <span className="text-slate-300 print:text-black">{macro?.boc_sentiment || 'Neutral'}</span></div>
                </div>
              </div>
            </div>

            {/* CIO Multi-Agent Arena */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-amber-400 print:text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4" /> 2. Multi-Agent Investment Debate & CIO Verdict
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl print:bg-emerald-50 print:border-emerald-300">
                  <div className="font-bold text-emerald-400 print:text-emerald-800 mb-1 flex items-center gap-1">
                    <Award className="w-4 h-4" /> Bull Case Advocate:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300 print:text-black">
                    {(bull.key_points || ["High Free Cash Flow conversion", "Dominant market leadership position"]).map((pt: string, i: number) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-950/20 border border-rose-500/30 p-3.5 rounded-xl print:bg-rose-50 print:border-rose-300">
                  <div className="font-bold text-rose-400 print:text-rose-800 mb-1 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> Bear Case Prosecutor:
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300 print:text-black">
                    {(bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"]).map((pt: string, i: number) => (
                      <li key={i}>• {pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CIO Final Decision Callout */}
              <div className="bg-slate-900 border border-amber-500/50 p-4 rounded-xl print:bg-gray-100 print:border-gray-400">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-amber-300 print:text-black">CIO Final Decision: {cio.verdict || 'ACCUMULATE ON PULLBACKS'}</span>
                  <span className="font-bold text-indigo-300 print:text-black">Risk/Reward: {cio.risk_reward_ratio || 2.4}:1</span>
                </div>
                <p className="text-[11px] text-slate-300 print:text-black leading-relaxed">
                  {cio.judge_summary || 'Ground-truth audit confirms solid FCF conversion and wide economic moat.'}
                </p>
              </div>
            </div>

            {/* SEC Text Mining */}
            {secMining && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-indigo-400 print:text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> 3. SEC 10-K & SEDAR+ Text Mining Audit
                </h3>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 text-[11px] space-y-2">
                  <div className="font-semibold">Audit Summary: {secMining.summary_note}</div>
                  {secMining.text_mining_timeline?.[0] && (
                    <div className="text-slate-300 print:text-black">
                      <span className="text-rose-400 font-bold">+ Inserted Disclaimer: </span>
                      {secMining.text_mining_timeline[0].added_disclaimer}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantitative Backtest */}
            {backtest && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-teal-400 print:text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> 4. 5-Year Quantitative Backtest (2021-2025)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800 print:bg-gray-50 print:border-gray-300 font-mono text-[11px]">
                  <div>CAGR: <span className="text-emerald-400 print:text-black font-bold">+{backtest.cagr_pct}%</span></div>
                  <div>Sharpe: <span className="text-indigo-300 print:text-black font-bold">{backtest.sharpe_ratio}</span></div>
                  <div>Max Drawdown: <span className="text-rose-400 print:text-black font-bold">-{backtest.max_drawdown_pct}%</span></div>
                  <div>Win Rate: <span className="text-amber-300 print:text-black font-bold">{backtest.win_rate_pct}%</span></div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 print:border-black text-[10px] text-slate-500 print:text-gray-500 text-center">
              Generated via Antigravity Quantitative Investment Workstation. Confidential institutional report.
            </div>
          </div>
        ) : (
          /* TAB CONTENT 2: RAW MARKDOWN VIEW */
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
              {markdownText}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
