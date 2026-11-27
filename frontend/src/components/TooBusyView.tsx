import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ShieldCheck,
  RefreshCw,
  Layers,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import {
  TooBusyTrackSelector,
  TooBusyVerdictAndTimeline,
  TooBusyKeySignalsChecklist,
} from './too-busy/TooBusyBeginnerSections';
import { TooBusyCrossBorderAndMatrix } from './too-busy/TooBusyCrossBorderAndMatrix';
import { TooBusyRebalanceAndBacktest } from './too-busy/TooBusyRebalanceAndBacktest';
import {
  fetchTooBusyRegimeApi,
  fetchTooBusyCrossBorderDuetApi,
  calculateTooBusyTicketApi,
  fetchTooBusyBacktestApi,
} from '../api/client';
import {
  TooBusyRegimeResponse,
  TooBusyRebalanceResponse,
  TooBusyBacktestResponse,
  TooBusyCrossBorderDuet,
  TooBusyStrategyMode,
  TooBusyRebalancePayload,
} from '../types';

export const TOO_BUSY_STORAGE_KEY = 'too_busy_portfolio_state_v1';
const AUTO_POLL_MS = 60_000;

export const getStoredTooBusyState = (): TooBusyRebalancePayload => {
  const defaults: TooBusyRebalancePayload = {
    strategy_mode: 'TOO_BUSY_LONG_ONLY',
    market: 'US',
    account_type: 'ROTH_IRA',
    has_usd_subaccount: true,
    cash_balance: 1500,
    current_long_shares: 60,
    current_short_shares: 0,
    current_cash_etf_shares: 20,
    hysteresis_pct: 10,
    opened_intraday_today: false,
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(TOO_BUSY_STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
};

/**
 * Top-level orchestrator for Standalone "Too Busy" 10-Minute EOD Index Navigation (Tab 5).
 * Manages live market polling, on-demand cache-busted refresh, beginner Plain-Talk state,
 * and composes modular beginner, cross-border, rebalance, and backtest cards.
 */
export const TooBusyView: React.FC = () => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const initialStored = getStoredTooBusyState();

  const [strategyMode, setStrategyMode] = useState<TooBusyStrategyMode>(initialStored.strategy_mode);
  const [market, setMarket] = useState<'US' | 'CA'>(initialStored.market);
  const [horizon, setHorizon] = useState<'16Y_POST_2010' | '40Y_FULL_1986' | '5Y_RECENT'>('16Y_POST_2010');
  const [plainTalkOn, setPlainTalkOn] = useState<boolean>(true);
  const [refreshingLive, setRefreshingLive] = useState<boolean>(false);

  const [regimeData, setRegimeData] = useState<TooBusyRegimeResponse | null>(null);
  const [ticketData, setTicketData] = useState<TooBusyRebalanceResponse | null>(null);
  const [backtestData, setBacktestData] = useState<TooBusyBacktestResponse | null>(null);
  const [duetData, setDuetData] = useState<TooBusyCrossBorderDuet | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [calcLoading, setCalcLoading] = useState<boolean>(false);

  // Small-Account (<$10K) Rebalance Calculator Form State
  const [accountType, setAccountType] = useState<'ROTH_IRA' | 'TFSA' | 'RRSP' | 'TAXABLE'>(initialStored.account_type);
  const [hasUsdSubaccount] = useState<boolean>(initialStored.has_usd_subaccount);
  const [cashBalance, setCashBalance] = useState<string>(String(initialStored.cash_balance));
  const [longShares, setLongShares] = useState<string>(String(initialStored.current_long_shares));
  const [shortShares, setShortShares] = useState<string>(String(initialStored.current_short_shares));
  const [cashEtfShares, setCashEtfShares] = useState<string>(String(initialStored.current_cash_etf_shares));
  const [hysteresisPct, setHysteresisPct] = useState<string>(String(initialStored.hysteresis_pct));
  const [openedIntradayToday] = useState<boolean>(initialStored.opened_intraday_today);

  // Cross-Border Two-Account Barbell Calculator State
  const [usdCapInput, setUsdCapInput] = useState<string>('4000');
  const [cadCapInput, setCadCapInput] = useState<string>('4000');
  const [duetLoading, setDuetLoading] = useState<boolean>(false);

  const buildPayload = useCallback(
    (forceRefresh = false): TooBusyRebalancePayload => ({
      strategy_mode: strategyMode,
      market,
      account_type: accountType,
      has_usd_subaccount: hasUsdSubaccount,
      cash_balance: Math.max(0, parseFloat(cashBalance) || 0),
      current_long_shares: Math.max(0, parseInt(longShares, 10) || 0),
      current_short_shares: Math.max(0, parseInt(shortShares, 10) || 0),
      current_cash_etf_shares: Math.max(0, parseInt(cashEtfShares, 10) || 0),
      hysteresis_pct: Math.max(0, parseFloat(hysteresisPct) || 10),
      opened_intraday_today: openedIntradayToday,
      lang: language,
      use_live: true,
      force_refresh: forceRefresh,
    }),
    [strategyMode, market, accountType, hasUsdSubaccount, cashBalance, longShares, shortShares, cashEtfShares, hysteresisPct, openedIntradayToday, language]
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(TOO_BUSY_STORAGE_KEY, JSON.stringify(buildPayload()));
    } catch {
      // Ignore storage quota errors
    }
  }, [buildPayload]);

  const loadAll = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        setRefreshingLive(true);
      } else if (!regimeData) {
        setLoading(true);
      }

      try {
        const payload = buildPayload(forceRefresh);
        const usdVal = Math.max(0, parseFloat(usdCapInput) || 0);
        const cadVal = Math.max(0, parseFloat(cadCapInput) || 0);

        const [reg, bt, tkt, duet] = await Promise.all([
          fetchTooBusyRegimeApi(strategyMode, market, language, forceRefresh),
          fetchTooBusyBacktestApi(horizon, strategyMode, payload.hysteresis_pct, language, forceRefresh),
          calculateTooBusyTicketApi(payload),
          fetchTooBusyCrossBorderDuetApi(usdVal, cadVal, language, forceRefresh),
        ]);
        setRegimeData(reg);
        setBacktestData(bt);
        setTicketData(tkt);
        setDuetData(duet);
      } catch (err) {
        console.error('TooBusyView load error:', err);
      } finally {
        setLoading(false);
        setRefreshingLive(false);
      }
    },
    [strategyMode, market, horizon, language, usdCapInput, cadCapInput, buildPayload]
  );

  useEffect(() => {
    loadAll(true);
  }, [strategyMode, market, horizon, language]);

  // Keep live market data fresh every 60s and whenever the user focuses/returns to the tab (even across overnight sessions)
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        loadAll(true);
      }
    };
    const id = window.setInterval(handleVisibilityOrFocus, AUTO_POLL_MS);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [loadAll]);

  const handleRecalculateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalcLoading(true);
    try {
      const tkt = await calculateTooBusyTicketApi(buildPayload(true));
      setTicketData(tkt);
    } catch (err) {
      console.error('Ticket recalculate error:', err);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleRecalculateDuet = async (e: React.FormEvent) => {
    e.preventDefault();
    setDuetLoading(true);
    try {
      const usdVal = Math.max(0, parseFloat(usdCapInput) || 0);
      const cadVal = Math.max(0, parseFloat(cadCapInput) || 0);
      const res = await fetchTooBusyCrossBorderDuetApi(usdVal, cadVal, language, true);
      setDuetData(res);
    } catch (err) {
      console.error('Cross-border duet recalculate error:', err);
    } finally {
      setDuetLoading(false);
    }
  };

  if (loading && !regimeData) {
    return (
      <div className="prism-card p-10 flex flex-col items-center justify-center gap-3 text-content-muted">
        <RefreshCw className="w-7 h-7 animate-spin text-violet-600" />
        <p className="text-xs font-bold">
          {isZh ? '正在实时拉取今日 ^NDX 价格并计算尾盘 (15:50 EST) 信号...' : 'Fetching live ^NDX market quote and computing 15:50 EST EOD signals...'}
        </p>
      </div>
    );
  }

  if (!regimeData) return null;

  const { vehicles, features, data_freshness, beginner_decision_guide, equivalent_etf_matrix } = regimeData;

  return (
    <div className="space-y-6">
      {/* Section 1: Top Live Freshness Header, Plain-Talk Toggle & Risk Track Selector */}
      <div className="prism-card p-6 border-l-4 border-l-violet-600">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border-subtle">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{isZh ? 'Too Busy • 每日10分钟尾盘助手' : 'Too Busy • 10-Min EOD Assistant'}</span>
              </span>

              {data_freshness && (
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border flex items-center gap-1.5 ${
                    data_freshness.is_live_intraday
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${data_freshness.is_live_intraday ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span>
                    {data_freshness.is_live_intraday ? (isZh ? '实时行情已同步' : 'LIVE YAHOO ^NDX') : (isZh ? '离线模拟基准' : 'OFFLINE FALLBACK')} • {data_freshness.last_updated_est}
                  </span>
                </span>
              )}

              <button
                type="button"
                onClick={() => loadAll(true)}
                disabled={refreshingLive}
                className="px-2.5 py-1 rounded-lg bg-surface-subtle hover:bg-violet-50 dark:hover:bg-violet-950/40 border border-border-subtle text-[11px] font-bold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <RefreshCw className={`w-3 h-3 ${refreshingLive ? 'animate-spin' : ''}`} />
                <span>{refreshingLive ? (isZh ? '刷新中...' : 'Refreshing...') : (isZh ? '立即刷新实时行情' : 'Refresh Live Prices')}</span>
              </button>
            </div>

            <h2 className="text-lg md:text-xl font-black text-content-primary flex flex-wrap items-center gap-2">
              <BilingualHoverCard termKey="TooBusyStrategy">
                <span>
                  {isZh
                    ? '每日 15:50 尾盘指数导航系统 (今日现价 → 明天持仓)'
                    : 'Daily 15:50 EST Index Navigator (Today Live Check → Tomorrow Ride)'}
                </span>
              </BilingualHoverCard>
            </h2>
            <p className="text-xs text-content-secondary mt-1">
              {isZh ? data_freshness?.signal_basis_zh : data_freshness?.signal_basis_en}
            </p>
            {regimeData.after_hours_futures && Math.abs(regimeData.after_hours_futures.futures_change_pct) >= 0.25 && (
              <div
                className={`mt-2 px-3 py-1.5 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${
                  regimeData.after_hours_futures.squeeze_warning_active
                    ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-900 dark:text-sky-200'
                }`}
              >
                <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] font-mono uppercase">
                  NQ=F LIVE
                </span>
                <span>
                  {isZh ? regimeData.after_hours_futures.warning_zh : regimeData.after_hours_futures.warning_en}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPlainTalkOn((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border flex items-center gap-1.5 cursor-pointer transition-all ${
                plainTalkOn
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-surface-subtle text-content-secondary border-border-subtle hover:text-content-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {isZh
                  ? `新手大白话+生活比喻: ${plainTalkOn ? '已开启' : '已关闭'}`
                  : `Beginner Plain-Talk Guide: ${plainTalkOn ? 'ON' : 'OFF'}`}
              </span>
            </button>

            <div className="flex items-center bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs">
              {(['US', 'CA'] as const).map((mkt) => (
                <button
                  key={mkt}
                  type="button"
                  onClick={() => setMarket(mkt)}
                  className={`px-3 py-1.5 rounded-lg font-extrabold cursor-pointer transition-all ${
                    market === mkt ? 'bg-violet-600 text-white shadow-sm' : 'text-content-secondary hover:text-content-primary'
                  }`}
                >
                  {mkt === 'US' ? 'US (TQQQ / SQQQ / SGOV)' : 'CA (HQU.TO / HQD.TO / CASH.TO)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <TooBusyTrackSelector
          strategyMode={strategyMode}
          onSelectMode={setStrategyMode}
          guide={beginner_decision_guide}
          isZh={isZh}
        />
      </div>

      {/* Section 2: Unmistakable Action Verdict + 3:50 PM Timeline + 4 Key Signals */}
      <TooBusyVerdictAndTimeline
        guide={beginner_decision_guide}
        asOfDate={regimeData.as_of_date}
        executionClock={regimeData.execution_clock}
        vehicles={vehicles}
        targetLongPct={regimeData.target_long_pct}
        targetShortPct={regimeData.target_short_pct}
        targetCashPct={regimeData.target_cash_pct}
        plainTalkOn={plainTalkOn}
        isZh={isZh}
      />

      <TooBusyKeySignalsChecklist
        signals={beginner_decision_guide?.key_signals_checklist || []}
        plainTalkOn={plainTalkOn}
        isZh={isZh}
      />

      {/* Section 3: Portfolio Target Cards & Underlying ^NDX Signal Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 prism-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-content-muted">
                {isZh ? '今日 15:50 EST 尾盘目标仓位指令' : "Today's 15:50 EST Target Portfolio Allocation"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 text-xs font-extrabold">
                {isZh ? regimeData.regime_label_zh : regimeData.regime_label_en}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70">
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  <BilingualHoverCard termKey="TQQQ_ETF">
                    <span>{isZh ? `进攻多头 (${vehicles.long_etf})` : `Growth Long (${vehicles.long_etf})`}</span>
                  </BilingualHoverCard>
                </div>
                <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  {regimeData.target_long_pct}%
                </div>
                <div className="text-[11px] text-content-muted mt-1 font-mono">
                  {vehicles.long_etf}: ${regimeData.live_etf_prices[vehicles.long_etf]?.toFixed(2)} ({vehicles.leverage}x)
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70">
                <div className="text-[11px] font-bold text-sky-800 dark:text-sky-300 mb-1">
                  <BilingualHoverCard termKey="SGOV_TBill">
                    <span>{isZh ? `国债现金护盾 (${vehicles.cash_etf})` : `T-Bill Cash Shield (${vehicles.cash_etf})`}</span>
                  </BilingualHoverCard>
                </div>
                <div className="text-3xl font-black text-sky-700 dark:text-sky-400 font-mono">
                  {regimeData.target_cash_pct}%
                </div>
                <div className="text-[11px] text-content-muted mt-1 font-mono">
                  {vehicles.cash_etf}: ${regimeData.live_etf_prices[vehicles.cash_etf]?.toFixed(2)} (~4.5% Yield)
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${
                regimeData.target_short_pct > 0
                  ? 'bg-rose-50/80 dark:bg-rose-950/35 border-rose-300 dark:border-rose-800'
                  : 'bg-surface-subtle border-border-subtle'
              }`}>
                <div className="text-[11px] font-bold text-content-muted mb-1">
                  <BilingualHoverCard termKey="SQQQ_ETF">
                    <span>{isZh ? `反向做空 (${vehicles.short_etf})` : `Inverse Short (${vehicles.short_etf})`}</span>
                  </BilingualHoverCard>
                </div>
                <div className={`text-3xl font-black font-mono ${regimeData.target_short_pct > 0 ? 'text-rose-600' : 'text-content-secondary'}`}>
                  {regimeData.target_short_pct}%
                </div>
                <div className="text-[11px] text-content-muted mt-1">
                  {strategyMode !== 'TOO_BUSY_DUAL'
                    ? (isZh ? `双工模式下今日可触发 (${regimeData.would_allocate_short_pct || 0}%)` : `Dual Mode Would Use: ${regimeData.would_allocate_short_pct || 0}%`)
                    : `${vehicles.short_etf}: $${regimeData.live_etf_prices[vehicles.short_etf]?.toFixed(2)}`}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs text-content-secondary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <BilingualHoverCard termKey="PDT_Exemption">
              <span>{isZh ? regimeData.pdt_exemption_note_zh : regimeData.pdt_exemption_note_en}</span>
            </BilingualHoverCard>
          </div>
        </div>

        <div className="lg:col-span-5 prism-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-content-muted">
              <BilingualHoverCard termKey="NDXIndex">
                <span>{isZh ? '底层无杠杆纳指100 (^NDX) 核心指标' : 'Underlying Nasdaq-100 (^NDX) Telemetry'}</span>
              </BilingualHoverCard>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-content-primary">
                ^NDX: {features.current_close.toLocaleString()}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-extrabold ${
                  features.roc_1_pct >= 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                }`}
              >
                {features.roc_1_pct >= 0 ? `+${features.roc_1_pct}%` : `${features.roc_1_pct}%`}
                {features.previous_close ? ` (vs ${features.previous_close.toLocaleString()})` : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="text-[10px] text-content-muted font-bold">
                <BilingualHoverCard termKey="SMA50_Trend"><span>50D SMA / Extension</span></BilingualHoverCard>
              </div>
              <div className="font-mono font-extrabold text-content-primary mt-0.5">
                {features.sma_50.toLocaleString()} ({features.ext_50_pct >= 0 ? `+${features.ext_50_pct}%` : `${features.ext_50_pct}%`})
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="text-[10px] text-content-muted font-bold">
                <BilingualHoverCard termKey="SMA250_Trend"><span>250D SMA / Extension</span></BilingualHoverCard>
              </div>
              <div className="font-mono font-extrabold text-content-primary mt-0.5">
                {features.sma_250.toLocaleString()} ({features.ext_250_pct >= 0 ? `+${features.ext_250_pct}%` : `${features.ext_250_pct}%`})
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="text-[10px] text-content-muted font-bold">
                <BilingualHoverCard termKey="Velocity_ROC"><span>Velocity ROC(10D) / dROC(5D)</span></BilingualHoverCard>
              </div>
              <div className="font-mono font-extrabold text-content-primary mt-0.5">
                {features.roc_10_pct >= 0 ? `+${features.roc_10_pct}%` : `${features.roc_10_pct}%`} / Δ {features.d_roc_5_pct >= 0 ? `+${features.d_roc_5_pct}%` : `${features.d_roc_5_pct}%`}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="text-[10px] text-content-muted font-bold">
                <BilingualHoverCard termKey="Wilder_RSI"><span>Wilder RSI(5) / RSI(10)</span></BilingualHoverCard>
              </div>
              <div className="font-mono font-extrabold text-content-primary mt-0.5">
                {features.rsi_5.toFixed(1)} / {features.rsi_10.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Sub-Strategies S1-S7 Breakdown */}
      <div className="prism-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-600" />
            <h3 className="text-base font-extrabold text-content-primary">
              {isZh ? '核心 7 大子规则逐条白话解析 (S1–S7)' : 'Sub-Strategy Attribution Breakdown (S1–S7)'}
            </h3>
          </div>
          <span className="text-xs text-content-muted">
            {isZh ? '清晰展示每条规则今日触发状态、真实原因与双工对比效果' : 'Shows why every rule fired or stood down today (including SQQQ S6/S7 preview)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {regimeData.sub_strategies.map((sub) => {
            const isActive = sub.status === 'ACTIVE' || sub.status === 'ACTIVE_TRIM';
            const isDormantDual = sub.status === 'DISABLED_IN_LONG_ONLY';
            return (
              <div
                key={sub.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-400 dark:border-emerald-700 shadow-sm'
                    : isDormantDual
                      ? 'bg-surface-subtle/60 border-dashed border-border-subtle opacity-90'
                      : 'bg-surface-subtle border-border-subtle'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black font-mono bg-surface border border-border-subtle text-content-primary">
                      {sub.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase flex items-center gap-1 ${
                        isActive
                          ? 'bg-emerald-600 text-white'
                          : isDormantDual
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                            : 'bg-surface text-content-muted border border-border-subtle'
                      }`}
                    >
                      {isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{sub.status}</span>
                    </span>
                  </div>
                  <h4 className="text-xs font-extrabold text-content-primary mb-1">
                    {sub.term_key ? (
                      <BilingualHoverCard termKey={sub.term_key}>
                        <span>{isZh ? sub.name_zh : sub.name_en}</span>
                      </BilingualHoverCard>
                    ) : (
                      <span>{isZh ? sub.name_zh : sub.name_en}</span>
                    )}
                  </h4>
                  {(sub.status_human_en || sub.status_human_zh) && (
                    <div className="text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1.5">
                      {isZh ? sub.status_human_zh : sub.status_human_en}
                    </div>
                  )}
                  <p className="text-[11px] text-content-secondary leading-relaxed mb-2">
                    {isZh ? (sub.why_status_zh || sub.rule_zh) : (sub.why_status_en || sub.rule_en)}
                  </p>
                  {plainTalkOn && (sub.analogy_en || sub.analogy_zh) && (
                    <div className="p-2 rounded-lg bg-surface border border-border-subtle text-[10px] text-content-muted mb-2 leading-relaxed">
                      <strong className="text-content-primary">{isZh ? '比喻: ' : 'Analogy: '}</strong>
                      {isZh ? sub.analogy_zh : sub.analogy_en}
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-border-subtle space-y-1">
                  <div className="text-[10px] font-mono text-content-muted">{sub.telemetry}</div>
                  <div className="text-xs font-black text-violet-600 dark:text-violet-400 font-mono">{sub.effect_label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Cross-Border Barbell Calculator & 5-Family ETF Matrix */}
      <TooBusyCrossBorderAndMatrix
        duetData={duetData || regimeData.cross_border_duet}
        etfMatrix={equivalent_etf_matrix}
        usdCapInput={usdCapInput}
        cadCapInput={cadCapInput}
        onChangeUsdCap={setUsdCapInput}
        onChangeCadCap={setCadCapInput}
        onSubmitDuet={handleRecalculateDuet}
        duetLoading={duetLoading}
        isZh={isZh}
      />

      {/* Section 6: <$10K Rebalance Ticket Calculator & Multi-Decade Backtest */}
      <TooBusyRebalanceAndBacktest
        vehicles={vehicles}
        accountType={accountType}
        onChangeAccountType={setAccountType}
        cashBalance={cashBalance}
        onChangeCashBalance={setCashBalance}
        longShares={longShares}
        onChangeLongShares={setLongShares}
        shortShares={shortShares}
        onChangeShortShares={setShortShares}
        cashEtfShares={cashEtfShares}
        onChangeCashEtfShares={setCashEtfShares}
        hysteresisPct={hysteresisPct}
        onChangeHysteresisPct={setHysteresisPct}
        onSubmitTicket={handleRecalculateTicket}
        calcLoading={calcLoading}
        ticketData={ticketData}
        horizon={horizon}
        onChangeHorizon={setHorizon}
        backtestData={backtestData}
        isZh={isZh}
      />
    </div>
  );
};
