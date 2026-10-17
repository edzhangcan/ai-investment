export type LanguageMode = 'en' | 'zh' | 'hybrid';

export interface Translations {
  // Navigation & General
  appTitle: string;
  appSubtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  tabMacro: string;
  tabPicks: string;
  tabStock: string;
  plainTalkOn: string;
  plainTalkOff: string;
  watchlistDrawerTitle: string;
  starred: string;
  addStar: string;
  groundTruthVerified: string;
  source: string;
  currentMarketPrice: string;
  verifyOnYahoo: string;
  commandPaletteTitle: string;
  calcButtonTitle: string;
  discordButtonTitle: string;
  themeLight: string;
  themeDark: string;
  exportMemoBtn: string;
  exportMemoTitle: string;
  backToMacroPicks: string;
  backToStockPicks: string;
  backToMacro: string;
  exportMemoModalTitle: string;
  exportMemoModalSubtitle: string;
  exportMemoStyledPreview: string;
  exportMemoRawMarkdown: string;
  exportMemoDownloadMd: string;
  exportMemoPrintPdf: string;
  exportMemoCopied: string;
  exportMemoCopy: string;

  // Startup Loading Screen
  loadingSubtitle: string;
  loadingStep1: string;
  loadingStep2: string;
  loadingStep3: string;
  loadingStep4: string;
  loadingStepCounter: string;
  loadingOf: string;

  // Macro Dashboard & Scanner Bar
  macroTitle: string;
  macroSubtitle: string;
  macroMarketUS: string;
  macroMarketCA: string;
  macroSelectMarket: string;
  usMarketDesc: string;
  caMarketDesc: string;
  liveMacroStream: string;
  cycleStage: string;
  fedSentiment: string;
  bocSentiment: string;
  hawkish: string;
  dovish: string;
  overweightSectors: string;
  underweightSectors: string;
  policyNews: string;
  empiricalFacts: string;
  credibleSources: string;
  indicator: string;
  value: string;
  impact: string;
  macroInsight: string;
  readOfficialRelease: string;

  // Recommendations Grid
  recsTitle: string;
  recsSubtitle: string;
  refreshRecommendations: string;
  refreshingPicks: string;
  catSectorChampions: string;
  catMarketLeaders: string;
  catGoldNuggets: string;
  catSectorDesc: string;
  catLeaderDesc: string;
  catGoldDesc: string;
  whyInvestNow: string;
  companyBackground: string;
  growthCatalysts: string;
  revenueDrivers: string;
  drillDownAnalysis: string;
  supportLevel: string;
  score: string;
  showingStocks: string;

  // Key Metrics Labels
  freeCashFlow: string;
  peRatio: string;
  moatRating: string;
  buyZone: string;
  fairValue: string;
  fiftyDaySma: string;
  twoHundredDaySma: string;
  rsi14: string;
  arrMetric: string;
  nrrMetric: string;
  fcfQualityAssessment: string;
  guidanceShiftDeltas: string;

  // Debate Arena & Verdicts
  debateTitle: string;
  debateSubtitle: string;
  bullCase: string;
  bearCase: string;
  roundTwoRebuttalTitle: string;
  bullRebuttalTitle: string;
  bearRebuttalTitle: string;
  cioVerdict: string;
  riskReward: string;
  recommendedBuyBracket: string;
  positionSizing: string;
  judgeSummary: string;
  keyUpsideCatalyst: string;
  keyDownsideRisk: string;
  shareVerdictBtn: string;
  shareVerdictModalTitle: string;
  shareVerdictModalSubtitle: string;
  shareVerdictPreviewTab: string;
  shareVerdictMarkdownTab: string;
  shareVerdictCopyBtn: string;
  shareVerdictCopied: string;
  shareVerdictDownloadMd: string;
  shareVerdictClose: string;
  shareVerdictTooltip: string;
  shareVerdictAttribution: string;
  shareVerdictHeaderBull: string;
  shareVerdictHeaderBear: string;
  shareVerdictHeaderCIO: string;

  // Soul Check, Regime & Falsification
  trendTemperatureTitle: string;
  rightSideBattingZone: string;
  leftSideObservation: string;
  bayesianPriorTitle: string;
  narrativePenetrationTitle: string;
  falsificationTriggerTitle: string;
  falsificationBreachedWarning: string;
  falsificationBreachedDesc: string;
  notifyFalsificationBtn: string;
  falsificationNotified: string;
  assetDiagnosisTitle: string;
  implied10YCeilingLabel: string;
  prosperityTrapLabel: string;
  coreSaaLabel: string;
  trapTriggered: string;
  trapSafe: string;

  // Pricing Chart & Timing
  chartTitle: string;
  pricingOverlay: string;
  valuationStatus: string;
  idealBuyRange: string;
  actionStatus: string;
  timingAdvice: string;

  // SEC Text Mining Viewer
  secTitle: string;
  secSubtitle: string;
  insertedDisclaimer: string;
  removedDisclaimer: string;
  extractedKeywordTrends: string;
  comparisonPeriod: string;

  // Quantitative Backtest Viewer
  backtestTitle: string;
  backtestSubtitle: string;
  filingYear: string;
  returnHeader: string;
  cagr: string;
  sharpeRatio: string;
  maxDrawdown: string;
  winRate: string;
  alpha: string;
  riskFreeRate: string;
  peakToTroughRisk: string;
  outperformedBenchmark: string;

  // Fundamental Review Section
  fundamentalReportTitle: string;

  // Hover Card Everyday Analogy
  everydayAnalogyHeader: string;

  // Watchlist Drawer
  watchlistTitle: string;
  addFocusAndAlert: string;
  tickerPlaceholder: string;
  companyPlaceholder: string;
  targetPricePlaceholder: string;
  allocPlaceholder: string;
  addWatchlistBtn: string;
  starredItems: string;
  targetPrice: string;
  suggestedAlloc: string;
  deleteItem: string;
  dbStorageNotice: string;

  // Portfolio Calculator Modal
  calcTitle: string;
  calcSubtitle: string;
  calcCapitalLabel: string;
  calcRiskModelLabel: string;
  calcConservative: string;
  calcBalanced: string;
  calcAggressive: string;
  calcMaxPerStock: string;
  calcCurrencyLabel: string;
  calcEquities: string;
  calcCashReserve: string;
  calcTableAsset: string;
  calcTablePrice: string;
  calcTableWeight: string;
  calcTableShares: string;
  calcTableDollar: string;
  calcSharesUnit: string;
  calcFooterNotice: string;
  calcCloseBtn: string;

  // Discord Push Alert Modal
  discordModalTitle: string;
  discordModalSubtitle: string;
  discordDirectWebhookBadge: string;
  discordGuideTitle: string;
  discordGuideStep1: string;
  discordGuideStep2: string;
  discordGuideStep3: string;
  discordChannelStatus: string;
  discordConnected: string;
  discordNotConfigured: string;
  discordWebhookInputLabel: string;
  discordEnableToggleTitle: string;
  discordEnableToggleDesc: string;
  discordTestChannelsTitle: string;
  discordTestChannelsSub: string;
  discordTestMacroBtn: string;
  discordTestBuyBtn: string;
  discordTestSellBtn: string;
  discordTestGoldBtn: string;
  discordConnTestBtn: string;
  discordSaveConfigBtn: string;
  discordSavingBtn: string;
  discordSavedSuccess: string;
  discordSaveFailed: string;
  discordEnterUrlFirst: string;
  discordConnTestSuccess: string;
  discordMacroSuccess: string;
  discordBuySuccess: string;
  discordSellSuccess: string;
  discordGoldSuccess: string;
  discordDispatchFailed: string;

  // In-App Notification Center & Alerts
  notificationCenterTitle: string;
  notificationInbox: string;
  notificationCenterAria: string;
  clearAllNotifications: string;
  noNotificationsTitle: string;
  noNotificationsDesc: string;
  checkAlertsNow: string;
  checkingAlerts: string;
  dismissNotification: string;
  viewDeepDive: string;
  unreadCountBadge: string;
  triggeredAt: string;
  toastTargetHit: string;
  toastEnteredBuyZone: string;
  toastTargetLabel: string;
  toastDeepDiveBtn: string;
  toastCloseAria: string;

  // Responsive Left-Side Navigation Drawer (Workstation Hub)
  navDrawerTitle: string;
  navDrawerSubtitle: string;
  navMemberProfile: string;
  navGuestAnalyst: string;
  navFreeTier: string;
  navSignInPlaceholder: string;
  navCoreModules: string;
  navPreferences: string;
  navQuickTabs: string;
  navWatchlistDesc: string;
  navDiscordDesc: string;
  navValuationDesc: string;
  navCalcDesc: string;
  navCommandDesc: string;
  navCloseDrawer: string;

  // Watchlist Sync
  syncTargetsBtn: string;
  syncingTargets: string;
  syncTargetsSuccess: string;

  // Alert Sensitivity & Valuation Range Settings
  settingsButtonTitle: string;
  settingsModalTitle: string;
  settingsModalSubtitle: string;
  settingsTabGlobal: string;
  settingsTabOverrides: string;
  settingsGlobalMosTitle: string;
  settingsGlobalMosSubtitle: string;
  settingsMosAggressive: string;
  settingsMosBalanced: string;
  settingsMosConservative: string;
  settingsMosDeepValue: string;
  settingsAnchorModeTitle: string;
  settingsAnchorModeSubtitle: string;
  settingsAnchorAdaptive: string;
  settingsAnchorAdaptiveDesc: string;
  settingsAnchorStrict: string;
  settingsAnchorStrictDesc: string;
  settingsAnchorTactical: string;
  settingsAnchorTacticalDesc: string;
  settingsOverridesTitle: string;
  settingsOverridesSubtitle: string;
  settingsTickerCol: string;
  settingsMarketPriceCol: string;
  settingsDynamicBuyCol: string;
  settingsCustomBuyCol: string;
  settingsDynamicSellCol: string;
  settingsCustomSellCol: string;
  settingsResetBtn: string;
  settingsResetConfirm: string;
  settingsSaveBtn: string;
  settingsSavingBtn: string;
  settingsSavedSuccess: string;
  settingsResetSuccess: string;
  settingsSaveFailed: string;
  settingsTradeoffNoticeTitle: string;
  settingsTradeoffNoticeDesc: string;

