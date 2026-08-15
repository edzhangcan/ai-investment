import React, { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import { MacroDashboard } from './components/MacroDashboard';
import { RecommendedStocksGrid } from './components/RecommendedStocksGrid';
import { PricingChart } from './components/PricingChart';
import { DebateArena } from './components/DebateArena';
import { SecTextMiningViewer } from './components/SecTextMiningViewer';
import { BacktestViewer } from './components/BacktestViewer';
import { BilingualHoverCard } from './components/BilingualHoverCard';
import { MacroScannerBar } from './components/MacroScannerBar';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { CommandPalette } from './components/CommandPalette';
import { NotificationToast } from './components/NotificationToast';
import { PortfolioCalculator } from './components/PortfolioCalculator';
import { DiscordAlertSettingsModal } from './components/DiscordAlertSettingsModal';
import { ExportMemoModal } from './components/ExportMemoModal';
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

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'macro' | 'stock'>('macro');
  const [ticker, setTicker] = useState<string>('NVDA');
  const [searchInput, setSearchInput] = useState<string>('NVDA');
  const [isPlainTalk, setIsPlainTalk] = useState<boolean>(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isPortfolioCalculatorOpen, setIsPortfolioCalculatorOpen] = useState<boolean>(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = useState<boolean>(false);
  const [isExportMemoModalOpen, setIsExportMemoModalOpen] = useState<boolean>(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState<Set<string>>(new Set());

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(true);

  const [stockData, setStockData] = useState<any>(null);
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

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
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
            <form onSubmit={handleSearch} className="relative flex-1 w-full md:max-w-xl">
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

            {/* Right Controls: Language, Theme & PlainTalk Switchers */}
            <div className="flex items-center gap-2 shrink-0">
              <LanguageSelector />
              <ThemeToggle />
              <button
                onClick={() => setIsPlainTalk(!isPlainTalk)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isPlainTalk
                    ? 'prism-badge-warning shadow-sm'
                    : 'bg-surface border-border-subtle text-content-secondary hover:text-content-primary hover:bg-surface-subtle shadow-sm'
                }`}
                title={isPlainTalk ? 'Switch to Professional Mode' : 'Switch to Plain Talk Mode'}
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{isPlainTalk ? t.plainTalkOn : t.plainTalkOff}</span>
              </button>
            </div>
          </div>

          {/* Sub-Header Toolbar */}
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-border-subtle w-full justify-start md:justify-center">
            {/* Watchlist Drawer Button */}
            <button
              onClick={() => setIsWatchlistOpen(true)}
              className="px-3.5 py-2 bg-surface border border-border-subtle hover:border-warning rounded-xl text-content-primary hover:text-warning transition-all flex items-center gap-2 text-xs font-bold relative cursor-pointer group shadow-sm"
              title={t.watchlistDrawerTitle}
            >
              <Star className="w-4 h-4 text-warning group-hover:scale-105 transition-transform" />
              <span>{t.watchlistTitle}</span>
              {watchlistSymbols.size > 0 && (
                <span className="min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-warning text-white text-[10px] font-bold rounded-md shadow-sm ml-0.5">
                  {watchlistSymbols.size}
                </span>
              )}
            </button>

            {/* Command Palette / Quick Search (Ctrl+K) Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="px-3.5 py-2 bg-surface border border-border-subtle hover:border-brand rounded-xl text-content-primary hover:text-brand transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              title={t.commandPaletteTitle}
            >
              <Command className="w-4 h-4 text-brand" />
              <span>{t.commandPaletteTitle}</span>
            </button>

            {/* Position Sizing Calculator Button */}
            <button
              onClick={() => setIsPortfolioCalculatorOpen(true)}
              className="px-3.5 py-2 bg-surface border border-border-subtle hover:border-brand rounded-xl text-content-primary hover:text-brand transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              title={t.calcButtonTitle}
            >
              <Calculator className="w-4 h-4 text-brand" />
              <span>{t.calcButtonTitle}</span>
            </button>

            {/* Discord Push Alerts Button */}
            <button
              onClick={() => setIsDiscordModalOpen(true)}
              className="px-3.5 py-2 bg-surface border border-border-subtle hover:border-brand rounded-xl text-content-primary hover:text-brand transition-all flex items-center gap-2 text-xs font-bold cursor-pointer shadow-sm"
              title={t.discordButtonTitle}
            >
              <Bell className="w-4 h-4 text-brand" />
              <span>{t.discordButtonTitle}</span>
            </button>
          </div>
        </header>

        {/* Navigation Tabs Bar with High-Contrast Selected State */}
        <div className="flex items-center justify-between gap-2 mb-8 bg-surface border border-border-subtle p-1.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('macro')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'macro'
                  ? 'bg-brand text-white shadow-sm ring-2 ring-brand/30 border border-brand'
                  : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface border border-border-subtle'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. {t.tabMacro}</span>
            </button>

            <button
              onClick={() => setActiveTab('stock')}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-brand text-white shadow-sm ring-2 ring-brand/30 border border-brand'
                  : 'bg-surface-subtle text-content-secondary hover:text-content-primary hover:bg-surface border border-border-subtle'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>2. {t.tabStock} (${ticker})</span>
            </button>
          </div>
        </div>

        {/* Plain Talk Banner */}
        {isPlainTalk && (
          <div className="prism-card p-4 mb-6 text-xs text-warning border-warning flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="w-4 h-4 shrink-0 text-warning" />
              <span>Bilingual Plain-Talk Hover Layovers Active: Hover or tap on metric badges for non-technical explanations.</span>
            </div>
          </div>
        )}

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
                  <MacroScannerBar macroData={stockData.macro} isPlainTalk={isPlainTalk} />

                  {/* Stock Header Card with Star Watchlist Button */}
                  <div className={`prism-card p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                    isPlainTalk ? 'border-warning' : ''
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
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
                                className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  isCurrentStarred
                                    ? 'prism-badge-warning shadow-sm'
                                    : 'bg-surface-subtle text-content-secondary border-border-subtle hover:border-warning hover:text-warning'
                                }`}
                                title={isCurrentStarred ? t.starred : t.addStar}
                              >
                                <Star className={`w-3.5 h-3.5 ${isCurrentStarred ? 'fill-warning text-warning' : 'text-content-muted'}`} />
                                <span>{isCurrentStarred ? t.starred : t.addStar}</span>
                              </button>

                              <button
                                onClick={() => setIsExportMemoModalOpen(true)}
                                className="px-3 py-1 bg-surface border border-border-subtle hover:border-brand text-brand rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                title="Export Institutional Investment Memo (.md / .pdf)"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Export Memo</span>
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
                        <div className="text-xs text-content-muted">{t.currentMarketPrice}</div>
                        <div className="text-xl font-extrabold text-content-primary">
                          ${stockData.stock.current_price} <span className="text-xs font-normal text-content-muted">{stockData.stock.currency}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-content-muted">
                          <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
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
                          <BilingualHoverCard termKey="PE" isPlainTalk={isPlainTalk}>
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

                  <PricingChart pricingData={stockData.pricing} isPlainTalk={isPlainTalk} />
                  <DebateArena debateData={stockData.debate} isPlainTalk={isPlainTalk} />
                  <SecTextMiningViewer symbol={stockData.stock.symbol} isPlainTalk={isPlainTalk} />
                  <BacktestViewer symbol={stockData.stock.symbol} isPlainTalk={isPlainTalk} />

                  <div className={`prism-card p-5 transition-all ${
                    isPlainTalk ? 'border-warning' : ''
                  }`}>
                    <div className="flex items-center justify-between text-sm font-bold text-content-primary mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-brand" />
                        <span>{t.fundamentalReportTitle}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="prism-surface-subtle p-3.5">
                        <span className="text-content-muted block mb-1">
                          <BilingualHoverCard termKey="FCF" isPlainTalk={isPlainTalk}>
                            {t.fcfQualityAssessment}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-positive">{stockData.fundamentals.fcf_quality}</span>
                      </div>
                      <div className="prism-surface-subtle p-3.5">
                        <span className="text-content-muted block mb-1">
                          <BilingualHoverCard termKey="MoatRating" isPlainTalk={isPlainTalk}>
                            {t.moatRating}
                          </BilingualHoverCard>:
                        </span>
                        <span className="font-semibold text-brand">{stockData.fundamentals.moat_rating}</span>
                      </div>
                      <div className="prism-surface-subtle p-3.5">
                        <span className="text-content-muted block mb-1">
                          <BilingualHoverCard termKey="GuidanceShift" isPlainTalk={isPlainTalk}>
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
