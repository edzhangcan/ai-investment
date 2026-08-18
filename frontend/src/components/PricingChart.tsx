import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Target, CheckCircle2, Sliders } from 'lucide-react';

interface PricingChartProps {
  pricingData: any;
}

export const PricingChart: React.FC<PricingChartProps> = ({ pricingData }) => {
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
    <div className="prism-card p-5 mb-6 transition-all">
      {/* Top Header & Range Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 border-b border-border-subtle pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-content-muted font-semibold">
            <Target className="w-4 h-4 text-positive" />
            <span>{t.pricingOverlay}</span>
          </div>
          <h3 className="text-base font-bold text-content-primary mt-1">
            {t.idealBuyRange}: <span className="text-positive">${buyMin} – ${buyMax} {currency}</span>
          </h3>
        </div>

        {/* Time Horizon Selector Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-subtle p-1 rounded-xl border border-border-subtle text-xs">
            {(['1M', '3M', '6M', '1Y', '5Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`h-7 px-2.5 rounded-lg font-bold transition-all inline-flex items-center cursor-pointer box-border ${
                  timeframe === tf
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="prism-badge-warning text-xs">
            <span>
              <BilingualHoverCard termKey="DCF">
                {t.fairValue}
              </BilingualHoverCard>:
            </span>
            <span className="font-bold"> ${dcfFairValue} {currency}</span>
          </div>
        </div>
      </div>

      {/* Layer Toggles & Current Price Callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 prism-surface-subtle p-2.5 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-content-muted font-semibold flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-brand" />
            <span>Chart Overlays:</span>
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer text-content-secondary font-medium hover:text-content-primary">
            <input
              type="checkbox"
              checked={show50D}
              onChange={(e) => setShow50D(e.target.checked)}
              className="accent-brand rounded"
            />
            <span>
              <BilingualHoverCard termKey="SMA50">
                50D SMA
              </BilingualHoverCard> (${fiftySma})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-content-secondary font-medium hover:text-content-primary">
            <input
              type="checkbox"
              checked={show200D}
              onChange={(e) => setShow200D(e.target.checked)}
              className="accent-brand rounded"
            />
            <span>
              <BilingualHoverCard termKey="SMA200">
                200D SMA
              </BilingualHoverCard> (${twoHundredSma})
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-warning font-medium">
            <input
              type="checkbox"
              checked={showDCF}
              onChange={(e) => setShowDCF(e.target.checked)}
              className="accent-warning rounded"
            />
            <span>
              <BilingualHoverCard termKey="DCF">
                DCF Fair Value
              </BilingualHoverCard> (${dcfFairValue})
            </span>
          </label>
        </div>

        <div className="text-content-secondary font-medium">
          Current Price: <span className="font-bold text-content-primary">${currentPrice} {currency}</span>
        </div>
      </div>

      {/* Action Advice Callout */}
      <div className="prism-surface-subtle p-3 mb-4 flex items-center gap-3 text-xs text-content-secondary shadow-sm">
        <CheckCircle2 className="w-5 h-5 text-positive shrink-0" />
        <div>
          <span className="font-bold text-positive">{pricingData.action_status}: </span>
          {pricingData.timing_advice}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-positive, #10b981)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-positive, #10b981)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="month" stroke="var(--text-muted, #64748b)" fontSize={11} tickLine={false} />
            <YAxis domain={['auto', 'auto']} stroke="var(--text-muted, #64748b)" fontSize={11} tickLine={false} />

            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-surface, #ffffff)', borderColor: 'var(--border-subtle, #e2e8f0)', color: 'var(--text-primary, #0f172a)', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: 'var(--accent-positive, #10b981)' }}
            />

            {/* Ideal Buy Zone Band */}
            <ReferenceLine y={buyMax} stroke="var(--accent-positive, #10b981)" strokeDasharray="3 3" label={{ value: `Buy Ceiling ($${buyMax})`, fill: 'var(--accent-positive, #10b981)', fontSize: 10 }} />
            <ReferenceLine y={buyMin} stroke="var(--accent-positive, #059669)" strokeDasharray="3 3" label={{ value: `Buy Floor ($${buyMin})`, fill: 'var(--accent-positive, #059669)', fontSize: 10 }} />

            {/* DCF Fair Value Anchor */}
            {showDCF && (
              <ReferenceLine y={dcfFairValue} stroke="var(--accent-warning, #f59e0b)" strokeWidth={2} label={{ value: `DCF ($${dcfFairValue})`, fill: 'var(--accent-warning, #f59e0b)', fontSize: 10, position: 'right' }} />
            )}

            <Area type="monotone" dataKey="Price" stroke="var(--accent-positive, #10b981)" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGradient)" />

            {show50D && <Area type="monotone" dataKey="50D_SMA" stroke="var(--accent-brand, #38bdf8)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />}
            {show200D && <Area type="monotone" dataKey="200D_SMA" stroke="var(--text-muted, #64748b)" strokeWidth={2} strokeDasharray="2 2" fill="none" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
