import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { Target, CheckCircle2, Sliders, AlertTriangle, TrendingUp, Layers, Table, Calculator, ChevronDown, ChevronUp, Grid } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface PricingChartProps {
  pricingData: any;
}

export const PricingChart: React.FC<PricingChartProps> = ({ pricingData }) => {
  const { t, language } = useLanguage();
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y' | '5Y'>('1Y');
  const [show50D, setShow50D] = useState(true);
  const [show200D, setShow200D] = useState(true);
  const [showDCF, setShowDCF] = useState(true);
  const [isLog, setIsLog] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [showInstitutionalBridge, setShowInstitutionalBridge] = useState(true);

  if (!pricingData) return null;

  const currentPrice = pricingData.current_price;
  const fiftySma = pricingData.fifty_day_sma;
  const twoHundredSma = pricingData.two_hundred_day_sma;
  const dcfFairValue = pricingData.dcf_fair_value;
  const buyMin = pricingData.ideal_buy_range_min;
  const buyMax = pricingData.ideal_buy_range_max;
  const currency = pricingData.currency || "USD";
  const taxonomy = pricingData.taxonomy;
  const reverseDcf = pricingData.reverse_dcf;
  const shareholderYield = pricingData.total_shareholder_yield_pct ?? taxonomy?.total_shareholder_yield_pct ?? 0.0;
  const dcfApplicable = pricingData.dcf_applicable !== false;

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
          <div className="flex items-center gap-2 text-xs text-content-muted font-semibold flex-wrap">
            <Target className="w-4 h-4 text-positive" />
            <span>{t.pricingOverlay}</span>
            {taxonomy && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                taxonomy.taxonomy === 'TREE'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                  : taxonomy.taxonomy === 'GRAIN'
                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
              }`}>
                {language === 'zh' ? taxonomy.badge_zh : taxonomy.badge_en}
              </span>
            )}
            <ProvenanceBadge provenance={pricingData.provenance} />
          </div>
          <h3 className="text-base font-bold text-content-primary mt-1">
            {dcfApplicable ? (
              <>
                {t.idealBuyRange}: <span className="text-positive">${buyMin} – ${buyMax} {currency}</span>
              </>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {language === 'zh' ? '种菜股：无基本面安全边际买入区间' : 'Vegetable Stock: No Fundamental DCF Buy Zone'}
              </span>
            )}
          </h3>
        </div>

        {/* Time Horizon & Scale Selector Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Log / Linear Toggle Button */}
          <button
            onClick={() => setIsLog(!isLog)}
            className={`h-7 px-2.5 rounded-xl font-bold text-xs border transition-all inline-flex items-center gap-1 cursor-pointer box-border ${
              isLog
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-surface-subtle text-content-secondary border-border-subtle hover:text-content-primary'
            }`}
            title="Toggle between Logarithmic Scale and Linear Scale"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{isLog ? t.logScaleLabel : t.linearScaleLabel}</span>
          </button>

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

          {dcfApplicable && (
            <div className="text-xs font-medium text-content-secondary flex items-center gap-1.5 bg-surface-subtle px-3 py-1.5 rounded-xl border border-border-subtle shadow-sm">
              <span>
                <BilingualHoverCard termKey="DCF">
                  {t.fairValue}
                </BilingualHoverCard>:
              </span>
              <span className="font-extrabold text-warning font-mono"> ${dcfFairValue} {currency}</span>
            </div>
          )}
        </div>
      </div>

      {/* Layer Toggles & Shareholder Yield Callout */}
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

          {dcfApplicable && (
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
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Total Shareholder Yield Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.shareholderYieldLabel}:</span>
            <span className="font-extrabold font-mono">{shareholderYield}%</span>
          </div>

          <div className="text-content-secondary font-medium">
            Current Price: <span className="font-bold text-content-primary">${currentPrice} {currency}</span>
          </div>
        </div>
      </div>

      {/* Prosperity Trap Warning Banner */}
      {reverseDcf?.is_prosperity_trap && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              {language === 'zh' ? '⚠️ 景气度陷阱预警 (Prosperity Trap)' : '⚠️ Prosperity Trap Warning'}:
            </span>{' '}
            {reverseDcf.prosperity_trap_note || t.prosperityTrapAlert}
          </div>
        </div>
      )}

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
            <YAxis
              scale={isLog ? 'log' : 'linear'}
              domain={['auto', 'auto']}
              stroke="var(--text-muted, #64748b)"
              fontSize={11}
              tickLine={false}
            />

            <Tooltip
              contentStyle={{ backgroundColor: 'var(--bg-surface, #ffffff)', borderColor: 'var(--border-subtle, #e2e8f0)', color: 'var(--text-primary, #0f172a)', borderRadius: '12px', fontSize: '12px' }}
              itemStyle={{ color: 'var(--accent-positive, #10b981)' }}
            />

            {/* Ideal Buy Zone Band */}
            {dcfApplicable && buyMax && (
              <ReferenceLine y={buyMax} stroke="var(--accent-positive, #10b981)" strokeDasharray="3 3" label={{ value: `Buy Ceiling ($${buyMax})`, fill: 'var(--accent-positive, #10b981)', fontSize: 10 }} />
            )}
            {dcfApplicable && buyMin && (
              <ReferenceLine y={buyMin} stroke="var(--accent-positive, #059669)" strokeDasharray="3 3" label={{ value: `Buy Floor ($${buyMin})`, fill: 'var(--accent-positive, #059669)', fontSize: 10 }} />
            )}

            {/* DCF Fair Value Anchor */}
            {dcfApplicable && showDCF && dcfFairValue && (
              <ReferenceLine y={dcfFairValue} stroke="var(--accent-warning, #f59e0b)" strokeWidth={2} label={{ value: `DCF ($${dcfFairValue})`, fill: 'var(--accent-warning, #f59e0b)', fontSize: 10, position: 'right' }} />
            )}

            <Area type="monotone" dataKey="Price" stroke="var(--accent-positive, #10b981)" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGradient)" />

            {show50D && <Area type="monotone" dataKey="50D_SMA" stroke="var(--accent-brand, #38bdf8)" strokeWidth={1.5} strokeDasharray="4 4" fill="none" />}
            {show200D && <Area type="monotone" dataKey="200D_SMA" stroke="var(--text-muted, #64748b)" strokeWidth={2} strokeDasharray="2 2" fill="none" />}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Reverse-DCF Implied 10Y Earnings Ceiling Bar & Matrix */}
      {reverseDcf && reverseDcf.current_pe > 0 && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-content-primary">
                {t.impliedCeilingTitle}:
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-mono font-extrabold">
                {reverseDcf.implied_10y_ceiling_multiple}x (10Y E_10/E_0)
              </span>
              {reverseDcf.implied_10y_profit_usd && (
                <span className="text-xs text-content-muted font-mono">
                  Implied 10Y Profit: ${(reverseDcf.implied_10y_profit_usd / 1e9).toFixed(1)}B
                </span>
              )}
            </div>

            <button
              onClick={() => setShowMatrix(!showMatrix)}
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Table className="w-3.5 h-3.5" />
              <span>{showMatrix ? (language === 'zh' ? '收起敏感度矩阵' : 'Hide Sensitivity Matrix') : (language === 'zh' ? '展开 10Y 敏感度矩阵' : 'Show 10Y Sensitivity Matrix')}</span>
            </button>
          </div>

          {showMatrix && reverseDcf.matrix && reverseDcf.matrix.length > 0 && (
            <div className="overflow-x-auto mt-2 rounded-xl border border-border-subtle bg-surface-subtle p-3">
              <p className="text-[11px] text-content-muted mb-2">
                {language === 'zh'
                  ? '透视叙事矩阵：在不同折现率 (r) 与 10年利润扩张倍数 (M) 下，当前估值所对应的合理动态市盈率 (Fair Dynamic P/E)。'
                  : 'Narrative Penetration Matrix: Fair Dynamic P/E implied across required hurdle rates (r) and 10-year earnings expansion multiples (M).'}
              </p>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border-subtle text-content-muted">
                    <th className="py-1 px-2 font-semibold">Discount Rate (r)</th>
                    <th className="py-1 px-2 font-semibold">1.5x</th>
                    <th className="py-1 px-2 font-semibold">2.0x</th>
                    <th className="py-1 px-2 font-semibold">3.0x</th>
                    <th className="py-1 px-2 font-semibold">5.0x</th>
                    <th className="py-1 px-2 font-semibold">8.0x</th>
                    <th className="py-1 px-2 font-semibold">10.0x</th>
                  </tr>
                </thead>
                <tbody>
                  {[8.0, 9.0, 10.0, 11.0, 12.0].map((rRate) => {
                    const rowCells = reverseDcf.matrix.filter((c: any) => Math.abs(c.discount_rate_pct - rRate) < 0.1);
                    return (
                      <tr key={rRate} className="border-b border-border-subtle/50 hover:bg-surface/50">
                        <td className="py-1 px-2 font-bold text-content-primary font-mono">{rRate}%</td>
                        {[1.5, 2.0, 3.0, 5.0, 8.0, 10.0].map((mMult) => {
                          const cell = rowCells.find((c: any) => Math.abs(c.ceiling_multiple - mMult) < 0.1);
                          return (
                            <td key={mMult} className="py-1 px-2 font-mono text-content-secondary">
                              {cell ? `${cell.fair_pe}x` : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Institutional EV-to-Equity Bridge & 5x5 DCF Sensitivity Heatmap */}
      {(pricingData.bridge || (pricingData.sensitivity_matrix && pricingData.sensitivity_matrix.length > 0)) && (
        <div className="mt-4 pt-3 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold text-content-primary">
                {language === 'zh' ? '机构级估值桥 (EV-to-Equity) & 5x5 敏感度矩阵' : 'Institutional DCF Bridge & 5x5 Sensitivity Matrix'}
              </span>
              {pricingData.bridge?.dynamic_wacc_used && (
                <span className="px-2 py-0.5 rounded-lg bg-brand/10 border border-brand/20 text-brand text-[11px] font-mono font-bold">
                  Dynamic WACC: {(pricingData.bridge.dynamic_wacc_used * 100).toFixed(1)}%
                </span>
              )}
            </div>

            <button
              onClick={() => setShowInstitutionalBridge(!showInstitutionalBridge)}
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>
                {showInstitutionalBridge
                  ? (language === 'zh' ? '收起估值桥与矩阵' : 'Hide Bridge & Matrix')
                  : (language === 'zh' ? '展开估值桥与矩阵' : 'Show Bridge & Matrix')}
              </span>
              {showInstitutionalBridge ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showInstitutionalBridge && (
            <div className="space-y-3">
              {/* EV-to-Equity Valuation Bridge Metric Pills */}
              {pricingData.bridge && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-content-muted block">{language === 'zh' ? '企业价值 (EV)' : 'Enterprise Value'}</span>
                    <span className="text-xs font-bold text-content-primary font-mono">
                      {pricingData.bridge.enterprise_value >= 1e9
                        ? `$${(pricingData.bridge.enterprise_value / 1e9).toFixed(2)}B`
                        : `$${(pricingData.bridge.enterprise_value / 1e6).toFixed(1)}M`}
                    </span>
                  </div>

                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-content-muted block">{language === 'zh' ? '+ 现金储备' : '+ Cash'}</span>
                    <span className="text-xs font-bold text-positive font-mono">
                      +{pricingData.bridge.plus_cash >= 1e9
                        ? `$${(pricingData.bridge.plus_cash / 1e9).toFixed(2)}B`
                        : `$${(pricingData.bridge.plus_cash / 1e6).toFixed(1)}M`}
                    </span>
                  </div>

                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-content-muted block">{language === 'zh' ? '- 全部总负债' : '- Total Debt'}</span>
                    <span className="text-xs font-bold text-negative font-mono">
                      -{pricingData.bridge.less_total_debt >= 1e9
                        ? `$${(pricingData.bridge.less_total_debt / 1e9).toFixed(2)}B`
                        : `$${(pricingData.bridge.less_total_debt / 1e6).toFixed(1)}M`}
                    </span>
                  </div>

                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-content-muted block">{language === 'zh' ? '- 年度 SBC 扣除' : '- Annual SBC'}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      -{pricingData.bridge.less_sbc_annual >= 1e9
                        ? `$${(pricingData.bridge.less_sbc_annual / 1e9).toFixed(2)}B`
                        : `$${(pricingData.bridge.less_sbc_annual / 1e6).toFixed(1)}M`}
                    </span>
                  </div>

                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-brand/30 bg-brand/5">
                    <span className="text-[10px] text-brand font-semibold block">{language === 'zh' ? '= 归母股权价值' : '= Equity Value'}</span>
                    <span className="text-xs font-extrabold text-brand font-mono">
                      {pricingData.bridge.equity_value >= 1e9
                        ? `$${(pricingData.bridge.equity_value / 1e9).toFixed(2)}B`
                        : `$${(pricingData.bridge.equity_value / 1e6).toFixed(1)}M`}
                    </span>
                  </div>

                  <div className="prism-surface-subtle p-2.5 rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-content-muted block">{language === 'zh' ? '每股公允价值' : 'Fair Value / Share'}</span>
                    <span className="text-xs font-extrabold text-positive font-mono">
                      ${pricingData.bridge.fair_value_per_share} {currency}
                    </span>
                  </div>
                </div>
              )}

              {/* Currency conversion or outlier notes */}
              {pricingData.bridge?.currency_conversion_note && (
                <div className="text-[11px] text-content-muted italic px-1">
                  💡 {pricingData.bridge.currency_conversion_note}
                </div>
              )}

              {/* 5x5 Sensitivity Matrix Table */}
              {pricingData.sensitivity_matrix && pricingData.sensitivity_matrix.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-subtle p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-content-primary">
                      {language === 'zh'
                        ? '5x5 DCF 估值敏感度矩阵 (横轴: 永续增长率 g | 纵轴: 加权平均资本成本 WACC)'
                        : '5x5 DCF Sensitivity Heatmap (Columns: Terminal Growth g | Rows: WACC)'}
                    </span>
                    <span className="text-[10px] text-content-muted flex items-center gap-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &gt;+10% Upside
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> &lt;-10% Downside
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 rounded border border-brand bg-brand/10"></span> Base Case
                      </span>
                    </span>
                  </div>

                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="border-b border-border-subtle text-content-muted">
                        <th className="py-1.5 px-2 font-semibold text-left">WACC \ g</th>
                        {pricingData.sensitivity_matrix[0].map((col: any, cIdx: number) => (
                          <th key={cIdx} className="py-1.5 px-2 font-mono font-semibold">
                            {(col.terminal_growth * 100).toFixed(1)}%
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pricingData.sensitivity_matrix.map((row: any[], rIdx: number) => (
                        <tr key={rIdx} className="border-b border-border-subtle/40 hover:bg-surface/50 transition-colors">
                          <td className="py-2 px-2 font-mono font-bold text-content-primary text-left">
                            {(row[0].wacc * 100).toFixed(1)}%
                          </td>
                          {row.map((cell: any, cIdx: number) => {
                            const isBase = rIdx === 2 && cIdx === 2;
                            const isHighUpside = cell.upside_pct > 10.0;
                            const isDeepDownside = cell.upside_pct < -10.0;
                            return (
                              <td
                                key={cIdx}
                                className={`py-1.5 px-2 font-mono transition-all relative ${
                                  isBase ? 'ring-2 ring-brand rounded-lg bg-brand/10 font-bold' : ''
                                } ${
                                  isHighUpside
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                                    : isDeepDownside
                                    ? 'text-rose-600 dark:text-rose-400 bg-rose-500/5'
                                    : 'text-content-secondary'
                                }`}
                              >
                                <div className="text-[11px] font-bold">${cell.fair_value}</div>
                                <div className="text-[10px] opacity-80">
                                  {cell.upside_pct >= 0 ? '+' : ''}{cell.upside_pct.toFixed(1)}%
                                </div>
                                {isBase && (
                                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded text-[8px] font-bold bg-brand text-white">
                                    BASE
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

