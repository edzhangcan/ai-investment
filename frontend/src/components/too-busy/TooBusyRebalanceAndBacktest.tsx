import React from 'react';
import { Calculator, AlertTriangle, LineChart as ChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { BilingualHoverCard } from '../BilingualHoverCard';
import { TooBusyBacktestResponse, TooBusyRebalanceResponse } from '../../types';

interface RebalanceAndBacktestProps {
  vehicles: { long_etf: string; short_etf: string; cash_etf: string };
  accountType: 'ROTH_IRA' | 'TFSA' | 'RRSP' | 'TAXABLE';
  onChangeAccountType: (val: 'ROTH_IRA' | 'TFSA' | 'RRSP' | 'TAXABLE') => void;
  cashBalance: string;
  onChangeCashBalance: (val: string) => void;
  longShares: string;
  onChangeLongShares: (val: string) => void;
  shortShares: string;
  onChangeShortShares: (val: string) => void;
  cashEtfShares: string;
  onChangeCashEtfShares: (val: string) => void;
  hysteresisPct: string;
  onChangeHysteresisPct: (val: string) => void;
  onSubmitTicket: (e: React.FormEvent) => void;
  calcLoading: boolean;
  ticketData: TooBusyRebalanceResponse | null;
  horizon: '16Y_POST_2010' | '40Y_FULL_1986' | '5Y_RECENT';
  onChangeHorizon: (h: '16Y_POST_2010' | '40Y_FULL_1986' | '5Y_RECENT') => void;
  backtestData: TooBusyBacktestResponse | null;
  isZh: boolean;
}

const HORIZON_OPTIONS: ReadonlyArray<{ id: '16Y_POST_2010' | '40Y_FULL_1986' | '5Y_RECENT'; label: string }> = [
  { id: '16Y_POST_2010', label: '2010–2026 (Real TQQQ Era)' },
  { id: '40Y_FULL_1986', label: '1986–2026 (40Y Full)' },
  { id: '5Y_RECENT', label: '2021–2026 (5Y)' },
];

/**
 * Interactive <$10K Whole-Share EOD Rebalance Calculator + Honest Leveraged Backtest Auditor.
 */
export const TooBusyRebalanceAndBacktest: React.FC<RebalanceAndBacktestProps> = ({
  vehicles,
  accountType,
  onChangeAccountType,
  cashBalance,
  onChangeCashBalance,
  longShares,
  onChangeLongShares,
  shortShares,
  onChangeShortShares,
  cashEtfShares,
  onChangeCashEtfShares,
  hysteresisPct,
  onChangeHysteresisPct,
  onSubmitTicket,
  calcLoading,
  ticketData,
  horizon,
  onChangeHorizon,
  backtestData,
  isZh,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 prism-card p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="text-base font-extrabold text-content-primary">
              <BilingualHoverCard termKey="Hysteresis_Band">
                <span>{isZh ? '<$10K 迷你账户尾盘调仓计算器' : '<$10K Small-Account EOD Rebalance Ticket'}</span>
              </BilingualHoverCard>
            </h3>
            <p className="text-[11px] text-content-muted">
              {isZh ? '含 10% 迟滞防磨损过滤，自动先卖后买释放资金（自动保存）' : 'Includes 10% hysteresis filter & SELL-before-BUY whole-share sequencing'}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmitTicket} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-content-secondary mb-1">
                {isZh ? '账户类型 (税务规则)' : 'Account Type (Tax Audit)'}
              </label>
              <select
                value={accountType}
                onChange={(e) => onChangeAccountType(e.target.value as 'ROTH_IRA' | 'TFSA' | 'RRSP' | 'TAXABLE')}
                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 font-bold text-content-primary"
              >
                <option value="ROTH_IRA">Roth IRA / IRA (Tax-Sheltered)</option>
                <option value="TFSA">TFSA (Canada Tax-Free)</option>
                <option value="RRSP">RRSP (Canada Tax-Deferred)</option>
                <option value="TAXABLE">Taxable Margin / Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-content-secondary mb-1">
                {isZh ? '可用现金余额 ($)' : 'Uninvested Cash ($)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={cashBalance}
                onChange={(e) => onChangeCashBalance(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-3 py-2 font-mono font-bold text-content-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-content-secondary mb-1">
                {isZh ? `当前 ${vehicles.long_etf}` : `Current ${vehicles.long_etf}`}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={longShares}
                onChange={(e) => onChangeLongShares(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-2.5 py-2 font-mono font-bold text-content-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-secondary mb-1">
                {isZh ? `当前 ${vehicles.short_etf}` : `Current ${vehicles.short_etf}`}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={shortShares}
                onChange={(e) => onChangeShortShares(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-2.5 py-2 font-mono font-bold text-content-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-secondary mb-1">
                {isZh ? `当前 ${vehicles.cash_etf}` : `Current ${vehicles.cash_etf}`}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={cashEtfShares}
                onChange={(e) => onChangeCashEtfShares(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-2.5 py-2 font-mono font-bold text-content-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-content-secondary mb-1">
                {isZh ? '迟滞过滤 (%)' : 'Hysteresis (%)'}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="25"
                value={hysteresisPct}
                onChange={(e) => onChangeHysteresisPct(e.target.value)}
                className="w-full bg-surface border border-border-subtle rounded-xl px-2.5 py-2 font-mono font-bold text-content-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={calcLoading}
            className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-extrabold transition-all cursor-pointer shadow-sm"
          >
            {calcLoading
              ? (isZh ? '正在实时计算尾盘调仓单...' : 'Calculating Live EOD Orders...')
              : (isZh ? '基于实时现价生成 15:50 EST 调仓单' : 'Generate Live 15:50 EST Whole-Share Ticket')}
          </button>
        </form>

        {ticketData && (
          <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-content-secondary">
                {isZh ? '账户总净值:' : 'Total Portfolio Equity:'}{' '}
                <strong className="font-mono text-content-primary">${ticketData.total_equity.toLocaleString()}</strong>
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                  ticketData.rebalance_required ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {ticketData.rebalance_required
                  ? (isZh ? '需要调仓 (REBALANCE)' : 'REBALANCE REQUIRED')
                  : (isZh ? '无需交易 (HOLD)' : 'HOLD (WITHIN HYSTERESIS)')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-xs font-bold text-content-primary">
              {isZh ? ticketData.action_summary_zh : ticketData.action_summary_en}
            </div>

            {ticketData.order_steps.length > 0 && (
              <div className="space-y-2">
                {ticketData.order_steps.map((step) => (
                  <div
                    key={step.step_number}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                      step.action === 'SELL'
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    }`}
                  >
                    <span>
                      Step {step.step_number}: {isZh ? step.instruction_zh : step.instruction_en}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {ticketData.friction_warnings.map((w, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <span>{isZh ? w.message_zh : w.message_en}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="lg:col-span-7 prism-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <ChartIcon className="w-5 h-5 text-violet-600" />
            <div>
              <h3 className="text-base font-extrabold text-content-primary">
                <BilingualHoverCard termKey="Financing_Drag_Audit">
                  <span>{isZh ? '真实杠杆融资损耗回测审计 ($10,000 本金)' : 'Honest Leveraged Backtest Auditor ($10,000 Initial)'}</span>
                </BilingualHoverCard>
              </h3>
              <p className="text-[11px] text-content-muted">
                {isZh ? '扣除 2倍联邦基金利率借贷成本 + 0.95% 管理费 + 5 bps 滑点' : 'Deducts 2x Fed Funds swap borrowing drag + 0.95% ER + 5 bps slippage'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-subtle p-1 rounded-xl border border-border-subtle text-[11px]">
            {HORIZON_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeHorizon(opt.id)}
                className={`px-2.5 py-1 rounded-lg font-extrabold cursor-pointer ${
                  horizon === opt.id ? 'bg-violet-600 text-white' : 'text-content-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {backtestData && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="text-[10px] text-content-muted font-bold">Realistic Net CAGR</div>
                <div className="text-base font-black text-emerald-600 font-mono">+{backtestData.realistic_net_cagr_pct}%</div>
                <div className="text-[10px] text-content-muted">Vs QQQ: +{backtestData.qqq_cagr_pct}%</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="text-[10px] text-content-muted font-bold">Naive (No-Drag) CAGR</div>
                <div className="text-base font-black text-amber-600 font-mono">+{backtestData.naive_no_drag_cagr_pct}%</div>
                <div className="text-[10px] text-content-muted">Drag: -{backtestData.annual_financing_drag_pct}%/yr</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="text-[10px] text-content-muted font-bold">Max Drawdown</div>
                <div className="text-base font-black text-negative font-mono">-{backtestData.max_drawdown_pct}%</div>
                <div className="text-[10px] text-content-muted">TQQQ B&amp;H: -{backtestData.tqqq_bh_max_drawdown_pct}%</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="text-[10px] text-content-muted font-bold">Calmar / Deflated SR</div>
                <div className="text-base font-black text-violet-600 font-mono">
                  {backtestData.calmar_ratio} / {backtestData.deflated_sharpe_ratio}
                </div>
                <div className="text-[10px] text-content-muted">M=350 Adjusted</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <div className="text-[10px] text-content-muted font-bold">Trades / Year</div>
                <div className="text-base font-black text-content-primary font-mono">{backtestData.trades_per_year}</div>
                <div className="text-[10px] text-content-muted">~{(backtestData.trades_per_year / 52).toFixed(1)} / week</div>
              </div>
            </div>

            <div className="h-56 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={backtestData.equity_curve} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `$${v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`}`}
                  />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="strategy_value"
                    name="Too Busy (Realistic Net)"
                    stroke="#7c3aed"
                    strokeWidth={2.5}
                    fill="#7c3aed"
                    fillOpacity={0.18}
                  />
                  <Line
                    type="monotone"
                    dataKey="qqq_value"
                    name="QQQ Buy & Hold"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle text-[11px] text-content-secondary">
              {isZh ? backtestData.audit_disclosure_zh : backtestData.audit_disclosure_en}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
