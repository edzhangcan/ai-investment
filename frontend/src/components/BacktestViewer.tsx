import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { LineChart as ChartIcon, TrendingUp } from 'lucide-react';

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
  max_drawdown_pct: number;
  win_rate_pct: number;
  total_return_pct: number;
  benchmark_total_return_pct: number;
  summary_note: string;
  equity_curve: EquityPoint[];
  annual_breakdown: AnnualBreakdownItem[];
}

export const BacktestViewer: React.FC<BacktestViewerProps> = ({ symbol }) => {
  const { language, t } = useLanguage();
  const [benchmark, setBenchmark] = useState<'SPY' | 'XIU.TO'>(symbol.endsWith('.TO') ? 'XIU.TO' : 'SPY');
  const [data, setData] = useState<BacktestResponsePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      <div className="prism-surface-subtle p-4 mb-6 text-xs text-content-secondary font-medium flex items-start gap-2.5 shadow-sm">
        <TrendingUp className="w-4 h-4 text-positive shrink-0 mt-0.5" />
        <div>{data.summary_note}</div>
      </div>

      {/* 4 Quantitative Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="prism-surface-subtle p-4 shadow-sm">
          <div className="text-[11px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="CAGR">
              {t.cagr}
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-positive">+{data.cagr_pct}%</div>
          <div className="text-[10px] text-content-muted mt-0.5">Vs {data.benchmark}: +{data.benchmark_cagr_pct}%</div>
        </div>

        <div className="prism-surface-subtle p-4 shadow-sm">
          <div className="text-[11px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="SharpeRatio">
              {t.sharpeRatio}
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-brand">{data.sharpe_ratio}</div>
          <div className="text-[10px] text-content-muted mt-0.5">{t.riskFreeRate}</div>
        </div>

        <div className="prism-surface-subtle p-4 shadow-sm">
          <div className="text-[11px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="MaxDrawdown">
              {t.maxDrawdown}
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-negative">-{data.max_drawdown_pct}%</div>
          <div className="text-[10px] text-content-muted mt-0.5">{t.peakToTroughRisk}</div>
        </div>

        <div className="prism-surface-subtle p-4 shadow-sm">
          <div className="text-[11px] text-content-muted font-semibold mb-1">
            <BilingualHoverCard termKey="WinRate">
              {t.winRate}
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-warning">{data.win_rate_pct}%</div>
          <div className="text-[10px] text-content-muted mt-0.5">{t.outperformedBenchmark}</div>
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
