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
  AlertTriangle,
  Building2,
  DollarSign
} from 'lucide-react';

interface MacroDashboardProps {
  macroData: MacroData;
  policyNews?: PolicyNewsItem[];
  supportingFacts?: SupportingFact[];
  credibleSources?: (string | { name: string; domain?: string; type?: string })[];
  selectedCountry?: 'US' | 'CA';
  onSelectCountry?: (country: 'US' | 'CA') => void;
  onRefreshMacro?: (country?: 'US' | 'CA') => Promise<void>;
}

export const MacroDashboard: React.FC<MacroDashboardProps> = ({
  macroData,
  policyNews = [],
  supportingFacts = [],
  credibleSources = [],
  selectedCountry,
  onSelectCountry,
  onRefreshMacro
}) => {
  const { t, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshToast, setRefreshToast] = useState<string | null>(null);

  const activeCountry: 'US' | 'CA' = selectedCountry || (macroData.country as 'US' | 'CA') || 'US';
  const isCA = activeCountry === 'CA';

  const handleRefresh = async () => {
    if (!onRefreshMacro || isRefreshing) return;
    setIsRefreshing(true);
    setRefreshToast(null);
    try {
      await onRefreshMacro(activeCountry);
      setRefreshToast(
        language === 'zh'
          ? `✅ 已成功刷新 ${isCA ? '加拿大 (CA)' : '美国 (US)'} 宏观数据与政策新闻！`
          : `✅ Successfully refreshed ${isCA ? 'Canada (CA)' : 'US'} macro data & policy news!`
      );
    } catch {
      setRefreshToast(
        language === 'zh'
          ? '⚠️ 刷新遇到问题，已保留缓存数据。'
          : '⚠️ Refresh encountered an issue. Using cached data.'
      );
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setRefreshToast(null), 4000);
    }
  };

  const handleCountrySwitch = (country: 'US' | 'CA') => {
    if (country === activeCountry) return;
    if (onSelectCountry) {
      onSelectCountry(country);
    }
  };

  const factsList: SupportingFact[] = supportingFacts.length > 0 ? supportingFacts : (
    isCA ? [
      { indicator: "Canada CPI Inflation YoY", value: "2.7%", source: "Statistics Canada (StatCan)", impact: "Target Normalization" },
      { indicator: "Bank of Canada Policy Rate", value: "4.50%", source: "Bank of Canada (BoC)", impact: "Monetary Easing Plateau" },
      { indicator: "GoC 10Y-2Y Yield Spread", value: "-0.08%", source: "Bank of Canada Valet API", impact: "Curve De-inversion Transition" },
      { indicator: "TSX Modified Buffett Ratio", value: "1.15x (115.0%)", source: "BoC Balance Sheet & StatCan GDP", impact: "Historic Structural Valuation Discount" },
      { indicator: "Canada Real GDP Growth QoQ", value: "1.8%", source: "StatCan National Accounts", impact: "Moderate Growth Dynamics" },
      { indicator: "Household Debt-to-Income", value: "178.5%", source: "CMHC & StatCan Survey", impact: "Mortgage Refinancing Sensitivity" }
    ] : [
      { indicator: "US CPI Inflation YoY", value: "3.2%", source: "BLS (CPIAUCSL)", impact: "Sticky Inflation / Restrictive Policy" },
      { indicator: "Federal Funds Rate Target", value: "5.25% - 5.50%", source: "FOMC Press Release", impact: "Restrictive Policy Stance" },
      { indicator: "10Y-2Y Treasury Yield Spread", value: "0.15%", source: "FRED (T10Y2Y)", impact: "Late-Cycle Yield Curve Transition" },
      { indicator: "Modified Buffett Indicator", value: "1.54x (154.0%)", source: "FRED WALCL & BEA GDP", impact: "Elevated Structural Equity Valuation" },
      { indicator: "AIAE Investor Allocation to Equities", value: "56.9%", source: "FRED GFDEBTN & MMMFFAQ027S", impact: "Crowded Retail & Institutional Position" },
      { indicator: "US Real GDP Growth QoQ", value: "2.4%", source: "BEA National Accounts", impact: "Economic Expansion Resilience" }
    ]
  );

  const newsList: PolicyNewsItem[] = policyNews.length > 0 ? policyNews : (
    isCA ? [
      {
        title: "Bank of Canada Holds Policy Interest Rate at 4.50% Citing Shelter Normalization",
        source: "Bank of Canada Official Statement",
        date: "2026-07-28",
        url: "https://www.bankofcanada.ca",
        summary: "Governing Council maintains policy rate at 4.50% while continuing balance sheet normalization, noting moderating wage pressures."
      },
      {
        title: "Statistics Canada CPI Moderates to 2.7% YoY; Trimmed Core Inflation Settles at 2.5%",
        source: "Statistics Canada (StatCan)",
        date: "2026-08-04",
        url: "https://www.statcan.gc.ca",
        summary: "StatCan releases monthly consumer price index showing price pressures retreating toward the central bank's midpoint inflation target."
      },
      {
        title: "TSX Energy & Mining Hub Logs Strong Free Cash Generation as Crude & Gold Surge",
        source: "TMX Group / Market Data",
        date: "2026-08-02",
        url: "https://www.tmx.com",
        summary: "S&P/TSX Composite leaders deliver record shareholder returns via share buybacks and dividend expansion in Canadian dollars."
      }
    ] : [
      {
        title: "Federal Reserve Maintains Benchmark Funds Rate Target Range at 5.25%-5.50%",
        source: "Federal Reserve Board Press Release",
        date: "2026-08-01",
        url: "https://www.federalreserve.gov",
        summary: "FOMC press release emphasizes data-dependent stance as Core PCE inflation remains above the 2% target."
      },
      {
        title: "US Consumer Price Index (CPI) Expands 3.2% YoY; Energy and Transport Costs Sticky",
        source: "US Bureau of Labor Statistics (BLS)",
        date: "2026-08-05",
        url: "https://www.bls.gov",
        summary: "BLS releases CPI inflation data showing headline CPI expanding 3.2% annually, cementing hawkish Fed rate expectations."
      },
      {
        title: "US Real GDP Expands at 2.4% Annualized Pace in Latest BEA National Accounts",
        source: "US Bureau of Economic Analysis (BEA)",
        date: "2026-07-30",
        url: "https://www.bea.gov",
        summary: "Strong consumer spending and private domestic investment drive resilient quarterly economic expansion across the United States."
      }
    ]
  );

  const sourcesList: any[] = credibleSources.length > 0 ? credibleSources : (
    isCA ? [
      { name: "Bank of Canada (BoC)", domain: "bankofcanada.ca", type: "Official Central Bank Authority" },
      { name: "Statistics Canada (StatCan)", domain: "statcan.gc.ca", type: "National Statistical Agency" },
      { name: "Department of Finance Canada", domain: "canada.ca", type: "Fiscal Policy Authority" },
      { name: "TMX Group (TSX Composite)", domain: "tmx.com", type: "National Exchange Operator" },
      { name: "SEDAR+ Filings", domain: "sedarplus.ca", type: "Corporate Securities Repository" },
      { name: "Canada Mortgage and Housing Corporation (CMHC)", domain: "cmhc-schl.gc.ca", type: "Housing Finance Authority" }
    ] : [
      { name: "Federal Reserve Economic Data (FRED)", domain: "stlouisfed.org", type: "Official Central Bank Data" },
      { name: "US Bureau of Labor Statistics (BLS)", domain: "bls.gov", type: "Tier-1 Government Statistical Agency" },
      { name: "US Bureau of Economic Analysis (BEA)", domain: "bea.gov", type: "National Accounts Agency" },
      { name: "Federal Reserve Board / FOMC", domain: "federalreserve.gov", type: "Monetary Policy Authority" },
      { name: "Securities and Exchange Commission (SEC EDGAR)", domain: "sec.gov", type: "Corporate Filings Repository" },
      { name: "S&P Dow Jones Indices", domain: "spglobal.com", type: "Benchmark Index Provider" }
    ]
  );

  const bigPicture = macroData.big_picture || (
    isCA ? {
      country: "CA",
      country_name: "Canada",
      currency: "CAD",
      modified_buffett_ratio: 1.15,
      modified_buffett_pct: 115.0,
      aiae_allocation_pct: 59.4,
      equity_risk_premium_pct: 3.23,
      goc_10y_yield_pct: 3.35,
      goc_real_return_yield_pct: 1.55,
      boc_assets_billion_cad: 312.4,
      ca_debt_trillion_cad: 2.25,
      money_market_trillion_cad: 0.38,
      cad_usd_rate: 0.731,
      usd_cad_rate: 1.368,
      household_debt_to_income_pct: 178.5,
      gold_board: {
        gold_price_cad: 3351.60,
        gold_price_usd: 2450.0,
        gold_log_yoy_pct: 26.8,
        tips_10y_real_yield_pct: 1.55,
        is_fiscal_dominance_decoupled: true,
        regime_en: "Monetary Easing & Currency Debasement Hedge (CAD Gold Outperformance)",
        regime_zh: "货币宽松与本币贬值对冲（加元金价显著跑赢且脱钩实际利率）"
      }
    } : {
      country: "US",
      country_name: "United States",
      currency: "USD",
      modified_buffett_ratio: 1.54,
      modified_buffett_pct: 154.0,
      aiae_allocation_pct: 56.9,
      equity_risk_premium_pct: -0.37,
      dgs10_yield_pct: 4.25,
      dfii10_tips_real_yield_pct: 1.85,
      fed_walcl_trillion: 7.12,
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
    }
  );

  const activeSentiment = isCA
    ? (macroData.boc_sentiment || macroData.central_bank_sentiment || { tone: "Neutral / Wait-and-See", score: 0.0 })
    : (macroData.fed_sentiment || macroData.central_bank_sentiment || { tone: "Hawkish (Restrictive Policy Stance)", score: 0.35 });

  return (
    <div className="prism-card p-6 md:p-8 mb-8">
      {/* Header Bar with Market Switcher */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 prism-badge-positive rounded-xl">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-black text-content-primary">
              {t.macroTitle}
            </h2>
            <span className="text-xl">{isCA ? '🇨🇦' : '🇺🇸'}</span>
          </div>
          <p className="text-xs text-content-muted">
            {isCA ? t.caMarketDesc : t.usMarketDesc}
          </p>
        </div>

        {/* Market Switcher & Refresh Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Segmented Country Selector */}
          <div className="flex items-center p-1 bg-surface-subtle border border-border-subtle rounded-xl shadow-2xs">
            <button
              type="button"
              onClick={() => handleCountrySwitch('US')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                !isCA
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface'
              }`}
            >
              <span>🇺🇸</span>
              <span>{t.macroMarketUS}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCountrySwitch('CA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isCA
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface'
              }`}
            >
              <span>🇨🇦</span>
              <span>{t.macroMarketCA}</span>
            </button>
          </div>

          {/* Cycle Stage Badge */}
          <span className="prism-badge-brand text-xs flex items-center gap-1.5 shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{macroData.cycle_stage}</span>
          </span>

          {/* Central Bank Sentiment Badge */}
          <span className="prism-badge-neutral text-xs flex items-center gap-1.5 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-brand" />
            <span>{isCA ? 'BoC' : 'Fed'}: {activeSentiment.tone}</span>
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
            </BilingualHoverCard>: <span className="text-positive font-bold">{macroData.cycle_stage}</span> ({isCA ? 'Canada' : 'United States'})
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
                {isCA
                  ? (language === 'zh'
                      ? '加股大局观与黄金商品看板 (Canadian Macro & Resource Gold Board)'
                      : 'Canadian Macro & Resource Gold Board')
                  : (language === 'zh'
                      ? '美股大局观与黄金拓扑看板 (Big Picture Macro & 4-Layer Gold Board)'
                      : 'Big Picture Macro & 4-Layer Gold Board')}
              </h3>
              <p className="text-[11px] text-content-muted">
                {isCA
                  ? (language === 'zh'
                      ? '宏观水位：多伦多TSX综指修正估值、全社会股票配置权重 (AIAE)、加股股权风险溢价 (ERP) 与加元对冲'
                      : 'TSX modified valuation, Canadian household equity allocation, TSX equity risk premium, and CAD debasement hedge')
                  : (language === 'zh'
                      ? '宏观水位：央行资产负债表扩张修正、全社会股票配置权重 (AIAE)、股权风险溢价 (ERP) 与财政主导黄金脱钩'
                      : 'Macro liquidity, household asset allocation, equity risk premium, and fiscal dominance sovereign gold dynamics')}
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
                  {isCA
                    ? (language === 'zh' ? 'TSX 修正巴菲特指标' : 'TSX Modified Buffett Ratio')
                    : (language === 'zh' ? '修正巴菲特指标' : 'Modified Buffett Indicator')}
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
                {isCA
                  ? `TSX TMC / (GDP + BoC Assets $${bigPicture.boc_assets_billion_cad || 312.4}B CAD)`
                  : `TMC / (GDP + Fed WALCL $${bigPicture.fed_walcl_trillion || 7.12}T)`}
              </p>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle pt-2">
              {isCA
                ? (language === 'zh'
                    ? '引入加拿大央行资产负债表 ($312.4B CAD) 与名义 GDP ($3.05T CAD)。多伦多 TSX 综指估值倍数仅 1.15x，显著低于美股，具备深厚安全边际。'
                    : 'Expands denominator with Bank of Canada balance sheet ($312.4B CAD) and nominal GDP. At 1.15x, TSX trades at a notable structural discount to US equities.')
                : (language === 'zh'
                    ? '引入美联储资产负债表 ($' + (bigPicture.fed_walcl_trillion || 7.12) + 'T)，消除自2008年量化宽松印钞对传统巴菲特指标的分子分母失真扭曲。'
                    : 'Expands denominator with Fed balance sheet ($' + (bigPicture.fed_walcl_trillion || 7.12) + 'T) to adjust for post-QE liquidity expansion.')}
            </p>
          </div>

          {/* Card 2: AIAE Allocation */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-content-secondary flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-brand" />
                  {isCA
                    ? (language === 'zh' ? '加国股票配置权重 (AIAE)' : 'Canadian Equity Ratio (AIAE)')
                    : (language === 'zh' ? '全社会股票配置权重 (AIAE)' : 'Aggregate Equity Ratio (AIAE)')}
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
                {isCA
                  ? `Public Debt: $${bigPicture.ca_debt_trillion_cad || 2.25}T · MMF: $${bigPicture.money_market_trillion_cad || 0.38}T CAD`
                  : `Debt: $${bigPicture.us_debt_trillion || 35.46}T · Cash MMF: $${bigPicture.money_market_trillion || 6.42}T`}
              </p>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle pt-2">
              {isCA
                ? (language === 'zh'
                    ? '加拿大全社会权益资产权重，搭配高居民杠杆比率 (178.5%)，反映抵押贷款重定价周期对内需板块的制约与资源出口驱动的再平衡。'
                    : 'Canadian equity weighting paired with high household debt-to-income (178.5%), indicating interest rate sensitivity in domestic retail vs resilient resource exporters.')
                : (language === 'zh'
                    ? '全市场家庭与机构股票占全资产权重。超过 50% 为长期回报负相关警戒区（如2000年与2021年底）。'
                    : 'Household & institutional equity weighting. Readings above 50% historically signal low 10-year forward equity returns.')}
            </p>
          </div>

          {/* Card 3: Equity Risk Premium */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-content-secondary flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-brand" />
                  {isCA
                    ? (language === 'zh' ? 'TSX 股权风险溢价 (ERP)' : 'TSX Equity Risk Premium')
                    : (language === 'zh' ? '股权风险溢价 (ERP)' : 'Equity Risk Premium (ERP)')}
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
                    : (language === 'zh' ? '健康风险溢价保护' : 'Positive ERP Buffer')}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-black ${
                  bigPicture.equity_risk_premium_pct < 0 ? 'text-negative' : 'text-positive'
                }`}>
                  {bigPicture.equity_risk_premium_pct > 0 ? '+' : ''}{bigPicture.equity_risk_premium_pct.toFixed(2)}%
                </span>
                <span className="text-xs text-content-muted">
                  {isCA
                    ? `vs GoC 10Y ${bigPicture.goc_10y_yield_pct || 3.35}%`
                    : `vs 10Y UST ${bigPicture.dgs10_yield_pct || 4.25}%`}
                </span>
              </div>
              <p className="text-[10px] text-content-muted font-mono mb-2">
                {isCA
                  ? 'Spread = TSX Earnings Yield (100/15.2) - GoC 10Y Yield'
                  : 'Spread = S&P 500 Yield (100/PE) - 10Y Yield'}
              </p>
            </div>
            <p className="text-[11px] text-content-secondary leading-relaxed border-t border-border-subtle pt-2">
              {isCA
                ? (language === 'zh'
                    ? 'TSX 综指市盈率仅 15.2x，提供 6.58% 的盈利收益率，对比加拿大10年期国债 3.35%，具备逾 3% 的稳健正向股权风险溢价缓冲。'
                    : 'TSX trailing P/E of 15.2x delivers 6.58% earnings yield, affording a healthy +3.23% positive buffer over 3.35% GoC 10-year sovereign yields.')
                : (language === 'zh'
                    ? '当 ERP 跌入负值，股票收益率无法补偿美债无风险利率，对冲宏观黑天鹅需依托哑铃防守与黄金。'
                    : 'Negative spread means equities offer less yield than risk-free debt, requiring barbell discipline and real asset hedges.')}
            </p>
          </div>
        </div>

        {/* Gold & Commodity Board Topology */}
        <div className="prism-surface-subtle p-5 rounded-2xl border border-amber-500/30 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border-subtle">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-lg">
                <Coins className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-extrabold text-content-primary">
                  {isCA
                    ? (language === 'zh' ? '加元黄金与大宗商品拓扑看板 (CAD Gold & Commodity Board)' : 'CAD Gold & Commodity Topology')
                    : (language === 'zh' ? '黄金拓扑四层看板 (4-Layer Gold Board Topology)' : '4-Layer Gold Board Topology')}
                </h4>
                <p className="text-[10px] text-content-muted">
                  {isCA
                    ? (language === 'zh' ? '本币汇率对冲、加国实际利率锚、能源矿业大宗商品超级周期与地缘凸性' : 'CAD currency hedge, GoC real return yield, TSX resource alpha, and geopolitical tail risk')
                    : (language === 'zh' ? '法币信用稀释、实际利率锚、央行储备去美元化与地缘凸性' : 'Fiat debasement, real rates, central bank de-dollarization, and geopolitical tail risk')}
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
                  ? (bigPicture.gold_board.is_fiscal_dominance_decoupled
                      ? (isCA ? '加元金价显著跑赢且脱钩实际利率' : '财政主导：金价与美债实际利率深度脱钩')
                      : '传统实际利率锚定')
                  : (bigPicture.gold_board.is_fiscal_dominance_decoupled
                      ? (isCA ? 'CAD Gold Decoupled from GoC Real Yield' : 'Fiscal Dominance: Gold Decoupled from TIPS Real Yield')
                      : 'Traditional Real Yield Anchor')}
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
                {isCA ? (
                  <>
                    ${(bigPicture.gold_board.gold_price_cad || 3351.6).toLocaleString()}{' '}
                    <span className="text-[10px] font-medium text-content-muted">CAD/oz</span>
                  </>
                ) : (
                  <>
                    ${(bigPicture.gold_board.gold_price_usd || 2450.0).toLocaleString()}{' '}
                    <span className="text-[10px] font-medium text-content-muted">USD/oz</span>
                  </>
                )}
              </div>
              <div className="text-xs font-bold text-positive flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>Log YoY: +{bigPicture.gold_board.gold_log_yoy_pct}%</span>
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {isCA
                  ? (language === 'zh' ? '加元计价黄金跑赢美元金价，对冲本币汇率购买力稀释' : 'CAD-denominated gold hedges against currency depreciation')
                  : (language === 'zh' ? '主权赤字货币化与法币购买力稀释溢价' : 'Fiat debasement and sovereign fiscal monetization premium')}
              </p>
            </div>

            {/* Layer 2: Real Yield Anchor */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {isCA
                  ? (language === 'zh' ? '第 2 层 · 加国真实收益率' : 'Layer 2 · GoC Real Return Yield')
                  : (language === 'zh' ? '第 2 层 · 实际利率锚' : 'Layer 2 · TIPS Real Yield')}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                {isCA ? (bigPicture.goc_real_return_yield_pct || 1.55) : (bigPicture.gold_board.tips_10y_real_yield_pct || 1.85)}%
              </div>
              <div className="text-xs font-bold text-amber-500">
                {language === 'zh' ? '高位脱钩状态' : 'High Rate Decoupled'}
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {isCA
                  ? (language === 'zh' ? '加拿大通胀保值国债收益率高企但金价创历史新高' : 'GoC real return yields remain elevated while gold hits CAD highs')
                  : (language === 'zh' ? '实际利率高企但金价创历史新高，打破传统反向关系' : 'Real yields remain high yet gold hits highs, breaking traditional beta')}
              </p>
            </div>

            {/* Layer 3: Central Bank Reserves / Commodity Flows */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {isCA
                  ? (language === 'zh' ? '第 3 层 · 资源出口与资本流' : 'Layer 3 · Resource & Capital Flows')
                  : (language === 'zh' ? '第 3 层 · 央行储备去美元化' : 'Layer 3 · Central Bank Reserves')}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                {isCA ? 'CAD/USD 0.73' : '1,000+ Tons/Yr'}
              </div>
              <div className="text-xs font-bold text-positive">
                {isCA
                  ? (language === 'zh' ? '大宗商品贸易顺差支撑' : 'Resource Trade Surplus')
                  : (language === 'zh' ? '主权无对手盘资产' : 'Zero Counterparty Asset')}
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {isCA
                  ? (language === 'zh' ? '能源与贵金属出口形成天然贸易顺差安全垫' : 'Energy and mineral exports cushion current account flows')
                  : (language === 'zh' ? '全球非美央行储备结构去美元化，持续净买入黄金' : 'Global central bank diversification away from fiat paper reserves')}
              </p>
            </div>

            {/* Layer 4: Tail Hedge / Commodity Alpha */}
            <div className="bg-surface p-3 rounded-xl border border-border-subtle">
              <div className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                {isCA
                  ? (language === 'zh' ? '第 4 层 · 矿业与能源 Alpha' : 'Layer 4 · TSX Resource Alpha')
                  : (language === 'zh' ? '第 4 层 · 地缘非对称尾部' : 'Layer 4 · Geopolitical Tail')}
              </div>
              <div className="text-base font-extrabold text-content-primary mb-0.5">
                Convex Alpha
              </div>
              <div className="text-xs font-bold text-brand">
                {isCA
                  ? (language === 'zh' ? '资源股自由现金流迸发' : 'TSX Free Cash Flow Surge')
                  : (language === 'zh' ? '危机凸性对冲' : 'Crisis Convexity')}
              </div>
              <p className="text-[10px] text-content-muted mt-1.5 leading-snug">
                {isCA
                  ? (language === 'zh' ? '加拿大黄金开采商与油砂巨头依托强劲自由现金流回购分红' : 'TSX gold miners and energy majors return massive cash flow via buybacks')
                  : (language === 'zh' ? '极端尾部冲击下吸收组合下行波动率之压舱石' : 'Asymmetric upside hedge guarding against geopolitical dislocations')}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-content-muted">
            <span className="font-semibold text-content-secondary">
              {language === 'zh' ? '拓扑机制定论：' : 'Topology Verdict:'}{' '}
              {language === 'zh' ? bigPicture.gold_board.regime_zh : bigPicture.gold_board.regime_en}
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
            <span>{t.overweightSectors} ({isCA ? 'TSX Canada' : 'US Market'})</span>
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
            <span>{t.underweightSectors} ({isCA ? 'TSX Canada' : 'US Market'})</span>
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
          <span>{t.empiricalFacts} ({isCA ? 'Canada / Bank of Canada / StatCan' : 'US / Federal Reserve / BLS'})</span>
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
                if (fact.indicator.toLowerCase().includes("fed") || fact.indicator.toLowerCase().includes("boc") || fact.indicator.toLowerCase().includes("rate")) key = "FedSentiment";
                else if (fact.indicator.toLowerCase().includes("cpi") || fact.indicator.toLowerCase().includes("gdp") || fact.indicator.toLowerCase().includes("buffett")) key = "MacroCycle";
                
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
            <span>{t.policyNews} ({isCA ? 'Bank of Canada & Statistics Canada' : 'Federal Reserve & BLS'})</span>
          </div>
          {onRefreshMacro && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-subtle hover:border-brand text-content-primary hover:text-brand rounded-xl text-[11px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              title={`Refresh ${isCA ? 'Canadian' : 'US'} Macro Data & News`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : `Refresh ${isCA ? 'CA' : 'US'} News`}</span>
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
          <span>{t.credibleSources} ({isCA ? 'Canada Sources' : 'US Sources'}):</span>
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
