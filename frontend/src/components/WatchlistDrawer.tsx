import React, { useState, useEffect } from 'react';
import { 
  Star, X, Trash2, Plus, Bell, ShieldCheck, RefreshCw, 
  Briefcase, TrendingUp, TrendingDown, ShieldAlert, Sparkles, CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { 
  fetchWatchlistApi, 
  deleteWatchlistApi, 
  syncWatchlistTargetsApi, 
  setStockBucketApi, 
  refreshRecommendationsApi 
} from '../api/client';
import { StockTrackingItem, StockBucket } from '../types';
import { BuyInHoldingModal } from './BuyInHoldingModal';
import { SellOffHoldingModal } from './SellOffHoldingModal';

export type WatchlistItem = StockTrackingItem;

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

  const [activeTab, setActiveTab] = useState<'HOLDINGS' | 'WATCHLIST' | 'REGULAR'>('HOLDINGS');
  const [items, setItems] = useState<StockTrackingItem[]>([]);
  const [regularOpportunities, setRegularOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // New stock add form state
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newBucket, setNewBucket] = useState<StockBucket>('WATCHLIST');
  const [newTarget, setNewTarget] = useState('');
  const [newBuyPrice, setNewBuyPrice] = useState('');
  const [newAlloc, setNewAlloc] = useState('3.0');
  const [newShares, setNewShares] = useState('10');

  // Modal states for item actions
  const [activeModalItem, setActiveModalItem] = useState<StockTrackingItem | null>(null);
  const [isBuyInModalOpen, setIsBuyInModalOpen] = useState(false);
  const [isSellOffModalOpen, setIsSellOffModalOpen] = useState(false);

  const fetchTrackedStocks = async () => {
    setLoading(true);
    try {
      const data = await fetchWatchlistApi('ALL');
      setItems(data);
    } catch (e) {
      console.warn("Failed to fetch tracked stocks from API:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await refreshRecommendationsApi("ALL", 0, "en", "US");
      const pool = res?.recommended_stocks || res?.overall_recommended_stocks || res?.recommendations || [];
      if (pool.length > 0) {
        // Filter regular stocks with >= 10% discount to ideal buy zone ceiling
        const opps = pool
          .filter((r: any) => {
            const ceiling = r.key_metrics?.ideal_buy_range_max || r.ideal_buy_range_max || 0;
            const price = r.current_price || 0;
            return ceiling > 0 && price > 0 && price <= (ceiling * 0.90);
          })
          .map((r: any) => {
            const ceiling = r.key_metrics?.ideal_buy_range_max || r.ideal_buy_range_max || 0;
            const price = r.current_price || 0;
            const discountPct = ceiling > 0 ? Math.round(((ceiling - price) / ceiling) * 100) : 10;
            return {
              ...r,
              ideal_buy_range_max: ceiling,
              upside_discount_pct: discountPct
            };
          });
        setRegularOpportunities(opps.slice(0, 8));
      }
    } catch (e) {
      console.debug("Failed to fetch regular opportunities:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrackedStocks();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'REGULAR' && regularOpportunities.length === 0) {
      fetchOpportunities();
    }
  }, [isOpen, activeTab, regularOpportunities.length]);

  const handleSyncTargets = async () => {
    setIsSyncing(true);
    try {
      const updated = await syncWatchlistTargetsApi();
      setItems(updated);
      setSyncNotice(t.syncTargetsSuccess || (t.targetsSynced ? `${t.targetsSynced} (95% Buy Ceiling)` : "Targets updated to 95% Buy Ceiling!"));
      setTimeout(() => setSyncNotice(null), 3000);
      if (onWatchlistChange) onWatchlistChange();
    } catch (e) {
      console.warn("Failed to sync watchlist targets:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol.trim()) return;

    const sym = newSymbol.trim().toUpperCase();
    const payload = {
      symbol: sym,
      company_name: newName.trim() || `${sym} Corp`,
      bucket: newBucket,
      target_buy_price: newTarget ? parseFloat(newTarget) : undefined,
      buy_in_price: newBuyPrice ? parseFloat(newBuyPrice) : undefined,
      shares_held: newBucket === 'HOLDING' ? (parseFloat(newShares) || 10) : undefined,
      portfolio_allocation_pct: newBucket === 'WATCHLIST' ? (parseFloat(newAlloc) || 3.0) : undefined,
    };

    try {
      await setStockBucketApi(payload);
      await fetchTrackedStocks();
      setNewSymbol('');
      setNewName('');
      setNewTarget('');
      setNewBuyPrice('');
      setNewShares('10');
      if (onWatchlistChange) onWatchlistChange();
    } catch (e) {
      console.warn("Failed to add stock tracking item:", e);
    }
  };

  const handleDelete = async (symbol: string) => {
    try {
      await deleteWatchlistApi(symbol);
      setItems(items.filter((i) => i.symbol.toUpperCase() !== symbol.toUpperCase()));
      if (onWatchlistChange) onWatchlistChange();
    } catch (e) {
      console.warn("Failed to delete stock from tracking:", e);
    }
  };

  const holdings = items.filter((it) => it.bucket === 'HOLDING');
  const watchlist = items.filter((it) => it.bucket === 'WATCHLIST' || !it.bucket);

  const portfolioTotalValue = holdings.reduce((sum, h) => {
    if (h.total_value !== undefined && h.total_value !== null) {
      return sum + h.total_value;
    }
    const shares = h.shares_held || 0;
    const price = h.current_price || h.buy_in_price || 0;
    return sum + (shares * price);
  }, 0);

  const portfolioTotalCost = holdings.reduce((sum, h) => {
    if (h.total_cost !== undefined && h.total_cost !== null) {
      return sum + h.total_cost;
    }
    const shares = h.shares_held || 0;
    const costPrice = h.buy_in_price || 0;
    return sum + (shares * costPrice);
  }, 0);

  const portfolioPnlDollar = portfolioTotalValue - portfolioTotalCost;
  const portfolioPnlPct = portfolioTotalCost > 0 ? ((portfolioTotalValue - portfolioTotalCost) / portfolioTotalCost) * 100 : 0;
  const isPortfolioPositive = portfolioPnlDollar >= 0;

  const openSellOffModal = (item: StockTrackingItem) => {
    setActiveModalItem(item);
    setIsSellOffModalOpen(true);
  };

  const openBuyInModal = (item: StockTrackingItem) => {
    setActiveModalItem(item);
    setIsBuyInModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stock-tracker-drawer-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 transition-colors duration-150">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 id="stock-tracker-drawer-title" className="text-base font-bold text-content-primary">
                  {t.watchlistTitle || "Stock Tracker & Alert Hub"}
                </h2>
                <p className="text-[11px] text-content-muted">
                  3-Bucket Architecture • Holdings, Watchlist & Regular
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              aria-label="Close Drawer" 
              className="p-1 text-content-muted hover:text-content-primary cursor-pointer rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-Tab Segmented Switcher */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-surface-subtle border border-border-subtle rounded-xl mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('HOLDINGS')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'HOLDINGS'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t.bucketHolding} ({holdings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('WATCHLIST')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'WATCHLIST'
                  ? 'bg-warning/20 text-warning-dark dark:text-warning border border-warning/30 shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
              <span>{t.bucketWatchlist} ({watchlist.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REGULAR')}
              className={`py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'REGULAR'
                  ? 'bg-surface text-content-primary border border-border-subtle shadow-xs'
                  : 'text-content-muted hover:text-content-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>{t.bucketRegularOpp}</span>
            </button>
          </div>

          {/* Quick Add Form */}
          <form onSubmit={handleAddSubmit} className="prism-surface-subtle p-3.5 rounded-xl border border-border-subtle mb-5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-content-primary">
              <span className="flex items-center gap-1.5 text-brand">
                <Plus className="w-4 h-4" />
                <span>Track New Stock</span>
              </span>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setNewBucket('HOLDING')}
                  className={`px-2 py-0.5 rounded-md ${newBucket === 'HOLDING' ? 'bg-brand text-white' : 'text-content-muted'}`}
                >
                  Holding
                </button>
                <button
                  type="button"
                  onClick={() => setNewBucket('WATCHLIST')}
                  className={`px-2 py-0.5 rounded-md ${newBucket === 'WATCHLIST' ? 'bg-warning/20 text-warning font-bold' : 'text-content-muted'}`}
                >
                  Watchlist
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder={t.tickerPlaceholder || "Ticker (e.g. NVDA)"}
                className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
              />
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t.companyPlaceholder || "Company Name"}
                className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {newBucket === 'HOLDING' ? (
                <>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newBuyPrice}
                    onChange={(e) => setNewBuyPrice(e.target.value)}
                    placeholder="Buy-In Price ($)"
                    className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm font-semibold"
                  />
                  <input
                    type="number"
                    step="1"
                    min="0.001"
                    value={newShares}
                    onChange={(e) => setNewShares(e.target.value)}
                    placeholder="Shares to Buy"
                    className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm font-semibold"
                  />
                </>
              ) : (
                <>
                  <input
                    type="number"
                    step="0.01"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="Target Buy Price ($)"
                    className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={newAlloc}
                    onChange={(e) => setNewAlloc(e.target.value)}
                    placeholder="Alloc % (max 4.0%)"
                    className="bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
                  />
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-1.5 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{newBucket === 'HOLDING' ? t.logHoldingTitle : t.addWatchlistBtn}</span>
            </button>
          </form>

          {/* Sync notification */}
          {syncNotice && (
            <div className="prism-badge-positive p-2 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 mb-3 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{syncNotice}</span>
            </div>
          )}

          {/* TAB 1: HOLDINGS */}
          {activeTab === 'HOLDINGS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Active Holdings ({holdings.length})
                </span>
                <span className="text-[10px] text-content-muted">
                  🛡️ Thesis Falsification Active
                </span>
              </div>

              {/* Portfolio Value Summary Card */}
              {holdings.length > 0 && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-surface to-surface-subtle border border-border-subtle shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-content-muted">
                    <span className="flex items-center gap-1.5 text-content-primary font-bold">
                      <Briefcase className="w-4 h-4 text-brand" />
                      <span>Total Portfolio Value</span>
                    </span>
                    <span className="prism-badge-neutral text-[10px]">
                      {holdings.length} {holdings.length === 1 ? 'Position' : 'Positions'}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <div className="text-2xl font-black tracking-tight text-content-primary">
                      ${portfolioTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 ${
                      isPortfolioPositive 
                        ? 'bg-positive/10 text-positive border border-positive/20' 
                        : 'bg-negative/10 text-negative border border-negative/20'
                    }`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${!isPortfolioPositive ? 'rotate-180' : ''}`} />
                      <span>
                        {isPortfolioPositive ? '+' : ''}${portfolioPnlDollar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPortfolioPositive ? '+' : ''}{portfolioPnlPct.toFixed(2)}%)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-content-muted pt-2 border-t border-border-subtle">
                    <span>Total Cost Basis:</span>
                    <span className="font-semibold text-content-secondary">
                      ${portfolioTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {loading && holdings.length === 0 ? (
                <div className="text-center py-6 text-xs text-content-muted">Loading holdings...</div>
              ) : holdings.length === 0 ? (
                <div className="prism-surface-subtle p-6 text-center text-xs text-content-muted rounded-xl">
                  No active holdings recorded. Buy in from your Watchlist or use the form above to track a real position.
                </div>
              ) : (
                holdings.map((item) => {
                  const stockValue = item.total_value ?? ((item.shares_held || 0) * (item.current_price || item.buy_in_price || 0));
                  const stockCost = item.total_cost ?? ((item.shares_held || 0) * (item.buy_in_price || 0));
                  const pnlDollar = item.unrealized_pnl_dollar ?? (stockValue - stockCost);
                  const pnl = item.unrealized_pnl_pct ?? (stockCost > 0 ? ((stockValue - stockCost) / stockCost) * 100 : 0);
                  const isPositive = pnl >= 0;
                  const allocPct = portfolioTotalValue > 0 ? (stockValue / portfolioTotalValue) * 100 : (item.portfolio_allocation_pct || 0);

                  return (
                    <div
                      key={item.symbol}
                      className="prism-card p-3.5 hover:border-brand transition-all flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface"
                    >
                      {/* Top Row: Symbol, Market, Company & Unrealized Return */}
                      <div className="flex items-start justify-between">
                        <div 
                          className="cursor-pointer"
                          onClick={() => {
                            selectStockHandler(item.symbol);
                            onClose();
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-content-primary hover:text-brand">
                              {item.symbol}
                            </span>
                            <span className="prism-badge-neutral text-[10px]">
                              {item.symbol.endsWith('.TO') ? 'CA' : 'US'}
                            </span>
                          </div>
                          <div className="text-xs text-content-muted">{item.company_name}</div>
                        </div>

                        {/* Realized / Unrealized P&L */}
                        <div className="text-right">
                          <div className={`text-sm font-black ${isPositive ? 'text-positive' : 'text-negative'}`}>
                            {isPositive ? '+' : ''}${pnlDollar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={`text-[11px] font-semibold ${isPositive ? 'text-positive' : 'text-negative'}`}>
                            {isPositive ? '+' : ''}{pnl.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* Position Value and Shares Matrix */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-surface-subtle border border-border-subtle text-xs">
                        <div>
                          <span className="text-[10px] text-content-muted block">Position Value</span>
                          <span className="font-bold text-content-primary">
                            ${stockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-content-muted block">Shares Held</span>
                          <span className="font-semibold text-content-secondary">
                            {item.shares_held != null ? `${item.shares_held} sh` : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-content-muted block">Avg Cost</span>
                          <span className="font-semibold text-content-secondary">
                            ${item.buy_in_price?.toFixed(2) || '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-content-muted block">Current Price</span>
                          <span className="font-semibold text-content-secondary">
                            ${item.current_price?.toFixed(2) || '--'}
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Portfolio Allocation Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-content-muted">Portfolio Allocation</span>
                          <span className="font-bold text-brand">{allocPct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-subtle border border-border-subtle rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, Math.max(0, allocPct))}%` }}
                          />
                        </div>
                      </div>

                      {/* Floor & Action Buttons */}
                      <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border-subtle">
                        <div className="flex items-center gap-1.5 text-content-secondary">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>
                            Floor: ${item.falsification_floor?.toFixed(2) || '--'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openBuyInModal(item)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-lg transition-all cursor-pointer flex items-center gap-1"
                            title="Execute additional buy-in to blend cost basis"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{t.buyInBtn || "Buy In"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openSellOffModal(item)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-negative/10 hover:bg-negative text-negative hover:text-white rounded-lg transition-all cursor-pointer"
                          >
                            {t.sellOffBtn}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: WATCHLIST */}
          {activeTab === 'WATCHLIST' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Watched Candidates ({watchlist.length})
                </span>
                <button
                  type="button"
                  onClick={handleSyncTargets}
                  disabled={isSyncing}
                  className="text-[10px] font-semibold text-brand hover:text-brand-dark transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Re-anchor all targets to 95% of ideal buy ceiling"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync 95% Ceilings"}</span>
                </button>
              </div>

              {loading && watchlist.length === 0 ? (
                <div className="text-center py-6 text-xs text-content-muted">Loading watchlist...</div>
              ) : watchlist.length === 0 ? (
                <div className="prism-surface-subtle p-6 text-center text-xs text-content-muted rounded-xl">
                  No stocks in watchlist yet. Star candidate compounders to receive right-side buy alerts.
                </div>
              ) : (
                watchlist.map((item) => (
                  <div
                    key={item.symbol}
                    className="prism-card p-3.5 hover:border-brand transition-all flex items-center justify-between rounded-xl border border-border-subtle bg-surface group"
                  >
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        selectStockHandler(item.symbol);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-content-primary group-hover:text-brand">
                          {item.symbol}
                        </span>
                        <span className="prism-badge-neutral text-[10px]">
                          {item.symbol.endsWith('.TO') ? 'CA' : 'US'}
                        </span>
                        {item.batting_zone === 'RIGHT_SIDE' && (
                          <span className="text-[10px] text-positive font-bold flex items-center gap-0.5">
                            🎯 右侧
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-content-muted">{item.company_name}</div>
                      <div className="flex items-center gap-3 text-[11px] mt-1">
                        <span className="text-positive flex items-center gap-1 font-semibold">
                          <Bell className="w-3 h-3 text-warning" />
                          Target: ${item.target_buy_price || '--'}
                        </span>
                        <span className="text-content-muted">
                          Curr: ${item.current_price?.toFixed(2) || '--'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openBuyInModal(item)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-brand/10 hover:bg-brand text-brand hover:text-white rounded-lg transition-all cursor-pointer"
                        title="Execute buy-in and promote to Holding"
                      >
                        {t.buyInBtn}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.symbol)}
                        aria-label={`Remove ${item.symbol}`}
                        className="p-1.5 text-content-muted hover:text-negative transition-colors rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: REGULAR OPPORTUNITIES */}
          {activeTab === 'REGULAR' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Deep Value Discoveries (P ≤ 90% Ceiling)
                </span>
                <span className="text-[10px] text-sky-500 font-bold">
                  💎 10%+ Discount
                </span>
              </div>

              {regularOpportunities.length === 0 ? (
                <div className="prism-surface-subtle p-6 text-center text-xs text-content-muted rounded-xl">
                  Scanning North American universe for deep value setups with right-side momentum...
                </div>
              ) : (
                regularOpportunities.map((opp) => (
                  <div
                    key={opp.symbol}
                    className="prism-card p-3.5 hover:border-brand transition-all flex items-center justify-between rounded-xl border border-border-subtle bg-surface"
                  >
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => {
                        selectStockHandler(opp.symbol);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-sm text-content-primary hover:text-brand">
                          {opp.symbol}
                        </span>
                        <span className="prism-badge-neutral text-[10px]">
                          {opp.symbol.endsWith('.TO') ? 'CA' : 'US'}
                        </span>
                        <span className="text-[10px] text-sky-500 font-bold">
                          -{opp.upside_discount_pct || 12}% below ceiling
                        </span>
                      </div>
                      <div className="text-xs text-content-muted">{opp.company_name}</div>
                      <div className="text-[11px] text-content-muted mt-1">
                        Price: ${opp.current_price?.toFixed(2) || opp.current_price} • Buy Max: ${opp.ideal_buy_range_max || '--'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={async () => {
                          await setStockBucketApi({
                            symbol: opp.symbol,
                            company_name: opp.company_name,
                            bucket: 'WATCHLIST'
                          });
                          await fetchTrackedStocks();
                          setActiveTab('WATCHLIST');
                        }}
                        className="px-2 py-1 text-[11px] font-bold bg-warning/15 text-warning-dark dark:text-warning hover:bg-warning hover:text-white rounded-lg transition-all cursor-pointer"
                      >
                        + Watchlist
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-border-subtle text-[11px] text-content-muted flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-positive" />
            <span>{t.dbStorageNotice}</span>
          </div>
          <span className="text-[10px] font-semibold text-content-muted">
            PL-721 Active
          </span>
        </div>
      </div>

      {/* Global Modals for Item Actions */}
      {activeModalItem && (
        <>
          <BuyInHoldingModal
            isOpen={isBuyInModalOpen}
            onClose={() => setIsBuyInModalOpen(false)}
            symbol={activeModalItem.symbol}
            companyName={activeModalItem.company_name}
            currentPrice={activeModalItem.current_price || activeModalItem.target_buy_price || 0}
            existingShares={activeModalItem.bucket === 'HOLDING' ? activeModalItem.shares_held : undefined}
            existingBuyInPrice={activeModalItem.bucket === 'HOLDING' ? activeModalItem.buy_in_price : undefined}
            onSuccess={() => {
              fetchTrackedStocks();
              setActiveTab('HOLDINGS');
              if (onWatchlistChange) onWatchlistChange();
            }}
          />

          <SellOffHoldingModal
            isOpen={isSellOffModalOpen}
            onClose={() => setIsSellOffModalOpen(false)}
            symbol={activeModalItem.symbol}
            companyName={activeModalItem.company_name}
            buyInPrice={activeModalItem.buy_in_price}
            buyInDate={activeModalItem.buy_in_date}
            currentPrice={activeModalItem.current_price || 0}
            onSuccess={() => {
              fetchTrackedStocks();
              if (onWatchlistChange) onWatchlistChange();
            }}
          />
        </>
      )}
    </div>
  );
};