  // Advanced Methodology & Taxonomy Fields
  taxonomyTree: string;
  taxonomyGrain: string;
  taxonomyVegetable: string;
  impliedCeilingTitle: string;
  prosperityTrapAlert: string;
  barbell8020Label: string;
  calmarRatioLabel: string;
  trendTempFreeze: string;
  trendTempFlat: string;
  trendTempWarm: string;
  trendTempHot: string;
  disciplineBlocked: string;
  soulCheckTitle: string;
  logScaleLabel: string;
  linearScaleLabel: string;
  shareholderYieldLabel: string;
  tabPositionSizing: string;
  tabKellySizer: string;
  tabFrontier: string;
  tabLiabilityStress: string;
  underwaterDrawdownTitle: string;
  rebalanceBonusLabel: string;
  falsificationKillSwitchTitle: string;
  syncTargetsToWatchlist: string;
  targetsSynced: string;
  institutionalBridgeTitle: string;
  dcfSensitivityHeatmap: string;
  accountingForensicsTitle: string;
  bayesianWinProb: string;
  correlationPenaltyFactor: string;
}

export const TRANSLATIONS: Record<LanguageMode, Translations> = {
  en: {
    appTitle: "Prism Loop",
    appSubtitle: "Multi-Spectrum Equity Intelligence",
    searchPlaceholder: "Search US & Canadian Stocks ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "Analyze Ticker",
    tabMacro: "Macro Dashboard",
    tabPicks: "Stock Picks",
    tabStock: "Single Stock Deep-Dive",
    plainTalkOn: "PlainTalk Mode: ON",
    plainTalkOff: "Professional Mode",
    watchlistDrawerTitle: "Watchlist & Price Alerts",
    starred: "Starred",
    addStar: "+ Add Star",
    groundTruthVerified: "100% Verified Data",
    source: "Source",
    currentMarketPrice: "Current Market Price",
    verifyOnYahoo: "Verify on Yahoo Finance",
    commandPaletteTitle: "Quick Search (Ctrl+K)",
    calcButtonTitle: "Position Sizing Calculator",
    discordButtonTitle: "Discord Push Alerts",
    themeLight: "Light Mode",
    themeDark: "Dark Mode",
    exportMemoBtn: "Export Memo",
    exportMemoTitle: "Export Institutional Investment Memo (.md / .pdf)",
    backToMacroPicks: "← Back to Macro Dashboard & Stock Picks",
    backToStockPicks: "← Back to Stock Picks",
    backToMacro: "← Back to Macro Dashboard",
    exportMemoModalTitle: "Institutional Investment Memo Export",
    exportMemoModalSubtitle: "1-Click Export in Clean Printable PDF or Markdown",
    exportMemoStyledPreview: "Styled Preview",
    exportMemoRawMarkdown: "Raw Markdown",
    exportMemoDownloadMd: "Download .md",
    exportMemoPrintPdf: "Print / Save PDF",
    exportMemoCopied: "Copied!",
    exportMemoCopy: "Copy",

    loadingSubtitle: "Initializing real-time market intelligence systems...",
    loadingStep1: "Connecting to Federal Reserve (FRED) & Bank of Canada Economic Data...",
    loadingStep2: "Ingesting Live Central Bank Policy Statements & Macro News Stream...",
    loadingStep3: "Analyzing Top Stock Recommendations & Sector Allocations...",
    loadingStep4: "Initializing Multi-Agent AI Debate Arena & Portfolio Engine...",
    loadingStepCounter: "Step",
    loadingOf: "of",

    macroTitle: "Macro Economic Cycle Scanner",
    macroSubtitle: "Empirical proof array derived from FRED economic data, Central Bank NLP statements & Sovereign Yields",
    macroMarketUS: "United States (US)",
    macroMarketCA: "Canada (CA)",
    macroSelectMarket: "Jurisdiction",
    usMarketDesc: "Federal Reserve monetary policy, BLS inflation, BEA growth & S&P 500 valuation",
    caMarketDesc: "Bank of Canada policy rate, StatCan inflation, GoC yields & TSX Composite valuation",
    liveMacroStream: "Live Policy & Economic News Stream",
    cycleStage: "Macro Cycle Stage",
    fedSentiment: "Fed Hawkish / Dovish Sentiment",
    bocSentiment: "BoC Hawkish / Dovish Sentiment",
    hawkish: "Hawkish Signals",
    dovish: "Dovish Signals",
    overweightSectors: "Recommended Overweight Sectors",
    underweightSectors: "Recommended Underweight Sectors",
    policyNews: "Policy & Economic News Stream",
    empiricalFacts: "Empirical Indicator Proof Array",
    credibleSources: "Credible Citation Sources",
    indicator: "Economic Indicator",
    value: "Current Value",
    impact: "Portfolio Impact",
    macroInsight: "Macro Insight:",
    readOfficialRelease: "Read Official Release",

    recsTitle: "Top Macro-Driven Stock Recommendations",
    recsSubtitle: "Categorized by Macro Overweight Sectors, Blue-Chip Leaders, and Hidden Gold Nuggets",
    refreshRecommendations: "Refresh Recommendations",
    refreshingPicks: "Rotating candidate batch...",
    catSectorChampions: "Sector Overweight Champions",
    catMarketLeaders: "Core Market Leaders",
    catGoldNuggets: "Hidden Gold Nuggets",
    catSectorDesc: "High FCF leaders strictly matching active macro overweight sectors.",
    catLeaderDesc: "Blue-chip core leaders with wide economic moats and strong cash flows.",
    catGoldDesc: "Non-mainstream mid-cap / niche growth stocks with high upside potential.",
    whyInvestNow: "Why Recommend Now",
    companyBackground: "Company Core Business Background",
    growthCatalysts: "Key Growth Catalysts",
    revenueDrivers: "Core Revenue Drivers & Business Segments",
    drillDownAnalysis: "Drill Down Full Analysis",
    supportLevel: "Support Level",
    score: "Score",
    showingStocks: "Showing",

    freeCashFlow: "Free Cash Flow (FCF)",
    peRatio: "P/E Ratio",
    moatRating: "Morningstar Moat Rating",
    buyZone: "Ideal Buy Zone",
    fairValue: "DCF Intrinsic Fair Value",
    fiftyDaySma: "50-Day SMA",
    twoHundredDaySma: "200-Day SMA",
    rsi14: "RSI (14-Day)",
    arrMetric: "Annual Recurring Revenue (ARR)",
    nrrMetric: "Net Revenue Retention (NRR)",
    fcfQualityAssessment: "FCF Quality Assessment",
    guidanceShiftDeltas: "5-Yr Guidance Shift Deltas",

    debateTitle: "Multi-Agent Institutional Investment Arena",
    debateSubtitle: "Bull Agent vs Bear Agent Data Debate → CIO Verdict & Evidence Verification",
    bullCase: "Bull Case Advocate",
    bearCase: "Bear Case Prosecutor",
    roundTwoRebuttalTitle: "Round 2: Adversarial Cross-Examination",
    bullRebuttalTitle: "Bull Agent Rebuttal",
    bearRebuttalTitle: "Bear Agent Rebuttal",
    cioVerdict: "Chief Investment Officer (CIO) Final Verdict",
    riskReward: "Risk / Reward Ratio",
    recommendedBuyBracket: "Recommended Entry Bracket",
    positionSizing: "Position Sizing Advice",
    judgeSummary: "CIO Decision Rationale",
    keyUpsideCatalyst: "Key Upside Catalyst",
    keyDownsideRisk: "Key Downside Risk",
    shareVerdictBtn: "Share Debate Verdict",
    shareVerdictModalTitle: "Debate Verdict & CIO Analysis",
    shareVerdictModalSubtitle: "Multi-Agent Institutional Bull vs Bear Thesis & Allocation Verdict",
    shareVerdictPreviewTab: "Formatted Preview",
    shareVerdictMarkdownTab: "Raw Markdown",
    shareVerdictCopyBtn: "Copy for Reddit / X",
    shareVerdictCopied: "Copied to Clipboard!",
    shareVerdictDownloadMd: "Download .md",
    shareVerdictClose: "Close",
    shareVerdictTooltip: "Preview and copy formatted debate verdict for Reddit, X, and Discord",
    shareVerdictAttribution: "Analysis generated by Prism Loop • Multi-Spectrum Equity Intelligence",
    shareVerdictHeaderBull: "Bull Case Advocate",
    shareVerdictHeaderBear: "Bear Case Prosecutor",
    shareVerdictHeaderCIO: "Chief Investment Officer (CIO) Verdict",

    // Soul Check, Regime & Falsification
    trendTemperatureTitle: "Trend Temperature / Batting Zone",
    rightSideBattingZone: "Right-Side Batting Zone",
    leftSideObservation: "Left-Side Observation",
    bayesianPriorTitle: "Bayesian Prior Confidence",
    narrativePenetrationTitle: "Narrative Penetration (10Y Ceiling)",
    falsificationTriggerTitle: "Mandatory Falsification Trigger",
    falsificationBreachedWarning: "FALSIFICATION THRESHOLD BREACHED",
    falsificationBreachedDesc: "Current market price has fallen below the quantified bottom exit threshold. Counter-trend averaging down is strictly prohibited by the Investment Constitution!",
    notifyFalsificationBtn: "Dispatch Falsification Alert",
    falsificationNotified: "Falsification Alert Sent!",
    assetDiagnosisTitle: "Asset Qualitative Diagnosis",
    implied10YCeilingLabel: "Implied 10Y Profit Ceiling",
    prosperityTrapLabel: "Prosperity Trap",
    coreSaaLabel: "80/20 Core SAA Allocation",
    trapTriggered: "TRIGGERED",
    trapSafe: "SAFE",

    chartTitle: "Valuation & Dynamic Price Channel Chart",
    pricingOverlay: "Pricing & Technical Overlay",
    valuationStatus: "Valuation Status",
    idealBuyRange: "Ideal Buy Range",
    actionStatus: "Action Status",
    timingAdvice: "Tactical Execution Advice",

    secTitle: "5-Year SEC 10-K & SEDAR+ Text Mining Pipeline",
    secSubtitle: "Algorithmic extraction of executive risk disclaimer mutations over 5 reporting years",
    insertedDisclaimer: "Inserted Risk Disclaimers",
    removedDisclaimer: "Removed Disclaimers",
    extractedKeywordTrends: "Extracted Keyword Trends",
    comparisonPeriod: "Comparison Period",

    backtestTitle: "5-Year Historical Quantitative Strategy Backtest",
    backtestSubtitle: "Simulated 5-year rolling returns, Sharpe Ratio, Max Drawdown & CAGR vs Benchmark",
    filingYear: "Year",
    returnHeader: "Return",
    cagr: "CAGR (Annual Return)",
    sharpeRatio: "Sharpe Ratio",
    maxDrawdown: "Max Drawdown",
    winRate: "Win Rate vs Benchmark",
    alpha: "Alpha (Excess Return)",
    riskFreeRate: "Risk-free rate: 3.5%",
    peakToTroughRisk: "Peak-to-trough risk",
    outperformedBenchmark: "Outperformed benchmark",

    fundamentalReportTitle: "Institutional Fundamental Audit Report",

    everydayAnalogyHeader: "Everyday Analogy:",

    watchlistTitle: "Watchlist & Price Alerts",
    addFocusAndAlert: "Add Security & Target Alert",
    tickerPlaceholder: "Ticker ($NVDA, $TD.TO)",
    companyPlaceholder: "Company Name (Optional)",
    targetPricePlaceholder: "Target Buy Price ($)",
    allocPlaceholder: "Suggested Alloc (%)",
    addWatchlistBtn: "Add to Watchlist",
    starredItems: "Starred Securities",
    targetPrice: "Target Price",
    suggestedAlloc: "Suggested Alloc",
    deleteItem: "Delete",
    dbStorageNotice: "Local SQLite database with WAL-mode persistence",

    calcTitle: "Position Sizing & Risk Management Calculator",
    calcSubtitle: "Dynamic capital allocation and share count execution tailored to CIO risk profiles",
    calcCapitalLabel: "Total Investment Capital",
    calcRiskModelLabel: "Risk Preference Model",
    calcConservative: "Conservative",
    calcBalanced: "Balanced",
    calcAggressive: "Aggressive",
    calcMaxPerStock: "Max/Stock",
    calcCurrencyLabel: "Base Currency",
    calcEquities: "Equities Allocation",
    calcCashReserve: "Cash Buffer",
    calcTableAsset: "Asset & Ticker",
    calcTablePrice: "Current Price",
    calcTableWeight: "Target Weight",
    calcTableShares: "Shares to Buy",
    calcTableDollar: "Target Dollar Amount",
    calcSharesUnit: "shares",
    calcFooterNotice: "*Calculated as whole integer shares; residual cash is retained in Cash Buffer.",
    calcCloseBtn: "Close Calculator",

    discordModalTitle: "Discord Push Alerts",
    discordModalSubtitle: "Real-time automated institutional alerts sent directly to your Discord server.",
    discordDirectWebhookBadge: "Direct Webhook Delivery",
    discordGuideTitle: "30-Second Discord Setup Guide",
    discordGuideStep1: "Open Discord → Server/Channel Settings → Integrations.",
    discordGuideStep2: "Click Webhooks → Create New Webhook.",
    discordGuideStep3: "Copy the Webhook URL and paste it below.",
    discordChannelStatus: "Channel Status:",
    discordConnected: "Connected",
    discordNotConfigured: "Not Configured",
    discordWebhookInputLabel: "Discord Webhook URL",
    discordEnableToggleTitle: "Enable Automatic Push Alerts",
    discordEnableToggleDesc: "Dispatches embed cards when Macro, Buy-In, Danger Risk, or Gold Nuggets triggers fire.",
    discordTestChannelsTitle: "Test Dispatch Channels",
    discordTestChannelsSub: "Click to send sample alert embed card to your Discord channel",
    discordTestMacroBtn: "1. Macro Digest",
    discordTestBuyBtn: "2. Buy-In Signals",
    discordTestSellBtn: "3. Sell / Danger Risk",
    discordTestGoldBtn: "4. Gold Nuggets",
    discordConnTestBtn: "Connection Test",
    discordSaveConfigBtn: "Save Configuration",
    discordSavingBtn: "Saving...",
    discordSavedSuccess: "Discord Webhook configuration saved successfully!",
    discordSaveFailed: "Save failed:",
    discordEnterUrlFirst: "Please enter a valid Discord Webhook URL first.",
    discordConnTestSuccess: "Connection test alert sent! Check your Discord channel.",
    discordMacroSuccess: "Daily Macro & Policy Digest alert sent to Discord!",
    discordBuySuccess: "Bundled Buy-In Watchlist alert sent to Discord!",
    discordSellSuccess: "Watchlist Sell & Danger Zone alert sent to Discord!",
    discordGoldSuccess: "Gold Nuggets Discovery alert sent to Discord!",
    discordDispatchFailed: "Alert dispatch failed:",

    // In-App Notification Center & Alerts
    notificationCenterTitle: "Notification Centre",
    notificationInbox: "Alert Inbox",
    notificationCenterAria: "Toggle notification center",
    clearAllNotifications: "Clear All",
    noNotificationsTitle: "All Caught Up",
    noNotificationsDesc: "No active price triggers or valuation alerts. Stocks entering your Ideal Buy Zone will appear here.",
    checkAlertsNow: "Check Live Alerts",
    checkingAlerts: "Scanning...",
    dismissNotification: "Dismiss",
    viewDeepDive: "Deep Dive",
    unreadCountBadge: "unread alerts",
    triggeredAt: "Triggered",
    toastTargetHit: "Target Price Hit!",
    toastEnteredBuyZone: "entered your Buy Zone! Live:",
    toastTargetLabel: "≤ Target:",
    toastDeepDiveBtn: "Deep Dive Analysis",
    toastCloseAria: "Dismiss alert",

    // Responsive Left-Side Navigation Drawer (Workstation Hub)
    navDrawerTitle: "Workstation Hub",
    navDrawerSubtitle: "Multi-Spectrum Equity Intelligence",
    navMemberProfile: "Analyst Account",
    navGuestAnalyst: "Guest Analyst",
    navFreeTier: "Local Session • Free Tier",
    navSignInPlaceholder: "Sign In / Multi-Tenant (Coming Soon)",
    navCoreModules: "Core Tools & Modules",
    navPreferences: "Preferences & Appearance",
    navQuickTabs: "Quick Jump Perspectives",
    navWatchlistDesc: "Tracked tickers & live entry triggers",
    navDiscordDesc: "Webhook alerts & automated push",
    navValuationDesc: "Margin of Safety (MoS) & moving average anchors",
    navCalcDesc: "80/20 Barbell & fractional Kelly sizing",
    navCommandDesc: "Search universe & keyboard shortcuts",
    navCloseDrawer: "Close navigation drawer",

    // Watchlist Sync
    syncTargetsBtn: "Sync to Live Buy Zones",
    syncingTargets: "Syncing...",
    syncTargetsSuccess: "Watchlist target buy prices synced to live Buy Zones!",

    // Alert Sensitivity & Valuation Range Settings
    settingsButtonTitle: "Alert & Valuation Settings",
    settingsModalTitle: "Alert Sensitivity & Valuation Settings",
    settingsModalSubtitle: "Configure Margin of Safety discount, technical moving average anchors, and per-stock trigger overrides",
    settingsTabGlobal: "Global Valuation & Anchors",
    settingsTabOverrides: "Watchlist Ticker Overrides",
    settingsGlobalMosTitle: "Global Margin of Safety (MoS) Discount",
    settingsGlobalMosSubtitle: "Adjust the intrinsic discount applied to DCF fair value before calculating Ideal Buy Zone ceilings.",
    settingsMosAggressive: "Aggressive Compounder (10%)",
    settingsMosBalanced: "Balanced Standard (15%)",
    settingsMosConservative: "Conservative Moat (20%)",
    settingsMosDeepValue: "Deep Value Graham (30%)",
    settingsAnchorModeTitle: "Technical Pullback Anchor Mode",
    settingsAnchorModeSubtitle: "Defines the moving average synthesis used to anchor entry ceilings and prevent chasing rallies.",
    settingsAnchorAdaptive: "Adaptive Balanced (50D & 200D)",
    settingsAnchorAdaptiveDesc: "Synthesizes 50D & 200D SMA support to eliminate cash drag while guarding against overvaluation.",
    settingsAnchorStrict: "Strict 200D SMA Support",
    settingsAnchorStrictDesc: "Restricts buy zone ceilings strictly at or below the 200-day moving average for maximum cycle protection.",
    settingsAnchorTactical: "Tactical 5% Pullback",
    settingsAnchorTacticalDesc: "Optimized for high-momentum compounders, setting triggers near the 50D SMA or 5% pullbacks off peaks.",
    settingsOverridesTitle: "Watchlist Per-Ticker Alert Overrides",
    settingsOverridesSubtitle: "Override platform defaults with custom upper & lower trigger prices for individual stocks.",
    settingsTickerCol: "Ticker",
    settingsMarketPriceCol: "Current Price",
    settingsDynamicBuyCol: "Dynamic Buy Ceiling",
    settingsCustomBuyCol: "Custom Buy Target",
    settingsDynamicSellCol: "Dynamic Sell Ceiling",
    settingsCustomSellCol: "Custom Sell Target",
    settingsResetBtn: "Reset to Institutional Defaults",
    settingsResetConfirm: "Are you sure you want to reset all valuation settings and overrides to institutional defaults?",
    settingsSaveBtn: "Save Settings & Overrides",
    settingsSavingBtn: "Saving Changes...",
    settingsSavedSuccess: "Valuation and alert sensitivity settings saved successfully!",
    settingsResetSuccess: "Settings restored to institutional defaults (15% MoS, Adaptive Balanced)!",
    settingsSaveFailed: "Failed to save settings:",
    settingsTradeoffNoticeTitle: "Institutional Sensitivity Trade-Offs",
    settingsTradeoffNoticeDesc: "Higher Margin of Safety (20%-30%) provides superior downside protection but can induce cash drag in bull markets. Lower MoS (10%) maximizes capital deployment into premium growth stocks at the cost of higher volatility.",

    // Advanced Methodology & Taxonomy Fields
    taxonomyTree: "🌲 Tree (Compounder)",
    taxonomyGrain: "🌾 Grain (Cyclical / Value)",
    taxonomyVegetable: "🥬 Vegetable (Trend Only)",
    impliedCeilingTitle: "Reverse-DCF Implied 10Y Earnings Ceiling",
    prosperityTrapAlert: "Prosperity Trap Warning: High short-term growth at low PE percentile — check if terminal ceiling is saturated.",
    barbell8020Label: "Barbell 80/20 (2%–4% Finite Bet Cap)",
    calmarRatioLabel: "Calmar Ratio (CAGR / Max Drawdown)",
    trendTempFreeze: "❄️ Freeze (Blood Chips)",
    trendTempFlat: "➖ Flat (Consolidation)",
    trendTempWarm: "🌤️ Warm (Right-Side Entry)",
    trendTempHot: "🔥 Hot (Fat-Tail Momentum)",
    disciplineBlocked: "Blocked by 纪律.md Constitution",
    soulCheckTitle: "Pre-Trade Four Soul Questions & Bayesian Prior",
    logScaleLabel: "Log Scale",
    linearScaleLabel: "Linear Scale",
    shareholderYieldLabel: "Total Shareholder Yield (Div + Net Buyback)",
    tabPositionSizing: "Position Sizing",
    tabKellySizer: "80/20 Barbell & Kelly Sizer",
    tabFrontier: "Efficient Frontier & Decoupling",
    tabLiabilityStress: "Liability Stress Test",
    underwaterDrawdownTitle: "Underwater Drawdown Curve",
    rebalanceBonusLabel: "Rebalancing Bonus",
    falsificationKillSwitchTitle: "Thesis Falsification Kill-Switch",
    syncTargetsToWatchlist: "Sync Targets to Watchlist",
    targetsSynced: "Targets Synced ✓",
    institutionalBridgeTitle: "Institutional DCF Bridge & 5x5 Sensitivity Matrix",
    dcfSensitivityHeatmap: "5x5 DCF Sensitivity Heatmap",
    accountingForensicsTitle: "Accounting Forensics & Earnings Quality Audit",
    bayesianWinProb: "Bayesian-Shrunk Win Probability",
    correlationPenaltyFactor: "Correlation Penalty Factor",
  },

  zh: {
    appTitle: "Prism Loop",
    appSubtitle: "多维光谱智能投研工作站",
    searchPlaceholder: "搜索美股与加拿大股票 ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "深度剖析标的",
    tabMacro: "宏观周期看板",
    tabPicks: "精选股票池",
    tabStock: "个股深度研报",
    plainTalkOn: "通俗白话模式: 开",
    plainTalkOff: "专业机构模式",
    watchlistDrawerTitle: "自选股与价格提醒",
    starred: "已关注",
    addStar: "+ 关注",
    groundTruthVerified: "100% 真实数据验证",
    source: "数据源",
    currentMarketPrice: "当前市场价格",
    verifyOnYahoo: "在 Yahoo Finance 验证行情",
    commandPaletteTitle: "快捷搜索 (Ctrl+K)",
    calcButtonTitle: "仓位管理计算器",
    discordButtonTitle: "Discord 警报推送",
    themeLight: "明亮模式",
    themeDark: "暗黑模式",
    exportMemoBtn: "导出投研备忘录",
    exportMemoTitle: "导出机构级投资备忘录 (.md / .pdf)",
    backToMacroPicks: "← 返回宏观大盘与精选标的",
    backToStockPicks: "← 返回精选股票池",
    backToMacro: "← 返回宏观周期看板",
    exportMemoModalTitle: "机构级投研备忘录导出",
    exportMemoModalSubtitle: "一键导出排版规范的 PDF 报告或 Markdown 文档",
    exportMemoStyledPreview: "精美排版预览",
    exportMemoRawMarkdown: "Markdown 源码",
    exportMemoDownloadMd: "下载 .md",
    exportMemoPrintPdf: "打印 / 保存为 PDF",
    exportMemoCopied: "已复制！",
    exportMemoCopy: "复制源码",

    loadingSubtitle: "正在初始化实时市场情报系统...",
    loadingStep1: "正在连接美联储 (FRED) 与加拿大央行宏观数据...",
    loadingStep2: "正在解析央行政策声明与实时宏观新闻流...",
    loadingStep3: "正在计算多维度股票推荐与板块配置建议...",
    loadingStep4: "正在初始化多智能体 AI 辩论竞技场与仓位引擎...",
    loadingStepCounter: "步骤",
    loadingOf: "/",

    macroTitle: "宏观经济周期扫描仪",
    macroSubtitle: "基于官方经济指标、央行政策声明 NLP 与主权国债收益率的客观实证数组",
    macroMarketUS: "美国市场 (US)",
    macroMarketCA: "加拿大市场 (CA)",
    macroSelectMarket: "宏观扫描区域",
    usMarketDesc: "美联储货币政策、劳工统计局通胀、经济分析局增长与标普500估值水位",
    caMarketDesc: "加拿大央行政策利率、统计局通胀、加拿大国债收益率与TSX多伦多综指估值",
    liveMacroStream: "实时央行政策与宏观新闻流",
    cycleStage: "宏观经济周期阶段",
    fedSentiment: "美联储鹰鸽情绪指数",
    bocSentiment: "加拿大央行鹰鸽情绪指数",
    hawkish: "鹰派信号",
    dovish: "鸽派信号",
    overweightSectors: "建议超配板块",
    underweightSectors: "建议低配板块",
    policyNews: "央行政策与宏观新闻流",
    empiricalFacts: "宏观指标实证链条",
    credibleSources: "权威数据来源与引用",
    indicator: "经济指标",
    value: "最新数据",
    impact: "组合影响",
    macroInsight: "宏观深度洞察:",
    readOfficialRelease: "阅读官方发布公告",

    recsTitle: "宏观驱动多维度股票推荐阵列",
    recsSubtitle: "按宏观超配板块、蓝筹核心龙头与隐形金矿股精准分类",
    refreshRecommendations: "刷新推荐组合",
    refreshingPicks: "正在更换新一批推荐标的...",
    catSectorChampions: "超配板块精选",
    catMarketLeaders: "核心龙头",
    catGoldNuggets: "隐形金矿股",
    catSectorDesc: "与当前超配板块完全契合的强现金流行业领头羊。",
    catLeaderDesc: "大盘核心蓝筹标的，兼具宽护城河与充沛现金流。",
    catGoldDesc: "中小盘利基龙头，估值合理且具备高上涨潜力。",
    whyInvestNow: "为什么此时推荐配置",
    companyBackground: "公司主营业务背景",
    growthCatalysts: "核心增长催化剂",
    revenueDrivers: "核心营收驱动与业务构成",
    drillDownAnalysis: "剖析完整报告",
    supportLevel: "技术支撑位",
    score: "评分",
    showingStocks: "显示",

    freeCashFlow: "自由现金流 (FCF)",
    peRatio: "市盈率 (P/E)",
    moatRating: "护城河评级",
    buyZone: "理想买入区间",
    fairValue: "DCF 固有价值",
    fiftyDaySma: "50日均线",
    twoHundredDaySma: "200日均线",
    rsi14: "RSI 相对强弱",
    arrMetric: "年度经常性收入 (ARR)",
    nrrMetric: "净收入留存率 (NRR)",
    fcfQualityAssessment: "现金流质量评估",
    guidanceShiftDeltas: "5年业绩指引变动",

    debateTitle: "多智能体投资辩论竞技场",
    debateSubtitle: "多头辩护人 vs 空头公诉人 数据辩论 → CIO 裁决与实证核验",
    bullCase: "多头辩护人",
    bearCase: "空头公诉人",
    roundTwoRebuttalTitle: "第二轮：多空交叉辩论与反驳",
    bullRebuttalTitle: "多头辩护人反驳",
    bearRebuttalTitle: "空头公诉人反驳",
    cioVerdict: "首席投资官 (CIO) 最终裁决",
    riskReward: "风险/收益比",
    recommendedBuyBracket: "建议买入区间",
    positionSizing: "仓位管理建议",
    judgeSummary: "CIO 决策逻辑",
    keyUpsideCatalyst: "核心看涨催化剂",
    keyDownsideRisk: "主要下行风险",
    shareVerdictBtn: "分享辩论裁决",
    shareVerdictModalTitle: "辩论裁决与首席投资官分析",
    shareVerdictModalSubtitle: "多智能体机构级多空辩论论据与资产配置裁决",
    shareVerdictPreviewTab: "排版预览",
    shareVerdictMarkdownTab: "Markdown 源码",
    shareVerdictCopyBtn: "复制到社区 (Reddit / X)",
    shareVerdictCopied: "已复制到剪贴板！",
    shareVerdictDownloadMd: "下载 Markdown",
    shareVerdictClose: "关闭",
    shareVerdictTooltip: "预览并复制格式化多空辩论裁决，用于分享至 Reddit、X 或 Discord",
    shareVerdictAttribution: "投研分析由 Prism Loop 多维光谱智能投研工作站生成 • 开源投研平台",
    shareVerdictHeaderBull: "多头辩护人论据",
    shareVerdictHeaderBear: "空头公诉人论据",
    shareVerdictHeaderCIO: "首席投资官 (CIO) 最终裁决",

    // Soul Check, Regime & Falsification
    trendTemperatureTitle: "量价温度 / 击球区",
    rightSideBattingZone: "右侧击球区",
    leftSideObservation: "左侧观察",
    bayesianPriorTitle: "贝叶斯先验置信度",
    narrativePenetrationTitle: "穿透叙事 (10年天花板)",
    falsificationTriggerTitle: "离场铁律与证伪底线",
    falsificationBreachedWarning: "证伪底线已击穿",
    falsificationBreachedDesc: "当前股价已跌破量化止损底线。恪守反破产投资宪法：破位机械离场，严禁左侧逆势加仓补仓！",
    notifyFalsificationBtn: "推送告警通知 (Discord/应用内)",
    falsificationNotified: "证伪告警已推送！",
    assetDiagnosisTitle: "标的定性归因",
    implied10YCeilingLabel: "逆向10年利润天花板",
    prosperityTrapLabel: "景气度陷阱",
    coreSaaLabel: "80/20 核心资产配置",
    trapTriggered: "已触发",
    trapSafe: "安全",

    chartTitle: "估值与动态价格通道",
    pricingOverlay: "估值与技术面走势",
    valuationStatus: "估值状态",
    idealBuyRange: "理想买入区间",
    actionStatus: "操作指令",
    timingAdvice: "战术执行建议",

    secTitle: "5年期 SEC 10-K 与 SEDAR+ 财报文本挖掘",
    secSubtitle: "基于算法对比 5 年年度财报中高管风险免责声明变动",
    insertedDisclaimer: "新增风险披露条款",
    removedDisclaimer: "移除与重分类声明",
    extractedKeywordTrends: "提取风险关键词趋势",
    comparisonPeriod: "对比年份",

    backtestTitle: "5年期历史量化策略回测",
    backtestSubtitle: "5 年滚动年化收益率、Sharpe Ratio、Max Drawdown 与 CAGR 对比",
    filingYear: "年份",
    returnHeader: "收益率",
    cagr: "年化复合收益率 (CAGR)",
    sharpeRatio: "夏普比率 (Sharpe Ratio)",
    maxDrawdown: "最大回撤 (Max Drawdown)",
    winRate: "胜率 (Win Rate)",
    alpha: "超额收益 (Alpha)",
    riskFreeRate: "无风险利率: 3.5%",
    peakToTroughRisk: "峰谷回撤风险",
    outperformedBenchmark: "跑赢基准大盘",

    fundamentalReportTitle: "机构基本面审计报告",

    everydayAnalogyHeader: "通俗比喻：",

    watchlistTitle: "自选股与价格提醒",
    addFocusAndAlert: "关注新股票与设置买入提醒",
    tickerPlaceholder: "代码 ($AAPL, $TD.TO)",
    companyPlaceholder: "公司名称 (可选)",
    targetPricePlaceholder: "目标买入价 ($)",
    allocPlaceholder: "建议仓位 (%)",
    addWatchlistBtn: "添加关注与价格提醒",
    starredItems: "已关注标的",
    targetPrice: "目标买入价",
    suggestedAlloc: "建议仓位",
    deleteItem: "删除",
    dbStorageNotice: "本地 SQLite 数据库 WAL 模式持久化存储",

    calcTitle: "组合仓位管理与再平衡计算器",
    calcSubtitle: "基于 CIO 模型的资金动态分配与精准拟购股数计算",
    calcCapitalLabel: "投资本金",
    calcRiskModelLabel: "风控模型",
    calcConservative: "保守型",
    calcBalanced: "稳健型",
    calcAggressive: "激进型",
    calcMaxPerStock: "单股上限",
    calcCurrencyLabel: "基础货币",
    calcEquities: "股票配置",
    calcCashReserve: "现金缓冲",
    calcTableAsset: "资产标的",
    calcTablePrice: "当前价格",
    calcTableWeight: "目标权重",
    calcTableShares: "拟购股数",
    calcTableDollar: "目标金额",
    calcSharesUnit: "股",
    calcFooterNotice: "*股数按整数股向下取整计算，剩余现金保留于现金缓冲。",
    calcCloseBtn: "关闭计算器",

    discordModalTitle: "Discord 推送警报",
    discordModalSubtitle: "在 Discord 服务器中实时接收 4 种多类型投资警报。",
    discordDirectWebhookBadge: "直接推送 (Direct Webhook)",
    discordGuideTitle: "30秒 Discord 快速设置指南",
    discordGuideStep1: "打开 Discord → 频道设置 → 整合 (Integrations)。",
    discordGuideStep2: "点击 Webhooks → 新建 Webhook (New Webhook)。",
    discordGuideStep3: "点击 Copy Webhook URL 并粘贴在下方。",
    discordChannelStatus: "通道连接状态:",
    discordConnected: "已连接",
    discordNotConfigured: "未配置",
    discordWebhookInputLabel: "Discord Webhook URL",
    discordEnableToggleTitle: "开启 Discord Webhook 自动推送",
    discordEnableToggleDesc: "触发宏观、买入、卖出或淘金信号时自动发送 Embed 卡片。",
    discordTestChannelsTitle: "测试推送通道",
    discordTestChannelsSub: "点击测试发送对应警报 Embed",
    discordTestMacroBtn: "1. 宏观简报",
    discordTestBuyBtn: "2. 买入汇总",
    discordTestSellBtn: "3. 卖出风控",
    discordTestGoldBtn: "4. 淘金金矿股",
    discordConnTestBtn: "连通性测试",
    discordSaveConfigBtn: "保存配置",
    discordSavingBtn: "保存中...",
    discordSavedSuccess: "Discord Webhook 配置保存成功！",
    discordSaveFailed: "保存失败:",
    discordEnterUrlFirst: "请先输入有效的 Discord Webhook URL。",
    discordConnTestSuccess: "连通性测试警报已发送！请检查您的 Discord 频道。",
    discordMacroSuccess: "每日宏观经济与政策简报已发送至 Discord！",
    discordBuySuccess: "观察列表买入信号汇总已发送至 Discord！",
    discordSellSuccess: "观察列表卖出与危险区间预警已发送至 Discord！",
    discordGoldSuccess: "淘金组合 (Gold Nuggets) 发现提醒已发送至 Discord！",
    discordDispatchFailed: "警报发送失败:",

    // In-App Notification Center & Alerts
    notificationCenterTitle: "消息通知中心",
    notificationInbox: "预警收件箱",
    notificationCenterAria: "打开或关闭通知中心",
    clearAllNotifications: "清空全部",
    noNotificationsTitle: "暂无新通知",
    noNotificationsDesc: "当前没有触发的买入或估值预警。当自选股或精选股票进入理想买入区间时将在此通知。",
    checkAlertsNow: "立即扫描预警",
    checkingAlerts: "扫描中...",
    dismissNotification: "清除此条",
    viewDeepDive: "深度分析",
    unreadCountBadge: "条未读预警",
    triggeredAt: "触发时间",
    toastTargetHit: "已达目标买入价!",
    toastEnteredBuyZone: "已进入理想买入区间！现价:",
    toastTargetLabel: "≤ 目标价:",
    toastDeepDiveBtn: "立即深度分析",
    toastCloseAria: "关闭提醒",

    // Responsive Left-Side Navigation Drawer (Workstation Hub)
    navDrawerTitle: "投研工作站导航",
    navDrawerSubtitle: "多维光谱智能投研工作站",
    navMemberProfile: "分析师账户",
    navGuestAnalyst: "访客分析师",
    navFreeTier: "本地会话 • 免费版",
    navSignInPlaceholder: "登录 / 多租户身份认证 (即将推出)",
    navCoreModules: "核心投研模块与工具",
    navPreferences: "工作台外观与偏好",
    navQuickTabs: "研报视角快速切换",
    navWatchlistDesc: "已关注标的与实时买入信号",
    navDiscordDesc: "Discord Webhook 实时推送通道",
    navValuationDesc: "安全边际与技术均线锚点",
    navCalcDesc: "80/20 哑铃与凯利仓位配比",
    navCommandDesc: "全市场标的索引与快捷指令",
    navCloseDrawer: "关闭工作站导航",

    // Watchlist Sync
    syncTargetsBtn: "一键同步最新买入区间",
    syncingTargets: "同步中...",
    syncTargetsSuccess: "已成功将所有观察标的同步至最新买入区间！",

    // Alert Sensitivity & Valuation Range Settings
    settingsButtonTitle: "估值与预警设置",
    settingsModalTitle: "预警灵敏度与估值设置",
    settingsModalSubtitle: "自定义安全边际折扣、技术均线回调锚点及个股买卖预警阈值",
    settingsTabGlobal: "全局估值与技术锚点",
    settingsTabOverrides: "自选股独立阈值覆盖",
    settingsGlobalMosTitle: "全局安全边际 (Margin of Safety) 折扣",
    settingsGlobalMosSubtitle: "调整基于 DCF 固有价值计算理想买入区间上限时的安全边际折扣率。",
    settingsMosAggressive: "进攻型高成长股 (10%)",
    settingsMosBalanced: "平衡基准标准 (15%)",
    settingsMosConservative: "护城河稳健型 (20%)",
    settingsMosDeepValue: "格雷厄姆深度价值 (30%)",
    settingsAnchorModeTitle: "技术均线回调锚定模式",
    settingsAnchorModeSubtitle: "定义用于锚定买入上限的技术均线综合逻辑，杜绝追高与假突破。",
    settingsAnchorAdaptive: "自适应平衡模式 (50D & 200D)",
    settingsAnchorAdaptiveDesc: "综合 50 日与 200 日均线支撑，杜绝永久现金踏空的同时提供严密估值保护。",
    settingsAnchorStrict: "严格 200 日均线支撑 (Strict 200D)",
    settingsAnchorStrictDesc: "严格将买入上限限制在 200 日均线支撑或以下，获取极致的周期回撤保护。",
    settingsAnchorTactical: "战术性 5% 回调突破 (Tactical Pullback)",
    settingsAnchorTacticalDesc: "专为强势成长复利股设计，将买入触发点设定在 50 日均线或自高点回调 5% 位置。",
    settingsOverridesTitle: "自选股独立买卖预警覆盖",
    settingsOverridesSubtitle: "针对特定自选标的覆盖平台默认计算结果，自定义专属买入与止盈上限。",
    settingsTickerCol: "标的代码",
    settingsMarketPriceCol: "当前现价",
    settingsDynamicBuyCol: "动态买入上限",
    settingsCustomBuyCol: "自定义买入价",
    settingsDynamicSellCol: "动态止盈下限",
    settingsCustomSellCol: "自定义止盈价",
    settingsResetBtn: "恢复机构默认参数",
    settingsResetConfirm: "确定要将所有估值灵敏度与自选股覆盖重置为机构默认值（15% 安全边际，自适应平衡）吗？",
    settingsSaveBtn: "保存设置与覆盖",
    settingsSavingBtn: "正在保存...",
    settingsSavedSuccess: "估值灵敏度与预警设置保存成功！",
    settingsResetSuccess: "已成功恢复至机构默认参数（15% 安全边际，自适应平衡）！",
    settingsSaveFailed: "保存设置失败:",
    settingsTradeoffNoticeTitle: "机构级灵敏度权衡说明",
    settingsTradeoffNoticeDesc: "较高的安全边际（20%-30%）可提供卓越的下行保护，但在强劲牛市中可能带来现金踏空（Cash Drag）；较低的安全边际（10%）能提高资本周转率与成长股参与度，但波动回撤承受度要求更高。",

    // Advanced Methodology & Taxonomy Fields
    taxonomyTree: "🌲 种树股（长期自由现金流复利）",
    taxonomyGrain: "🌾 种粮股（春播秋收：估值回归+高股息）",
    taxonomyVegetable: "🥬 种菜股（无基本面价值，仅限趋势交易）",
    impliedCeilingTitle: "穿透叙事：当前股价隐含 10 年利润天花板倍数",
    prosperityTrapAlert: "景气度陷阱预警：高增速+低PE分位，警惕行业终局天花板见顶导致估值压缩。",
    barbell8020Label: "80/20 哑铃配置（单票 2%–4% 有限下注）",
    calmarRatioLabel: "卡玛比率（年化收益 ÷ 最大回撤）",
    trendTempFreeze: "❄️ 冻（血筹区：左侧勿抄底）",
    trendTempFlat: "➖ 平（震荡整理）",
    trendTempWarm: "🌤️ 温（温转热右侧击球区）",
    trendTempHot: "🔥 热（肥尾主升浪）",
    disciplineBlocked: "《纪律.md》一票否决",
    soulCheckTitle: "投资灵魂四问与贝叶斯先验记录",
    logScaleLabel: "对数坐标",
    linearScaleLabel: "普通坐标",
    shareholderYieldLabel: "总股东回报率（股息 + 净回购）",
    tabPositionSizing: "仓位配比",
    tabKellySizer: "80/20 哑铃与凯利计算器",
    tabFrontier: "有效前沿与脱钩监控",
    tabLiabilityStress: "负债端四笔钱压力测试",
    underwaterDrawdownTitle: "自高点回撤面积图 (Underwater)",
    rebalanceBonusLabel: "再平衡波动率收割收益",
    falsificationKillSwitchTitle: "投资假说证伪熔断线",
    syncTargetsToWatchlist: "同步目标价至自选",
    targetsSynced: "已同步至自选 ✓",
    institutionalBridgeTitle: "机构级估值桥 (EV-to-Equity) & 5x5 敏感度矩阵",
    dcfSensitivityHeatmap: "5x5 DCF 估值敏感度热力矩阵",
    accountingForensicsTitle: "会计法证与财报质量审计",
    bayesianWinProb: "贝叶斯收缩后胜率",
    correlationPenaltyFactor: "行业相关性折减因子",
  },

  hybrid: {
    appTitle: "Prism Loop",
    appSubtitle: "多维光谱投研工作站 (Multi-Spectrum Equity Intelligence)",
    searchPlaceholder: "搜索美股与加拿大股票 ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "深度剖析标的",
    tabMacro: "宏观周期看板 (Macro Dashboard)",
    tabPicks: "精选股票池 (Stock Picks)",
    tabStock: "个股深度研报 (Stock Deep-Dive)",
    plainTalkOn: "通俗白话模式: 开",
    plainTalkOff: "专业机构模式 (Pro)",
    watchlistDrawerTitle: "自选股与价格提醒 (Watchlist & Price Alerts)",
    starred: "已关注 (Starred)",
    addStar: "+ 关注 (Star)",
    groundTruthVerified: "100% Verified Data (真实数据)",
    source: "Source (数据源)",
    currentMarketPrice: "当前价格 (Current Market Price)",
    verifyOnYahoo: "在 Yahoo Finance 验证 (Verify Live)",
    commandPaletteTitle: "快捷搜索 (Command Palette)",
    calcButtonTitle: "仓位计算器 (Position Sizing)",
    discordButtonTitle: "Discord 警报 (Push Alerts)",
    themeLight: "明亮模式 (Light)",
    themeDark: "暗黑模式 (Dark)",
    exportMemoBtn: "导出备忘录 (Export Memo)",
    exportMemoTitle: "导出机构级投资备忘录 (Export Memo .md / .pdf)",
    backToMacroPicks: "← 返回宏观大盘与精选标的 (Back to Macro Dashboard)",
    backToStockPicks: "← 返回精选股票池 (Back to Stock Picks)",
    backToMacro: "← 返回宏观周期看板 (Back to Macro Dashboard)",
    exportMemoModalTitle: "机构级投研备忘录导出 (Memo Export)",
    exportMemoModalSubtitle: "一键导出 PDF 或 Markdown (Printable PDF / Markdown)",
    exportMemoStyledPreview: "精美排版预览 (Styled Preview)",
    exportMemoRawMarkdown: "Markdown 源码 (Raw Markdown)",
    exportMemoDownloadMd: "下载 .md (Download)",
    exportMemoPrintPdf: "打印 / 保存 PDF (Print / PDF)",
    exportMemoCopied: "已复制 (Copied!)",
    exportMemoCopy: "复制 (Copy)",

    loadingSubtitle: "正在初始化市场情报系统 (Initializing Market Intelligence)...",
    loadingStep1: "正在连接美联储 FRED & 央行数据 (Connecting Macro Data)...",
    loadingStep2: "正在解析央行政策声明与新闻 (Ingesting Policy News)...",
    loadingStep3: "正在计算股票推荐与板块配置 (Stock Recommendations)...",
    loadingStep4: "正在初始化多智能体 AI 辩论 (Initializing AI Arena)...",
    loadingStepCounter: "Step",
    loadingOf: "/",

    macroTitle: "宏观经济周期扫描仪 (Macro Cycle Scanner)",
    macroSubtitle: "基于官方经济数据、央行政策声明 NLP 与主权国债收益率的客观实证数组",
    macroMarketUS: "美国市场 (United States)",
    macroMarketCA: "加拿大市场 (Canada)",
    macroSelectMarket: "宏观区域 (Macro Jurisdiction)",
    usMarketDesc: "Fed 货币政策、BLS 通胀、BEA 增长与 S&P 500 估值水位",
    caMarketDesc: "BoC 政策利率、StatCan 通胀、GoC 收益率与 TSX 综指估值",
    liveMacroStream: "实时央行政策与新闻 (Live Macro Stream)",
    cycleStage: "宏观周期阶段 (Macro Cycle Stage)",
    fedSentiment: "美联储 (Fed) 鹰鸽情绪",
    bocSentiment: "加拿大央行 (BoC) 鹰鸽情绪",
    hawkish: "Hawkish (鹰派信号)",
    dovish: "Dovish (鸽派信号)",
    overweightSectors: "建议超配板块 (Recommended Overweight Sectors)",
    underweightSectors: "建议低配板块 (Recommended Underweight Sectors)",
    policyNews: "央行政策与宏观新闻流 (Policy News)",
    empiricalFacts: "宏观指标实证链条 (Empirical Indicator Proofs)",
    credibleSources: "权威数据来源 (Credible Sources)",
    indicator: "经济指标 (Indicator)",
    value: "最新数据 (Value)",
    impact: "组合影响 (Impact)",
    macroInsight: "宏观洞察 (Macro Insight):",
    readOfficialRelease: "阅读官方公告 (Official Release)",

    recsTitle: "宏观驱动股票推荐阵列 (Top Macro Recommendations)",
    recsSubtitle: "按 Overweight 板块、Blue-Chip 核心龙头与 Hidden Gold Nuggets 精准分类",
    refreshRecommendations: "刷新推荐 (Refresh Picks)",
    refreshingPicks: "正在刷新标的 (Rotating Picks)...",
    catSectorChampions: "超配板块精选 (Sector Champions)",
    catMarketLeaders: "核心龙头 (Market Leaders)",
    catGoldNuggets: "隐形金矿股 (Hidden Gold Nuggets)",
    catSectorDesc: "与当前 Overweight 板块 100% 契合的强现金流领头羊。",
    catLeaderDesc: "美股与加股大盘蓝筹核心标的，兼具 Wide Moat 与强劲 FCF。",
    catGoldDesc: "非散户热搜的中小盘利基龙头，具高 FCF 转换率与强 upside 潜力。",
    whyInvestNow: "为什么此时推荐配置 (Why Recommend Now)",
    companyBackground: "主营业务背景 (Company Background)",
    growthCatalysts: "核心增长催化剂 (Key Catalysts)",
    revenueDrivers: "核心营收驱动与业务构成 (Revenue Drivers)",
    drillDownAnalysis: "剖析完整报告 (Drill Down Analysis)",
    supportLevel: "技术支撑位 (Support Level)",
    score: "Score",
    showingStocks: "显示",

    freeCashFlow: "自由现金流 (Free Cash Flow)",
    peRatio: "市盈率 (P/E Ratio)",
    moatRating: "护城河评级 (Morningstar Moat Rating)",
    buyZone: "理想买入区间 (Buy Zone)",
    fairValue: "DCF 固有价值 (Fair Value)",
    fiftyDaySma: "50日均线 (50D SMA)",
    twoHundredDaySma: "200日均线 (200D SMA)",
    rsi14: "RSI (14-Day)",
    arrMetric: "年度订阅收入 (ARR)",
    nrrMetric: "净收入留存率 (NRR)",
    fcfQualityAssessment: "自由现金流质量 (FCF Quality Assessment)",
    guidanceShiftDeltas: "5年指引变动 (5-Yr Guidance Shift Deltas)",

    debateTitle: "多智能体投资辩论竞技场 (Multi-Agent Investment Arena)",
    debateSubtitle: "多头 (Bull) vs 空头 (Bear) 数据辩论 → CIO 裁决与 Evidence 核验",
    bullCase: "多头辩护人 (Bull Case Advocate)",
    bearCase: "空头公诉人 (Bear Case Prosecutor)",
    roundTwoRebuttalTitle: "第二轮交叉反驳 (Round 2 Cross-Examination)",
    bullRebuttalTitle: "多头反驳 (Bull Rebuttal)",
    bearRebuttalTitle: "空头反驳 (Bear Rebuttal)",
    cioVerdict: "CIO 最终裁决 (Chief Investment Officer Verdict)",
    riskReward: "风险/收益比 (Risk / Reward)",
    recommendedBuyBracket: "建议买入区间 (Entry Bracket)",
    positionSizing: "仓位管理建议 (Position Sizing)",
    judgeSummary: "CIO 决策逻辑 (Judge Summary)",
    keyUpsideCatalyst: "核心看涨催化剂 (Key Upside Catalyst)",
    keyDownsideRisk: "主要下行风险 (Key Downside Risk)",
    shareVerdictBtn: "分享辩论裁决 (Share Verdict)",
    shareVerdictModalTitle: "辩论裁决与 CIO 分析 (Debate Verdict & CIO Analysis)",
    shareVerdictModalSubtitle: "多智能体多空辩论与配置裁决 (Multi-Agent Debate & Allocation)",
    shareVerdictPreviewTab: "排版预览 (Formatted Preview)",
    shareVerdictMarkdownTab: "Markdown 源码 (Raw Markdown)",
    shareVerdictCopyBtn: "复制到社区 (Copy for Reddit / X)",
    shareVerdictCopied: "已复制到剪贴板！ (Copied!)",
    shareVerdictDownloadMd: "下载 Markdown (Download .md)",
    shareVerdictClose: "关闭 (Close)",
    shareVerdictTooltip: "预览并复制辩论裁决 (Preview & Copy for Reddit/X/Discord)",
    shareVerdictAttribution: "投研分析由 Prism Loop 生成 • Multi-Spectrum Equity Intelligence",
    shareVerdictHeaderBull: "多头论据 (Bull Case Advocate)",
    shareVerdictHeaderBear: "空头论据 (Bear Case Prosecutor)",
    shareVerdictHeaderCIO: "CIO 最终裁决 (CIO Final Verdict)",

    // Soul Check, Regime & Falsification
    trendTemperatureTitle: "量价温度 / 击球区 (Trend Temp & Batting Zone)",
    rightSideBattingZone: "右侧击球区 (Right-Side)",
    leftSideObservation: "左侧观察 (Left-Side)",
    bayesianPriorTitle: "贝叶斯先验置信度 (Prior Confidence)",
    narrativePenetrationTitle: "穿透叙事 (10年天花板) (Narrative Penetration)",
    falsificationTriggerTitle: "离场铁律与证伪底线 (Falsification Trigger)",
    falsificationBreachedWarning: "证伪底线已击穿 (FALSIFICATION BREACHED)",
    falsificationBreachedDesc: "当前股价已跌破量化止损底线。恪守反破产投资宪法：破位机械离场，严禁逆势加仓！",
    notifyFalsificationBtn: "推送告警通知 (Notify Alert)",
    falsificationNotified: "证伪告警已推送！ (Alert Dispatched)",
    assetDiagnosisTitle: "标的定性归因 (Asset Diagnosis)",
    implied10YCeilingLabel: "逆向10年利润天花板 (Implied 10Y Ceiling)",
    prosperityTrapLabel: "景气度陷阱 (Prosperity Trap)",
    coreSaaLabel: "80/20 核心资产配置 (Core SAA)",
    trapTriggered: "已触发 (TRIGGERED)",
    trapSafe: "安全 (SAFE)",

    chartTitle: "估值与动态价格通道 (Valuation & Price Channel)",
    pricingOverlay: "估值与技术面走势 (Pricing & Technical Overlay)",
    valuationStatus: "估值状态 (Valuation Status)",
    idealBuyRange: "理想买入区间 (Ideal Buy Range)",
    actionStatus: "操作指令 (Action Status)",
    timingAdvice: "战术执行建议 (Timing Advice)",

    secTitle: "5年期 SEC 10-K 与 SEDAR+ 财报文本挖掘 (Text Mining Pipeline)",
    secSubtitle: "基于算法对比 5 年年度财报中高管 Risk Disclaimer 变动",
    insertedDisclaimer: "新增风险披露条款 (Inserted Risk Disclaimer)",
    removedDisclaimer: "移除与重分类声明 (Removed Disclaimers)",
    extractedKeywordTrends: "提取风险关键词趋势 (Extracted Keyword Trends)",
    comparisonPeriod: "对比年份 (Comparison Period)",

    backtestTitle: "5年期历史量化策略回测 (5-Year Quantitative Backtest)",
    backtestSubtitle: "5 年滚动年化收益率、Sharpe Ratio、Max Drawdown 与 CAGR 对比",
    filingYear: "财报年份 (Filing Year)",
    returnHeader: "收益率 (Return)",
    cagr: "年化复利 (CAGR)",
    sharpeRatio: "夏普比率 (Sharpe Ratio)",
    maxDrawdown: "最大回撤 (Max Drawdown)",
    winRate: "胜率 (Win Rate vs Benchmark)",
    alpha: "超额收益 (Alpha)",
    riskFreeRate: "无风险利率 (Risk-free rate): 3.5%",
    peakToTroughRisk: "最大回撤风险 (Peak-to-trough risk)",
    outperformedBenchmark: "跑赢基准大盘 (Outperformed benchmark)",

    fundamentalReportTitle: "机构基本面审计报告 (Fundamental Review Report)",

    everydayAnalogyHeader: "通俗比喻 (Everyday Analogy)：",

    watchlistTitle: "自选股与价格提醒 (Watchlist & Price Alerts)",
    addFocusAndAlert: "关注新股票与设置买入提醒",
    tickerPlaceholder: "代码 ($AAPL, $TD.TO)",
    companyPlaceholder: "公司名称 (可选)",
    targetPricePlaceholder: "目标买入价 ($)",
    allocPlaceholder: "建议仓位 (%)",
    addWatchlistBtn: "添加关注与价格提醒",
    starredItems: "已关注标的 (Starred Securities)",
    targetPrice: "目标价 (Target Price)",
    suggestedAlloc: "建议仓位 (Suggested Alloc)",
    deleteItem: "删除",
    dbStorageNotice: "本地 SQLite 数据库 WAL 模式持久化存储",

    calcTitle: "组合仓位管理与再平衡计算器 (Position Sizing Calculator)",
    calcSubtitle: "基于 CIO 模型的资金动态分配与精准 Share Count 计算",
    calcCapitalLabel: "投资本金 (Investment Capital)",
    calcRiskModelLabel: "风控模型 (Risk Preference Model)",
    calcConservative: "保守型 (Conservative)",
    calcBalanced: "稳健型 (Balanced)",
    calcAggressive: "激进型 (Aggressive)",
    calcMaxPerStock: "单股上限 (Max)",
    calcCurrencyLabel: "基础货币 (Base Currency)",
    calcEquities: "股票仓位 (Equities Allocation)",
    calcCashReserve: "现金缓冲 (Cash Reserve)",
    calcTableAsset: "标的 (Asset & Ticker)",
    calcTablePrice: "当前价格 (Current Price)",
    calcTableWeight: "目标权重 (Target Weight)",
    calcTableShares: "拟购买股数 (Executable Shares)",
    calcTableDollar: "目标金额 (Target Dollar)",
    calcSharesUnit: "股 (shares)",
    calcFooterNotice: "*股数按整数股向下取整计算，剩余现金保留于 Cash Reserve。",
    calcCloseBtn: "关闭计算器 (Close)",

    discordModalTitle: "Discord 推送警报 (Push Alerts)",
    discordModalSubtitle: "在 Discord 服务器中实时接收 4 种多类型投资 alert。",
    discordDirectWebhookBadge: "直接推送 (Direct Webhook)",
    discordGuideTitle: "30秒 Discord 快速设置指南 (Setup Guide)",
    discordGuideStep1: "打开 Discord → 频道设置 → 整合 (Integrations)。",
    discordGuideStep2: "点击 Webhooks → 新建 Webhook (New Webhook)。",
    discordGuideStep3: "点击 Copy Webhook URL 并粘贴在下方。",
    discordChannelStatus: "通道连接状态 (Channel Status):",
    discordConnected: "已连接 (Connected)",
    discordNotConfigured: "未配置 (Not Configured)",
    discordWebhookInputLabel: "Discord Webhook URL",
    discordEnableToggleTitle: "开启 Discord Webhook 自动推送",
    discordEnableToggleDesc: "触发 Macro, Buy-In, Danger Risk, & Gold Nuggets 时自动发送 Embed 卡片。",
    discordTestChannelsTitle: "测试推送通道 (Test Channels)",
    discordTestChannelsSub: "点击测试发送对应警报 Embed",
    discordTestMacroBtn: "1. 宏观简报 (Macro)",
    discordTestBuyBtn: "2. 买入汇总 (Buy-In)",
    discordTestSellBtn: "3. 卖出风控 (Sell Risk)",
    discordTestGoldBtn: "4. 淘金组合 (Gold Nuggets)",
    discordConnTestBtn: "连通性测试 (Conn Test)",
    discordSaveConfigBtn: "保存配置 (Save)",
    discordSavingBtn: "保存中...",
    discordSavedSuccess: "Discord Webhook 配置保存成功！",
    discordSaveFailed: "保存失败:",
    discordEnterUrlFirst: "请先输入有效的 Discord Webhook URL。",
    discordConnTestSuccess: "连通性测试警报已发送！请检查 Discord 频道。",
    discordMacroSuccess: "每日宏观简报已发送至 Discord！",
    discordBuySuccess: "观察列表买入信号汇总已发送至 Discord！",
    discordSellSuccess: "观察列表卖出与危险预警已发送至 Discord！",
    discordGoldSuccess: "Gold Nuggets 发现提醒已发送至 Discord！",
    discordDispatchFailed: "警报发送失败:",

    // In-App Notification Center & Alerts
    notificationCenterTitle: "消息通知中心 (Notification Centre)",
    notificationInbox: "预警收件箱 (Alert Inbox)",
    notificationCenterAria: "打开或关闭通知中心 (Toggle Notifications)",
    clearAllNotifications: "清空全部 (Clear All)",
    noNotificationsTitle: "暂无新通知 (All Caught Up)",
    noNotificationsDesc: "当前没有触发的买入或估值预警。当自选股或精选股票进入理想买入区间时将在此通知。",
    checkAlertsNow: "立即扫描预警 (Check Live Alerts)",
    checkingAlerts: "扫描中 (Scanning...)",
    dismissNotification: "清除此条 (Dismiss)",
    viewDeepDive: "深度分析 (Deep Dive)",
    unreadCountBadge: "条未读预警 (Unread)",
    triggeredAt: "触发时间 (Triggered)",
    toastTargetHit: "已达目标买入价! (Target Hit)",
    toastEnteredBuyZone: "已进入买入区间 (Buy Zone)！现价:",
    toastTargetLabel: "≤ 目标价 (Target):",
    toastDeepDiveBtn: "立即深度分析 (Deep Dive)",
    toastCloseAria: "关闭提醒 (Dismiss)",

    // Responsive Left-Side Navigation Drawer (Workstation Hub)
    navDrawerTitle: "投研工作站导航 (Workstation Hub)",
    navDrawerSubtitle: "多维光谱投研工作站 (Prism Loop)",
    navMemberProfile: "分析师账户 (Analyst Account)",
    navGuestAnalyst: "访客分析师 (Guest Analyst)",
    navFreeTier: "本地会话 • 免费版 (Free Tier)",
    navSignInPlaceholder: "登录 / 多租户身份认证 (Coming Soon)",
    navCoreModules: "核心投研模块与工具 (Core Modules)",
    navPreferences: "工作台外观与偏好 (Preferences)",
    navQuickTabs: "研报视角快速切换 (Quick Jump)",
    navWatchlistDesc: "已关注标的与实时买入信号 (Watchlist & Triggers)",
    navDiscordDesc: "Discord Webhook 实时推送通道 (Push Channel)",
    navValuationDesc: "安全边际与技术均线锚点 (MoS & Anchors)",
    navCalcDesc: "80/20 哑铃与凯利仓位配比 (Kelly & Barbell)",
    navCommandDesc: "全市场标的索引与快捷指令 (Command Palette)",
    navCloseDrawer: "关闭工作站导航 (Close Drawer)",

    // Watchlist Sync
    syncTargetsBtn: "同步买入区间 (Sync Buy Zones)",
    syncingTargets: "同步中 (Syncing...)",
    syncTargetsSuccess: "观察列表目标价已同步 (Synced to Buy Zones)！",

    // Alert Sensitivity & Valuation Range Settings
    settingsButtonTitle: "估值与预警设置 (Settings)",
    settingsModalTitle: "预警灵敏度与估值设置 (Alert Sensitivity & Valuation Settings)",
    settingsModalSubtitle: "自定义安全边际折扣、技术均线回调锚点及个股买卖预警阈值 (MoS & Anchor Timing)",
    settingsTabGlobal: "全局估值与技术锚点 (Global & Anchors)",
    settingsTabOverrides: "自选股独立阈值覆盖 (Ticker Overrides)",
    settingsGlobalMosTitle: "全局安全边际折扣 (Global Margin of Safety MoS)",
    settingsGlobalMosSubtitle: "调整基于 DCF 固有价值计算理想买入区间上限时的安全边际折扣率 (10% - 30%)。",
    settingsMosAggressive: "进攻型高成长股 (10% MoS)",
    settingsMosBalanced: "平衡基准标准 (15% MoS)",
    settingsMosConservative: "护城河稳健型 (20% MoS)",
    settingsMosDeepValue: "格雷厄姆深度价值 (30% MoS)",
    settingsAnchorModeTitle: "技术均线回调锚定模式 (Technical Anchor Mode)",
    settingsAnchorModeSubtitle: "定义用于锚定买入上限的技术均线综合逻辑，杜绝追高 (Overextension Prevention)。",
    settingsAnchorAdaptive: "自适应平衡模式 (Adaptive Balanced 50D & 200D)",
    settingsAnchorAdaptiveDesc: "综合 50 日与 200 日均线支撑，杜绝永久现金踏空的同时提供严密估值保护。",
    settingsAnchorStrict: "严格 200 日均线支撑 (Strict 200D SMA)",
    settingsAnchorStrictDesc: "严格将买入上限限制在 200 日均线支撑或以下，获取极致的周期回撤保护。",
    settingsAnchorTactical: "战术性 5% 回调突破 (Tactical 5% Pullback)",
    settingsAnchorTacticalDesc: "专为强势成长复利股设计，将买入触发点设定在 50 日均线或自高点回调 5% 位置。",
    settingsOverridesTitle: "自选股独立买卖预警覆盖 (Watchlist Overrides)",
    settingsOverridesSubtitle: "针对特定自选标的覆盖平台默认计算结果，自定义专属买入与止盈上限。",
    settingsTickerCol: "标的代码 (Ticker)",
    settingsMarketPriceCol: "当前现价 (Price)",
    settingsDynamicBuyCol: "动态买入上限 (Buy Ceiling)",
    settingsCustomBuyCol: "自定义买入价 (Custom Buy)",
    settingsDynamicSellCol: "动态止盈下限 (Sell Floor)",
    settingsCustomSellCol: "自定义止盈价 (Custom Sell)",
    settingsResetBtn: "恢复机构默认参数 (Reset)",
    settingsResetConfirm: "确定要将所有估值灵敏度与自选股覆盖重置为机构默认值（15% MoS，自适应平衡）吗？",
    settingsSaveBtn: "保存设置与覆盖 (Save Settings)",
    settingsSavingBtn: "正在保存 (Saving...)",
    settingsSavedSuccess: "估值灵敏度与预警设置保存成功 (Settings Saved)！",
    settingsResetSuccess: "已成功恢复至机构默认参数（15% MoS，自适应平衡）！",
    settingsSaveFailed: "保存设置失败 (Save Failed):",
    settingsTradeoffNoticeTitle: "机构级灵敏度权衡说明 (Sensitivity Trade-Offs)",
    settingsTradeoffNoticeDesc: "较高的安全边际（20%-30%）可提供卓越的下行保护，但在强劲牛市中可能带来现金踏空（Cash Drag）；较低的安全边际（10%）能提高资本周转率与成长股参与度，但波动回撤承受度要求更高。",

    // Advanced Methodology & Taxonomy Fields
    taxonomyTree: "🌲 种树股 (Tree Compounder)",
    taxonomyGrain: "🌾 种粮股 (Grain Value/Yield)",
    taxonomyVegetable: "🥬 种菜股 (Vegetable Trend Only)",
    impliedCeilingTitle: "穿透叙事: 隐含 10Y 天花板倍数 (Reverse-DCF)",
    prosperityTrapAlert: "景气度陷阱预警 (Prosperity Trap): 高增速+低PE分位，警惕行业终局见顶估值压缩。",
    barbell8020Label: "80/20 哑铃配置 (2%–4% Cap)",
    calmarRatioLabel: "卡玛比率 Calmar Ratio (CAGR / Max DD)",
    trendTempFreeze: "❄️ 冻 Freeze (血筹左侧勿抄底)",
    trendTempFlat: "➖ 平 Flat (震荡整理)",
    trendTempWarm: "🌤️ 温 Warm (右侧击球区)",
    trendTempHot: "🔥 热 Hot (肥尾主升浪)",
    disciplineBlocked: "《纪律.md》一票否决 (Discipline Blocked)",
    soulCheckTitle: "投资灵魂四问与先验 (Soul Check & Prior)",
    logScaleLabel: "对数坐标 (Log)",
    linearScaleLabel: "线性坐标 (Linear)",
    shareholderYieldLabel: "总股东回报率 (Div + Buyback Yield)",
    tabPositionSizing: "仓位配比 (Sizing)",
    tabKellySizer: "80/20 哑铃 & Kelly Sizer",
    tabFrontier: "有效前沿 (Frontier & Decoupling)",
    tabLiabilityStress: "负债端压力测试 (Liability Stress)",
    underwaterDrawdownTitle: "高点回撤图 (Underwater Curve)",
    rebalanceBonusLabel: "再平衡收益 (Rebalancing Bonus)",
    falsificationKillSwitchTitle: "证伪熔断线 (Thesis Falsification Kill-Switch)",
    syncTargetsToWatchlist: "同步目标价 (Sync Targets to Watchlist)",
    targetsSynced: "目标价已同步 ✓ (Synced)",
    institutionalBridgeTitle: "机构估值桥与敏感度矩阵 (DCF Bridge & Matrix)",
    dcfSensitivityHeatmap: "5x5 DCF 敏感度热力图 (5x5 Sensitivity Heatmap)",
    accountingForensicsTitle: "会计法证审计 (Accounting Forensics)",
    bayesianWinProb: "贝叶斯收缩胜率 (Bayesian Win Prob)",
    correlationPenaltyFactor: "行业折减因子 (Correlation Penalty)",
  }
};

