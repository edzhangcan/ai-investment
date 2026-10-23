import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import {
  TrendingUp,
  LayoutDashboard,
  LineChart,
  Search,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Sparkles,
  BarChart3,
  Star,
  Command,
  Calculator,
  Bell,
  Sliders,
  FileText,
  Info,
  ExternalLink,
  ArrowLeft,
  ChevronRight,
  Compass,
  Menu
} from 'lucide-react';
import { MacroDashboard } from './components/MacroDashboard';
import { RecommendedStocksGrid } from './components/RecommendedStocksGrid';
import { PricingChart } from './components/PricingChart';
import { DebateArena } from './components/DebateArena';
import { BilingualHoverCard } from './components/BilingualHoverCard';
import { MacroScannerBar } from './components/MacroScannerBar';
import { NotificationCenter } from './components/NotificationCenter';
import { StartupLoadingOverlay } from './components/StartupLoadingOverlay';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { PrismLoopLogo } from './components/PrismLoopLogo';
import { StockBucketBadge } from './components/StockBucketBadge';
import { useLanguage } from './context/LanguageContext';
import {
  fetchMacroDashboard,
  fetchStockAnalysis,
  refreshRecommendationsApi,
  fetchWatchlistApi,
  addWatchlistApi,
  deleteWatchlistApi,
  setStockBucketApi,
} from './api/client';
import { MacroDashboardResponse, StockAnalysisResponse, StockBucket, StockTrackingItem } from './types';

