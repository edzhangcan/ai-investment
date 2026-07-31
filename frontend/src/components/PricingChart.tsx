import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { JargonTooltip } from './JargonTooltip';
import { Target, TrendingDown, CheckCircle2 } from 'lucide-react';

interface PricingChartProps {
  pricingData: any;
}

export const PricingChart: React.FC<PricingChartProps> = ({ pricingData }) => {
  if (!pricingData) return null;

  const currentPrice = pricingData.current_price;
  const fiftySma = pricingData.fifty_day_sma;
  const twoHundredSma = pricingData.two_hundred_day_sma;
  const dcfFairValue = pricingData.dcf_fair_value;
  const buyMin = pricingData.ideal_buy_range_min;
  const buyMax = pricingData.ideal_buy_range_max;
  const currency = pricingData.currency || "USD";

  // Generate 12 synthetic historical price points anchored to real metrics
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const month = `M${i + 1}`;
    const factor = 0.90 + (i / 11) * 0.15;
    return {
      month,
      Price: Math.round((twoHundredSma * factor) * 100) / 100,
      "50D SMA": Math.round(fiftySma * 100) / 100,
      "200D SMA": Math.round(twoHundredSma * 100) / 100,
    };
  });

  chartData[11].Price = currentPrice;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>估值与择时分析器 (Pricing & Technical Overlay)</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            理想买入区间：<span className="text-emerald-400">${buyMin} – ${buyMax} {currency}</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">DCF <JargonTooltip termKey="DCF">合理估值</JargonTooltip>: </span>
            <span className="font-bold text-emerald-300">${dcfFairValue} {currency}</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">当前市价: </span>
            <span className="font-bold text-slate-100">${currentPrice} {currency}</span>
          </div>
        </div>
      </div>

      {/* Action Advice Callout */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 mb-4 flex items-center gap-3 text-xs text-slate-300">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold text-emerald-400">{pricingData.action_status}: </span>
          {pricingData.timing_advice}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
            
            {/* 200D MA Reference Line */}
            <ReferenceLine y={twoHundredSma} stroke="#6366f1" strokeDasharray="3 3" label={{ value: '200D MA', fill: '#818cf8', fontSize: 10 }} />
            {/* DCF Fair Value Line */}
            <ReferenceLine y={dcfFairValue} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'DCF Fair Value', fill: '#fbbf24', fontSize: 10 }} />

            <Area type="monotone" dataKey="Price" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#priceColor)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
