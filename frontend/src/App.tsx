import React, { useState, useEffect } from 'react';
import { MacroScannerBar } from './components/MacroScannerBar';
import { MacroDashboard } from './components/MacroDashboard';
import { RecommendedStocksGrid } from './components/RecommendedStocksGrid';
import { PricingChart } from './components/PricingChart';
import { DebateArena } from './components/DebateArena';
import { BilingualHoverCard } from './components/BilingualHoverCard';
import { CommandPalette } from './components/CommandPalette';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SecTextMiningViewer } from './components/SecTextMiningViewer';
import { PortfolioCalculator } from './components/PortfolioCalculator';
import { BacktestViewer } from './components/BacktestViewer';
import { NotificationToast } from './components/NotificationToast';
import { LanguageSelector } from './components/LanguageSelector';
import { StartupLoadingOverlay } from './components/StartupLoadingOverlay';
import { useLanguage } from './context/LanguageContext';
import { StockAnalysisResponse, MacroDashboardResponse } from './types';
import { fetchStockAnalysis, fetchMacroDashboard } from './api/client';
import { Search, Sparkles, RefreshCw, ShieldCheck, ShieldAlert, HelpCircle, LayoutDashboard, LineChart, Star, Command, TrendingUp, Layers, Calculator } from 'lucide-react';

