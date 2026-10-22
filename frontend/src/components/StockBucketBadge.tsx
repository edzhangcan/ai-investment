import React, { useState } from 'react';
import { Star, Briefcase, Globe } from 'lucide-react';
import { StockBucket } from '../types';
import { setStockBucketApi } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { BuyInHoldingModal } from './BuyInHoldingModal';
import { SellOffHoldingModal } from './SellOffHoldingModal';

interface StockBucketBadgeProps {
  symbol: string;
  companyName: string;
  currentBucket: StockBucket;
  currentPrice: number;
  buyInPrice?: number;
  buyInDate?: string;
  sharesHeld?: number;
  onBucketChange?: (newBucket: StockBucket) => void;
  className?: string;
}

export const StockBucketBadge: React.FC<StockBucketBadgeProps> = ({
  symbol,
  companyName,
  currentBucket = 'REGULAR',
  currentPrice,
  buyInPrice,
  buyInDate,
  sharesHeld,
  onBucketChange,
  className = ''
}) => {
  const { t } = useLanguage();
  const [isBuyInOpen, setIsBuyInOpen] = useState(false);
  const [isSellOffOpen, setIsSellOffOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSelect = async (targetBucket: StockBucket) => {
    if (isPending) return;

    // Case 1: Switching to HOLDING or adding to active HOLDING
    if (targetBucket === 'HOLDING') {
      setIsBuyInOpen(true);
      return;
    }

    if (targetBucket === currentBucket) return;

    // Case 2: Switching away from an active HOLDING requires executing disciplined sell-off
    if (currentBucket === 'HOLDING') {
      setIsSellOffOpen(true);
      return;
    }

    // Case 3: Transition between REGULAR and WATCHLIST
    setIsPending(true);
    try {
      await setStockBucketApi({
        symbol: symbol.toUpperCase(),
        company_name: companyName,
        bucket: targetBucket
      });
      if (onBucketChange) onBucketChange(targetBucket);
    } catch (err) {
      console.error('Failed to change stock bucket:', err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div 
        className={`inline-flex items-center p-0.5 rounded-xl border border-border-subtle bg-surface-subtle shadow-sm ${className}`}
        role="group"
        aria-label="Stock Bucket Status Selector"
      >
        {/* 1. REGULAR */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleSelect('REGULAR')}
          className={`h-7 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
            currentBucket === 'REGULAR'
              ? 'bg-surface text-content-primary shadow-xs font-bold border border-border-subtle'
              : 'text-content-muted hover:text-content-primary'
          }`}
          title="Regular Universe Candidate"
        >
          <Globe className="w-3.5 h-3.5 shrink-0 opacity-80" />
          <span>{t.bucketRegular}</span>
        </button>

        {/* 2. WATCHLIST */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleSelect('WATCHLIST')}
          className={`h-7 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
            currentBucket === 'WATCHLIST'
              ? 'bg-warning/15 text-warning-dark dark:text-warning shadow-xs font-bold border border-warning/30'
              : 'text-content-muted hover:text-content-primary'
          }`}
          title="Monitored in Watchlist (95% Buy Ceiling)"
        >
          <Star className={`w-3.5 h-3.5 shrink-0 ${currentBucket === 'WATCHLIST' ? 'fill-warning text-warning' : ''}`} />
          <span>{t.bucketWatchlist}</span>
        </button>

        {/* 3. HOLDING */}
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleSelect('HOLDING')}
          className={`h-7 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
            currentBucket === 'HOLDING'
              ? 'bg-brand text-white shadow-xs font-bold border border-brand hover:brightness-105'
              : 'text-content-muted hover:text-content-primary'
          }`}
          title={currentBucket === 'HOLDING' ? "Owned Portfolio Holding • Click to buy more shares" : "Owned Portfolio Holding (Falsification Floor Active)"}
        >
          <Briefcase className="w-3.5 h-3.5 shrink-0" />
          <span>{t.bucketHolding}</span>
        </button>
      </div>

      {/* Buy-In Modal */}
      <BuyInHoldingModal
        isOpen={isBuyInOpen}
        onClose={() => setIsBuyInOpen(false)}
        symbol={symbol}
        companyName={companyName}
        currentPrice={currentPrice}
        existingShares={currentBucket === 'HOLDING' ? sharesHeld : undefined}
        existingBuyInPrice={currentBucket === 'HOLDING' ? buyInPrice : undefined}
        onSuccess={() => {
          if (onBucketChange) onBucketChange('HOLDING');
        }}
      />

      {/* Sell-Off Modal */}
      <SellOffHoldingModal
        isOpen={isSellOffOpen}
        onClose={() => setIsSellOffOpen(false)}
        symbol={symbol}
        companyName={companyName}
        buyInPrice={buyInPrice}
        buyInDate={buyInDate}
        currentPrice={currentPrice}
        onSuccess={() => {
          if (onBucketChange) onBucketChange('REGULAR');
        }}
      />
    </>
  );
};
