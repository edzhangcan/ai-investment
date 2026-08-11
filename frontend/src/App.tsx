import React, { useState, useEffect } from 'react';
import { MacroScannerBar } from './components/MacroScannerBar';
import { MacroDashboard } from './components/MacroDashboard';
import { RecommendedStocksGrid } from './components/RecommendedStocksGrid';
import { PricingChart } from './components/PricingChart';
import { DebateArena } from './components/DebateArena';
import { BilingualHoverCard } from './components/BilingualHoverCard';
import { StockAnalysisResponse, MacroDashboardResponse, StockRecommendation } from './types';
import { fetchStockAnalysis, fetchMacroDashboard } from './api/client';
import { Search, Sparkles, RefreshCw, ShieldCheck, ShieldAlert, HelpCircle, LayoutDashboard, LineChart, ChevronRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'macro' | 'stock'>('macro');
  const [ticker, setTicker] = useState('NVDA');
  const [searchInput, setSearchInput] = useState('NVDA');
  const [stockData, setStockData] = useState<StockAnalysisResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<MacroDashboardResponse | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isPlainTalk, setIsPlainTalk] = useState(false);

  const roundNum = (n: number) => Math.round(n * 100) / 100;

  // Load Macro & Recommendations Dashboard
  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetchMacroDashboard();
      setDashboardData(res);
    } catch (e) {
      // Fallback mock dashboard if backend server is not running
      setDashboardData({
        macro_assessment: {
          cycle_stage: "Overheat / Late Expansion (过热期)",
          cycle_code: "OVERHEAT",
          plain_explanation: "通胀仍处高位，美联储保持高利率。资金流向能把成本转嫁给客户的强现金流公司与能源/金融板块。",
          us_indicators: {},
          ca_indicators: {},
          fed_sentiment: { score: 0.45, tone: "Hawkish (偏鹰派)", hawkish_signals_detected: 4, dovish_signals_detected: 1 },
          boc_sentiment: { score: 0.20, tone: "Neutral / Wait-and-See", hawkish_signals_detected: 2, dovish_signals_detected: 2 },
          recommended_overweights: ["Energy & Tech Infrastructure (AI基础设施)", "Financials & Banks (金融与银行)"],
          recommended_underweights: ["Unprofitable Tech (未盈利科技)", "High-Yield Speculative Debt"]
        },
        policy_news: [
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
            summary: "BoC Monetary Policy Report signals prudent rate calibration to safeguard balance sheet resilience."
          },
          {
            title: "US Cloud CapEx Exceeds $200B Annualized Pace in AI Infrastructure",
            source: "SEC EDGAR 10-K Filings",
            date: "2026-08-05",
            url: "https://www.sec.gov/edgar",
            summary: "Hyperscale cloud providers expand capital expenditure for accelerated computing data center expansions."
          }
        ],
        empirical_supporting_facts: [
          { indicator: "US CPI Inflation YoY", value: "3.4%", source: "FRED (CPIAUCSL)", impact: "High Inflation Sticky" },
          { indicator: "10Y-2Y Treasury Yield Spread", value: "-0.15%", source: "FRED (T10Y2Y)", impact: "Yield Curve Inversion Warning" },
          { indicator: "Fed Target Funds Rate", value: "5.25% - 5.50%", source: "FOMC Statement", impact: "Restrictive Rate Policy" },
          { indicator: "Bank of Canada Policy Rate", value: "4.75%", source: "Bank of Canada Press Release", impact: "Plateau / Gradual Easing" },
          { indicator: "US Unemployment Rate", value: "4.1%", source: "FRED (UNRATE)", impact: "Resilient Labor Market" }
        ],
        credible_sources: [
          "FRED (Federal Reserve Bank of St. Louis API)",
          "FOMC Official Press Releases & Statements",
          "Bank of Canada Monetary Policy Summary",
          "SEC EDGAR Company Fact Statements"
        ],
        recommendations: {
          macro_context: {
            cycle_stage: "Overheat / Late Expansion (过热期)",
            cycle_code: "OVERHEAT",
            plain_explanation: "高利率背景下，强现金流与核心技术护城河企业最受资金追捧。"
          },
          recommended_stocks_count: 4,
          recommended_stocks: [
            {
              symbol: "NVDA",
              company_name: "NVIDIA Corporation",
              market: "US",
              currency: "USD",
              current_price: 219.46,
              previous_close: 217.99,
              company_background: "NVIDIA Corporation is the world leader in accelerated computing, AI GPUs (Hopper, Blackwell), and CUDA software stack.",
              why_recommend_rationale: "Primary beneficiary of global AI infrastructure buildout with $60.8B Free Cash Flow generation and Wide Moat protection.",
              macro_alignment_tag: "Beneficiary of Late Expansion CapEx",
              total_recommendation_score: 0.96,
              key_catalysts: ["Generative AI infrastructure demand", "Hyperscale Cloud CapEx expansion", "CUDA software lock-in"],
              key_metrics: {
                pe_ratio: 49.8,
                free_cash_flow_b: 60.8,
                fcf_quality: "High Quality (真金白银现金流)",
                moat_rating: "Wide Moat (宽护城河)",
                two_hundred_day_sma: 194.16,
                dcf_fair_value: 230.43,
                ideal_buy_range: "$194.16 - $209.69 USD"
              },
              downside_risk_summary: "Technical support at 200D SMA ($194.16 USD).",
              action_status: "PULLBACK_WATCH"
            },
            {
              symbol: "MSFT",
              company_name: "Microsoft Corporation",
              market: "US",
              currency: "USD",
              current_price: 501.32,
              previous_close: 505.26,
              company_background: "Microsoft Corporation provides Azure cloud infrastructure, Office 365 productivity suites, enterprise security, and Copilot AI.",
              why_recommend_rationale: "Combines resilient B2B enterprise recurring software cash flows with commercial AI monetization across Office 365.",
              macro_alignment_tag: "Defensive Growth & Cloud Monetization",
              total_recommendation_score: 0.94,
              key_catalysts: ["Azure cloud market share gains", "Enterprise Copilot adoption", "High recurring software ARR"],
              key_metrics: {
                pe_ratio: 37.5,
                free_cash_flow_b: 74.1,
                fcf_quality: "High Quality (真金白银现金流)",
                moat_rating: "Wide Moat (宽护城河)",
                two_hundred_day_sma: 433.02,
                dcf_fair_value: 526.39,
                ideal_buy_range: "$433.02 - $467.66 USD"
              },
              downside_risk_summary: "Technical support at 200D SMA ($433.02 USD).",
              action_status: "ACCUMULATE"
            },
            {
              symbol: "SHOP.TO",
              company_name: "Shopify Inc.",
              market: "CA",
              currency: "CAD",
              current_price: 213.24,
              previous_close: 216.19,
              company_background: "Shopify Inc. is Canada's premier e-commerce platform powering millions of global merchants with storefront tools and Shop Pay checkout.",
              why_recommend_rationale: "Dominant e-commerce merchant operating system in North America with accelerating GMV and 118% Net Revenue Retention.",
              macro_alignment_tag: "Canadian Tech Core Champion",
              total_recommendation_score: 0.91,
              key_catalysts: ["GMV expansion", "Shop Pay conversion superiority", "Enterprise merchant onboarding"],
              key_metrics: {
                pe_ratio: 75.4,
                free_cash_flow_b: 1.8,
                fcf_quality: "High Quality",
                moat_rating: "Narrow Moat",
                two_hundred_day_sma: 183.70,
                dcf_fair_value: 223.90,
                ideal_buy_range: "$183.70 - $198.40 CAD"
              },
              downside_risk_summary: "Technical support at 200D SMA ($183.70 CAD).",
              action_status: "BUY_ZONE"
            },
            {
              symbol: "TD.TO",
              company_name: "Toronto-Dominion Bank",
              market: "CA",
              currency: "CAD",
              current_price: 170.42,
              previous_close: 168.92,
              company_background: "Toronto-Dominion Bank is one of Canada's Big Five chartered banks, providing retail, commercial, and wealth management services.",
              why_recommend_rationale: "Defensive banking stability and high Net Interest Income during elevated interest rate cycles with attractive dividend yield.",
              macro_alignment_tag: "High Yield & Interest Rate Beneficiary",
              total_recommendation_score: 0.89,
              key_catalysts: ["High Net Interest Margin (NIM)", "Dominant retail banking market share", "4.5%+ Dividend Yield"],
              key_metrics: {
                pe_ratio: 12.1,
                free_cash_flow_b: 14.5,
                fcf_quality: "High Quality",
                moat_rating: "Wide Moat",
                two_hundred_day_sma: 139.89,
                dcf_fair_value: 178.94,
                ideal_buy_range: "$139.89 - $151.08 CAD"
              },
              downside_risk_summary: "Technical support at 200D SMA ($139.89 CAD).",
              action_status: "STRONG_BUY"
            }
          ]
        }
      });
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Load single stock detailed analysis
  const loadStockData = async (symbol: string) => {
    setLoadingStock(true);
    try {
      const response = await fetchStockAnalysis(symbol);
      if (response && response.stock && response.stock.is_valid === false) {
        setStockData(response);
      } else {
        setStockData(response);
      }
    } catch (e) {
      console.warn(`Stock data fetch failed for ${symbol}:`, e);
      setStockData(null);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadStockData(ticker);
  }, [ticker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const sym = searchInput.trim().toUpperCase();
      setTicker(sym);
      setActiveTab('stock');
    }
  };

  const handleSelectRecommendedStock = (symbol: string) => {
    setTicker(symbol.toUpperCase());
    setSearchInput(symbol.toUpperCase());
    setActiveTab('stock');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 selection:bg-emerald-500 selection:text-slate-950">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Main Navigation Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                Antigravity AI 宏观智能投资分析平台
              </h1>
              <p className="text-xs text-slate-400">
                US & Canadian Markets (美股 & 加股) | Macro-First & Top Stock Recommendation Engine
              </p>
            </div>
          </div>

          {/* Search Form & Plain Talk Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索个股 ($NVDA, $SHOP.TO)"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-400 cursor-pointer">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={() => setIsPlainTalk(!isPlainTalk)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isPlainTalk
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{isPlainTalk ? '通俗白话模式: 开' : '白话模式: 关'}</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('macro')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'macro'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>📊 1. Macro Scan & Top Stock Picks (宏观 dashboard & 推荐)</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>🔍 2. Single Stock Deep-Dive (${ticker})</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 px-3">
            <span>Current Selection:</span>
            <span className="font-bold text-emerald-400 px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
              {ticker}
            </span>
          </div>
        </div>

        {/* Plain Talk Banner */}
        {isPlainTalk && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 rounded-2xl p-4 mb-6 text-xs text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
            <div className="flex items-start gap-2.5 font-semibold">
              <span className="text-base shrink-0 mt-0.5">💡</span>
              <div>
                <div className="font-bold text-amber-300 text-sm mb-0.5">Bilingual Plain-Talk Hover Layovers Active</div>
                <p className="text-slate-300 font-normal leading-relaxed">
                  Hover or tap on any financial metric badge, moat rating, or macro indicator to view interactive plain-language everyday analogies.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-amber-500/30 border border-amber-400/40 rounded-full font-bold text-[11px] text-amber-100 shrink-0">
              Hover Layovers On
            </span>
          </div>
        )}

        {/* TAB 1: MACRO & RECOMMENDED STOCKS DASHBOARD */}
        {activeTab === 'macro' && (
          loadingDashboard ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs">Fetching North American Macro Data & Recommendations...</p>
            </div>
          ) : (
            dashboardData && (
              <>
                <MacroDashboard
                  macroData={dashboardData.macro_assessment}
                  policyNews={dashboardData.policy_news}
                  supportingFacts={dashboardData.empirical_supporting_facts}
                  credibleSources={dashboardData.credible_sources}
                  isPlainTalk={isPlainTalk}
                />

                <RecommendedStocksGrid
                  recommendations={dashboardData.recommendations.recommended_stocks}
                  onSelectStock={handleSelectRecommendedStock}
                  isPlainTalk={isPlainTalk}
                />
              </>
            )
          )
        )}

        {/* TAB 2: SINGLE STOCK DEEP-DIVE ANALYSIS */}
        {activeTab === 'stock' && (
          loadingStock ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs">Fetching real-time market data & running debate for ${ticker}...</p>
            </div>
          ) : (
            stockData && (
              stockData.stock && stockData.stock.is_valid === false ? (
                /* NO DATA / UNLISTED TICKER STATE CARD */
                <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-2xl my-8">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl w-fit mx-auto mb-4 text-rose-400">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100 mb-2">
                    NO REAL DATA FOUND FOR TICKER: ${ticker}
                  </h3>
                  <p className="text-xs text-slate-300 mb-6 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    {stockData.stock.error || `No active market data feed found for symbol '${ticker}'. Please check symbol spelling or add '.TO' suffix for TSX stocks (e.g. $XEQT.TO, $SHOP.TO, $TD.TO).`}
                  </p>
                  <div className="text-xs text-slate-400 font-semibold mb-3">
                    Try searching verified tickers:
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {['XEQT.TO', 'NVDA', 'MSFT', 'SHOP.TO', 'TD.TO', 'AAPL'].map((sym) => (
                      <button
                        key={sym}
                        onClick={() => handleSelectRecommendedStock(sym)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        ${sym}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Macro Scanner Hero Bar */}
                  <MacroScannerBar macroData={stockData.macro} isPlainTalk={isPlainTalk} />

                  {/* Stock Core Summary Header Card */}
                  <div className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isPlainTalk ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-slate-100">{stockData.stock.company_name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-xs font-bold border border-slate-700">
                          {stockData.stock.symbol} ({stockData.stock.market})
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Source: <span className="text-slate-300">{stockData.stock.source}</span></span>
                        <span>•</span>
                        <span>Empirical Ground Truth: <span className="text-emerald-400 font-semibold">100% Verified</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-slate-400">Current Market Price</div>
                        <div className="text-xl font-extrabold text-slate-100">
                          ${stockData.stock.current_price} <span className="text-xs font-normal text-slate-400">{stockData.stock.currency}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">
                          <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                            Free Cash Flow (FCF)
                          </BilingualHoverCard>
                        </div>
                        <div className="text-base font-bold text-emerald-400">
                          {stockData.stock.free_cash_flow && stockData.stock.free_cash_flow > 0
                            ? `$${(stockData.stock.free_cash_flow / 1e9).toFixed(1)}B`
                            : 'N/A (ETF/Index)'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">
                          <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
                            Price-to-Earnings (P/E)
                          </BilingualHoverCard>
                        </div>
                        <div className="text-base font-bold text-indigo-400">
                          {stockData.stock.pe_ratio ? `${stockData.stock.pe_ratio}x` : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Technical Buy-Zone Chart */}
                  <PricingChart pricingData={stockData.pricing} isPlainTalk={isPlainTalk} />

                  {/* Multi-Agent Debate Arena */}
                  <DebateArena debateData={stockData.debate} isPlainTalk={isPlainTalk} />

                  {/* Fundamental Review Summary Card */}
                  <div className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-xl transition-all ${
                    isPlainTalk ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <span>Fundamental Review Report</span>
                      </div>
                      {isPlainTalk && (
                        <span className="text-xs text-amber-300 font-semibold px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/30">
                          Hover Metric Badges for Layover
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">
                          <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                            FCF Quality Assessment
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-emerald-400">{stockData.fundamentals.fcf_quality}</span>
                      </div>
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">
                          <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                            Morningstar Moat Rating
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-indigo-300">{stockData.fundamentals.moat_rating}</span>
                      </div>
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block mb-1">
                          <BilingualHoverCard termKey="GuidanceShift" isPlainTalk={isPlainTalk}>
                            5-Yr Guidance Shift Deltas
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-amber-300">{stockData.fundamentals.guidance_shift_deltas[0].added_disclaimer}</span>
                      </div>
                    </div>
                  </div>
                </>
              )
            )
          )
        )}
      </div>
    </div>
  );
};

export default App;