export const App: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'macro' | 'stock'>('macro');
  const [ticker, setTicker] = useState('NVDA');
  const [searchInput, setSearchInput] = useState('NVDA');
  const [stockData, setStockData] = useState<StockAnalysisResponse | null>(null);
  const [dashboardData, setDashboardData] = useState<MacroDashboardResponse | null>(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [isPlainTalk, setIsPlainTalk] = useState(false);
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isPortfolioCalculatorOpen, setIsPortfolioCalculatorOpen] = useState(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set(['NVDA', 'SHOP.TO']));

  // Fetch watchlist symbols from database
  const fetchWatchlistSymbols = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/watchlist');
      if (res.ok) {
        const items = await res.json();
        setWatchlistSymbols(new Set(items.map((i: any) => i.symbol.toUpperCase())));
      }
    } catch (e) {
      console.warn("Failed to fetch watchlist symbols:", e);
    }
  };

  // Load Macro & Recommendations Dashboard
  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetchMacroDashboard(language);
      setDashboardData(res);
    } catch (e) {
      console.warn("Macro dashboard fetch failed:", e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Load single stock detailed analysis
  const loadStockData = async (symbol: string) => {
    setLoadingStock(true);
    try {
      const response = await fetchStockAnalysis(symbol, language);
      setStockData(response);
    } catch (e) {
      console.warn(`Stock data fetch failed for ${symbol}:`, e);
      setStockData(null);
    } finally {
      setLoadingStock(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    fetchWatchlistSymbols();
  }, [language]);

  useEffect(() => {
    loadStockData(ticker);
  }, [ticker, language]);

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

  const toggleWatchlist = async (symbol: string, companyName: string, targetPrice?: number) => {
    const sym = symbol.toUpperCase();
    const isStarred = watchlistSymbols.has(sym);
    const nextSet = new Set(watchlistSymbols);

    if (isStarred) {
      nextSet.delete(sym);
      setWatchlistSymbols(nextSet);
      try {
        await fetch(`http://127.0.0.1:8000/api/watchlist/${sym}`, { method: 'DELETE' });
      } catch (e) {
        console.warn("Watchlist delete failed:", e);
      }
    } else {
      nextSet.add(sym);
      setWatchlistSymbols(nextSet);
      try {
        await fetch('http://127.0.0.1:8000/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: sym,
            company_name: companyName,
            target_buy_price: targetPrice,
            portfolio_allocation_pct: 3.5,
          }),
        });
      } catch (e) {
        console.warn("Watchlist add failed:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8 selection:bg-emerald-500 selection:text-slate-950">
      {/* Startup Loading Overlay */}
      <StartupLoadingOverlay isLoading={loadingDashboard} />

      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTicker={(sym) => {
          setTicker(sym);
          setSearchInput(sym);
          setActiveTab('stock');
        }}
        onTogglePlainTalk={() => setIsPlainTalk(!isPlainTalk)}
        isPlainTalk={isPlainTalk}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
      />

      {/* Watchlist Slide-over Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        onSelectTicker={(sym) => {
          setTicker(sym);
          setSearchInput(sym);
          setActiveTab('stock');
        }}
        onWatchlistChange={fetchWatchlistSymbols}
      />

      {/* Notification Toast for Triggered Buy-Zone Price Alerts */}
      <NotificationToast
        onSelectTicker={(sym) => {
          setTicker(sym);
          setSearchInput(sym);
          setActiveTab('stock');
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Main Navigation Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
              <p className="text-xs text-slate-400">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Purpose-Grouped Toolbar */}
          <div className="flex items-center gap-1 w-full md:w-auto flex-wrap">

            {/* Cluster 1: Search & Quick Navigation */}
            <div className="flex items-center gap-1.5 flex-1 md:flex-none">
              <form onSubmit={handleSearch} className="relative flex-1 md:w-52">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
                <button type="submit" aria-label={t.searchButton} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-emerald-400">
                  <Search className="w-4 h-4" />
                </button>
              </form>
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="p-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-300 transition-all flex items-center gap-1 text-xs font-semibold"
                title="Quick Search (Ctrl+K)"
              >
                <Command className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline font-mono text-[10px]">⌘K</span>
              </button>
            </div>

            {/* Cluster Separator */}
            <div className="hidden md:block w-px h-6 bg-slate-700/60 mx-1" />

            {/* Cluster 2: Investment Analysis Tools */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsWatchlistOpen(true)}
                className="p-2 bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl text-amber-400 transition-all flex items-center gap-1 text-xs font-semibold relative"
                title={t.watchlistTitle}
              >
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="hidden sm:inline">Watchlist</span>
                {watchlistSymbols.size > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded-full shadow-lg">
                    {watchlistSymbols.size}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsPortfolioCalculatorOpen(true)}
                className="p-2 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-indigo-300 transition-all flex items-center gap-1 text-xs font-semibold"
                title="Portfolio Sizing Calculator"
              >
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Calculator</span>
              </button>
            </div>

            {/* Cluster Separator */}
            <div className="hidden md:block w-px h-6 bg-slate-700/60 mx-1" />

            {/* Cluster 3: Preferences & Accessibility */}
            <div className="flex items-center gap-1.5">
              <LanguageSelector />
              <button
                onClick={() => setIsPlainTalk(!isPlainTalk)}
                className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shrink-0 ${
                  isPlainTalk
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={isPlainTalk ? 'Switch to Professional Mode' : 'Switch to Plain Talk Mode'}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isPlainTalk ? t.plainTalkOn : t.plainTalkOff}</span>
              </button>
            </div>

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
              <span>📊 1. {t.tabMacro}</span>
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
              <span>🔍 2. {t.tabStock} (${ticker})</span>
            </button>
          </div>
        </div>

        {/* Plain Talk Banner */}
        {isPlainTalk && (
          <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/40 rounded-2xl p-4 mb-6 text-xs text-amber-200 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2 font-semibold">
              <span className="text-base">💡</span>
              <span>Bilingual Plain-Talk Hover Layovers Active: Hover or tap on metric badges for non-technical explanations.</span>
            </div>
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
                  onRefreshMacro={async () => {
                    const res = await fetchMacroDashboard(language, true);
                    setDashboardData(res);
                  }}
                />

                <RecommendedStocksGrid
                  recommendations={dashboardData.recommendations}
                  onSelectStock={handleSelectRecommendedStock}
                  isPlainTalk={isPlainTalk}
                  watchlistSymbols={watchlistSymbols}
                  onToggleWatchlist={toggleWatchlist}
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
                </div>
              ) : (
                <>
                  <MacroScannerBar macroData={stockData.macro} isPlainTalk={isPlainTalk} />

                  {/* Stock Header Card with Star Watchlist Button */}
                  <div className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isPlainTalk ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-slate-100">{stockData.stock.company_name}</span>
                        <span className="px-2 py-0.5 bg-slate-800 text-emerald-400 rounded text-xs font-bold border border-slate-700">
                          {stockData.stock.symbol} ({stockData.stock.market})
                        </span>
                        {(() => {
                          const isCurrentStarred = stockData?.stock?.symbol ? watchlistSymbols.has(stockData.stock.symbol.toUpperCase()) : false;
                          return (
                            <button
                              onClick={() => toggleWatchlist(stockData.stock.symbol, stockData.stock.company_name, stockData.pricing.ideal_buy_range_max)}
                              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ml-2 ${
                                isCurrentStarred
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-md shadow-amber-500/10'
                                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-amber-500/40 hover:text-amber-300'
                              }`}
                              title={isCurrentStarred ? "已在自选股中 (点击取消关注)" : "添加到自选股与价格提醒"}
                            >
                              <Star className={`w-3.5 h-3.5 ${isCurrentStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                              <span>{isCurrentStarred ? '✓ 已关注' : '+ 关注'}</span>
                            </button>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Source: <span className="text-slate-300">{stockData.stock.source}</span></span>
                        <span>•</span>
                        <span>Ground Truth: <span className="text-emerald-400 font-semibold">100% Verified Data</span></span>
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

                  {(() => {
                    const allRecs: any[] = [];
                    if (dashboardData?.recommendations) {
                      if (Array.isArray(dashboardData.recommendations)) {
                        allRecs.push(...dashboardData.recommendations);
                      } else {
                        if (dashboardData.recommendations.sector_overweight_stocks) allRecs.push(...dashboardData.recommendations.sector_overweight_stocks);
                        if (dashboardData.recommendations.overall_recommended_stocks) allRecs.push(...dashboardData.recommendations.overall_recommended_stocks);
                        if (dashboardData.recommendations.gold_nugget_stocks) allRecs.push(...dashboardData.recommendations.gold_nugget_stocks);
                      }
                    }
                    const matchedRec = allRecs.find(r => r.symbol.toUpperCase() === stockData.stock.symbol.toUpperCase());
                    if (!matchedRec) return null;

                    return (
                      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
                        <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-950 border border-emerald-500/30 p-4 rounded-2xl">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 mb-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span>Why Invest Now (为什么此时推荐配置)</span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-medium">
                            {matchedRec.why_recommend_rationale}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-2 font-bold text-slate-300 mb-1.5">
                              <Layers className="w-4 h-4 text-indigo-400" />
                              <span>Company Business Background (主营业务背景)</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">
                              {matchedRec.company_background}
                            </p>
                          </div>

                          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                            <div className="flex items-center gap-2 font-bold text-slate-300 mb-2">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>Growth Catalysts & Revenue Drivers (核心增长催化剂)</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {matchedRec.key_catalysts?.map((cat: string, idx: number) => (
                                <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium">
                                  • {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <PricingChart pricingData={stockData.pricing} isPlainTalk={isPlainTalk} />
                  <DebateArena debateData={stockData.debate} isPlainTalk={isPlainTalk} />
                  <SecTextMiningViewer symbol={stockData.stock.symbol} isPlainTalk={isPlainTalk} />
                  <BacktestViewer symbol={stockData.stock.symbol} isPlainTalk={isPlainTalk} />

                  <div className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-xl transition-all ${
                    isPlainTalk ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <span>Fundamental Review Report</span>
                      </div>
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
        <PortfolioCalculator
          isOpen={isPortfolioCalculatorOpen}
          onClose={() => setIsPortfolioCalculatorOpen(false)}
          onSelectStock={(sym) => handleSelectRecommendedStock(sym)}
          isPlainTalk={isPlainTalk}
        />
      </div>
    </div>
  );
};

export default App;
