import React, { useState } from 'react';
import { X, Briefcase, Calendar, DollarSign, ShieldAlert, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { setStockBucketApi } from '../api/client';
import { StockTrackingItem } from '../types';

interface BuyInHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
  currentPrice: number;
  initialAllocation?: number;
  onSuccess?: (item: StockTrackingItem) => void;
}

export const BuyInHoldingModal: React.FC<BuyInHoldingModalProps> = ({
  isOpen,
  onClose,
  symbol,
  companyName,
  currentPrice,
  initialAllocation = 3.0,
  onSuccess
}) => {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const [buyPrice, setBuyPrice] = useState<string>(currentPrice > 0 ? currentPrice.toString() : '');
  const [buyDate, setBuyDate] = useState<string>(todayStr);
  const [allocation, setAllocation] = useState<string>(initialAllocation.toString());
  const [shares, setShares] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(buyPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("Please enter a valid buy-in price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await setStockBucketApi({
        symbol: symbol.toUpperCase(),
        company_name: companyName,
        bucket: 'HOLDING',
        buy_in_price: priceNum,
        buy_in_date: buyDate || todayStr,
        portfolio_allocation_pct: parseFloat(allocation) || 3.0,
        shares_held: shares ? parseFloat(shares) : undefined
      });
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error("Failed to log position as holding:", err);
      setErrorMsg(err.message || "Failed to save holding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm animate-fade-in p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-in-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand/10 text-brand">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h3 id="buy-in-modal-title" className="text-base font-bold text-content-primary">
                {t.logHoldingTitle}
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

        {/* Informative Discipline Callout */}
        <div className="p-3 mb-4 rounded-xl bg-brand/5 border border-brand/20 text-xs text-content-secondary flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <span>{t.logHoldingSubtitle}</span>
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
              <span>{t.buyInPrice}</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand shadow-sm"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>{t.buyInDate}</span>
            </label>
            <input
              type="date"
              required
              value={buyDate}
              onChange={(e) => setBuyDate(e.target.value)}
              className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                {t.suggestedAlloc} (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="4.0"
                value={allocation}
                onChange={(e) => setAllocation(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
              />
              <span className="text-[10px] text-content-muted mt-0.5 block">Max 4.0% finite bet</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-secondary mb-1">
                {t.calcTableShares || "Shares"}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="Optional"
                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-brand shadow-sm"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold bg-brand text-white hover:bg-brand/90 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : t.logHoldingTitle}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
