import React, { useState, useEffect } from 'react';
import { Star, X, Trash2, Plus, Bell, TrendingUp, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface WatchlistItem {
  id?: number;
  symbol: string;
  company_name: string;
  target_buy_price?: number;
  portfolio_allocation_pct: number;
}

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicker: (symbol: string) => void;
  onWatchlistChange?: () => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
  onWatchlistChange,
}) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newAlloc, setNewAlloc] = useState('3.0');

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/watchlist');
      if (res.ok) {
        const json = await res.json();
        setItems(json);
      }
    } catch (e) {
      // Fallback mock watchlist items if API server offline
      setItems([
        { id: 1, symbol: 'NVDA', company_name: 'NVIDIA Corporation', target_buy_price: 108.5, portfolio_allocation_pct: 5.0 },
        { id: 2, symbol: 'SHOP.TO', company_name: 'Shopify Inc.', target_buy_price: 94.6, portfolio_allocation_pct: 3.5 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWatchlist();
    }
  }, [isOpen]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    const payload = {
      symbol: newSymbol.trim().toUpperCase(),
      company_name: newName.trim() || `${newSymbol.trim().toUpperCase()} Corp`,
      target_buy_price: newTarget ? parseFloat(newTarget) : undefined,
      portfolio_allocation_pct: parseFloat(newAlloc) || 0.0,
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchWatchlist();
        setNewSymbol('');
        setNewName('');
        setNewTarget('');
        if (onWatchlistChange) onWatchlistChange();
      }
    } catch (e) {
      setItems([...items, { ...payload, id: Date.now() }]);
      setNewSymbol('');
      setNewName('');
      setNewTarget('');
      if (onWatchlistChange) onWatchlistChange();
    }
  };

  const handleDelete = async (symbol: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/watchlist/${symbol}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.symbol !== symbol));
      if (onWatchlistChange) onWatchlistChange();
    } catch (e) {
      setItems(items.filter((i) => i.symbol !== symbol));
      if (onWatchlistChange) onWatchlistChange();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-base font-bold text-slate-100">
                {t.watchlistTitle}
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close Watchlist Drawer" className="p-1 text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAdd} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-6 space-y-3">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>{t.addFocusAndAlert}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder={t.tickerPlaceholder}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.companyPlaceholder}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder={t.targetPricePlaceholder}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <input
                type="number"
                step="0.5"
                value={newAlloc}
                onChange={(e) => setNewAlloc(e.target.value)}
                placeholder={t.allocPlaceholder}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              {t.addWatchlistBtn}
            </button>
          </form>

          {/* Watchlist Item Cards */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.starredItems} ({items.length})
            </div>

            {items.map((item) => (
              <div
                key={item.symbol}
                className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all flex items-center justify-between group"
              >
                <div
                  onClick={() => {
                    onSelectTicker(item.symbol);
                    onClose();
                  }}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.symbol.endsWith('.TO') ? 'CA' : 'US'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{item.company_name}</div>
                  <div className="flex items-center gap-3 text-[11px]">
                    {item.target_buy_price && (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <Bell className="w-3 h-3 text-amber-400" />
                        {t.targetPrice}: ${item.target_buy_price}
                      </span>
                    )}
                    <span className="text-indigo-300 font-semibold">
                      {t.suggestedAlloc}: {item.portfolio_allocation_pct}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.symbol)}
                  aria-label={`Delete ${item.symbol}`}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t.dbStorageNotice}</span>
        </div>
      </div>
    </div>
  );
};
