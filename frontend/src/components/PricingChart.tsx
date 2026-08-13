import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Target, CheckCircle2, Sliders, Calendar } from 'lucide-react';

interface PricingChartProps {
  pricingData: any;
  isPlainTalk?: boolean;
}

export const PricingChart: React.FC<PricingChartProps> = ({ pricingData, isPlainTalk = false }) => {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '5Y'>('1Y');
  const [show50D, setShow50D] = useState(true);
  const [show200D, setShow200D] = useState(true);
  const [showDCF, setShowDCF] = useState(true);

  if (!pricingData) return null;

  const currentPrice = pricingData.current_price;
  const fiftySma = pricingData.fifty_day_sma;
  const twoHundredSma = pricingData.two_hundred_day_sma;
  const dcfFairValue = pricingData.dcf_fair_value;
  const buyMin = pricingData.ideal_buy_range_min;
  const buyMax = pricingData.ideal_buy_range_max;
  const currency = pricingData.currency || "USD";

  // Points count depending on timeframe
  const pointsMap = { '1M': 10, '3M': 15, '6M': 20, '1Y': 24, '5Y': 36 };
  const pointCount = pointsMap[timeframe];

  // Generate dynamic chart data depending on timeframe
  const chartData = Array.from({ length: pointCount }, (_, i) => {
    const month = `${timeframe}-${i + 1}`;
    const volatility = (Math.sin(i * 0.5) * 0.04);
    const trendFactor = 0.88 + (i / (pointCount - 1)) * 0.16 + volatility;
    return {
      month,
      Price: Math.round((twoHundredSma * trendFactor) * 100) / 100,
      "50D_SMA": Math.round(fiftySma * 100) / 100,
      "200D_SMA": Math.round(twoHundredSma * 100) / 100,
    };
  });

  chartData[pointCount - 1].Price = currentPrice;

  return (
    <div className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6 transition-all ${
      isPlainTalk ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
    }`}>
      {/* Top Header & Range Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>{t.pricingOverlay}</span>
          </div>
          <h3 className="text-base font-bold text-slate-100 mt-1">
            {t.idealBuyRange}: <span className="text-emerald-400">${buyMin} – ${buyMax} {currency}</span>
          </h3>
        </div>

        {/* Time Horizon Selector Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['1M', '3M', '6M', '1Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  timeframe === tf
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400">
              <BilingualHoverCard termKey="DCF" isPlainTalk={isPlainTalk}>
                {t.fairValue}
              </BilingualHoverCard>:
            </span>
            <span className="font-bold text-emerald-300"> ${dcfFairValue} {currency}</span>
          </div>
        </div>
      </div>

      {/* Layer Toggles & Current Price Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span>Chart Overlays:</span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-indigo-300">
            <input
              type="checkbox"
              checked={show50D}
              onChange={(e) => setShow50D(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            <span>
              <BilingualHoverCard termKey="SMA50" isPlainTalk={isPlainTalk}>
                50D SMA
              </BilingualHoverCard> (${fiftySma})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-indigo-400">
            <input
              type="checkbox"
              checked={show200D}
              onChange={(e) => setShow200D(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <span>
              <BilingualHoverCard termKey="SMA200" isPlainTalk={isPlainTalk}>
                200D SMA
              </BilingualHoverCard> (${twoHundredSma})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-amber-300">
            <input
              type="checkbox"
              checked={showDCF}
              onChange={(e) => setShowDCF(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span>
              <BilingualHoverCard termKey="DCF" isPlainTalk={isPlainTalk}>
                DCF Fair Value
              </BilingualHoverCard> (${dcfFairValue})
            </span>
          </label>
        </div>

        <div className="text-slate-300 font-medium">
          Current Price: <span className="font-bold text-slate-100">${currentPrice} {currency}</span>
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

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} tickLine={false} />

            <Tooltip
              contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: '#34d399' }}
            />

            {/* Ideal Buy Zone Band */}
            <ReferenceLine y={buyMax} stroke="#10b981" strokeDasharray="3 3" label={{ value: `Buy Ceiling ($${buyMax})`, fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine y={buyMin} stroke="#059669" strokeDasharray="3 3" label={{ value: `Buy Floor ($${buyMin})`, fill: '#059669', fontSize: 10 }} />

            {/* DCF Fair Value Anchor */}
            {showDCF && (
              <ReferenceLine y={dcfFairValue} stroke="#f59e0b" strokeWidth={2} label={{ value: `DCF ($${dcfFairValue})`, fill: '#f59e0b', fontSize: 10, position: 'right' }} />
            )}

            <Area type="monotone" dataKey="Price" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#priceGradient)" />

            {show50D && <Area type="monotone" dataKey="50D_SMA" stroke="#818cf8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />}
            {show200D && <Area type="monotone" dataKey="200D_SMA" stroke="#6366f1" strokeWidth={2} strokeDasharray="2 2" fill="none" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
