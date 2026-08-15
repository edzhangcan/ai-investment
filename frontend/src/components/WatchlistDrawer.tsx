import React, { useState, useEffect } from 'react';
import { Star, X, Trash2, Plus, Bell, TrendingUp, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { fetchWatchlistApi, addWatchlistApi, deleteWatchlistApi } from '../api/client';

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
      const data = await fetchWatchlistApi();
      setItems(data);
    } catch (e) {
      console.warn("Failed to fetch watchlist from API:", e);
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
      await addWatchlistApi(payload);
      fetchWatchlist();
      setNewSymbol('');
      setNewName('');
      setNewTarget('');
      if (onWatchlistChange) onWatchlistChange();
    } catch (e) {
      console.warn("Failed to add item to watchlist API:", e);
    }
  };

  const handleDelete = async (symbol: string) => {
    try {
      await deleteWatchlistApi(symbol);
      setItems(items.filter((i) => i.symbol.toUpperCase() !== symbol.toUpperCase()));
      if (onWatchlistChange) onWatchlistChange();
    } catch (e) {
      console.warn("Failed to delete item from watchlist API:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto transition-colors duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.watchlistTitle}
              </h2>
            </div>
            <button onClick={onClose} aria-label="Close Watchlist Drawer" className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 mb-6 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>{t.addFocusAndAlert}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder={t.tickerPlaceholder}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-sm"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.companyPlaceholder}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-sm"
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
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-sm"
                />
              </div>
              <input
                type="number"
                step="0.5"
                value={newAlloc}
                onChange={(e) => setNewAlloc(e.target.value)}
                placeholder={t.allocPlaceholder}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-sky-500 dark:bg-emerald-500 hover:bg-sky-600 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs py-2 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              {t.addWatchlistBtn}
            </button>
          </form>

          {/* Watchlist Item Cards */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {t.starredItems} ({items.length})
            </div>

            {items.map((item) => (
              <div
                key={item.symbol}
                className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 hover:border-sky-400 dark:hover:border-emerald-500/40 rounded-2xl p-4 transition-all flex items-center justify-between group shadow-sm"
              >
                <div
                  onClick={() => {
                    onSelectTicker(item.symbol);
                    onClose();
                  }}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.symbol.endsWith('.TO') ? 'CA' : 'US'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.company_name}</div>
                  <div className="flex items-center gap-3 text-[11px]">
                    {item.target_buy_price && (
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <Bell className="w-3 h-3 text-amber-500" />
                        {t.targetPrice}: ${item.target_buy_price}
                      </span>
                    )}
                    <span className="text-indigo-700 dark:text-indigo-300 font-semibold">
                      {t.suggestedAlloc}: {item.portfolio_allocation_pct}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(item.symbol)}
                  aria-label={`Delete ${item.symbol}`}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t.dbStorageNotice}</span>
        </div>
      </div>
    </div>
  );
};
