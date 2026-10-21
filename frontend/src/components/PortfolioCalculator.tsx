import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import {
  Calculator,
  X,
  DollarSign,
  CheckCircle2,
  Sliders,
  Coins,
  ShieldAlert,
  TrendingUp,
  Activity,
  Layers,
  Scale,
  AlertTriangle
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  KellyResult,
  EfficientFrontierResponse,
  LiabilityStressResponse,
  PositionBreakdownItem,
  PortfolioCalculateResponse,
  DataProvenance
} from '../types';

interface PortfolioCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock?: (symbol: string) => void;
}

export const PortfolioCalculator: React.FC<PortfolioCalculatorProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const { language, t } = useLanguage();

  // Navigation tab: 'sizing' | 'kelly' | 'frontier' | 'liability'
  const [activeTab, setActiveTab] = useState<'sizing' | 'kelly' | 'frontier' | 'liability'>('sizing');

  // Tab 1: Sizing state
  const [cashBalance, setCashBalance] = useState<number>(50000);
  const [riskProfile, setRiskProfile] = useState<'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE' | 'BARBELL_80_20'>('BARBELL_80_20');
  const [currency, setCurrency] = useState<'USD' | 'CAD'>('USD');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<PortfolioCalculateResponse | null>(null);

  // Tab 2: Kelly Sizer state
  const [winProb, setWinProb] = useState<number>(0.55);
  const [upsidePct, setUpsidePct] = useState<number>(25.0);
  const [stopLossPct, setStopLossPct] = useState<number>(8.0);
  const [sameSectorCount, setSameSectorCount] = useState<number>(0);
  const [kellyResult, setKellyResult] = useState<KellyResult | null>(null);

  // Tab 3: Frontier state
  const [frontierData, setFrontierData] = useState<EfficientFrontierResponse | null>(null);
  const [frontierLoading, setFrontierLoading] = useState<boolean>(false);
  const [corrPeriod, setCorrPeriod] = useState<'3y' | '60d'>('3y');

  // Tab 4: Liability Stress state
  const [liabilityCapital, setLiabilityCapital] = useState<number>(100000);
  const [estDrawdownPct, setEstDrawdownPct] = useState<number>(25.0);
  const [monthlyExpense, setMonthlyExpense] = useState<number>(4000);
  const [annualPassive, setAnnualPassive] = useState<number>(12000);
  const [stressResult, setStressResult] = useState<LiabilityStressResponse | null>(null);

  // API Host helper
  const apiBase = `http://${window.location.hostname || '127.0.0.1'}:8000`;

  // Fetch Position Sizing
  const calculateSizing = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/portfolio/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cash_balance: cashBalance,
          risk_profile: riskProfile,
          currency: currency,
          base_currency: currency,
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

  // Fetch Kelly Size
  const calculateKelly = async () => {
    try {
      const res = await fetch(`${apiBase}/api/portfolio/kelly-size`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          win_prob: winProb,
          upside_pct: upsidePct,
          stop_loss_pct: stopLossPct,
          kelly_fraction: 0.25,
          max_cap_pct: 4.0,
          conviction_score: Math.round(winProb * 100),
          same_sector_count: sameSectorCount
        })
      });
      if (res.ok) {
        const json = await res.json();
        setKellyResult(json);
      }
    } catch (e) {
      console.warn("Kelly size error:", e);
    }
  };

  // Fetch Efficient Frontier
  const fetchFrontier = async () => {
    if (frontierData) return;
    setFrontierLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/portfolio/efficient-frontier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbols: ["SPY", "QQQ", "GLD", "TLT", "NVDA", "MSFT"],
          lookback_days: 756
        })
      });
      if (res.ok) {
        const json = await res.json();
        setFrontierData(json);
      }
    } catch (e) {
      console.warn("Efficient frontier fetch error:", e);
    } finally {
      setFrontierLoading(false);
    }
  };

  // Fetch Liability Stress
  const calculateStress = async () => {
    try {
      const res = await fetch(`${apiBase}/api/portfolio/liability-stress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_capital: liabilityCapital,
          est_max_drawdown_pct: estDrawdownPct,
          monthly_living_expense: monthlyExpense,
          annual_passive_income: annualPassive
        })
      });
      if (res.ok) {
        const json = await res.json();
        setStressResult(json);
      }
    } catch (e) {
      console.warn("Liability stress error:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      calculateSizing();
      calculateKelly();
      calculateStress();
    }
  }, [isOpen, cashBalance, riskProfile, currency, language]);

  useEffect(() => {
    if (isOpen && activeTab === 'frontier' && !frontierData) {
      fetchFrontier();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    calculateKelly();
  }, [winProb, upsidePct, stopLossPct, sameSectorCount]);

  useEffect(() => {
    calculateStress();
  }, [liabilityCapital, estDrawdownPct, monthlyExpense, annualPassive]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portfolio-calc-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-content-primary z-10 transition-colors duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Position Sizing Calculator"
          className="absolute right-6 top-6 p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
          <span className="p-3 prism-badge-brand rounded-2xl">
            <Calculator className="w-6 h-6" />
          </span>
          <div>
            <h2 id="portfolio-calc-title" className="text-xl md:text-2xl font-extrabold text-content-primary">
              <BilingualHoverCard termKey="PositionSizing">
                {t.calcTitle}
              </BilingualHoverCard>
            </h2>
            <p className="text-xs text-content-muted">
              {t.calcSubtitle}
            </p>
          </div>
        </div>

        {/* Multi-Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border-subtle pb-3">
          <button
            onClick={() => setActiveTab('sizing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sizing'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabPositionSizing}</span>
          </button>
          <button
            onClick={() => setActiveTab('kelly')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'kelly'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{t.tabKellySizer}</span>
          </button>
          <button
            onClick={() => setActiveTab('frontier')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'frontier'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.tabFrontier}</span>
          </button>
          <button
            onClick={() => setActiveTab('liability')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'liability'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{t.tabLiabilityStress}</span>
          </button>
        </div>

        {/* TAB 1: SIZING */}
        {activeTab === 'sizing' && (
          <div>
            {/* Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 prism-surface-subtle p-5 shadow-sm rounded-2xl">
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
                  {(['BARBELL_80_20', 'CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as const).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setRiskProfile(profile)}
                      className={`w-full h-8 px-2.5 rounded-xl text-xs font-bold border transition-all inline-flex items-center justify-between cursor-pointer box-border ${
                        riskProfile === profile
                          ? 'bg-brand text-white border-brand shadow-sm'
                          : 'bg-surface text-content-secondary border-border-subtle hover:text-content-primary'
                      }`}
                    >
                      <span className="truncate mr-1">
                        {profile === 'BARBELL_80_20' && (language === 'zh' ? '⚖️ 80/20 哑铃配置' : '⚖️ Barbell 80/20')}
                        {profile === 'CONSERVATIVE' && t.calcConservative}
                        {profile === 'BALANCED' && t.calcBalanced}
                        {profile === 'AGGRESSIVE' && t.calcAggressive}
                      </span>
                      <span className="text-[10px] opacity-80 font-mono shrink-0">
                        {profile === 'BARBELL_80_20' ? '2%–4% Cap' : profile === 'CONSERVATIVE' ? '3% Max' : profile === 'BALANCED' ? '5% Max' : '8% Max'}
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
                      className={`flex-1 h-8 rounded-xl text-xs font-bold border transition-all inline-flex items-center justify-center cursor-pointer box-border ${
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
                    {data.is_barbell ? (
                      <>
                        <div className="flex justify-between text-content-muted mb-1">
                          <span>{language === 'zh' ? '核心底仓 SAA (80%)' : 'Core SAA (80%):'}</span>
                          <span className="font-bold text-brand">${(data.cash_balance * 0.8).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-content-muted">
                          <span>{language === 'zh' ? '卫星进攻 TAA (20%)' : 'Satellite TAA (20%):'}</span>
                          <span className="font-bold text-positive">${(data.cash_balance * 0.2).toLocaleString()}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-content-muted mb-1">
                          <span>{t.calcEquities} ({data.equity_allocation_pct}%):</span>
                          <span className="font-bold text-positive">${data.total_allocated_dollars.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-content-muted">
                          <span>{t.calcCashReserve} ({data.cash_buffer_pct}%):</span>
                          <span className="font-bold text-warning">${data.residual_unallocated_cash.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Strategy Banner */}
            {data && (
              <div className="prism-surface-subtle p-4 mb-6 text-xs text-content-secondary flex items-start gap-2.5 shadow-sm rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-positive shrink-0 mt-0.5" />
                <div>{data.strategy_summary}</div>
              </div>
            )}

            {/* Position Breakdown Table */}
            {loading ? (
              <div className="p-12 text-center text-content-muted text-xs">
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
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.allocation_tier === 'CORE_SAA'
                                ? 'prism-badge-brand'
                                : 'prism-badge-neutral'
                            }`}>
                              {item.allocation_tier === 'CORE_SAA' ? 'CORE' : item.is_ca ? 'CA' : 'US'}
                            </span>
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
          </div>
        )}

        {/* TAB 2: KELLY SIZER */}
        {activeTab === 'kelly' && (
          <div className="space-y-6">
            <div className="prism-surface-subtle p-5 rounded-2xl shadow-sm border border-border-subtle">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-content-primary">
                  {language === 'zh' ? '四分之一凯利有限下注模型 (2%–4% Finite Bet)' : 'Quarter-Kelly Finite Bet Sizer'}
                </h3>
              </div>
              <p className="text-xs text-content-muted mb-4">
                {language === 'zh'
                  ? '在 80/20 哑铃体系中，20% 卫星战术仓位绝不对单一个股梭哈重仓。通过四分之一凯利公式严格计算胜率与赔率，单票试仓 2.0%，重仓上限严格锁死在 4.0%，彻底杜绝爆仓本金永久损失。'
                  : 'In the 80/20 Barbell architecture, speculative or tactical bets never exceed 2% (trial) to 4% (max cap). Quarter-Kelly scaling prevents geometric ruin while harvesting positive expected value.'}
              </p>

              {/* Kelly Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '预估胜率 Win Probability (%)' : 'Win Probability (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    value={Math.round(winProb * 100)}
                    onChange={(e) => setWinProb(Math.max(1, Math.min(99, Number(e.target.value))) / 100.0)}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-content-primary"
                  />
                  <span className="text-[10px] text-content-muted">{language === 'zh' ? '通常建议 45%–65%' : 'Typical 45%–65%'}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '预期上涨空间 Upside (%)' : 'Expected Upside (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={upsidePct}
                    onChange={(e) => setUpsidePct(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-positive"
                  />
                  <span className="text-[10px] text-content-muted">{language === 'zh' ? 'DCF或目标价潜在涨幅' : 'To target / fair value'}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '硬止损幅度 Stop Loss (%)' : 'Hard Stop-Loss (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(Math.max(0.5, Number(e.target.value)))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-negative"
                  />
                  <span className="text-[10px] text-content-muted">{language === 'zh' ? '技术面或宪法硬止损' : 'Discipline stop level'}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '同行业持仓数 Sector Overlap' : 'Same-Sector Overlap'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="1"
                    value={sameSectorCount}
                    onChange={(e) => setSameSectorCount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-amber-600 dark:text-amber-400"
                  />
                  <span className="text-[10px] text-content-muted">{language === 'zh' ? '惩罚因子 1/(1+0.25k)' : 'Penalty: 1/(1+0.25k)'}</span>
                </div>
              </div>

              {/* Kelly Output Cards */}
              {kellyResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border-subtle">
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '赔率比 (b)' : 'Payoff Ratio (b)'}</span>
                      <span className="text-base font-extrabold text-content-primary">{kellyResult.payoff_ratio_b}x</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '理论全凯利 (f*)' : 'Full Kelly (f*)'}</span>
                      <span className={`text-base font-extrabold ${kellyResult.full_kelly_pct > 0 ? 'text-positive' : 'text-negative'}`}>
                        {kellyResult.full_kelly_pct}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '四分之一凯利 (f/4)' : 'Quarter-Kelly'}</span>
                      <span className="text-base font-extrabold text-brand">{kellyResult.quarter_kelly_pct}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '建议仓位 (4%封顶)' : 'Capped Weight (Max 4%)'}</span>
                      <span className="text-base font-extrabold text-warning">{kellyResult.recommended_weight_pct}%</span>
                    </div>
                  </div>

                  {/* Institutional Kelly Telemetry: Bayesian Shrinkage & Sector Correlation Penalty */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-content-muted block">{language === 'zh' ? '贝叶斯收缩后胜率 (Bayesian Win Prob)' : 'Bayesian-Shrunk Win Probability'}</span>
                        <span className="text-xs font-semibold text-content-secondary">
                          {Math.round(winProb * 100)}% Raw → <span className="text-brand font-bold font-mono">{Math.round((kellyResult.calibrated_win_prob ?? winProb) * 100)}%</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand/10 text-brand font-bold">
                        P_shrunk
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-content-muted block">{language === 'zh' ? '行业相关性折减因子 (Sector Penalty)' : 'Correlation Penalty Factor'}</span>
                        <span className="text-xs font-semibold text-content-secondary">
                          Overlap ({sameSectorCount}x) → <span className={`font-bold font-mono ${(kellyResult.correlation_penalty_factor ?? 1.0) < 1.0 ? 'text-amber-600 dark:text-amber-400' : 'text-positive'}`}>{(kellyResult.correlation_penalty_factor ?? 1.0).toFixed(3)}x</span>
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${(kellyResult.correlation_penalty_factor ?? 1.0) < 1.0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                        {(kellyResult.correlation_penalty_factor ?? 1.0) < 1.0 ? 'Penalized' : 'No Overlap'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EFFICIENT FRONTIER & DECOUPLING */}
        {activeTab === 'frontier' && (
          <div className="space-y-6">
            {frontierLoading ? (
              <div className="p-16 text-center text-content-muted text-xs">
                Generating 400 Monte Carlo Frontier Portfolios & Covariance Matrix...
              </div>
            ) : frontierData ? (
              <>
                {/* Decoupling Alerts Banner */}
                {frontierData.correlation_decoupling_alerts.length > 0 ? (
                  <div className="prism-surface-warning p-4 rounded-2xl border border-warning/30 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-content-primary mb-1">
                        {language === 'zh' ? '相关性脱钩警报 (|ρ(60D) - ρ(3Y)| ≥ 0.35)' : 'Correlation Decoupling Alerts (|ρ_60D - ρ_3Y| ≥ 0.35)'}
                      </h4>
                      <ul className="text-xs text-content-secondary space-y-1">
                        {frontierData.correlation_decoupling_alerts.map((al, idx) => (
                          <li key={idx}>
                            {language === 'zh' ? al.alert_zh : al.alert_en}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="prism-surface-subtle p-3.5 rounded-xl border border-border-subtle text-xs text-content-secondary flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-positive" />
                    <span>{language === 'zh' ? '资产相关性状态稳定：近 60 日未发生异常脱钩。' : 'Asset correlations stable: No extreme 60D vs 3Y decoupling detected.'}</span>
                  </div>
                )}

                {/* Risk-Return Scatter Chart */}
                <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-content-primary flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-brand" />
                      <span>{language === 'zh' ? '有效前沿散点图 (波动率 vs 预期收益率)' : 'Efficient Frontier Scatter (Volatility vs Return)'}</span>
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-content-muted">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand"></span> Max Sharpe ({frontierData.max_sharpe_portfolio.sharpe_ratio})</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-positive"></span> Min Volatility ({frontierData.min_variance_portfolio.volatility_pct}%)</span>
                    </div>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis
                          type="number"
                          dataKey="volatility_pct"
                          name="Volatility"
                          unit="%"
                          tick={{ fontSize: 10 }}
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <YAxis
                          type="number"
                          dataKey="return_pct"
                          name="Return"
                          unit="%"
                          tick={{ fontSize: 10 }}
                          domain={['dataMin - 2', 'dataMax + 2']}
                        />
                        <ZAxis range={[20, 60]} />
                        <RechartsTooltip
                          cursor={{ strokeDasharray: '3 3' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] border border-slate-700 shadow-xl">
                                  <div className="font-bold text-brand mb-1">Portfolio Point</div>
                                  <div>Return: +{d.return_pct}%</div>
                                  <div>Volatility: {d.volatility_pct}%</div>
                                  <div>Sharpe: {d.sharpe_ratio}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Scatter data={frontierData.frontier_points} fill="#3b82f6" opacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Correlation Matrix Heatmap Table */}
                <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-content-primary flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-brand" />
                      <span>{language === 'zh' ? '资产相关性矩阵' : 'Asset Correlation Matrix'}</span>
                    </h4>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCorrPeriod('3y')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          corrPeriod === '3y' ? 'bg-brand text-white' : 'bg-surface text-content-secondary'
                        }`}
                      >
                        3-Year Mean
                      </button>
                      <button
                        onClick={() => setCorrPeriod('60d')}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                          corrPeriod === '60d' ? 'bg-brand text-white' : 'bg-surface text-content-secondary'
                        }`}
                      >
                        Recent 60D
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-[10px] font-mono border-collapse">
                      <thead>
                        <tr className="border-b border-border-subtle">
                          <th className="p-2 text-left font-sans text-content-muted">Ticker</th>
                          {frontierData.symbols.map((s) => (
                            <th key={s} className="p-2 font-bold text-content-primary">{s}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {frontierData.symbols.map((s1) => {
                          const matrix = corrPeriod === '3y' ? frontierData.correlation_matrix_3y : frontierData.correlation_matrix_60d;
                          return (
                            <tr key={s1} className="border-b border-border-subtle/50">
                              <td className="p-2 text-left font-bold text-content-primary">{s1}</td>
                              {frontierData.symbols.map((s2) => {
                                const val = matrix[s1]?.[s2] ?? 0;
                                const isSelf = s1 === s2;
                                return (
                                  <td
                                    key={s2}
                                    className={`p-2 font-semibold ${
                                      isSelf
                                        ? 'text-content-muted'
                                        : val < 0.2
                                        ? 'text-positive font-bold'
                                        : val > 0.7
                                        ? 'text-warning font-bold'
                                        : 'text-content-secondary'
                                    }`}
                                  >
                                    {val.toFixed(2)}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* TAB 4: LIABILITY STRESS TEST */}
        {activeTab === 'liability' && (
          <div className="space-y-6">
            <div className="prism-surface-subtle p-5 rounded-2xl shadow-sm border border-border-subtle">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-positive" />
                <h3 className="text-base font-bold text-content-primary">
                  {language === 'zh' ? '负债端四笔钱压力测试 (Liability Runway & Passive Coverage)' : 'Liability Runway & Four-Money Stress Tester'}
                </h3>
              </div>
              <p className="text-xs text-content-muted mb-4">
                {language === 'zh'
                  ? '只做合格持有人：资产端无论遇到 20% 还是 40% 的黑天鹅回撤，只要负债端（家庭现金流缓冲）保有至少 2 年以上的开支保障，就不会被迫在市场底部割肉斩仓。'
                  : 'Qualified Holder mindset: No matter the portfolio drawdown, ensuring at least 24 months of household living expense runway prevents forced liquidation at market bottoms.'}
              </p>

              {/* Stress Test Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '总资产规模 Total Capital' : 'Total Capital ($)'}
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={liabilityCapital}
                    onChange={(e) => setLiabilityCapital(Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-content-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '极端回撤假设 Max DD (%)' : 'Est. Max Drawdown (%)'}
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    step="5"
                    value={estDrawdownPct}
                    onChange={(e) => setEstDrawdownPct(Math.max(5, Math.min(80, Number(e.target.value))))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-negative"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '月度固定开支 Monthly Exp' : 'Monthly Living Cost ($)'}
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={monthlyExpense}
                    onChange={(e) => setMonthlyExpense(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-warning"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">
                    {language === 'zh' ? '年稳定被动收入 Passive Inc' : 'Annual Passive Inc ($)'}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={annualPassive}
                    onChange={(e) => setAnnualPassive(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-positive"
                  />
                </div>
              </div>

              {/* Stress Test Results */}
              {stressResult && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-4 rounded-xl border border-border-subtle">
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '极端回撤损失' : 'Drawdown Loss ($)'}</span>
                      <span className="text-base font-extrabold text-negative">-${stressResult.max_drawdown_usd.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '折合家庭月支出' : 'Cost in Months'}</span>
                      <span className="text-base font-extrabold text-warning">{stressResult.drawdown_months_of_living_expenses} m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '被动收入覆盖率' : 'Passive Coverage'}</span>
                      <span className="text-base font-extrabold text-brand">{stressResult.passive_income_coverage_pct}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-content-muted block">{language === 'zh' ? '回撤后安全跑道' : 'Post-DD Runway'}</span>
                      <span className={`text-base font-extrabold ${stressResult.is_runway_secure ? 'text-positive' : 'text-negative'}`}>
                        {stressResult.runway_months} {language === 'zh' ? '个月' : 'months'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-xl border border-border-subtle text-xs text-content-secondary flex items-start gap-2.5">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${stressResult.is_runway_secure ? 'text-positive' : 'text-warning'}`} />
                    <div>{language === 'zh' ? stressResult.verdict_zh : stressResult.verdict_en}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle mt-6">
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