export const METHODOLOGY_I18N_PATCH = {
  en: {
    taxonomy_tree: "🌲 Tree (Compounder)",
    taxonomy_grain: "🌾 Grain (Cyclical / Value)",
    taxonomy_vegetable: "🥬 Vegetable (Trend Only)",
    implied_ceiling_title: "Reverse-DCF Implied 10Y Earnings Ceiling",
    prosperity_trap_alert: "Prosperity Trap Warning: High short-term growth at low PE percentile — check if terminal ceiling is saturated.",
    barbell_80_20_label: "Barbell 80/20 (2%–4% Finite Bet Cap)",
    calmar_ratio_label: "Calmar Ratio (CAGR / Max Drawdown)",
    trend_temp_freeze: "❄️ Freeze (Blood Chips)",
    trend_temp_flat: "➖ Flat (Consolidation)",
    trend_temp_warm: "🌤️ Warm (Right-Side Entry)",
    trend_temp_hot: "🔥 Hot (Fat-Tail Momentum)",
    discipline_blocked: "Blocked by 纪律.md Constitution",
    soul_check_title: "Pre-Trade Four Soul Questions & Bayesian Prior"
  },
  zh: {
    taxonomy_tree: "🌲 种树股（长期自由现金流复利）",
    taxonomy_grain: "🌾 种粮股（春播秋收：估值回归+高股息）",
    taxonomy_vegetable: "🥬 种菜股（无基本面价值，仅限趋势交易）",
    implied_ceiling_title: "穿透叙事：当前股价隐含 10 年利润天花板倍数",
    prosperity_trap_alert: "景气度陷阱预警：高增速+低PE分位，警惕行业终局天花板见顶导致估值压缩。",
    barbell_80_20_label: "80/20 哑铃配置（单票 2%–4% 有限下注）",
    calmar_ratio_label: "卡玛比率（年化收益 ÷ 最大回撤）",
    trend_temp_freeze: "❄️ 冻（血筹区：左侧勿抄底）",
    trend_temp_flat: "➖ 平（震荡整理）",
    trend_temp_warm: "🌤️ 温（温转热右侧击球区）",
    trend_temp_hot: "🔥 热（肥尾主升浪）",
    discipline_blocked: "《纪律.md》一票否决",
    soul_check_title: "投资灵魂四问与贝叶斯先验记录"
  }
};

export const MIANJI_I18N_PATCH = METHODOLOGY_I18N_PATCH;
