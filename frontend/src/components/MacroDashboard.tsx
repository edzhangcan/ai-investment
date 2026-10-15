import React, { useState } from 'react';
import { MacroData, PolicyNewsItem, SupportingFact } from '../types';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import {
  Globe,
  TrendingUp,
  ShieldAlert,
  ExternalLink,
  Newspaper,
  Database,
  CheckCircle2,
  RefreshCw,
  Compass,
  Coins,
  Layers,
  Scale,
  AlertTriangle
} from 'lucide-react';

interface MacroDashboardProps {
  macroData: MacroData;
  policyNews?: PolicyNewsItem[];
  supportingFacts?: SupportingFact[];
  credibleSources?: (string | { name: string; domain?: string; type?: string })[];
  onRefreshMacro?: () => Promise<void>;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  macroData,
  policyNews = [],
  supportingFacts = [],
  credibleSources = [],
  onRefreshMacro
}) => {
  const { t, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (!onRefreshMacro || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshToast(null);
    try {
      await onRefreshMacro();
      setRefreshToast('✅ Macro data & policy news refreshed successfully!');
    } catch {
      setRefreshToast('⚠️ Refresh encountered an issue. Using cached data.');
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(null), 4000);
    }
  };

  const factsList: SupportingFact[] = supportingFacts.length > 0 ? supportingFacts : [
    { indicator: "US CPI Inflation YoY", value: "3.4%", source: "FRED (CPIAUCSL)", impact: "High Inflation Sticky" },
    { indicator: "10Y-2Y Treasury Yield Spread", value: "-0.15%", source: "FRED (T10Y2Y)", impact: "Yield Curve Inversion Warning" },
    { indicator: "Fed Target Funds Rate", value: "5.25% - 5.50%", source: "FOMC Statement", impact: "Restrictive Rate Policy" },
    { indicator: "Bank of Canada Policy Rate", value: "4.75%", source: "Bank of Canada Press Release", impact: "Plateau / Gradual Easing" },
    { indicator: "US Unemployment Rate", value: "4.1%", source: "FRED (UNRATE)", impact: "Resilient Labor Market" }
  ];

  const newsList: PolicyNewsItem[] = policyNews.length > 0 ? policyNews : [
    {
      title: "FOMC Reaffirms Data-Dependent Stance Amid Sticky Core Services Inflation",
      source: "Federal Reserve Board",
      date: "2026-08-01",
      url: "https://www.federalreserve.gov",
      summary: "Fed Officials emphasize maintaining restrictive policy rates until inflation convincingly glides down to 2.0% target."
    },
    {
      title: "Bank of Canada Assesses Housing Cost Pressures and Wage Growth Dynamics",
      source: "Bank of Canada",
      date: "2026-07-28",
      url: "https://www.bankofcanada.ca",
      summary: "BoC Monetary Policy Report signals prudent rate calibration to safeguard balance sheet resilience and commercial lending quality."
    },
    {
      title: "US Tech & AI Infrastructure Cloud CapEx Exceeds $200B Annualized Pace",
      source: "SEC EDGAR 10-K Filings",
      date: "2026-08-05",
      url: "https://www.sec.gov/edgar",
      summary: "Hyperscale tech giants increase GPU and power grid CapEx commitments, accelerating enterprise AI software adoption."
    }
  ];

  const sourcesList: any[] = credibleSources.length > 0 ? credibleSources : [
    "Federal Reserve Economic Data (FRED) - St. Louis Fed",
    "SEC EDGAR 10-K / 10-Q Corporate Filing Database",
    "Bank of Canada Monetary Policy Report (MPR)",
    "SEDAR+ Canadian System for Electronic Document Analysis and Retrieval"
  ];

  const bigPicture = macroData.big_picture || {
    modified_buffett_ratio: 1.54,
    modified_buffett_pct: 154.0,
    aiae_allocation_pct: 56.9,
    equity_risk_premium_pct: -0.37,
    dgs10_yield_pct: 4.25,
    dfii10_tips_real_yield_pct: 1.85,
    fed_walcl_trillion: 7.21,
    us_debt_trillion: 35.46,
    money_market_trillion: 6.42,
    gold_board: {
      gold_price_usd: 2450.0,
      gold_log_yoy_pct: 24.5,
      tips_10y_real_yield_pct: 1.85,
      is_fiscal_dominance_decoupled: true,
      regime_en: "Fiscal Dominance & Fiat Debasement (Gold Decoupled from Real Yield)",
      regime_zh: "财政主导与法币信用稀释（金价与美债实际利率深度脱钩）"
    }
  };

  return (
    <div className="prism-card p-6 md:p-8 mb-8">
      {/* Header Title Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 prism-badge-positive rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-content-primary">
              {t.macroTitle}
            </h2>
          </div>
          <p className="text-xs text-content-muted">
            {t.macroSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="prism-badge-brand text-xs flex items-center gap-1.5 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{macroData.cycle_stage}</span>
          </span>
        </div>
      </div>

      {/* Cycle Stage Plain Explanation Banner */}
      <div className="p-4 rounded-2xl mb-6 border text-xs leading-relaxed font-medium transition-all prism-surface-subtle text-content-secondary">
        <div className="flex items-center gap-2 font-bold mb-1 text-content-primary">
          <CheckCircle2 className="w-4 h-4 text-positive" />
          <span>
            <BilingualHoverCard termKey="MacroCycle">
              {t.cycleStage}
            </BilingualHoverCard>: <span className="text-positive font-bold">{macroData.cycle_stage}</span>
          </span>
        </div>
        <p className="text-content-secondary">{macroData.plain_explanation}</p>
      </div>

      {/* Big Picture Macro & 4-Layer Gold Board */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 prism-badge-brand rounded-lg">
              <Compass className="w-4 h-4 text-brand" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-content-primary">
                {language === 'zh'
                  ? '美股大局观与黄金拓扑看板 (Big Picture Macro & 4-Layer Gold Board)'
                  : 'Big Picture Macro & 4-Layer Gold Board'}
              </h3>
              <p className="text-[11px] text-content-muted">
                {language === 'zh'
                  ? '宏观水位：央行资产负债表扩张修正、全社会股票配置权重 (AIAE)、股权风险溢价 (ERP) 与财政主导黄金脱钩'
                  : 'Macro liquidity, household asset allocation, equity risk premium, and fiscal dominance sovereign gold dynamics'}
              </p>
            </div>
          </div>
        </div>

        {/* 3 Valuation & Allocation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Card 1: Modified Buffett Indicator */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-content-secondary flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-brand" />
                  {language === 'zh' ? '修正巴菲特指标' : 'Modified Buffett Indicator'}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  bigPicture.modified_buffett_ratio > 1.8
                    ? 'prism-badge-negative'
                    : bigPicture.modified_buffett_ratio > 1.5
                    ? 'prism-badge-warning'
                    : bigPicture.modified_buffett_ratio >= 1.2
                    ? 'prism-badge-neutral'
                    : 'prism-badge-positive'
                }`}>
                  {bigPicture.modified_buffett_ratio > 1.8
                    ? (language === 'zh' ? '严重过热' : 'Overheated')
                    : bigPicture.modified_buffett_ratio > 1.5
                    ? (language === 'zh' ? '偏高警戒' : 'Elevated')
                    : bigPicture.modified_buffett_ratio >= 1.2
                    ? (language === 'zh' ? '合理估值' : 'Fair Value')
                    : (language === 'zh' ? '深度低估' : 'Undervalued')}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black text-content-primary">
                  {bigPicture.modified_buffett_ratio.toFixed(2)}×
                </span>
                <span className="text-xs text-content-muted">
                  ({bigPicture.modified_buffett_pct.toFixed(1)}%)
                </span>
              </div>
              <p className="text-[10px] text-content-muted font-mono mb-2">
                TMC / (GDP + Fed WALCL ${bigPicture.fed_walcl_trillion}T)
              </p>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle pt-2">
              {language === 'zh'
                ? '引入美联储资产负债表 ($' + bigPicture.fed_walcl_trillion + 'T)，消除自2008年量化宽松印钞对传统巴菲特指标的分子分母失真扭曲。'
                : 'Expands denominator with Fed balance sheet ($' + bigPicture.fed_walcl_trillion + 'T) to adjust for post-QE liquidity expansion.'}
            </p>
          </div>

          {/* Card 2: AIAE Allocation */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-content-secondary flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  {language === 'zh' ? '全社会股票配置权重 (AIAE)' : 'Aggregate Equity Ratio (AIAE)'}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  bigPicture.aiae_allocation_pct > 60
                    ? 'prism-badge-negative'
                    : bigPicture.aiae_allocation_pct > 50
                    ? 'prism-badge-warning'
                    : 'prism-badge-positive'
                }`}>
                  {bigPicture.aiae_allocation_pct > 60
                    ? (language === 'zh' ? '历史极度拥挤' : 'Extreme Crowding')
                    : bigPicture.aiae_allocation_pct > 50
                    ? (language === 'zh' ? '高位拥挤' : 'Crowded >50%')
                    : (language === 'zh' ? '均衡水位' : 'Balanced')}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black text-content-primary">
                  {bigPicture.aiae_allocation_pct.toFixed(1)}%
                </span>
                <span className="text-xs text-content-muted">
                  {language === 'zh' ? '家庭及机构持仓' : 'of Total Financial Assets'}
                </span>
              </div>
              <p className="text-[10px] text-content-muted font-mono mb-2">
                Debt: ${bigPicture.us_debt_trillion}T · Cash MMF: ${bigPicture.money_market_trillion}T
              </p>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle pt-2">
              {language === 'zh'
                ? '全市场家庭与机构股票占全资产权重。超过 50% 为长期回报负相关警戒区（如2000年与2021年底）。'
                : 'Household & institutional equity weighting. Readings above 50% historically signal low 10-year forward equity returns.'}
            </p>
          </div>

          {/* Card 3: Equity Risk Premium */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-content-secondary flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-brand" />
                  {language === 'zh' ? '股权风险溢价 (ERP)' : 'Equity Risk Premium (ERP)'}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  bigPicture.equity_risk_premium_pct < 0
                    ? 'prism-badge-negative'
                    : bigPicture.equity_risk_premium_pct < 1.5
                    ? 'prism-badge-warning'
                    : 'prism-badge-positive'
                }`}>
                  {bigPicture.equity_risk_premium_pct < 0
                    ? (language === 'zh' ? 'TINA 已死 / 负风险溢价' : 'Negative ERP (TINA Dead)')
                    : (language === 'zh' ? '正常风险溢价' : 'Positive ERP')}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-black ${
                  bigPicture.equity_risk_premium_pct < 0 ? 'text-negative' : 'text-positive'
                }`}>
                  {bigPicture.equity_risk_premium_pct > 0 ? '+' : ''}{bigPicture.equity_risk_premium_pct.toFixed(2)}%
                </span>
                <span className="text-xs text-content-muted">
                  vs 10Y UST {bigPicture.dgs10_yield_pct}%
                </span>
              </div>
              <p className="text-[10px] text-content-muted font-mono mb-2">
                Spread = S&P 500 Yield (100/PE) - 10Y Yield
              </p>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle pt-2">
              {language === 'zh'
                ? '当 ERP 跌入负值，股票收益率无法补偿美债无风险利率，对冲宏观黑天鹅需依托哑铃防守与黄金。'
                : 'Negative spread means equities offer less yield than risk-free debt, requiring barbell discipline and real asset hedges.'}
            </p>
          </div>
        </div>

        {/* Gold 4-Layer Board Topology */}
        <div className="prism-surface-subtle p-5 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
                <Coins className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-content-primary">
                  {language === 'zh' ? '黄金拓扑四层看板 (4-Layer Gold Board Topology)' : '4-Layer Gold Board Topology'}
                </h4>
                <p className="text-[10px] text-content-muted">
                  {language === 'zh' ? '法币信用稀释、实际利率锚、央行储备去美元化与地缘凸性' : 'Fiat debasement, real rates, central bank de-dollarization, and geopolitical tail risk'}
                </p>
              </div>
            </div>

            <span className={`text-[11px] font-extrabold px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm ${
              bigPicture.gold_board.is_fiscal_dominance_decoupled
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                : 'prism-badge-neutral'
            }`}>
              <span>⚡</span>
              <span>
                {language === 'zh'
                  ? (bigPicture.gold_board.is_fiscal_dominance_decoupled ? '财政主导：金价与美债实际利率深度脱钩' : '传统实际利率锚定')
                  : (bigPicture.gold_board.is_fiscal_dominance_decoupled ? 'Fiscal Dominance: Gold Decoupled from TIPS Real Yield' : 'Traditional Real Yield Anchor')}
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Layer 1: Spot & Log Momentum */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {language === 'zh' ? '第 1 层 · 现货与动量' : 'Layer 1 · Spot & Momentum'}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                ${bigPicture.gold_board.gold_price_usd.toLocaleString()} <span className="text-[10px] font-medium text-content-muted">USD/oz</span>
              </div>
              <div className="text-xs font-bold text-positive flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Log YoY: +{bigPicture.gold_board.gold_log_yoy_pct}%</span>
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {language === 'zh' ? '主权赤字货币化与法币购买力稀释溢价' : 'Fiat debasement and sovereign fiscal monetization premium'}
              </p>
            </div>

            {/* Layer 2: TIPS Real Yield */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {language === 'zh' ? '第 2 层 · 实际利率锚' : 'Layer 2 · TIPS Real Yield'}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                {bigPicture.gold_board.tips_10y_real_yield_pct}%
              </div>
              <div className="text-xs font-bold text-amber-500">
                {language === 'zh' ? '高位脱钩状态' : 'High Rate Decoupled'}
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {language === 'zh' ? '实际利率高企但金价创历史新高，打破传统反向关系' : 'Real yields remain high yet gold hits highs, breaking traditional beta'}
              </p>
            </div>

            {/* Layer 3: Central Bank Reserve Accumulation */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {language === 'zh' ? '第 3 层 · 央行储备去美元化' : 'Layer 3 · Central Bank Reserves'}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                1,000+ <span className="text-[10px] font-medium text-content-muted">Tons / Year</span>
              </div>
              <div className="text-xs font-bold text-positive">
                {language === 'zh' ? '主权无对手盘资产' : 'Zero Counterparty Asset'}
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {language === 'zh' ? '全球非美央行储备结构去美元化，持续净买入黄金' : 'Global central bank diversification away from fiat paper reserves'}
              </p>
            </div>

            {/* Layer 4: Geopolitical Tail Hedge */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {language === 'zh' ? '第 4 层 · 地缘非对称尾部' : 'Layer 4 · Geopolitical Tail'}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                Convex Alpha
              </div>
              <div className="text-xs font-bold text-brand">
                {language === 'zh' ? '危机凸性对冲' : 'Crisis Convexity'}
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {language === 'zh' ? '极端尾部冲击下吸收组合下行波动率之压舱石' : 'Asymmetric upside hedge guarding against geopolitical dislocations'}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-content-muted">
            <span className="font-semibold text-content-secondary">
              {language === 'zh' ? '拓扑机制定论：' : 'Topology Verdict:'} {language === 'zh' ? bigPicture.gold_board.regime_zh : bigPicture.gold_board.regime_en}
            </span>
          </div>
        </div>
      </div>

      {/* Overweight & Underweight Sectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Recommended Overweight Sectors */}
        <div className="prism-surface-subtle p-4 border-l-4 border-l-positive">
          <div className="text-xs font-bold text-positive mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>{t.overweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroData.recommended_overweights.map((sector, idx) => (
              <span key={idx} className="prism-badge-positive text-xs">
                {sector}
              </span>
            ))}
          </div>
        </div>

        {/* Recommended Underweight Sectors */}
        <div className="prism-surface-subtle p-4 border-l-4 border-l-negative">
          <div className="text-xs font-bold text-negative mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>{t.underweightSectors}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {macroData.recommended_underweights.map((sector, idx) => (
              <span key={idx} className="prism-badge-negative text-xs">
                {sector}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Empirical Macro Indicators Supporting Facts Table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-content-primary uppercase tracking-wider">
          <Database className="w-4 h-4 text-brand" />
          <span>{t.empiricalFacts}</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border-subtle">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-content-muted font-bold border-b border-border-subtle uppercase text-[10px]">
              <tr>
                <th className="p-3">{t.indicator}</th>
                <th className="p-3">{t.value}</th>
                <th className="p-3">{t.source}</th>
                <th className="p-3">{t.impact}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-surface">
              {factsList.map((fact, idx) => {
                let key = "YieldSpread";
                if (fact.indicator.toLowerCase().includes("fed") || fact.indicator.toLowerCase().includes("rate")) key = "FedSentiment";
                else if (fact.indicator.toLowerCase().includes("cpi") || fact.indicator.toLowerCase().includes("gdp")) key = "MacroCycle";
                
                return (
                  <tr key={idx} className="hover:bg-surface-subtle transition-colors">
                    <td className="p-3 font-semibold text-content-primary">
                      <BilingualHoverCard termKey={key}>
                        {fact.indicator}
                      </BilingualHoverCard>
                    </td>
                    <td className="p-3 font-extrabold text-positive">{fact.value}</td>
                    <td className="p-3 text-content-muted">{fact.source}</td>
                    <td className="p-3 text-content-secondary">{fact.impact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Toast Notification */}
      {refreshToast && (
        <div className={`mb-4 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
          refreshToast.startsWith('✅')
            ? 'prism-badge-positive'
            : 'prism-badge-warning'
        }`}>
          {refreshToast}
        </div>
      )}

      {/* Central Bank Policy & Economic News */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-content-primary uppercase tracking-wider">
            <Newspaper className="w-4 h-4 text-brand" />
            <span>{t.policyNews}</span>
          </div>
          {onRefreshMacro && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-subtle hover:border-brand text-content-primary hover:text-brand rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title="Refresh Macro Data & Policy News"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh News'}</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsList.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="prism-surface-subtle hover:border-brand p-4 transition-all group flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-content-muted mb-1.5">
                  <span className="font-bold text-brand">{item.source}</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-xs font-bold text-content-primary group-hover:text-brand transition-colors line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-[11px] text-content-secondary leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </div>
              <div className="mt-3 text-[11px] text-brand font-semibold flex items-center gap-1 group-hover:underline">
                <span>Read Official Release</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Credible Sources Footer */}
      <div className="pt-4 border-t border-border-subtle text-[11px] text-content-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-positive" />
          <span>{t.credibleSources}:</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {sourcesList.map((src: any, idx: number) => {
            const label = typeof src === 'string' ? src : (src.name || src.domain || 'Official Source');
            return (
              <span key={idx} className="px-2 py-0.5 prism-badge-neutral text-[10px]">
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
