import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { LineChart as ChartIcon, TrendingUp, ShieldAlert, Award, Calendar, Compass, RefreshCw } from 'lucide-react';

interface BacktestViewerProps {
  symbol: string;
  isPlainTalk?: boolean;
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

export const BacktestViewer: React.FC<BacktestViewerProps> = ({ symbol, isPlainTalk = false }) => {
  const { language, t } = useLanguage();
  const [benchmark, setBenchmark] = useState<'SPY' | 'XIU.TO'>(symbol.endsWith('.TO') ? 'XIU.TO' : 'SPY');
  const [data, setData] = useState<BacktestResponsePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBacktest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/backtest/stock/${symbol}?benchmark=${benchmark}&lang=${language}`);
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl animate-pulse flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-3 text-slate-400 text-xs">
          <ChartIcon className="w-5 h-5 animate-spin text-emerald-400" />
          <span>Simulating 5-Year Historical Macro Cycle Performance (2021-2025)...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-xl text-slate-950 shadow-md">
              <ChartIcon className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <BilingualHoverCard termKey="Backtest" isPlainTalk={isPlainTalk}>
                5-Year Historical Quantitative Backtest (2021 – 2025)
              </BilingualHoverCard>
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            5-Year rolling annual returns, Sharpe Ratio, Max Drawdown & CAGR vs benchmark
          </p>
        </div>

        {/* Benchmark Switcher Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setBenchmark('SPY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              benchmark === 'SPY'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            S&P 500 (SPY)
          </button>
          <button
            onClick={() => setBenchmark('XIU.TO')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              benchmark === 'XIU.TO'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TSX 60 (XIU.TO)
          </button>
        </div>
      </div>

      {/* Summary Note Banner */}
      <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl mb-6 text-xs text-slate-300 font-medium flex items-start gap-2.5">
        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>{data.summary_note}</div>
      </div>

      {/* 4 Quantitative Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold mb-1">
            <BilingualHoverCard termKey="CAGR" isPlainTalk={isPlainTalk}>
              CAGR (年化复利)
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-emerald-400">+{data.cagr_pct}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Vs {data.benchmark}: +{data.benchmark_cagr_pct}%</div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold mb-1">
            <BilingualHoverCard termKey="SharpeRatio" isPlainTalk={isPlainTalk}>
              Sharpe Ratio (夏普比率)
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-indigo-300">{data.sharpe_ratio}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Risk-free rate: 3.5%</div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold mb-1">
            <BilingualHoverCard termKey="MaxDrawdown" isPlainTalk={isPlainTalk}>
              Max Drawdown (最大回撤)
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-rose-400">-{data.max_drawdown_pct}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Peak-to-trough risk</div>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="text-[11px] text-slate-400 font-semibold mb-1">
            <BilingualHoverCard termKey="WinRate" isPlainTalk={isPlainTalk}>
              Win Rate (胜率)
            </BilingualHoverCard>
          </div>
          <div className="text-lg font-extrabold text-amber-300">{data.win_rate_pct}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Outperformed benchmark</div>
        </div>
      </div>

      {/* Annual Breakdown Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-3.5">Filing Year</th>
              <th className="p-3.5 text-emerald-400 font-bold">{symbol} Return</th>
              <th className="p-3.5 text-slate-300">{data.benchmark} Return</th>
              <th className="p-3.5 text-right font-bold">
                <BilingualHoverCard termKey="Alpha" isPlainTalk={isPlainTalk}>
                  Alpha (超额收益)
                </BilingualHoverCard>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {data.annual_breakdown.map((row) => (
              <tr key={row.year} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3.5 font-bold font-mono text-slate-200">{row.year}</td>
                <td className="p-3.5 font-mono font-bold text-emerald-400">
                  {row.portfolio_return_pct >= 0 ? `+${row.portfolio_return_pct}%` : `${row.portfolio_return_pct}%`}
                </td>
                <td className="p-3.5 font-mono text-slate-300">
                  {row.benchmark_return_pct >= 0 ? `+${row.benchmark_return_pct}%` : `${row.benchmark_return_pct}%`}
                </td>
                <td className="p-3.5 text-right font-mono font-bold">
                  <span className={`px-2 py-0.5 rounded text-[11px] ${
                    row.alpha_pct >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
