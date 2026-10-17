import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import {
  LineChart as ChartIcon,
  TrendingUp,
  ShieldAlert,
  RefreshCw,
  Activity,
  Layers,
  ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid
} from 'recharts';
import {
  DrawdownEvent,
  UnderwaterPoint,
  RebalanceComparison
} from '../types';

interface BacktestViewerProps {
  symbol: string;
}

interface EquityPoint {
  year: string;
  value: number;
  benchmark_value: number;
  portfolio_return_pct?: number;
  benchmark_return_pct?: number;
}

interface AnnualBreakdownItem {
  year: string;
  portfolio_return_pct: number;
  benchmark_return_pct: number;
  alpha_pct: number;
}

interface BacktestResponsePayload {
  portfolio_symbols: string[];
  benchmark: string;
  period_years: number;
  start_year: string;
  end_year: string;
  cagr_pct: number;
  benchmark_cagr_pct: number;
  alpha_cagr_pct: number;
  sharpe_ratio: number;
  calmar_ratio?: number;
  robust_3y_calmar_ratio?: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_return_pct: number;
  benchmark_total_return_pct: number;
  summary_note: string;
  equity_curve: EquityPoint[];
  annual_breakdown: AnnualBreakdownItem[];
  underwater_curve?: UnderwaterPoint[];
  drawdown_events?: DrawdownEvent[];
  rebalancing_simulation?: RebalanceComparison;
}

