import React, { useState } from 'react';
import { X, Briefcase, Calendar, DollarSign, ShieldAlert, Check, Layers, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { setStockBucketApi } from '../api/client';
import { StockTrackingItem } from '../types';

interface BuyInHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  companyName: string;
  currentPrice: number;
  existingShares?: number;
  existingBuyInPrice?: number;
  onSuccess?: (item: StockTrackingItem) => void;
}

export const BuyInHoldingModal: React.FC<BuyInHoldingModalProps> = ({
  isOpen,
  onClose,
  symbol,
  companyName,
  currentPrice,
  existingShares,
  existingBuyInPrice,
  onSuccess
}) => {
  const { t } = useLanguage();
  const todayStr = new Date().toISOString().split('T')[0];

  const isAdditionalBuy = existingShares !== undefined && existingShares > 0;

  const [buyPrice, setBuyPrice] = useState<string>(currentPrice > 0 ? currentPrice.toString() : '');
  const [buyDate, setBuyDate] = useState<string>(todayStr);
  const [shares, setShares] = useState<string>('10');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const priceNum = parseFloat(buyPrice) || 0;
  const sharesNum = parseFloat(shares) || 0;
  const transactionTotal = priceNum * sharesNum;

  // Blended calculations if adding to existing position
  const prevShares = existingShares || 0;
  const prevPrice = existingBuyInPrice || 0;
  const prevCost = prevShares * prevPrice;
  const newTotalShares = prevShares + sharesNum;
  const newTotalCost = prevCost + transactionTotal;
  const blendedAvgPrice = newTotalShares > 0 ? newTotalCost / newTotalShares : priceNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (priceNum <= 0) {
      setErrorMsg("Please enter a valid buy-in price.");
      return;
    }
    if (sharesNum <= 0) {
      setErrorMsg("Please specify the number of shares to buy.");
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
        shares_held: sharesNum,
        is_additional_buy: isAdditionalBuy
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
                {isAdditionalBuy ? "Additional Buy-In (Scale-In)" : t.logHoldingTitle}
              </h3>
              <p className="text-xs text-content-muted">
                {symbol} • {companyName}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 text-content-muted hover:text-content-primary rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Position Card if Additional Buy */}
        {isAdditionalBuy && (
          <div className="p-3 mb-4 rounded-xl bg-surface-subtle border border-border-subtle flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand shrink-0" />
              <div>
                <span className="font-semibold text-content-primary">Current Position:</span>
                <span className="text-content-secondary ml-1">{prevShares} shares @ ${prevPrice.toFixed(2)}</span>
              </div>
            </div>
            <span className="font-bold text-brand">
              ${(prevShares * (currentPrice || prevPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-brand" />
                <span>{isAdditionalBuy ? "Buy Price ($)" : t.buyInPrice}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand shadow-sm font-semibold"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand" />
                <span>{isAdditionalBuy ? "Additional Shares to Buy" : "Number of Shares to Buy"}</span>
              </span>
              {transactionTotal > 0 && (
                <span className="text-[11px] text-content-muted">
                  Outlay: ${transactionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </label>
            <input
              type="number"
              step="1"
              min="0.001"
              required
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="e.g. 50"
              className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-brand shadow-sm font-bold"
            />
          </div>

          {/* Live Position Impact Preview */}
          <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs space-y-1.5">
            <div className="flex items-center justify-between text-content-secondary">
              <span>Transaction Value:</span>
              <span className="font-bold text-content-primary">
                ${transactionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {isAdditionalBuy && (
              <>
                <div className="flex items-center justify-between text-content-secondary">
                  <span>Resulting Total Shares:</span>
                  <span className="font-bold text-brand">
                    {newTotalShares} shares (+{sharesNum})
                  </span>
                </div>
                <div className="flex items-center justify-between text-content-secondary">
                  <span>Blended Cost Basis:</span>
                  <span className="font-bold text-content-primary">
                    ${blendedAvgPrice.toFixed(2)} / share
                  </span>
                </div>
              </>
            )}
            {!isAdditionalBuy && (
              <div className="flex items-center justify-between text-content-secondary">
                <span>Initial Position Value:</span>
                <span className="font-bold text-brand">
                  ${transactionTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-content-muted hover:text-content-primary rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || sharesNum <= 0 || priceNum <= 0}
              className="px-5 py-2 text-xs font-bold bg-brand text-white hover:bg-brand/90 rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer transition-all"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Saving..."
                  : isAdditionalBuy
                  ? `Confirm Buy-In (+${sharesNum} sh)`
                  : t.logHoldingTitle}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
