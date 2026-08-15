import React, { useState, useEffect } from 'react';
import { Search, Sparkles, HelpCircle, Compass, Star, X } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (ticker: string) => void;
  onTogglePlainTalk: () => void;
  isPlainTalk: boolean;
  onOpenWatchlist: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
  onTogglePlainTalk,
  isPlainTalk,
  onOpenWatchlist,
}) => {
  const [query, setQuery] = useState('');

  const quickTickers = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US' },
    { symbol: 'AAPL', name: 'Apple Inc.', market: 'US' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US' },
    { symbol: 'SHOP.TO', name: 'Shopify Inc.', market: 'CA' },
    { symbol: 'TD.TO', name: 'Toronto-Dominion Bank', market: 'CA' },
    { symbol: 'XEQT.TO', name: 'iShares Core Equity ETF', market: 'CA' },
  ];

  const filteredTickers = quickTickers.filter(
    (t) =>
      t.symbol.toLowerCase().includes(query.toLowerCase()) ||
      t.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (symbol: string) => {
    onSelectTicker(symbol);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-colors duration-200">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-sky-600 dark:text-emerald-400" />
          <input
            type="text"
            value={query}
            aria-label="搜索美股或加股代码"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索美股/加股代码或命令 ($NVDA, $SHOP.TO, Ctrl+K)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium"
            autoFocus
          />
          <button onClick={onClose} aria-label="关闭搜索" className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Menu Items */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-2 text-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1">
            快捷操作命令 (Actions)
          </div>

          <button
            onClick={() => {
              onTogglePlainTalk();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all text-left cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>切换通俗白话解说模式</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              {isPlainTalk ? '已开启' : '已关闭'}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenWatchlist();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all text-left cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span>打开自选股与价格提醒抽屉 (Watchlist)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
              Drawer
            </span>
          </button>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-2 py-1 pt-2">
            热门美股与加拿大标的 (Stocks)
          </div>

          {filteredTickers.map((t) => (
            <button
              key={t.symbol}
              onClick={() => handleSelect(t.symbol)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-600 dark:text-emerald-400" />
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">{t.symbol}</span>
                  <span className="text-slate-500 dark:text-slate-400">{t.name}</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-emerald-400 border border-slate-200 dark:border-emerald-500/30 font-medium">
                {t.market}
              </span>
            </button>
          ))}

          {query.trim() && !filteredTickers.some((t) => t.symbol.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              onClick={() => handleSelect(query.trim())}
              className="w-full p-2.5 rounded-xl bg-sky-50 dark:bg-emerald-950/40 border border-sky-200 dark:border-emerald-500/40 text-sky-800 dark:text-emerald-300 font-medium hover:bg-sky-100 dark:hover:bg-emerald-900/50 transition-all text-left flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>搜索并深度分析股票 "${query.toUpperCase()}"</span>
            </button>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>提示：按 <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono">Esc</kbd> 退出</span>
          <span className="text-sky-600 dark:text-emerald-400 font-medium">Ctrl + K 随时唤起</span>
        </div>
      </div>
    </div>
  );
};
