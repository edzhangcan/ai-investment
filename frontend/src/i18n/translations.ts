export type LanguageMode = 'en' | 'zh' | 'hybrid';

export interface Translations {
  // Navigation & General
  appTitle: string;
  appSubtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  tabMacro: string;
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
}

export const TRANSLATIONS: Record<LanguageMode, Translations> = {
  en: {
    appTitle: "Prism Loop",
    appSubtitle: "Multi-Spectrum Equity Intelligence",
    searchPlaceholder: "Search US & Canadian Stocks ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "Analyze Ticker",
    tabMacro: "Macro Dashboard & Picks",
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

    macroTitle: "North American Macro Economic Cycle Scanner (US & CA)",
    macroSubtitle: "Empirical proof array derived from FRED economic data, Fed & Bank of Canada NLP statements",
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
  },

  zh: {
    appTitle: "Prism Loop",
    appSubtitle: "多维光谱智能投研工作站",
    searchPlaceholder: "搜索美股与加拿大股票 ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "深度剖析标的",
    tabMacro: "宏观仪表盘与选股阵列",
    tabStock: "个股深度剖析引擎",
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

    macroTitle: "北美宏观经济周期扫描仪 (美股与加股)",
    macroSubtitle: "基于美联储 FRED 经济指标、美联储与加拿大央行 NLP 语句分析的客观实证数组",
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
  },

  hybrid: {
    appTitle: "Prism Loop",
    appSubtitle: "多维光谱投研工作站 (Multi-Spectrum Equity Intelligence)",
    searchPlaceholder: "搜索美股与加拿大股票 ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "深度剖析标的",
    tabMacro: "宏观仪表盘与选股阵列 (Macro Dashboard & Picks)",
    tabStock: "个股深度剖析 (Stock Deep-Dive)",
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

    macroTitle: "北美宏观经济周期扫描仪 (Macro Cycle Scanner US & CA)",
    macroSubtitle: "基于 FRED 经济数据、Fed 与 Bank of Canada NLP 语句分析的客观实证数组",
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
  }
};
