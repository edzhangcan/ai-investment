import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { Calculator, X, DollarSign, CheckCircle2, Sliders, Coins } from 'lucide-react';

interface PortfolioCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
  isPlainTalk?: boolean;
}

interface PositionBreakdownItem {
  symbol: string;
  company_name: string;
  market: string;
  currency: string;
  current_price: number;
  target_weight_pct: number;
  actual_weight_pct: number;
  target_dollar_amount: number;
  actual_allocated_amount: number;
  executable_shares: number;
  is_ca: boolean;
}

interface PortfolioCalculateResponse {
  cash_balance: number;
  currency: string;
  risk_profile: string;
  risk_profile_label: string;
  equity_allocation_pct: number;
  cash_buffer_pct: number;
  max_per_stock_pct: number;
  total_allocated_dollars: number;
  residual_unallocated_cash: number;
  strategy_summary: string;
  position_breakdown: PositionBreakdownItem[];
}

export const PortfolioCalculator: React.FC<PortfolioCalculatorProps> = ({
  isOpen,
  onClose,
  onSelectStock,
  isPlainTalk = false
}) => {
  const { language, t } = useLanguage();
  const [cashBalance, setCashBalance] = useState<number>(50000);
  const [riskProfile, setRiskProfile] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'>('BALANCED');
  const [currency, setCurrency] = useState<'USD' | 'CAD'>('USD');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<PortfolioCalculateResponse | null>(null);

  const calculateSizing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname || '127.0.0.1'}:8000/api/portfolio/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cash_balance: cashBalance,
          risk_profile: riskProfile,
          currency: currency,
          lang: language
        })
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.warn("Portfolio sizing calculation error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculateSizing();
    }
  }, [isOpen, cashBalance, riskProfile, currency, language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-surface border border-border-subtle rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-content-primary transition-colors duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
          <span className="p-3 prism-badge-brand rounded-2xl">
            <Calculator className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-content-primary">
              <BilingualHoverCard termKey="PositionSizing" isPlainTalk={isPlainTalk}>
                {t.calcTitle}
              </BilingualHoverCard>
            </h2>
            <p className="text-xs text-content-muted">
              {t.calcSubtitle}
            </p>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 prism-surface-subtle p-5 shadow-sm">
          {/* Capital Input & Presets */}
          <div>
            <label className="block text-xs font-bold text-content-primary mb-2 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-positive" />
              <span>{t.calcCapitalLabel} ({currency})</span>
            </label>
            <input
              type="number"
              value={cashBalance}
              onChange={(e) => setCashBalance(Math.max(100, Number(e.target.value)))}
              className="w-full bg-surface border border-border-subtle rounded-xl px-3.5 py-2 text-sm font-bold text-positive focus:outline-none focus:border-brand transition-all mb-2 shadow-sm"
            />
            <div className="flex flex-wrap gap-1">
              {[5000, 10000, 25000, 50000, 100000, 250000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setCashBalance(preset)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    cashBalance === preset
                      ? 'prism-badge-positive'
                      : 'bg-surface text-content-secondary border-border-subtle hover:text-content-primary'
                  }`}
                >
                  ${preset / 1000}k
                </button>
              ))}
            </div>
          </div>

          {/* Risk Profile Selector */}
          <div>
            <label className="block text-xs font-bold text-content-primary mb-2 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-brand" />
              <span>{t.calcRiskModelLabel}</span>
            </label>
            <div className="space-y-1.5">
              {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => setRiskProfile(profile)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                    riskProfile === profile
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-surface text-content-secondary border-border-subtle hover:text-content-primary'
                  }`}
                >
                  <span>
                    {profile === 'CONSERVATIVE' && t.calcConservative}
                    {profile === 'BALANCED' && t.calcBalanced}
                    {profile === 'AGGRESSIVE' && t.calcAggressive}
                  </span>
                  <span className="text-[10px] opacity-80 font-mono">
                    {profile === 'CONSERVATIVE' && `${t.calcMaxPerStock} 3%`}
                    {profile === 'BALANCED' && `${t.calcMaxPerStock} 5%`}
                    {profile === 'AGGRESSIVE' && `${t.calcMaxPerStock} 8%`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Currency Selector & Summary Metric */}
          <div>
            <label className="block text-xs font-bold text-content-primary mb-2 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-warning" />
              <span>{t.calcCurrencyLabel}</span>
            </label>
            <div className="flex gap-2 mb-3">
              {(['USD', 'CAD'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    currency === curr
                      ? 'bg-warning text-white border-warning font-extrabold shadow-sm'
                      : 'bg-surface text-content-secondary border-border-subtle hover:text-content-primary'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {data && (
              <div className="bg-surface p-3 rounded-xl border border-border-subtle text-xs shadow-sm">
                <div className="flex justify-between text-content-muted mb-1">
                  <span>{t.calcEquities} ({data.equity_allocation_pct}%):</span>
                  <span className="font-bold text-positive">${data.total_allocated_dollars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-content-muted">
                  <span>{t.calcCashReserve} ({data.cash_buffer_pct}%):</span>
                  <span className="font-bold text-warning">${data.residual_unallocated_cash.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strategy Banner */}
        {data && (
          <div className="prism-surface-subtle p-4 mb-6 text-xs text-content-secondary flex items-start gap-2.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-positive shrink-0 mt-0.5" />
            <div>{data.strategy_summary}</div>
          </div>
        )}

        {/* Position Breakdown Table */}
        {loading ? (
          <div className="p-12 text-center text-content-muted text-xs animate-pulse">
            Calculating optimal share allocations...
          </div>
        ) : data && data.position_breakdown.length > 0 ? (
          <div className="overflow-x-auto border border-border-subtle rounded-2xl mb-6 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle text-content-muted uppercase tracking-wider text-[10px] border-b border-border-subtle">
                <tr>
                  <th className="p-3.5">{t.calcTableAsset}</th>
                  <th className="p-3.5">{t.calcTablePrice}</th>
                  <th className="p-3.5">{t.calcTableWeight}</th>
                  <th className="p-3.5 text-positive font-bold">{t.calcTableShares}</th>
                  <th className="p-3.5 text-right">{t.calcTableDollar}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle bg-surface">
                {data.position_breakdown.map((item) => (
                  <tr key={item.symbol} className="hover:bg-surface-subtle transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span>{item.is_ca ? '🇨🇦' : '🇺🇸'}</span>
                        <div>
                          <span
                            onClick={() => {
                              if (onSelectStock) {
                                onSelectStock(item.symbol);
                                onClose();
                              }
                            }}
                            className="font-bold text-content-primary hover:text-brand cursor-pointer block"
                          >
                            {item.symbol}
                          </span>
                          <span className="text-[10px] text-content-muted truncate max-w-[160px] block">
                            {item.company_name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-content-primary">
                      ${item.current_price} <span className="text-[10px] text-content-muted">{item.currency}</span>
                    </td>
                    <td className="p-3.5 font-mono text-content-secondary">
                      {item.target_weight_pct}%
                    </td>
                    <td className="p-3.5">
                      <span className="prism-badge-positive font-mono text-xs">
                        {item.executable_shares} {t.calcSharesUnit}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-content-primary">
                      ${item.actual_allocated_amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <span className="text-[11px] text-content-muted">
            {t.calcFooterNotice}
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-surface-subtle hover:bg-surface border border-border-subtle text-content-primary font-extrabold rounded-xl text-xs transition-all cursor-pointer"
          >
            {t.calcCloseBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