export const BacktestViewer: React.FC<BacktestViewerProps> = ({ symbol }) => {
  const { language, t } = useLanguage();
  const [benchmark, setBenchmark] = useState<'SPY' | 'XIU.TO'>(symbol.endsWith('.TO') || symbol.endsWith('.V') ? 'XIU.TO' : 'SPY');
  const [chartView, setChartView] = useState<'equity' | 'drawdown'>('equity');
  const [data, setData] = useState<BacktestResponsePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Automatically sync benchmark to TSX 60 for Canadian assets and S&P 500 for US assets
  useEffect(() => {
    setBenchmark(symbol.endsWith('.TO') || symbol.endsWith('.V') ? 'XIU.TO' : 'SPY');
  }, [symbol]);

  useEffect(() => {
    const fetchBacktest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://${window.location.hostname || '127.0.0.1'}:8000/api/stock/${symbol}/backtest?benchmark=${benchmark}&lang=${language}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.warn("Backtest fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBacktest();
  }, [symbol, benchmark, language]);

  if (loading) {
    return (
      <div className="prism-card p-6 flex items-center justify-center min-h-[260px]">
        <div className="flex items-center gap-3 text-content-muted text-xs">
          <ChartIcon className="w-5 h-5 animate-spin text-brand" />
          <span>Running 5-Year Quantitative Backtest against {benchmark}...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="prism-card p-6 md:p-8 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 prism-badge-brand rounded-xl">
              <ChartIcon className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-content-primary flex items-center gap-2">
              <BilingualHoverCard termKey="Backtest">
                {t.backtestTitle}
              </BilingualHoverCard>
            </h3>
          </div>
          <p className="text-xs text-content-muted">
            {t.backtestSubtitle}
          </p>
        </div>

        {/* Benchmark Switcher Buttons */}
        <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs shadow-sm">
          <button
            onClick={() => setBenchmark('SPY')}
            className={`h-7 px-3 rounded-lg font-bold transition-all inline-flex items-center cursor-pointer box-border ${
              benchmark === 'SPY'
                ? 'bg-brand text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface'
            }`}
          >
            S&P 500 (SPY)
          </button>
          <button
            onClick={() => setBenchmark('XIU.TO')}
            className={`h-7 px-3 rounded-lg font-bold transition-all inline-flex items-center cursor-pointer box-border ${
              benchmark === 'XIU.TO'
                ? 'bg-brand text-white shadow-sm'
                : 'text-content-secondary hover:text-content-primary hover:bg-surface'
            }`}
          >
            TSX 60 (XIU.TO)
          </button>
        </div>
      </div>

      {/* Summary Note Banner */}
      <div className="prism-surface-subtle p-4 mb-6 text-xs text-content-secondary font-medium flex items-start gap-2.5 shadow-sm rounded-xl">
        <TrendingUp className="w-4 h-4 text-positive shrink-0 mt-0.5" />
        <div>{data.summary_note}</div>
      </div>

      {/* 6 Quantitative Metric Badges (Including Calmar & Rebalancing Bonus) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {/* CAGR */}
        <div className="prism-surface-subtle p-3.5 shadow-sm rounded-xl">
          <div className="text-[10px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="CAGR">
              {t.cagr}
            </BilingualHoverCard>
          </div>
          <div className="text-base font-extrabold text-positive">+{data.cagr_pct}%</div>
          <div className="text-[10px] text-content-muted mt-0.5">Vs {data.benchmark}: +{data.benchmark_cagr_pct}%</div>
        </div>

        {/* Sharpe Ratio */}
        <div className="prism-surface-subtle p-3.5 shadow-sm rounded-xl">
          <div className="text-[10px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="SharpeRatio">
              {t.sharpeRatio}
            </BilingualHoverCard>
          </div>
          <div className="text-base font-extrabold text-brand">{data.sharpe_ratio}</div>
          <div className="text-[10px] text-content-muted mt-0.5">{t.riskFreeRate}</div>
        </div>

        {/* Calmar Ratio */}
        <div className="prism-surface-subtle p-3.5 shadow-sm rounded-xl">
          <div className="text-[10px] text-content-muted font-semibold mb-1">
            <span>{language === 'zh' ? '卡玛比率 Calmar' : 'Calmar Ratio'}</span>
          </div>
          <div className="text-base font-extrabold text-warning">
            {data.calmar_ratio ?? (Math.round((data.cagr_pct / Math.max(0.01, data.max_drawdown_pct)) * 100) / 100)}
          </div>
          <div className="text-[10px] text-content-muted mt-0.5">
            {data.robust_3y_calmar_ratio ? `3Y: ${data.robust_3y_calmar_ratio}` : 'CAGR / MaxDD'}
          </div>
        </div>

        {/* Max Drawdown */}
        <div className="prism-surface-subtle p-3.5 shadow-sm rounded-xl">
          <div className="text-[10px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="MaxDrawdown">
              {t.maxDrawdown}
            </BilingualHoverCard>
          </div>
          <div className="text-base font-extrabold text-negative">-{data.max_drawdown_pct}%</div>
          <div className="text-[10px] text-content-muted mt-0.5">{t.peakToTroughRisk}</div>
        </div>

        {/* Win Rate */}
        <div className="prism-surface-subtle p-3.5 shadow-sm rounded-xl">
          <div className="text-[10px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="WinRate">
              {t.winRate}
            </BilingualHoverCard>
          </div>
          <div className="text-base font-extrabold text-content-primary">{data.win_rate_pct}%</div>
          <div className="text-[10px] text-content-muted mt-0.5">{t.outperformedBenchmark}</div>
        </div>

        {/* Rebalancing Bonus */}
        <div className="prism-surface-subtle p-3.5 shadow-sm rounded-xl">
          <div className="text-[10px] text-content-muted font-semibold mb-1">
            <span>{t.rebalanceBonusLabel}</span>
          </div>
          <div className={`text-base font-extrabold ${
            (data.rebalancing_simulation?.rebalancing_bonus_bps ?? 0) >= 0 ? 'text-positive' : 'text-content-secondary'
          }`}>
            {data.rebalancing_simulation?.rebalancing_bonus_bps !== undefined
              ? `${data.rebalancing_simulation.rebalancing_bonus_bps > 0 ? '+' : ''}${data.rebalancing_simulation.rebalancing_bonus_bps} bps`
              : '0.0 bps'}
          </div>
          <div className="text-[10px] text-content-muted mt-0.5">
            {language === 'zh' ? '波动率收割' : 'Volatility Harvest'}
          </div>
        </div>
      </div>

      {/* Interactive Chart Container: Equity Growth ($10k) vs Underwater Drawdown (%) */}
      <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {chartView === 'equity' ? (
              <TrendingUp className="w-4 h-4 text-positive" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-negative" />
            )}
            <h4 className="text-xs font-bold text-content-primary">
              {chartView === 'equity'
                ? (language === 'zh' ? '5 年净值增长轨迹 ($10,000 初始本金)' : '5-Year Equity Growth Trajectory ($10,000 Initial)')
                : (language === 'zh' ? '历史水下回撤曲线 (Underwater Curve)' : t.underwaterDrawdownTitle)}
            </h4>
          </div>

          {/* Chart Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-xl border border-border-subtle text-[11px]">
            <button
              onClick={() => setChartView('equity')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'equity'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
              }`}
            >
              {language === 'zh' ? '本金增值曲线' : 'Equity Growth'}
            </button>
            <button
              onClick={() => setChartView('drawdown')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartView === 'drawdown'
                  ? 'bg-negative text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-subtle'
              }`}
            >
              {language === 'zh' ? '回撤深度曲线' : 'Underwater DD'}
            </button>
          </div>
        </div>

        {chartView === 'equity' ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.equity_curve} margin={{ top: 10, right: 15, bottom: 5, left: 5 }}>
                <defs>
                  <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 1000', 'dataMax + 1000']}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload as EquityPoint;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl text-[11px] border border-slate-700 shadow-xl space-y-1">
                          <div className="font-bold text-content-primary border-b border-slate-700 pb-1 mb-1">{pt.year} Benchmark Comparison</div>
                          <div className="text-brand font-bold flex justify-between gap-4">
                            <span>{symbol}:</span>
                            <span>${pt.value?.toLocaleString()} {pt.portfolio_return_pct !== undefined ? `(${pt.portfolio_return_pct >= 0 ? '+' : ''}${pt.portfolio_return_pct}%)` : ''}</span>
                          </div>
                          <div className="text-amber-400 font-bold flex justify-between gap-4">
                            <span>{data.benchmark}:</span>
                            <span>${pt.benchmark_value?.toLocaleString()} {pt.benchmark_return_pct !== undefined ? `(${pt.benchmark_return_pct >= 0 ? '+' : ''}${pt.benchmark_return_pct}%)` : ''}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={symbol}
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#equityGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="benchmark_value"
                  name={data.benchmark}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.underwater_curve} margin={{ top: 10, right: 15, bottom: 5, left: -5 }}>
                <defs>
                  <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                <YAxis unit="%" tick={{ fontSize: 10 }} domain={['dataMin - 2', 0]} />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const pt = payload[0].payload as UnderwaterPoint;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] border border-slate-700 shadow-xl">
                          <div className="font-bold text-content-primary mb-1">{pt.year} Status</div>
                          <div className="text-negative font-bold">Drawdown: {pt.drawdown_pct}%</div>
                          <div className="text-content-muted">Value: ${pt.portfolio_value.toLocaleString()}</div>
                          <div className="text-content-muted">Peak: ${pt.peak_value.toLocaleString()}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown_pct"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#drawdownGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Rebalancing Simulation & Drawdown Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Rebalancing Comparison Card */}
        {data.rebalancing_simulation && (
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-brand" />
                <h4 className="text-xs font-bold text-content-primary">
                  {language === 'zh' ? '动态再平衡对比 (Rebalancing Simulation)' : 'Rebalancing Simulation'}
                </h4>
              </div>
              <p className="text-[11px] text-content-muted mb-3 leading-relaxed">
                {language === 'zh'
                  ? data.rebalancing_simulation.explanation_zh
                  : data.rebalancing_simulation.explanation_en}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-surface p-3 rounded-xl border border-border-subtle text-center">
              <div>
                <span className="text-[9px] text-content-muted block">{language === 'zh' ? '自然漂移' : 'Drift CAGR'}</span>
                <span className="text-xs font-bold text-content-secondary">+{data.rebalancing_simulation.drift_cagr_pct}%</span>
              </div>
              <div>
                <span className="text-[9px] text-content-muted block">{language === 'zh' ? '动态再平衡' : 'Rebalanced'}</span>
                <span className="text-xs font-bold text-positive">+{data.rebalancing_simulation.quarterly_rebalanced_cagr_pct}%</span>
              </div>
              <div>
                <span className="text-[9px] text-content-muted block">{language === 'zh' ? '超额收割' : 'Bonus'}</span>
                <span className="text-xs font-extrabold text-brand">
                  {data.rebalancing_simulation.rebalancing_bonus_bps > 0 ? '+' : ''}{data.rebalancing_simulation.rebalancing_bonus_bps} bps
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Drawdown Events Card */}
        <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-warning" />
            <h4 className="text-xs font-bold text-content-primary">
              {language === 'zh' ? '历史大级别回撤事件 (≥10% Drawdowns)' : 'Major Drawdown Events (≥10%)'}
            </h4>
          </div>
          {data.drawdown_events && data.drawdown_events.length > 0 ? (
            <div className="space-y-2 mt-2">
              {data.drawdown_events.map((evt, idx) => (
                <div key={idx} className="bg-surface p-2.5 rounded-xl border border-border-subtle text-[11px] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-negative">-{evt.depth_pct}%</span>
                    <span className="text-content-muted mx-1.5">•</span>
                    <span className="text-content-secondary">{evt.peak_date.slice(0, 4)} → {evt.trough_date.slice(0, 4)}</span>
                  </div>
                  <div className="text-[10px] text-content-muted font-mono">
                    {evt.recovery_date ? `Recovered in ${evt.recovery_date.slice(0, 4)}` : 'Ongoing Recovery'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-content-muted text-xs">
              {language === 'zh' ? '该标的在回测周期内未发生超过 10% 的严重回撤。' : 'No major drawdowns exceeding 10% recorded during this period.'}
            </div>
          )}
        </div>
      </div>

      {/* Annual Breakdown Table */}
      <div className="overflow-x-auto border border-border-subtle rounded-2xl bg-surface shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-subtle text-content-muted uppercase tracking-wider text-[10px] border-b border-border-subtle">
            <tr>
              <th className="p-3.5">{t.filingYear}</th>
              <th className="p-3.5 text-positive font-bold">{symbol} {t.returnHeader}</th>
              <th className="p-3.5 text-content-secondary">{data.benchmark} {t.returnHeader}</th>
              <th className="p-3.5 text-right font-bold">
                <BilingualHoverCard termKey="Alpha">
                  {t.alpha}
                </BilingualHoverCard>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface">
            {data.annual_breakdown.map((row) => (
              <tr key={row.year} className="hover:bg-surface-subtle transition-colors">
                <td className="p-3.5 font-bold font-mono text-content-primary">{row.year}</td>
                <td className="p-3.5 font-mono font-bold text-positive">
                  {row.portfolio_return_pct >= 0 ? `+${row.portfolio_return_pct}%` : `${row.portfolio_return_pct}%`}
                </td>
                <td className="p-3.5 font-mono text-content-secondary">
                  {row.benchmark_return_pct >= 0 ? `+${row.benchmark_return_pct}%` : `${row.benchmark_return_pct}%`}
                </td>
                <td className="p-3.5 text-right font-mono font-bold">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${
                    row.alpha_pct >= 0
                      ? 'prism-badge-positive'
                      : 'prism-badge-negative'
                  }`}>
                    {row.alpha_pct >= 0 ? `+${row.alpha_pct}%` : `${row.alpha_pct}%`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
