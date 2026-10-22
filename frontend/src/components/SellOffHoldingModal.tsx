import React, { useState, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { sellHoldingApi } from '../api/client';

interface SellOffHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
  buyInPrice?: number;
  buyInDate?: string;
  currentPrice: number;
  onSuccess?: () => void;
}

export const SellOffHoldingModal: React.FC<SellOffHoldingModalProps> = ({
  isOpen,
  onClose,
  symbol,
  companyName,
  buyInPrice = 0,
  buyInDate,
  currentPrice,
  onSuccess
}) => {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [sellPrice, setSellPrice] = useState<string>(currentPrice > 0 ? currentPrice.toString() : '');
  const [sellDate, setSellDate] = useState<string>(todayStr);
  const [postBucket, setPostBucket] = useState<'REGULAR' | 'WATCHLIST'>('REGULAR');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic calculations
  const parsedSellPrice = parseFloat(sellPrice) || 0;
  const realizedReturnPct = useMemo(() => {
    if (buyInPrice <= 0 || parsedSellPrice <= 0) return 0;
    return Math.round(((parsedSellPrice - buyInPrice) / buyInPrice) * 10000) / 100;
  }, [buyInPrice, parsedSellPrice]);

  const holdingDays = useMemo(() => {
    if (!buyInDate || !sellDate) return 0;
    try {
      const d1 = new Date(buyInDate);
      const d2 = new Date(sellDate);
      const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    } catch {
      return 0;
    }
  }, [buyInDate, sellDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedSellPrice <= 0) {
      setErrorMsg("Please enter a valid exit price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await sellHoldingApi({
        symbol: symbol.toUpperCase(),
        sell_off_price: parsedSellPrice,
        sell_off_date: sellDate || todayStr,
        post_sell_bucket: postBucket,
        notes: notes || undefined
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Failed to sell holding:", err);
      setErrorMsg(err.message || "Failed to execute sell-off.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPositive = realizedReturnPct >= 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sell-off-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isPositive ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="sell-off-modal-title" className="text-base font-bold text-content-primary">
                {t.sellHoldingTitle}
              </h3>
              <p className="text-xs text-content-muted">
                {symbol} • {companyName}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 text-content-muted hover:text-content-primary rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realized Return Metric Card */}
        <div className="prism-surface-subtle p-3.5 rounded-xl border border-border-subtle mb-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-content-muted font-medium">{t.realizedPnl}</div>
            <div className={`text-xl font-black ${isPositive ? 'text-positive' : 'text-negative'}`}>
              {isPositive ? '+' : ''}{realizedReturnPct.toFixed(2)}%
            </div>
            <div className="text-[10px] text-content-muted">
              {t.buyInPrice}: ${buyInPrice.toFixed(2)} → {t.sellOffPrice}: ${parsedSellPrice.toFixed(2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-content-muted font-medium flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>{t.holdingDuration}</span>
            </div>
            <div className="text-base font-bold text-content-primary">
              {holdingDays} {t.daysUnit}
            </div>
            {buyInDate && (
              <div className="text-[10px] text-content-muted">
                {buyInDate} ~ {sellDate}
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 mb-4 rounded-xl bg-negative/10 border border-negative/20 text-negative text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-brand" />
              <span>{t.sellOffPrice}</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand shadow-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>{t.sellOffDate}</span>
            </label>
            <input
              type="date"
              required
              value={sellDate}
              onChange={(e) => setSellDate(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand shadow-sm"
            />
          </div>

          {/* Destination Selector */}
          <div>
            <label className="block text-xs font-bold text-content-primary mb-1.5">
              {t.postSellDestination}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label 
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  postBucket === 'REGULAR' 
                    ? 'border-brand bg-brand/10 font-bold text-brand' 
                    : 'border-border-subtle bg-surface text-content-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="postBucket"
                  value="REGULAR"
                  checked={postBucket === 'REGULAR'}
                  onChange={() => setPostBucket('REGULAR')}
                  className="hidden"
                />
                <span className="text-sm">🌐</span>
                <span>{t.exitToRegular}</span>
              </label>

              <label 
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2 ${
                  postBucket === 'WATCHLIST' 
                    ? 'border-brand bg-brand/10 font-bold text-brand' 
                    : 'border-border-subtle bg-surface text-content-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="postBucket"
                  value="WATCHLIST"
                  checked={postBucket === 'WATCHLIST'}
                  onChange={() => setPostBucket('WATCHLIST')}
                  className="hidden"
                />
                <span className="text-sm">⭐</span>
                <span>{t.keepOnWatchlist}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-secondary mb-1">
              {t.soulCheckTitle || "Discipline Notes"}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Profit target reached / 200D SMA breach stop-loss"
              className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-content-muted hover:text-content-primary rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-negative text-white hover:bg-negative/90 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? "Processing..." : t.sellOffBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
