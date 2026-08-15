import React, { useState, useEffect } from 'react';
import { Search, Sparkles, HelpCircle, Star, X } from 'lucide-react';

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
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
      <div className="w-full max-w-xl bg-surface border border-border-subtle rounded-2xl shadow-2xl overflow-hidden transition-colors duration-150">
        {/* Search Input Bar */}
        <div className="relative border-b border-border-subtle p-4 flex items-center gap-3">
          <Search className="w-5 h-5 text-brand" />
          <input
            type="text"
            value={query}
            aria-label="搜索美股或加股代码"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索美股/加股代码或命令 ($NVDA, $SHOP.TO, Ctrl+K)..."
            className="w-full bg-transparent text-sm text-content-primary placeholder:text-content-muted focus:outline-none font-medium"
            autoFocus
          />
          <button onClick={onClose} aria-label="关闭搜索" className="p-1 text-content-muted hover:text-content-primary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command Menu Items */}
        <div className="max-h-80 overflow-y-auto p-3 space-y-2 text-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-content-muted px-2 py-1">
            快捷操作命令 (Actions)
          </div>

          <button
            onClick={() => {
              onTogglePlainTalk();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl prism-surface-subtle hover:bg-surface text-content-primary transition-all text-left cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-warning" />
              <span>切换通俗白话解说模式</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded prism-badge-neutral font-mono">
              {isPlainTalk ? '已开启' : '已关闭'}
            </span>
          </button>

          <button
            onClick={() => {
              onOpenWatchlist();
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl prism-surface-subtle hover:bg-surface text-content-primary transition-all text-left cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning" />
              <span>打开自选股与价格提醒抽屉 (Watchlist)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded prism-badge-neutral font-mono">
              Drawer
            </span>
          </button>

          <div className="text-[11px] font-semibold uppercase tracking-wider text-content-muted px-2 py-1 pt-2">
            热门美股与加拿大标的 (Stocks)
          </div>

          {filteredTickers.map((t) => (
            <button
              key={t.symbol}
              onClick={() => handleSelect(t.symbol)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface hover:bg-surface-subtle text-content-primary transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand" />
                <div>
                  <span className="font-bold text-content-primary mr-2">{t.symbol}</span>
                  <span className="text-content-muted">{t.name}</span>
                </div>
              </div>
              <span className="prism-badge-brand text-[10px]">
                {t.market}
              </span>
            </button>
          ))}

          {query.trim() && !filteredTickers.some((t) => t.symbol.toLowerCase() === query.trim().toLowerCase()) && (
            <button
              onClick={() => handleSelect(query.trim())}
              className="w-full p-2.5 rounded-xl prism-badge-brand transition-all text-left flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>搜索并深度分析股票 "${query.toUpperCase()}"</span>
            </button>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-surface-subtle border-t border-border-subtle flex items-center justify-between text-[11px] text-content-muted">
          <span>提示：按 <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border-subtle font-mono text-content-primary">Esc</kbd> 退出</span>
          <span className="text-brand font-medium">Ctrl + K 随时唤起</span>
        </div>
      </div>
    </div>
  );
};
