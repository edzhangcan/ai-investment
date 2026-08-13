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
  commandPaletteTitle: string;
  calcButtonTitle: string;
  discordButtonTitle: string;

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
  catSectorChampions: string;
  catMarketLeaders: string;
  catGoldNuggets: string;
  catSectorDesc: string;
  catLeaderDesc: string;
  catGoldDesc: string;
  whyInvestNow: string;
  companyBackground: string;
  growthCatalysts: string;
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
  discordZeroKycBadge: string;
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
    appTitle: "Investment Workstation",
    appSubtitle: "",
    searchPlaceholder: "Search US & Canadian Stocks ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "Analyze Ticker",
    tabMacro: "Macro Dashboard & Picks",
    tabStock: "Single Stock Deep-Dive",
    plainTalkOn: "PlainTalk Mode: ON",
    plainTalkOff: "Professional Mode",
    watchlistDrawerTitle: "Watchlist & Price Alerts",
    starred: "✓ Starred",
    addStar: "+ Add Star",
    groundTruthVerified: "100% Verified Data",
    source: "Source",
    currentMarketPrice: "Current Market Price",
    commandPaletteTitle: "Quick Search (Ctrl+K)",
    calcButtonTitle: "Position Sizing Calculator",
    discordButtonTitle: "Discord Push Alerts",

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
    catSectorChampions: "🟢 Sector Overweight Champions",
    catMarketLeaders: "🔵 Core Market Leaders",
    catGoldNuggets: "🪙 Hidden Gold Nuggets",
    catSectorDesc: "High FCF leaders strictly matching active macro overweight sectors.",
    catLeaderDesc: "Blue-chip core leaders with wide economic moats and strong cash flows.",
    catGoldDesc: "Non-mainstream mid-cap / niche growth stocks with high upside potential.",
    whyInvestNow: "Why Recommend Now",
    companyBackground: "Company Core Business Background",
    growthCatalysts: "Growth Catalysts & Revenue Drivers",
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
    debateSubtitle: "🐂 Bull Agent vs 🐻 Bear Agent Data Debate → 👨‍⚖️ CIO Verdict & Evidence Verification",
    bullCase: "🟢 Bull Case Advocate",
    bearCase: "🔴 Bear Case Prosecutor",
    cioVerdict: "⚖️ Chief Investment Officer (CIO) Final Verdict",
    riskReward: "Risk / Reward Ratio",
    recommendedBuyBracket: "Recommended Entry Bracket",
    positionSizing: "Position Sizing Advice",
    judgeSummary: "CIO Decision Rationale",
    keyUpsideCatalyst: "Key Upside Catalyst",
    keyDownsideRisk: "Key Downside Risk",

    chartTitle: "Valuation & Dynamic Price Channel Chart",
    pricingOverlay: "Pricing & Technical Overlay",
    valuationStatus: "Valuation Assessment",
    idealBuyRange: "Ideal Entry Bracket",
    actionStatus: "Action Status",
    timingAdvice: "Timing & Tactical Execution Advice",

    secTitle: "5-Year SEC 10-K & SEDAR+ Text Mining Pipeline",
    secSubtitle: "Automated Levenshtein diffing & risk factor keyword extraction across 5 annual filings",
    insertedDisclaimer: "+ Inserted Risk Disclaimer",
    removedDisclaimer: "- Removed / Reclassified Disclaimers",
    extractedKeywordTrends: "Extracted Risk Keyword Trends",
    comparisonPeriod: "Comparison Period",

    backtestTitle: "5-Year Historical Quantitative Backtest (2021 – 2025)",
    backtestSubtitle: "5-Year rolling annual returns, Sharpe Ratio, Max Drawdown & CAGR vs benchmark",
    filingYear: "Filing Year",
    returnHeader: "Return",
    cagr: "CAGR (Annual Compound Rate)",
    sharpeRatio: "Sharpe Ratio",
    maxDrawdown: "Max Drawdown",
    winRate: "Win Rate",
    alpha: "Alpha (Excess Return)",
    riskFreeRate: "Risk-free rate: 3.5%",
    peakToTroughRisk: "Peak-to-trough risk",
    outperformedBenchmark: "Outperformed benchmark",

    fundamentalReportTitle: "Institutional Fundamental Review Report",

    everydayAnalogyHeader: "💡 Everyday Analogy:",

    watchlistTitle: "Watchlist & Price Alerts",
    addFocusAndAlert: "Add Stock & Target Buy Price Alert",
    tickerPlaceholder: "Ticker ($AAPL, $TD.TO)",
    companyPlaceholder: "Company Name (Optional)",
    targetPricePlaceholder: "Target Buy Price ($)",
    allocPlaceholder: "Suggested Alloc (%)",
    addWatchlistBtn: "Add to Watchlist & Set Alert",
    starredItems: "Starred Securities",
    targetPrice: "Target Price",
    suggestedAlloc: "Suggested Alloc",
    deleteItem: "Delete",
    dbStorageNotice: "SQLite WAL Mode Persistent Database",

    calcTitle: "Portfolio Position Sizing & Rebalancing Calculator",
    calcSubtitle: "Risk-adjusted dollar allocations & exact share counts based on CIO position sizing models",
    calcCapitalLabel: "Investment Capital",
    calcRiskModelLabel: "Risk Preference Model",
    calcConservative: "🛡️ Conservative",
    calcBalanced: "⚖️ Balanced",
    calcAggressive: "🚀 Aggressive",
    calcMaxPerStock: "Max",
    calcCurrencyLabel: "Base Currency",
    calcEquities: "Equities",
    calcCashReserve: "Cash Reserve",
    calcTableAsset: "Asset & Ticker",
    calcTablePrice: "Current Price",
    calcTableWeight: "Target Weight",
    calcTableShares: "Executable Shares",
    calcTableDollar: "Target Dollar",
    calcSharesUnit: "shares",
    calcFooterNotice: "*Positions sized strictly to floor integer share counts. Remaining cash retained in portfolio reserve.",
    calcCloseBtn: "Close Calculator",

    discordModalTitle: "Discord Push Alerts",
    discordModalSubtitle: "Receive real-time 4 multi-type alerts directly in your Discord server.",
    discordZeroKycBadge: "Zero-KYC",
    discordGuideTitle: "30-Second Discord Setup Guide",
    discordGuideStep1: "Open Discord → Channel Settings (⚙️) → Integrations.",
    discordGuideStep2: "Click Webhooks → New Webhook.",
    discordGuideStep3: "Click Copy Webhook URL and paste it below.",
    discordChannelStatus: "Channel Status:",
    discordConnected: "Discord Connected",
    discordNotConfigured: "Not Configured",
    discordWebhookInputLabel: "Discord Webhook URL",
    discordEnableToggleTitle: "Enable Discord Webhook Alerts",
    discordEnableToggleDesc: "Automatically dispatch rich embeds for Macro, Buy-In, Danger Risk, & Gold Nuggets.",
    discordTestChannelsTitle: "Test Alert Channels",
    discordTestChannelsSub: "Click to send sample embed",
    discordTestMacroBtn: "1. Macro Digest",
    discordTestBuyBtn: "2. Bundled Buy-In",
    discordTestSellBtn: "3. Sell / Danger Risk",
    discordTestGoldBtn: "4. Gold Nuggets",
    discordConnTestBtn: "Connection Test",
    discordSaveConfigBtn: "Save Configuration",
    discordSavingBtn: "Saving...",
    discordSavedSuccess: "✅ Discord Webhook configuration saved successfully!",
    discordSaveFailed: "❌ Save failed:",
    discordEnterUrlFirst: "⚠️ Please enter a valid Discord Webhook URL first.",
    discordConnTestSuccess: "🧪 Connection test alert sent! Check your Discord channel.",
    discordMacroSuccess: "📊 Daily Macro & Policy Digest alert sent to Discord!",
    discordBuySuccess: "🟢 Bundled Buy-In Watchlist alert sent to Discord!",
    discordSellSuccess: "🔴 Watchlist Sell & Danger Zone alert sent to Discord!",
    discordGoldSuccess: "💡 Gold Nuggets Discovery alert sent to Discord!",
    discordDispatchFailed: "❌ Alert dispatch failed:",
  },

  zh: {
    appTitle: "投资工作站",
    appSubtitle: "",
    searchPlaceholder: "搜索美股与加拿大股票 ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "深度剖析标的",
    tabMacro: "宏观仪表盘与选股阵列",
    tabStock: "个股深度剖析引擎",
    plainTalkOn: "通俗白话模式: 开",
    plainTalkOff: "专业机构模式",
    watchlistDrawerTitle: "自选股与价格提醒",
    starred: "✓ 已关注",
    addStar: "+ 关注",
    groundTruthVerified: "100% 真实数据验证",
    source: "数据源",
    currentMarketPrice: "当前市场价格",
    commandPaletteTitle: "快捷搜索 (Ctrl+K)",
    calcButtonTitle: "仓位管理计算器",
    discordButtonTitle: "Discord 警报推送",

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
    catSectorChampions: "🟢 超配板块精选",
    catMarketLeaders: "🔵 核心龙头",
    catGoldNuggets: "🪙 隐形金矿股",
    catSectorDesc: "与当前宏观超配板块 100% 契合的强现金流领头羊。",
    catLeaderDesc: "美股与加股大盘蓝筹核心标的，兼具宽护城河与真金白银现金流。",
    catGoldDesc: "非散户热搜的中小盘利基龙头，具高现金流转换率与强增长潜力。",
    whyInvestNow: "为什么此时推荐配置",
    companyBackground: "主营业务背景",
    growthCatalysts: "核心增长催化剂",
    drillDownAnalysis: "剖析完整报告",
    supportLevel: "技术支撑位",
    score: "综合评分",
    showingStocks: "显示",

    freeCashFlow: "自由现金流",
    peRatio: "市盈率",
    moatRating: "晨星护城河评级",
    buyZone: "理想买入区间",
    fairValue: "DCF 固有价值",
    fiftyDaySma: "50日均线",
    twoHundredDaySma: "200日均线",
    rsi14: "RSI 相对强弱",
    arrMetric: "年度订阅收入",
    nrrMetric: "净收入留存率",
    fcfQualityAssessment: "自由现金流质量评估",
    guidanceShiftDeltas: "5年期管理层指引变动量",

    debateTitle: "多智能体机构投资辩论竞技场",
    debateSubtitle: "🐂 多头分析师 vs 🐻 空头公诉人 辩论竞技场 → 👨‍⚖️ 首席投资官 最终裁决与证据核验",
    bullCase: "🟢 多头辩护人",
    bearCase: "🔴 空头公诉人",
    cioVerdict: "⚖️ 首席投资官最终裁决",
    riskReward: "风险/收益比",
    recommendedBuyBracket: "建议买入区间",
    positionSizing: "仓位管理建议",
    judgeSummary: "CIO 决策逻辑阐述",
    keyUpsideCatalyst: "核心看涨催化剂",
    keyDownsideRisk: "主要下行风险",

    chartTitle: "估值与动态价格通道图表",
    pricingOverlay: "估值与技术面走势叠加",
    valuationStatus: "估值状态",
    idealBuyRange: "理想买入区间",
    actionStatus: "操作指令",
    timingAdvice: "择时与战术执行建议",

    secTitle: "5年期 SEC 10-K 与 SEDAR+ 官方财报文本挖掘",
    secSubtitle: "基于 Levenshtein 算法对比 5 年年度财报中高管隐患与避责声明变动",
    insertedDisclaimer: "+ 新增风险披露条款",
    removedDisclaimer: "- 移除与重分类避责声明",
    extractedKeywordTrends: "提取高频风险关键词趋势",
    comparisonPeriod: "对比年份",

    backtestTitle: "5年期历史量化策略回测 (2021 – 2025)",
    backtestSubtitle: "5 年滚动年化收益率、夏普比率、最大回撤与超额收益对比",
    filingYear: "财报年份",
    returnHeader: "收益率",
    cagr: "年化复利收益率",
    sharpeRatio: "夏普比率",
    maxDrawdown: "最大回撤",
    winRate: "跑赢大盘胜率",
    alpha: "超额收益",
    riskFreeRate: "无风险利率基准: 3.5%",
    peakToTroughRisk: "峰值至谷值最大回撤风险",
    outperformedBenchmark: "跑赢基准大盘比例",

    fundamentalReportTitle: "机构基本面深度审计报告",

    everydayAnalogyHeader: "💡 通俗比喻：",

    watchlistTitle: "自选股与价格提醒",
    addFocusAndAlert: "关注新股票与设置买入提醒",
    tickerPlaceholder: "代码 ($AAPL, $TD.TO)",
    companyPlaceholder: "公司名称 (可选)",
    targetPricePlaceholder: "目标买入价 ($)",
    allocPlaceholder: "建议仓位 (%)",
    addWatchlistBtn: "添加关注与价格提醒",
    starredItems: "已关注标的",
    targetPrice: "目标价",
    suggestedAlloc: "建议仓位",
    deleteItem: "删除",
    dbStorageNotice: "本地 SQLite 数据库 WAL 模式持久化存储",

    calcTitle: "组合仓位管理与再平衡计算器",
    calcSubtitle: "基于 CIO 风险对冲模型的资金动态分配与精准拟执行股数计算",
    calcCapitalLabel: "投资总本金",
    calcRiskModelLabel: "风控偏好模型",
    calcConservative: "🛡️ 保守型",
    calcBalanced: "⚖️ 稳健型",
    calcAggressive: "🚀 激进型",
    calcMaxPerStock: "单股上限",
    calcCurrencyLabel: "基础结算货币",
    calcEquities: "股票配置仓位",
    calcCashReserve: "现金储备缓冲",
    calcTableAsset: "标的与股票代码",
    calcTablePrice: "当前市场价格",
    calcTableWeight: "目标配置权重",
    calcTableShares: "拟执行购买股数",
    calcTableDollar: "目标配置金额",
    calcSharesUnit: "股",
    calcFooterNotice: "*购买股数按整数股向下取整计算，剩余未分配尾款保留于现金储备中。",
    calcCloseBtn: "关闭计算器",

    discordModalTitle: "Discord 实时推送警报",
    discordModalSubtitle: "在您的 Discord 服务器中实时接收 4 种多类型投资与风控提醒。",
    discordZeroKycBadge: "Zero-KYC 免认证",
    discordGuideTitle: "30秒 Discord 快速设置指南",
    discordGuideStep1: "打开 Discord → 频道设置 (⚙️) → 整合 (Integrations)。",
    discordGuideStep2: "点击 Webhooks → 新建 Webhook (New Webhook)。",
    discordGuideStep3: "点击 复制 Webhook URL (Copy Webhook URL) 并粘贴在下方。",
    discordChannelStatus: "通道连接状态:",
    discordConnected: "Discord 已连接",
    discordNotConfigured: "未配置通道",
    discordWebhookInputLabel: "Discord Webhook 地址 (URL)",
    discordEnableToggleTitle: "开启 Discord Webhook 自动推送",
    discordEnableToggleDesc: "当触发宏观新闻、买入区间、卖出风控或淘金股时自动发送富文本 Embed 卡片。",
    discordTestChannelsTitle: "测试推送通道 (4大类型)",
    discordTestChannelsSub: "点击测试发送对应警报 Embed",
    discordTestMacroBtn: "1. 宏观政策简报",
    discordTestBuyBtn: "2. 观察列表买入",
    discordTestSellBtn: "3. 卖出与风险预警",
    discordTestGoldBtn: "4. 淘金金矿股",
    discordConnTestBtn: "连通性测试",
    discordSaveConfigBtn: "保存配置",
    discordSavingBtn: "保存中...",
    discordSavedSuccess: "✅ Discord Webhook 配置保存成功！",
    discordSaveFailed: "❌ 保存失败:",
    discordEnterUrlFirst: "⚠️ 请先输入有效的 Discord Webhook URL。",
    discordConnTestSuccess: "🧪 连通性测试警报已发送！请检查您的 Discord 频道。",
    discordMacroSuccess: "📊 每日宏观经济与政策简报已发送至 Discord！",
    discordBuySuccess: "🟢 观察列表买入信号汇总已发送至 Discord！",
    discordSellSuccess: "🔴 观察列表卖出与危险区间预警已发送至 Discord！",
    discordGoldSuccess: "💡 淘金组合 (Gold Nuggets) 发现提醒已发送至 Discord！",
    discordDispatchFailed: "❌ 警报发送失败:",
  },

  hybrid: {
    appTitle: "投资工作站 (Investment Workstation)",
    appSubtitle: "",
    searchPlaceholder: "搜索美股与加拿大股票 ($NVDA, $AAPL, $SHOP.TO, $TD.TO)...",
    searchButton: "深度剖析标的",
    tabMacro: "宏观仪表盘与选股阵列 (Macro Dashboard & Picks)",
    tabStock: "个股深度剖析 (Stock Deep-Dive)",
    plainTalkOn: "通俗白话模式: 开",
    plainTalkOff: "专业机构模式 (Pro)",
    watchlistDrawerTitle: "自选股与价格提醒 (Watchlist & Price Alerts)",
    starred: "✓ 已关注 (Starred)",
    addStar: "+ 关注 (Star)",
    groundTruthVerified: "100% Verified Data (真实数据)",
    source: "Source (数据源)",
    currentMarketPrice: "当前价格 (Current Market Price)",
    commandPaletteTitle: "快捷搜索 (Command Palette)",
    calcButtonTitle: "仓位计算器 (Position Sizing)",
    discordButtonTitle: "Discord 警报 (Push Alerts)",

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
    catSectorChampions: "🟢 超配板块精选 (Sector Champions)",
    catMarketLeaders: "🔵 核心龙头 (Market Leaders)",
    catGoldNuggets: "🪙 隐形金矿股 (Hidden Gold Nuggets)",
    catSectorDesc: "与当前 Overweight 板块 100% 契合的强现金流领头羊。",
    catLeaderDesc: "美股与加股大盘蓝筹核心标的，兼具 Wide Moat 与强劲 FCF。",
    catGoldDesc: "非散户热搜的中小盘利基龙头，具高 FCF 转换率与强 upside 潜力。",
    whyInvestNow: "为什么此时推荐配置 (Why Recommend Now)",
    companyBackground: "主营业务背景 (Company Background)",
    growthCatalysts: "核心增长催化剂 (Growth Catalysts)",
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
    debateSubtitle: "🐂 多头 (Bull) vs 🐻 空头 (Bear) 数据辩论 → 👨‍⚖️ CIO 裁决与 Evidence 核验",
    bullCase: "🟢 多头辩护人 (Bull Case Advocate)",
    bearCase: "🔴 空头公诉人 (Bear Case Prosecutor)",
    cioVerdict: "⚖️ CIO 最终裁决 (Chief Investment Officer Verdict)",
    riskReward: "风险/收益比 (Risk / Reward)",
    recommendedBuyBracket: "建议买入区间 (Entry Bracket)",
    positionSizing: "仓位管理建议 (Position Sizing)",
    judgeSummary: "CIO 决策逻辑 (Judge Summary)",
    keyUpsideCatalyst: "核心看涨催化剂 (Key Upside Catalyst)",
    keyDownsideRisk: "主要下行风险 (Key Downside Risk)",

    chartTitle: "估值与动态价格通道 (Valuation & Price Channel)",
    pricingOverlay: "估值与技术面走势 (Pricing & Technical Overlay)",
    valuationStatus: "估值状态 (Valuation Status)",
    idealBuyRange: "理想买入区间 (Ideal Buy Range)",
    actionStatus: "操作指令 (Action Status)",
    timingAdvice: "战术执行建议 (Timing Advice)",

    secTitle: "5年期 SEC 10-K 与 SEDAR+ 财报文本挖掘 (Text Mining Pipeline)",
    secSubtitle: "基于算法对比 5 年年度财报中高管 Risk Disclaimer 变动",
    insertedDisclaimer: "+ 新增风险披露条款 (Inserted Risk Disclaimer)",
    removedDisclaimer: "- 移除与重分类声明 (Removed Disclaimers)",
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

    everydayAnalogyHeader: "💡 通俗比喻 (Everyday Analogy)：",

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
    calcConservative: "🛡️ 保守型 (Conservative)",
    calcBalanced: "⚖️ 稳健型 (Balanced)",
    calcAggressive: "🚀 激进型 (Aggressive)",
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
    discordZeroKycBadge: "Zero-KYC 免认证",
    discordGuideTitle: "30秒 Discord 快速设置指南 (Setup Guide)",
    discordGuideStep1: "打开 Discord → 频道设置 (⚙️) → 整合 (Integrations)。",
    discordGuideStep2: "点击 Webhooks → 新建 Webhook (New Webhook)。",
    discordGuideStep3: "点击 Copy Webhook URL 并粘贴在下方。",
    discordChannelStatus: "通道连接状态 (Channel Status):",
    discordConnected: "Discord 已连接 (Connected)",
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
    discordSavedSuccess: "✅ Discord Webhook 配置保存成功！",
    discordSaveFailed: "❌ 保存失败:",
    discordEnterUrlFirst: "⚠️ 请先输入有效的 Discord Webhook URL。",
    discordConnTestSuccess: "🧪 连通性测试警报已发送！请检查 Discord 频道。",
    discordMacroSuccess: "📊 每日宏观简报已发送至 Discord！",
    discordBuySuccess: "🟢 观察列表买入信号汇总已发送至 Discord！",
    discordSellSuccess: "🔴 观察列表卖出与危险预警已发送至 Discord！",
    discordGoldSuccess: "💡 Gold Nuggets 发现提醒已发送至 Discord！",
    discordDispatchFailed: "❌ 警报发送失败:",
  }
};
