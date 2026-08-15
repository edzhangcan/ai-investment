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
import { ThemeToggle } from './components/ThemeToggle';
import { StartupLoadingOverlay } from './components/StartupLoadingOverlay';
import { DiscordAlertSettingsModal } from './components/DiscordAlertSettingsModal';
import { ExportMemoModal } from './components/ExportMemoModal';
import { PrismLoopLogo } from './components/PrismLoopLogo';
import { useLanguage } from './context/LanguageContext';
import { StockAnalysisResponse, MacroDashboardResponse } from './types';
import { fetchStockAnalysis, fetchMacroDashboard, fetchWatchlistApi, addWatchlistApi, deleteWatchlistApi, refreshRecommendationsApi } from './api/client';
import { Search, Sparkles, RefreshCw, ShieldCheck, ShieldAlert, HelpCircle, LayoutDashboard, LineChart, Star, Command, TrendingUp, Layers, Calculator, Bell, FileText, BarChart3 } from 'lucide-react';

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
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState(false);
  const [isExportMemoModalOpen, setIsExportMemoModalOpen] = useState(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set(['NVDA', 'SHOP.TO']));

  // Fetch watchlist symbols from database
  const fetchWatchlistSymbols = async () => {
    try {
      const items = await fetchWatchlistApi();
      setWatchlistSymbols(new Set(items.map((i: any) => i.symbol.toUpperCase())));
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
        await deleteWatchlistApi(sym);
      } catch (e) {
        console.warn("Watchlist delete failed:", e);
      }
    } else {
      nextSet.add(sym);
      setWatchlistSymbols(nextSet);
      try {
        await addWatchlistApi({
          symbol: sym,
          company_name: companyName,
          target_buy_price: targetPrice,
          portfolio_allocation_pct: 3.5,
        });
      } catch (e) {
        console.warn("Watchlist add failed:", e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans p-4 md:p-8 selection:bg-sky-500 selection:text-white dark:selection:text-slate-950 transition-colors duration-200">
      {/* Startup Loading Overlay */}
      <StartupLoadingOverlay isLoading={loadingDashboard} />

      {/* Ambient background glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-sky-400/10 dark:bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

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
        <header className="flex flex-col gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Top Row: App Title, Prominent Search Bar, Language & PlainTalk Switchers */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
            {/* Title & Brand Mark */}
            <div className="flex items-center gap-3 shrink-0">
              <PrismLoopLogo size="lg" className="hover:scale-105 transition-transform duration-200" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    PRISM
                  </span>
                  <span className="text-xl md:text-2xl font-black tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    LOOP
                  </span>
                </div>
                {t.appSubtitle && (
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide mt-0.5">
                    {t.appSubtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Prominent Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 w-full md:max-w-xl">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/90 hover:border-sky-500/50 focus:border-sky-500 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all shadow-sm dark:shadow-inner font-medium"
              />
              <button
                type="submit"
                aria-label={t.searchButton}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Right Controls: Language, Theme & PlainTalk Switchers */}
            <div className="flex items-center gap-2 shrink-0">
              <LanguageSelector />
              <ThemeToggle />
              <button
                onClick={() => setIsPlainTalk(!isPlainTalk)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isPlainTalk
                    ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/50 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
                }`}
                title={isPlainTalk ? 'Switch to Professional Mode' : 'Switch to Plain Talk Mode'}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{isPlainTalk ? t.plainTalkOn : t.plainTalkOff}</span>
              </button>
            </div>
          </div>

          {/* Sub-Header Toolbar */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-slate-200/80 dark:border-slate-800/80 w-full justify-start md:justify-center">
            {/* Watchlist Drawer Button */}
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-xl text-amber-600 dark:text-amber-400 transition-all flex items-center gap-2 text-xs font-bold relative cursor-pointer group shadow-sm"
              title={t.watchlistDrawerTitle}
            >
              <Star className="w-4 h-4 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
              <span>{t.watchlistTitle}</span>
              {watchlistSymbols.size > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full shadow-md ml-0.5">
                  {watchlistSymbols.size}
                </span>
              )}
            </button>

            {/* Command Palette / Quick Search (Ctrl+K) Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-xl text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              title={t.commandPaletteTitle}
            >
              <Command className="w-4 h-4 text-sky-500" />
              <span>{t.commandPaletteTitle}</span>
            </button>

            {/* Position Sizing Calculator Button */}
            <button
              onClick={() => setIsPortfolioCalculatorOpen(true)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-xl text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              title={t.calcButtonTitle}
            >
              <Calculator className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>{t.calcButtonTitle}</span>
            </button>

            {/* Discord Push Alerts Button */}
            <button
              onClick={() => setIsDiscordModalOpen(true)}
              className="px-3.5 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-xl text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              title={t.discordButtonTitle}
            >
              <Bell className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>{t.discordButtonTitle}</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/80 dark:border-slate-800 p-1.5 rounded-2xl backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('macro')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'macro'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>📊 1. {t.tabMacro}</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
          ) : dashboardData ? (
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
                onRefreshRecommendations={async (category, offset) => {
                  try {
                    const res = await refreshRecommendationsApi(category, offset, language);
                    if (dashboardData && dashboardData.recommendations) {
                      const updatedRecs = { ...dashboardData.recommendations };
                      if (category === 'SECTOR') {
                        updatedRecs.sector_overweight_stocks = res.stocks || res.sector_overweight_stocks;
                      } else if (category === 'OVERALL') {
                        updatedRecs.overall_recommended_stocks = res.stocks || res.overall_recommended_stocks;
                      } else if (category === 'GOLD') {
                        updatedRecs.gold_nugget_stocks = res.stocks || res.gold_nugget_stocks;
                      } else if (res.sector_overweight_stocks) {
                        dashboardData.recommendations = res;
                      }
                      setDashboardData({ ...dashboardData, recommendations: updatedRecs });
                    }
                  } catch (e) {
                    console.warn("Failed to refresh recommendations:", e);
                  }
                }}
              />
            </>
          ) : (
            <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-6 text-center max-w-2xl mx-auto my-12 shadow-xl backdrop-blur-md">
              <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-red-200 mb-2">Backend Service Connection Timeout</h3>
              <p className="text-xs text-red-300/80 mb-4 leading-relaxed">
                Unable to reach backend service at <code className="bg-red-900/60 px-2 py-0.5 rounded font-mono text-red-200">{`http://${window.location.hostname}:8000`}</code>.
                <br />
                If connecting from another device on your Wi-Fi network, Windows Defender Firewall may be blocking inbound traffic on port 8000.
              </p>
              <button
                onClick={() => loadDashboard()}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
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
                <div className="bg-white dark:bg-slate-900/90 border border-rose-300 dark:border-rose-500/40 rounded-3xl p-8 text-center max-w-2xl mx-auto shadow-sm dark:shadow-2xl my-8">
                  <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl w-fit mx-auto mb-4 text-rose-600 dark:text-rose-400">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    NO REAL DATA FOUND FOR TICKER: ${ticker}
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mb-6 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    {stockData.stock.error || `No active market data feed found for symbol '${ticker}'. Please check symbol spelling or add '.TO' suffix for TSX stocks (e.g. $XEQT.TO, $SHOP.TO, $TD.TO).`}
                  </p>
                </div>
              ) : (
                <>
                  <MacroScannerBar macroData={stockData.macro} isPlainTalk={isPlainTalk} />

                  {/* Stock Header Card with Star Watchlist Button */}
                  <div className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-sm dark:shadow-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isPlainTalk ? 'border-amber-400 dark:border-amber-500/40 ring-1 ring-amber-400/20 dark:ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{stockData.stock.company_name}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-sky-700 dark:text-emerald-400 rounded text-xs font-bold border border-slate-200 dark:border-slate-700">
                          {stockData.stock.symbol} ({stockData.stock.market})
                        </span>
                        {(() => {
                          const isCurrentStarred = stockData?.stock?.symbol ? watchlistSymbols.has(stockData.stock.symbol.toUpperCase()) : false;
                          return (
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() => toggleWatchlist(stockData.stock.symbol, stockData.stock.company_name, stockData.pricing.ideal_buy_range_max)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isCurrentStarred
                                    ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/50 hover:bg-amber-100 dark:hover:bg-amber-500/30 shadow-sm'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300'
                                }`}
                                title={isCurrentStarred ? t.starred : t.addStar}
                              >
                                <Star className={`w-3.5 h-3.5 ${isCurrentStarred ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                                <span>{isCurrentStarred ? t.starred : t.addStar}</span>
                              </button>

                              <button
                                onClick={() => setIsExportMemoModalOpen(true)}
                                className="px-3 py-1 bg-sky-50 dark:bg-gradient-to-r dark:from-emerald-500/20 dark:to-teal-500/20 hover:bg-sky-100 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 text-sky-700 dark:text-emerald-300 border border-sky-300 dark:border-emerald-500/50 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="Export Institutional Investment Memo (.md / .pdf)"
                              >
                                <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400" />
                                <span>Export Memo</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                        <span>{t.source}: <span className="text-slate-700 dark:text-slate-300 font-medium">{stockData.stock.source}</span></span>
                        <span>•</span>
                        <span>Ground Truth: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t.groundTruthVerified}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.currentMarketPrice}</div>
                        <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                          ${stockData.stock.current_price} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">{stockData.stock.currency}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                            {t.freeCashFlow}
                          </BilingualHoverCard>
                        </div>
                        <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                          {stockData.stock.free_cash_flow && Math.abs(stockData.stock.free_cash_flow) >= 1e9
                            ? `$${(stockData.stock.free_cash_flow / 1e9).toFixed(2)}B ${stockData.stock.currency || 'USD'}`
                            : (stockData.stock.free_cash_flow && Math.abs(stockData.stock.free_cash_flow) >= 1e6
                                ? `$${Math.round(stockData.stock.free_cash_flow / 1e6)}M ${stockData.stock.currency || 'USD'}`
                                : 'N/A (ETF/Financial)')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
                            {t.peRatio}
                          </BilingualHoverCard>
                        </div>
                        <div className="text-base font-bold text-indigo-700 dark:text-indigo-400">
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
                    const matchedRec = allRecs.find(r => r.symbol?.toUpperCase() === stockData.stock?.symbol?.toUpperCase());

                    const background = stockData.profile?.company_background 
                      || (stockData.fundamentals as any)?.company_background 
                      || (stockData.fundamentals as any)?.company_profile?.company_background 
                      || matchedRec?.company_background;

                    const catalysts: string[] = stockData.profile?.growth_catalysts 
                      || stockData.profile?.key_catalysts 
                      || (stockData.fundamentals as any)?.growth_catalysts 
                      || (stockData.fundamentals as any)?.company_profile?.growth_catalysts 
                      || matchedRec?.key_catalysts 
                      || [];

                    const drivers: string[] = stockData.profile?.revenue_drivers 
                      || (stockData.fundamentals as any)?.revenue_drivers 
                      || (stockData.fundamentals as any)?.company_profile?.revenue_drivers 
                      || (matchedRec as any)?.revenue_drivers 
                      || [];

                    const whyInvest = matchedRec?.why_recommend_rationale 
                      || (matchedRec as any)?.why_invest_now 
                      || (stockData.debate?.cio_verdict?.judge_summary 
                          ? `${stockData.stock.symbol} ${stockData.debate.cio_verdict.judge_summary}` 
                          : `High conviction strategic candidate aligned with current macroeconomic cycle.`);

                    if (!background && catalysts.length === 0 && drivers.length === 0) return null;

                    return (
                      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
                        <div className="bg-emerald-50/60 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-950 border border-emerald-200 dark:border-emerald-500/30 p-4 rounded-2xl">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 mb-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span>{t.whyInvestNow}</span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {whyInvest}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* 1. Core Business Background */}
                          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-200 mb-2">
                                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                <span>{t.companyBackground}</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {background}
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                              <span>Sector: <span className="text-slate-800 dark:text-slate-200 font-medium">{stockData.profile?.sector || stockData.stock.market}</span></span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified Registry</span>
                            </div>
                          </div>

                          {/* 2. Key Growth Catalysts */}
                          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300 mb-2">
                              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                              <span>{t.growthCatalysts}</span>
                            </div>
                            <div className="space-y-2">
                              {catalysts.map((cat: string, idx: number) => (
                                <div key={idx} className="p-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 rounded-xl text-xs flex items-start gap-2 shadow-sm">
                                  <span className="text-amber-500 dark:text-amber-400 font-bold leading-tight">▸</span>
                                  <span className="leading-snug">{cat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. Revenue Drivers & Segments */}
                          <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center gap-2 font-bold text-teal-700 dark:text-teal-300 mb-2">
                              <BarChart3 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                              <span>{t.revenueDrivers}</span>
                            </div>
                            <div className="space-y-2">
                              {drivers.map((drv: string, idx: number) => (
                                <div key={idx} className="p-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 rounded-xl text-xs flex items-start gap-2 shadow-sm">
                                  <span className="text-teal-600 dark:text-teal-400 font-bold leading-tight">•</span>
                                  <span className="leading-snug">{drv}</span>
                                </div>
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

                  <div className={`bg-white dark:bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-sm dark:shadow-xl transition-all ${
                    isPlainTalk ? 'border-amber-400 dark:border-amber-500/40 ring-1 ring-amber-400/20 dark:ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <span>{t.fundamentalReportTitle}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                            {t.fcfQualityAssessment}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{stockData.fundamentals.fcf_quality}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                            {t.moatRating}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-indigo-700 dark:text-indigo-300">{stockData.fundamentals.moat_rating}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <span className="text-slate-500 dark:text-slate-400 block mb-1">
                          <BilingualHoverCard termKey="GuidanceShift" isPlainTalk={isPlainTalk}>
                            {t.guidanceShiftDeltas}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-amber-700 dark:text-amber-300">{stockData.fundamentals.guidance_shift_deltas[0].added_disclaimer}</span>
                      </div>
                    </div>
                  </div>
                </>
              )
            )
          )
        )}
        
        {/* Portfolio Sizing Calculator Modal */}
        <PortfolioCalculator
          isOpen={isPortfolioCalculatorOpen}
          onClose={() => setIsPortfolioCalculatorOpen(false)}
          onSelectStock={(sym) => handleSelectRecommendedStock(sym)}
          isPlainTalk={isPlainTalk}
        />

        {/* Discord Push Alert Settings Modal */}
        <DiscordAlertSettingsModal
          isOpen={isDiscordModalOpen}
          onClose={() => setIsDiscordModalOpen(false)}
        />

        {/* Institutional Investment Memo Export Modal */}
        {stockData && (
          <ExportMemoModal
            isOpen={isExportMemoModalOpen}
            onClose={() => setIsExportMemoModalOpen(false)}
            memoData={{
              stock: stockData.stock,
              macro: stockData.macro,
              pricing: stockData.pricing,
              debate: stockData.debate,
              fundamentals: stockData.fundamentals,
              secMining: null,
              backtest: null,
              language
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
