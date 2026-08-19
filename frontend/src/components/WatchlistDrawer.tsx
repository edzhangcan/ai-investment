import React, { useState, useEffect } from 'react';
import { Star, X, Trash2, Plus, Bell, ShieldCheck } from 'lucide-react';
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
  onSelectTicker?: (symbol: string) => void;
  onSelectStock?: (symbol: string) => void;
  onWatchlistChange?: () => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTicker,
  onSelectStock,
  onWatchlistChange,
}) => {
  const { t } = useLanguage();
  const selectStockHandler = onSelectStock || onSelectTicker || (() => {});
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
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="watchlist-drawer-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 transition-colors duration-150">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <Star className="w-5 h-5 text-warning fill-warning" />
              <h2 id="watchlist-drawer-title" className="text-base font-bold text-content-primary">
                {t.watchlistTitle}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Close Watchlist Drawer" 
              className="p-1 text-content-muted hover:text-content-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Item Form */}
          <form onSubmit={handleAdd} className="prism-surface-subtle p-4 mb-6 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-positive flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>{t.addFocusAndAlert}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder={t.tickerPlaceholder}
                aria-label={t.tickerPlaceholder}
                className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand shadow-sm"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.companyPlaceholder}
                aria-label={t.companyPlaceholder}
                className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand shadow-sm"
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
                  aria-label={t.targetPricePlaceholder}
                  className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand shadow-sm"
                />
              </div>
              <input
                type="number"
                step="0.5"
                value={newAlloc}
                onChange={(e) => setNewAlloc(e.target.value)}
                placeholder={t.allocPlaceholder}
                aria-label={t.suggestedAlloc}
                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-brand text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addWatchlistBtn}</span>
            </button>
          </form>

          {/* Watchlist List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider">
              {t.starredItems} ({items.length})
            </h3>
            {loading && items.length === 0 ? (
              <div className="text-center py-6 text-xs text-content-muted">Loading...</div>
            ) : items.length === 0 ? (
              <div className="prism-surface-subtle p-6 text-center text-xs text-content-muted">
                No items starred yet.
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.symbol}
                  className="prism-card p-3.5 flex items-center justify-between hover:border-brand transition-all group"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${item.symbol} (${item.company_name})`}
                    onClick={() => {
                      selectStockHandler(item.symbol);
                      onClose();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectStockHandler(item.symbol);
                        onClose();
                      }
                    }}
                    className="cursor-pointer flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg p-1"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-content-primary group-hover:text-brand transition-colors">
                        {item.symbol}
                      </span>
                      <span className="prism-badge-neutral text-[10px]">
                        {item.symbol.endsWith('.TO') ? 'CA' : 'US'}
                      </span>
                    </div>
                    <div className="text-xs text-content-muted mb-1">{item.company_name}</div>
                    <div className="flex items-center gap-3 text-[11px]">
                      {item.target_buy_price && (
                        <span className="text-positive flex items-center gap-1 font-semibold">
                          <Bell className="w-3 h-3 text-warning" />
                          {t.targetPrice}: ${item.target_buy_price}
                        </span>
                      )}
                      <span className="text-brand font-semibold">
                        {t.suggestedAlloc}: {item.portfolio_allocation_pct}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.symbol)}
                    aria-label={`Delete ${item.symbol} from Watchlist`}
                    className="p-2 text-content-muted hover:text-negative transition-colors opacity-80 group-hover:opacity-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-negative rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] text-content-muted flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-positive" />
          <span>{t.dbStorageNotice}</span>
        </div>
      </div>
    </div>
  );
};