// Code Splitting & Lazy-Loaded Modals / Viewers
const NavigationDrawer = lazy(() => import('./components/NavigationDrawer').then(m => ({ default: m.NavigationDrawer })));
const WatchlistDrawer = lazy(() => import('./components/WatchlistDrawer').then(m => ({ default: m.WatchlistDrawer })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const PortfolioCalculator = lazy(() => import('./components/PortfolioCalculator').then(m => ({ default: m.PortfolioCalculator })));
const DiscordAlertSettingsModal = lazy(() => import('./components/DiscordAlertSettingsModal').then(m => ({ default: m.DiscordAlertSettingsModal })));
const ValuationSettingsModal = lazy(() => import('./components/ValuationSettingsModal').then(m => ({ default: m.ValuationSettingsModal })));
const ExportMemoModal = lazy(() => import('./components/ExportMemoModal').then(m => ({ default: m.ExportMemoModal })));
const SecTextMiningViewer = lazy(() => import('./components/SecTextMiningViewer').then(m => ({ default: m.SecTextMiningViewer })));
const BacktestViewer = lazy(() => import('./components/BacktestViewer').then(m => ({ default: m.BacktestViewer })));
const PreTradeSoulCheckModal = lazy(() => import('./components/PreTradeSoulCheckModal').then(m => ({ default: m.PreTradeSoulCheckModal })));

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'macro' | 'picks' | 'stock'>('macro');
  const [ticker, setTicker] = useState<string>('NVDA');
  const [searchInput, setSearchInput] = useState<string>('NVDA');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isPortfolioCalculatorOpen, setIsPortfolioCalculatorOpen] = useState<boolean>(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);
  const [isValuationSettingsOpen, setIsValuationSettingsOpen] = useState<boolean>(false);
  const [isExportMemoModalOpen, setIsExportMemoModalOpen] = useState<boolean>(false);
  const [isSoulCheckOpen, setIsSoulCheckOpen] = useState<boolean>(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());
  const [stockBucketMap, setStockBucketMap] = useState<Record<string, StockTrackingItem>>({});

  const [macroCountry, setMacroCountry] = useState<'US' | 'CA'>('US');
  const [dashboardData, setDashboardData] = useState<MacroDashboardResponse | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);

  const [stockData, setStockData] = useState<StockAnalysisResponse | null>(null);
  const [loadingStock, setLoadingStock] = useState<boolean>(false);

  const fetchWatchlistSymbols = async () => {
    try {
      const items = await fetchWatchlistApi('ALL');
      const symSet = new Set<string>();
      const map: Record<string, StockTrackingItem> = {};
      items.forEach((it: StockTrackingItem) => {
        const sym = String(it.symbol).toUpperCase();
        map[sym] = it;
        if (it.bucket === 'WATCHLIST' || it.bucket === 'HOLDING') {
          symSet.add(sym);
        }
      });
      setStockBucketMap(map);
      setWatchlistSymbols(symSet);
    } catch (e) {
      console.warn("Failed to fetch watchlist symbols:", e);
    }
  };

  const toggleWatchlist = async (symbol: string, companyName?: string, targetBuyPrice?: number) => {
    try {
      const sym = symbol.toUpperCase();
      const isStarred = watchlistSymbols.has(sym);
      if (isStarred) {
        await deleteWatchlistApi(sym);
      } else {
        await setStockBucketApi({
          symbol: sym,
          company_name: companyName || sym,
          bucket: 'WATCHLIST',
          target_buy_price: targetBuyPrice,
          portfolio_allocation_pct: 3.0,
        });
      }
      await fetchWatchlistSymbols();
    } catch (e) {
      console.error("Failed to toggle watchlist symbol:", e);
    }
  };

  const stockAbortControllerRef = useRef<AbortController | null>(null);
  const dashboardAbortControllerRef = useRef<AbortController | null>(null);

  const loadDashboard = async (targetCountry: 'US' | 'CA' = macroCountry, forceRefresh: boolean = false) => {
    if (dashboardAbortControllerRef.current) {
      dashboardAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    dashboardAbortControllerRef.current = controller;

    setLoadingDashboard(true);
    try {
      const data = await fetchMacroDashboard(language, forceRefresh, targetCountry, controller.signal);
      setDashboardData(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Dashboard fetch error:", err);
    } finally {
      if (dashboardAbortControllerRef.current === controller) {
        setLoadingDashboard(false);
      }
    }
  };

  useEffect(() => {
    loadDashboard(macroCountry);
    fetchWatchlistSymbols();
  }, [language, macroCountry]);

  const loadStock = async (sym: string, forceRefresh: boolean = false) => {
    if (stockAbortControllerRef.current) {
      stockAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    stockAbortControllerRef.current = controller;

    setLoadingStock(true);
    try {
      const data = await fetchStockAnalysis(sym, language, controller.signal, forceRefresh);
      setStockData(data);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(`Stock fetch error for ${sym}:`, err);
    } finally {
      if (stockAbortControllerRef.current === controller) {
        setLoadingStock(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (stockAbortControllerRef.current) stockAbortControllerRef.current.abort();
      if (dashboardAbortControllerRef.current) dashboardAbortControllerRef.current.abort();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      const cleanTicker = searchInput.trim().toUpperCase();
      setTicker(cleanTicker);
      setActiveTab('stock');
      loadStock(cleanTicker);
    }
  };

  const handleSelectRecommendedStock = (sym: string) => {
    setTicker(sym);
    setSearchInput(sym);
    setActiveTab('stock');
    loadStock(sym);
  };

  useEffect(() => {
    if (activeTab === 'stock') {
      loadStock(ticker);
    }
  }, [activeTab, language]);

  // Global Keyboard Shortcuts: Esc to close any open modal/drawer, Ctrl+K/Cmd+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNavDrawerOpen(false);
        setIsWatchlistOpen(false);
        setIsCommandPaletteOpen(false);
        setIsPortfolioCalculatorOpen(false);
        setIsDiscordModalOpen(false);
        setIsExportMemoModalOpen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-content-primary font-sans p-4 md:p-8 selection:bg-brand selection:text-white transition-colors duration-150">
      {/* Startup Loading Overlay */}
      <StartupLoadingOverlay isLoading={loadingDashboard} />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Main Navigation Header */}
        <header className="flex flex-col gap-4 mb-6 pb-2">
          {/* Top Row: Hamburger Hub, Brand Mark, Search Bar, Notification Centre, Language & Theme */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
            {/* Left: Hamburger Menu Button + Brand Mark */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsNavDrawerOpen(true)}
                aria-label={t.navDrawerTitle || 'Toggle Workstation Hub'}
                title={t.navDrawerTitle || 'Toggle Workstation Hub'}
                className="p-2.5 rounded-xl border border-border-subtle bg-surface hover:bg-surface-subtle text-content-secondary hover:text-content-primary transition-all cursor-pointer shadow-sm group"
              >
                <Menu className="w-5 h-5 text-content-primary group-hover:scale-105 transition-transform" />
              </button>

              <div className="flex items-center gap-2.5">
                <PrismLoopLogo size="lg" className="hover:scale-105 transition-transform duration-200" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xl md:text-2xl font-black tracking-tight text-content-primary">
                      PRISM
                    </span>
                    <span className="text-xl md:text-2xl font-black tracking-tight text-brand">
                      LOOP
                    </span>
                  </div>
                  {t.appSubtitle && (
                    <span className="text-[11px] font-medium text-content-muted tracking-wide mt-0.5 hidden sm:inline">
                      {t.appSubtitle}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Expanded Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 w-full md:max-w-2xl lg:max-w-3xl">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-surface border border-border-subtle hover:border-brand focus:border-brand rounded-2xl px-4 py-2.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none transition-all shadow-sm font-medium"
              />
              <button
                type="submit"
                aria-label={t.searchButton}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-content-muted hover:text-brand transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Right Controls: Notification Centre, Language & Theme Switchers */}
            <div className="flex items-center gap-2 shrink-0">
              <NotificationCenter onSelectTicker={handleSelectRecommendedStock} />
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Navigation Tabs Bar with Multi-Color Selected States */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-surface border border-border-subtle p-1.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Tab 1: Macro Dashboard (Sky Blue Signature) */}
            <button
              onClick={() => setActiveTab('macro')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'macro'
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md ring-2 ring-sky-400/40 border border-sky-600'
                  : 'bg-surface-subtle text-content-secondary hover:text-sky-600 hover:bg-surface border border-border-subtle'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. {t.tabMacro}</span>
              <span className="text-[11px] font-bold opacity-90">({macroCountry === 'CA' ? '🇨🇦 CA' : '🇺🇸 US'})</span>
            </button>

            {/* Tab 2: Stock Picks (Emerald Green Signature) */}
            <button
              onClick={() => setActiveTab('picks')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'picks'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ring-2 ring-emerald-400/40 border border-emerald-600'
                  : 'bg-surface-subtle text-content-secondary hover:text-emerald-600 hover:bg-surface border border-border-subtle'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. {t.tabPicks}</span>
            </button>

            {/* Tab 3: Single Stock Deep-Dive (Indigo Signature) */}
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'stock'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md ring-2 ring-indigo-400/40 border border-indigo-600'
                  : 'bg-surface-subtle text-content-secondary hover:text-indigo-600 hover:bg-surface border border-border-subtle'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>3. {t.tabStock} (${ticker})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MACRO DASHBOARD */}
        {activeTab === 'macro' && (
          loadingDashboard ? (
            <div className="flex flex-col items-center justify-center py-20 text-content-muted gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand" />
              <p className="text-xs">Fetching North American Macro Data...</p>
            </div>
          ) : dashboardData ? (
            <div className="space-y-6">
              <MacroDashboard
                macroData={dashboardData.macro_assessment}
                policyNews={dashboardData.policy_news}
                supportingFacts={dashboardData.empirical_supporting_facts}
                credibleSources={dashboardData.credible_sources}
                selectedCountry={macroCountry}
                onSelectCountry={(country) => {
                  setMacroCountry(country);
                }}
                onRefreshMacro={async (country) => {
                  await loadDashboard(country || macroCountry, true);
                }}
              />

              {/* Call to Action to proceed to Tab 2: Stock Picks */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 md:p-5 bg-surface border border-border-subtle rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-content-primary">
                      {language === 'zh'
                        ? '根据宏观周期策略探索精选股票池'
                        : 'Explore Sector Champions & Macro-Driven Stock Universe'}
                    </h4>
                    <p className="text-[11px] text-content-secondary mt-0.5">
                      {language === 'zh'
                        ? `当前宏观判定为「${dashboardData.macro_assessment.cycle_stage}」，点击前往精选股票池查看行业领跑者与隐形冠军`
                        : `Current cycle is identified as "${dashboardData.macro_assessment.cycle_stage}". Proceed to view curated champions and gold nuggets.`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('picks')}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 group"
                >
                  <span>{t.tabPicks}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="prism-card p-6 text-center max-w-2xl mx-auto my-12 border-negative">
              <ShieldAlert className="w-10 h-10 text-negative mx-auto mb-3" />
              <h3 className="text-base font-bold text-negative mb-2">Backend Service Connection Timeout</h3>
              <p className="text-xs text-content-secondary mb-4 leading-relaxed">
                Unable to reach backend service at <code className="bg-surface-subtle px-2 py-0.5 rounded font-mono text-content-primary">{`http://${window.location.hostname}:8000`}</code>.
                <br />
                If connecting from another device on your Wi-Fi network, Windows Defender Firewall may be blocking inbound traffic on port 8000.
              </p>
              <button
                onClick={() => loadDashboard()}
                className="px-4 py-2 bg-negative hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          )
        )}

        {/* TAB 2: STOCK PICKS (RECOMMENDED STOCKS GRID) */}
        {activeTab === 'picks' && (
          loadingDashboard ? (
            <div className="flex flex-col items-center justify-center py-20 text-content-muted gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs">Fetching Macro-Driven Stock Recommendations...</p>
            </div>
          ) : dashboardData ? (
            <div className="space-y-6">
              <RecommendedStocksGrid
                recommendations={dashboardData.recommendations}
                onSelectStock={handleSelectRecommendedStock}
                watchlistSymbols={watchlistSymbols}
                onToggleWatchlist={toggleWatchlist}
                cycleStage={dashboardData.macro_assessment.cycle_stage}
                onBackToMacro={() => setActiveTab('macro')}
                selectedCountry={macroCountry}
                onSelectCountry={(c) => {
                  setMacroCountry(c);
                }}
                onRefreshRecommendations={async (category, offset) => {
                  try {
                    const res = await refreshRecommendationsApi(category, offset, language, macroCountry);
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
            </div>
          ) : (
            <div className="prism-card p-6 text-center max-w-2xl mx-auto my-12 border-negative">
              <ShieldAlert className="w-10 h-10 text-negative mx-auto mb-3" />
              <h3 className="text-base font-bold text-negative mb-2">Backend Service Connection Timeout</h3>
              <p className="text-xs text-content-secondary mb-4 leading-relaxed">
                Unable to reach backend service for stock recommendations.
              </p>
              <button
                onClick={() => loadDashboard()}
                className="px-4 py-2 bg-negative hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Connection</span>
              </button>
            </div>
          )
        )}

        {/* TAB 3: SINGLE STOCK DEEP-DIVE ANALYSIS */}
        {activeTab === 'stock' && (
          loadingStock ? (
            <div className="flex flex-col items-center justify-center py-20 text-content-muted gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand" />
              <p className="text-xs">Fetching real-time market data & running debate for ${ticker}...</p>
            </div>
          ) : (
            stockData && (
              stockData.stock && stockData.stock.is_valid === false ? (
                <div className="prism-card p-8 text-center max-w-2xl mx-auto my-8 border-negative">
                  <div className="p-3 prism-badge-negative rounded-2xl w-fit mx-auto mb-4">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-content-primary mb-2">
                    NO REAL DATA FOUND FOR TICKER: ${ticker}
                  </h3>
                  <p className="text-xs text-content-secondary mb-6 leading-relaxed bg-surface-subtle p-4 rounded-xl border border-border-subtle">
                    {stockData.stock.error || `No active market data feed found for symbol '${ticker}'. Please check symbol spelling or add '.TO' suffix for TSX stocks (e.g. $XEQT.TO, $SHOP.TO, $TD.TO).`}
                  </p>
                </div>
              ) : (
                <>
                  {/* Back to Stock Picks & Macro Dashboard Navigation Buttons */}
                  <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveTab('picks')}
                      className="h-8 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-emerald-500 text-content-secondary hover:text-emerald-600 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm group"
                      title={t.backToStockPicks}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-emerald-600" />
                      <span>{t.backToStockPicks}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('macro')}
                      className="h-8 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-sky-500 text-content-secondary hover:text-sky-600 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm group"
                      title={t.backToMacro}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 group-hover:scale-105 transition-transform text-sky-600" />
                      <span>{t.backToMacro}</span>
                    </button>
                  </div>

                  {/* Stock Header Card with Star Watchlist Button */}
                  <div className="prism-card p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xl font-bold text-content-primary">{stockData.stock.company_name}</span>
                        <span className="prism-badge-brand text-xs">
                          {stockData.stock.symbol} ({stockData.stock.market})
                        </span>
                        {(() => {
                          const sym = stockData?.stock?.symbol?.toUpperCase() || '';
                          const trackingItem = stockBucketMap[sym];
                          const currentBucket: StockBucket = trackingItem?.bucket || 'REGULAR';
                          const currPrice = Number(stockData?.stock?.current_price ?? stockData?.pricing?.current_price ?? 0);

                          return (
                            <div className="flex items-center gap-2 ml-2 flex-wrap">
                              <StockBucketBadge
                                symbol={sym}
                                companyName={stockData.stock.company_name}
                                currentBucket={currentBucket}
                                currentPrice={currPrice}
                                buyInPrice={trackingItem?.buy_in_price ?? undefined}
                                buyInDate={trackingItem?.buy_in_date ?? undefined}
                                sharesHeld={trackingItem?.shares_held ?? undefined}
                                onBucketChange={async () => {
                                  await fetchWatchlistSymbols();
                                }}
                              />

                              <button
                                onClick={() => setIsExportMemoModalOpen(true)}
                                className="h-8 px-3 bg-surface border border-border-subtle hover:border-brand text-brand rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm box-border"
                                title={t.exportMemoTitle}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{t.exportMemoBtn}</span>
                              </button>

                              <button
                                onClick={() => setIsSoulCheckOpen(true)}
                                className="h-8 px-3 bg-surface border border-border-subtle hover:border-positive text-positive rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm box-border"
                                title={language === 'zh' ? '投前灵魂四问与先验记录' : 'Pre-Trade Soul Check & Prior'}
                              >
                                <Compass className="w-3.5 h-3.5 text-positive" />
                                <span>{language === 'zh' ? '投前自省' : 'Soul Check'}</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="text-xs text-content-muted flex items-center gap-3">
                        <span>{t.source}: <span className="text-content-secondary font-medium">{stockData.stock.source}</span></span>
                        <span>•</span>
                        <span>Ground Truth: <span className="text-positive font-semibold">{t.groundTruthVerified}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-content-muted flex items-center gap-1.5 mb-0.5">
                          <span>{t.currentMarketPrice}</span>
                          <a
                            href={`https://finance.yahoo.com/quote/${encodeURIComponent(stockData.stock.symbol)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand hover:text-brand-hover hover:underline transition-colors ml-0.5"
                            title={t.verifyOnYahoo}
                          >
                            <span>Yahoo Finance</span>
                            <ExternalLink className="w-3 h-3 inline opacity-80" />
                          </a>
                        </div>
                        <div className="text-xl font-extrabold text-content-primary">
                          ${stockData.stock.current_price} <span className="text-xs font-normal text-content-muted">{stockData.stock.currency}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-content-muted">
                          <BilingualHoverCard termKey="FCF">
                            {t.freeCashFlow}
                          </BilingualHoverCard>
                        </div>
                        <div className="text-base font-bold text-positive">
                          {stockData.stock.free_cash_flow && Math.abs(stockData.stock.free_cash_flow) >= 1e9
                            ? `$${(stockData.stock.free_cash_flow / 1e9).toFixed(2)}B ${stockData.stock.currency || 'USD'}`
                            : (stockData.stock.free_cash_flow && Math.abs(stockData.stock.free_cash_flow) >= 1e6
                                ? `$${Math.round(stockData.stock.free_cash_flow / 1e6)}M ${stockData.stock.currency || 'USD'}`
                                : 'N/A (ETF/Financial)')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-content-muted">
                          <BilingualHoverCard termKey="PE">
                            {t.peRatio}
                          </BilingualHoverCard>
                        </div>
                        <div className="text-base font-bold text-brand">
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
                      <div className="prism-card p-6 mb-6 space-y-4">
                        <div className="prism-surface-subtle p-4 border-l-4 border-l-brand">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-brand mb-1.5">
                            <TrendingUp className="w-4 h-4" />
                            <span>{t.whyInvestNow}</span>
                          </div>
                          <p className="text-xs text-content-primary leading-relaxed font-medium">
                            {whyInvest}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          {/* 1. Core Business Background */}
                          <div className="prism-surface-subtle p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 font-bold text-content-primary mb-2">
                                <Layers className="w-4 h-4 text-brand" />
                                <span>{t.companyBackground}</span>
                              </div>
                              <p className="text-xs text-content-secondary leading-relaxed">
                                {background}
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-content-muted">
                              <span>Sector: <span className="text-content-primary font-medium">{stockData.profile?.sector || stockData.stock.market}</span></span>
                              <span className="text-positive font-semibold">Verified Registry</span>
                            </div>
                          </div>

                          {/* 2. Key Growth Catalysts */}
                          <div className="prism-surface-subtle p-4">
                            <div className="flex items-center gap-2 font-bold text-warning mb-2">
                              <Sparkles className="w-4 h-4" />
                              <span>{t.growthCatalysts}</span>
                            </div>
                            <div className="space-y-2">
                              {catalysts.map((cat: string, idx: number) => (
                                <div key={idx} className="p-2 bg-surface border border-border-subtle text-content-primary rounded-xl text-xs flex items-start gap-2 shadow-sm">
                                  <span className="text-warning font-bold leading-tight">▸</span>
                                  <span className="leading-snug">{cat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. Revenue Drivers & Segments */}
                          <div className="prism-surface-subtle p-4">
                            <div className="flex items-center gap-2 font-bold text-brand mb-2">
                              <BarChart3 className="w-4 h-4" />
                              <span>{t.revenueDrivers}</span>
                            </div>
                            <div className="space-y-2">
                              {drivers.map((drv: string, idx: number) => (
                                <div key={idx} className="p-2 bg-surface border border-border-subtle text-content-primary rounded-xl text-xs flex items-start gap-2 shadow-sm">
                                  <span className="text-brand font-bold leading-tight">•</span>
                                  <span className="leading-snug">{drv}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  <PricingChart pricingData={stockData.pricing} stockData={stockData.stock} />
                  <DebateArena
                    debateData={stockData.debate}
                    stock={stockData.stock}
                    pricing={stockData.pricing}
                    onRefreshDebate={(force) => loadStock(stockData.stock.symbol, force ?? true)}
                    isHolding={stockBucketMap[stockData.stock.symbol.toUpperCase()]?.bucket === 'HOLDING'}
                  />
                  <SecTextMiningViewer
                    symbol={stockData.stock.symbol}
                    earningsQuality={stockData.pricing?.earnings_quality}
                    provenance={stockData.pricing?.provenance}
                  />
                  <BacktestViewer symbol={stockData.stock.symbol} />

                  <div className="prism-card p-5 transition-all">
                    <div className="flex items-center justify-between text-sm font-bold text-content-primary mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-brand" />
                        <span>{t.fundamentalReportTitle}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="prism-surface-subtle p-3.5">
                        <span className="text-content-muted block mb-1">
                          <BilingualHoverCard termKey="FCF">
                            {t.fcfQualityAssessment}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-positive">{stockData.fundamentals.fcf_quality}</span>
                      </div>
                      <div className="prism-surface-subtle p-3.5">
                        <span className="text-content-muted block mb-1">
                          <BilingualHoverCard termKey="MoatRating">
                            {t.moatRating}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-brand">{stockData.fundamentals.moat_rating}</span>
                      </div>
                      <div className="prism-surface-subtle p-3.5">
                        <span className="text-content-muted block mb-1">
                          <BilingualHoverCard termKey="GuidanceShift">
                            {t.guidanceShiftDeltas}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-warning">{stockData.fundamentals.guidance_shift_deltas[0].added_disclaimer}</span>
                      </div>
                    </div>
                  </div>
                </>
              )
            )
          )
        )}
        
        {/* Suspended Lazy Modals & Drawers */}
        <Suspense fallback={null}>
          {/* Responsive Left-Side Navigation Drawer (Workstation Hub) */}
          <NavigationDrawer
            isOpen={isNavDrawerOpen}
            onClose={() => setIsNavDrawerOpen(false)}
            onOpenWatchlist={() => setIsWatchlistOpen(true)}
            onOpenDiscord={() => setIsDiscordModalOpen(true)}
            onOpenValuationSettings={() => setIsValuationSettingsOpen(true)}
            onOpenCalculator={() => setIsPortfolioCalculatorOpen(true)}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            currentTicker={ticker}
            watchlistCount={watchlistSymbols.size}
            macroCountry={macroCountry}
            onSelectMacroCountry={(country) => {
              setMacroCountry(country);
            }}
          />

          {/* Command Palette Modal */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onSelectTicker={(sym) => {
              setTicker(sym);
              setSearchInput(sym);
              setActiveTab('stock');
            }}
          />

          {/* Watchlist Drawer */}
          <WatchlistDrawer
            isOpen={isWatchlistOpen}
            onClose={() => setIsWatchlistOpen(false)}
            onSelectStock={(sym) => handleSelectRecommendedStock(sym)}
            onWatchlistChange={fetchWatchlistSymbols}
          />

          {/* Portfolio Sizing Calculator Modal */}
          <PortfolioCalculator
            isOpen={isPortfolioCalculatorOpen}
            onClose={() => setIsPortfolioCalculatorOpen(false)}
            onSelectStock={(sym) => handleSelectRecommendedStock(sym)}
          />

          {/* Discord Push Alert Settings Modal */}
          <DiscordAlertSettingsModal
            isOpen={isDiscordModalOpen}
            onClose={() => setIsDiscordModalOpen(false)}
          />

          {/* Alert Sensitivity & Valuation Settings Modal */}
          <ValuationSettingsModal
            isOpen={isValuationSettingsOpen}
            onClose={() => setIsValuationSettingsOpen(false)}
            onSettingsSaved={() => {
              if (activeTab === 'stock' && ticker) {
                loadStock(ticker);
              } else {
                loadDashboard();
              }
            }}
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

          {/* Pre-Trade Four Soul Questions & Bayesian Journal Modal */}
          <PreTradeSoulCheckModal
            isOpen={isSoulCheckOpen}
            onClose={() => setIsSoulCheckOpen(false)}
            symbol={stockData?.stock?.symbol || ticker}
            currentPrice={stockData?.stock?.current_price}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default App;
