import React, { useState, useEffect, Suspense, lazy } from 'react';
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
  FileText,
  Info,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { MacroDashboard } from './components/MacroDashboard';
import { RecommendedStocksGrid } from './components/RecommendedStocksGrid';
import { PricingChart } from './components/PricingChart';
import { DebateArena } from './components/DebateArena';
import { BilingualHoverCard } from './components/BilingualHoverCard';
import { MacroScannerBar } from './components/MacroScannerBar';
import { NotificationToast } from './components/NotificationToast';
import { StartupLoadingOverlay } from './components/StartupLoadingOverlay';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { PrismLoopLogo } from './components/PrismLoopLogo';
import { useLanguage } from './context/LanguageContext';
import {
  fetchMacroDashboard,
  fetchStockAnalysis,
  refreshRecommendationsApi,
  fetchWatchlistApi,
  addWatchlistApi,
  deleteWatchlistApi,
} from './api/client';
import { MacroDashboardResponse, StockAnalysisResponse } from './types';

// Code Splitting & Lazy-Loaded Modals / Viewers
const WatchlistDrawer = lazy(() => import('./components/WatchlistDrawer').then(m => ({ default: m.WatchlistDrawer })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(m => ({ default: m.CommandPalette })));
const PortfolioCalculator = lazy(() => import('./components/PortfolioCalculator').then(m => ({ default: m.PortfolioCalculator })));
const DiscordAlertSettingsModal = lazy(() => import('./components/DiscordAlertSettingsModal').then(m => ({ default: m.DiscordAlertSettingsModal })));
const ExportMemoModal = lazy(() => import('./components/ExportMemoModal').then(m => ({ default: m.ExportMemoModal })));
const SecTextMiningViewer = lazy(() => import('./components/SecTextMiningViewer').then(m => ({ default: m.SecTextMiningViewer })));
const BacktestViewer = lazy(() => import('./components/BacktestViewer').then(m => ({ default: m.BacktestViewer })));

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'macro' | 'stock'>('macro');
  const [ticker, setTicker] = useState<string>('NVDA');
  const [searchInput, setSearchInput] = useState<string>('NVDA');
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isPortfolioCalculatorOpen, setIsPortfolioCalculatorOpen] = useState<boolean>(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);
  const [isExportMemoModalOpen, setIsExportMemoModalOpen] = useState<boolean>(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());

  const [dashboardData, setDashboardData] = useState<MacroDashboardResponse | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);

  const [stockData, setStockData] = useState<StockAnalysisResponse | null>(null);
  const [loadingStock, setLoadingStock] = useState<boolean>(false);

  const fetchWatchlistSymbols = async () => {
    try {
      const items = await fetchWatchlistApi();
      const symSet = new Set<string>(items.map((it: any) => String(it.symbol).toUpperCase()));
      setWatchlistSymbols(symSet);
    } catch (e) {
      console.warn("Failed to fetch watchlist symbols:", e);
    }
  };

  const toggleWatchlist = async (symbol: string, companyName?: string, targetBuyPrice?: number) => {
    try {
      const isStarred = watchlistSymbols.has(symbol.toUpperCase());
      if (isStarred) {
        await deleteWatchlistApi(symbol);
      } else {
        await addWatchlistApi({
          symbol: symbol.toUpperCase(),
          company_name: companyName || symbol,
          target_buy_price: targetBuyPrice,
          portfolio_allocation_pct: 3.0,
        });
      }
      await fetchWatchlistSymbols();
    } catch (e) {
      console.error("Failed to toggle watchlist symbol:", e);
    }
  };

  useEffect(() => {
    loadDashboard();
    fetchWatchlistSymbols();
  }, [language]);

  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const data = await fetchMacroDashboard(language);
      setDashboardData(data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const loadStock = async (sym: string) => {
    setLoadingStock(true);
    try {
      const data = await fetchStockAnalysis(sym, language);
      setStockData(data);
    } catch (err) {
      console.error(`Stock fetch error for ${sym}:`, err);
    } finally {
      setLoadingStock(false);
    }
  };

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
        <header className="flex flex-col gap-4 mb-6 pb-4 border-b border-border-subtle">
          {/* Top Row: App Title, Search Bar, Language, Theme, & PlainTalk Switchers */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full">
            {/* Title & Brand Mark */}
            <div className="flex items-center gap-3 shrink-0">
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
                  <span className="text-[11px] font-medium text-content-muted tracking-wide mt-0.5">
                    {t.appSubtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Expanded Search Bar */}
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

            {/* Right Controls: Language & Theme Switchers */}
            <div className="flex items-center gap-2 shrink-0">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Sub-Header Toolbar with Distinct Multi-Color Accents */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border-subtle w-full justify-start md:justify-center">
            {/* 1. Watchlist Drawer Button (Amber Gold Theme) */}
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 rounded-xl transition-all flex items-center gap-2 text-xs font-extrabold relative cursor-pointer group shadow-sm"
              title={t.watchlistDrawerTitle}
            >
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-500 group-hover:scale-105 transition-transform" />
              <span>{t.watchlistTitle}</span>
              {watchlistSymbols.size > 0 && (
                <span className="min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-amber-600 dark:bg-amber-500 text-white text-[10px] font-black rounded-md shadow-sm ml-0.5">
                  {watchlistSymbols.size}
                </span>
              )}
            </button>

            {/* 2. Command Palette (Sky Blue Theme) */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-3.5 py-2 bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-700/80 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-900 dark:text-sky-300 rounded-xl transition-all flex items-center gap-2 text-xs font-extrabold cursor-pointer shadow-sm group"
              title={t.commandPaletteTitle}
            >
              <Command className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform" />
              <span>{t.commandPaletteTitle}</span>
            </button>

            {/* 3. Position Sizing Calculator (Emerald Green Theme) */}
            <button
              onClick={() => setIsPortfolioCalculatorOpen(true)}
              className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300 rounded-xl transition-all flex items-center gap-2 text-xs font-extrabold cursor-pointer shadow-sm group"
              title={t.calcButtonTitle}
            >
              <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform" />
              <span>{t.calcButtonTitle}</span>
            </button>

            {/* 4. Discord Push Alerts (Indigo Violet Theme) */}
            <button
              onClick={() => setIsDiscordModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-900 dark:text-indigo-300 rounded-xl transition-all flex items-center gap-2 text-xs font-extrabold cursor-pointer shadow-sm group"
              title={t.discordButtonTitle}
            >
              <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform" />
              <span>{t.discordButtonTitle}</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar with Multi-Color Selected States */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-surface border border-border-subtle p-1.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Tab 1: Macro Dashboard (Sky Blue Signature) */}
            <button
              onClick={() => setActiveTab('macro')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'macro'
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-md ring-2 ring-sky-400/40 border border-sky-600'
                  : 'bg-surface-subtle text-content-secondary hover:text-sky-600 hover:bg-surface border border-border-subtle'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. {t.tabMacro}</span>
            </button>

            {/* Tab 2: Single Stock Deep-Dive (Indigo Signature) */}
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md ring-2 ring-indigo-400/40 border border-indigo-600'
                  : 'bg-surface-subtle text-content-secondary hover:text-indigo-600 hover:bg-surface border border-border-subtle'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>2. {t.tabStock} (${ticker})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: MACRO & RECOMMENDED STOCKS DASHBOARD */}
        {activeTab === 'macro' && (
          loadingDashboard ? (
            <div className="flex flex-col items-center justify-center py-20 text-content-muted gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-brand" />
              <p className="text-xs">Fetching North American Macro Data & Recommendations...</p>
            </div>
          ) : dashboardData ? (
            <>
              <MacroDashboard
                macroData={dashboardData.macro_assessment}
                policyNews={dashboardData.policy_news}
                supportingFacts={dashboardData.empirical_supporting_facts}
                credibleSources={dashboardData.credible_sources}
                onRefreshMacro={async () => {
                  const res = await fetchMacroDashboard(language, true);
                  setDashboardData(res);
                }}
              />

              <RecommendedStocksGrid
                recommendations={dashboardData.recommendations}
                onSelectStock={handleSelectRecommendedStock}
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

        {/* TAB 2: SINGLE STOCK DEEP-DIVE ANALYSIS */}
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
                  {/* Back to Macro Dashboard & Stock Picks Navigation Button */}
                  <div className="mb-4">
                    <button
                      onClick={() => setActiveTab('macro')}
                      className="h-8 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-brand text-content-secondary hover:text-brand rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm group"
                      title={t.backToMacroPicks}
                    >
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-brand" />
                      <span>{t.backToMacroPicks}</span>
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
                          const isCurrentStarred = stockData?.stock?.symbol ? watchlistSymbols.has(stockData.stock.symbol.toUpperCase()) : false;
                          return (
                            <div className="flex items-center gap-2 ml-2">
                              <button
                                onClick={() => toggleWatchlist(stockData.stock.symbol, stockData.stock.company_name, stockData.pricing.ideal_buy_range_max)}
                                className={`h-8 px-3 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer box-border ${
                                  isCurrentStarred
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/80 shadow-sm'
                                    : 'bg-surface-subtle text-content-secondary border-border-subtle hover:border-warning hover:text-warning'
                                }`}
                                title={isCurrentStarred ? t.starred : t.addStar}
                              >
                                <Star className={`w-3.5 h-3.5 ${isCurrentStarred ? 'fill-warning text-warning' : 'text-content-muted'}`} />
                                <span>{isCurrentStarred ? t.starred : t.addStar}</span>
                              </button>

                              <button
                                onClick={() => setIsExportMemoModalOpen(true)}
                                className="h-8 px-3 bg-surface border border-border-subtle hover:border-brand text-brand rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm box-border"
                                title={t.exportMemoTitle}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>{t.exportMemoBtn}</span>
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

                  <PricingChart pricingData={stockData.pricing} />
                  <DebateArena debateData={stockData.debate} />
                  <SecTextMiningViewer symbol={stockData.stock.symbol} />
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
        </Suspense>
      </div>
    </div>
  );
};

export default App;
