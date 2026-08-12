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

  // Macro Dashboard
  macroTitle: string;
  macroSubtitle: string;
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

  // Debate Arena & Verdicts
  debateTitle: string;
  bullCase: string;
  bearCase: string;
  cioVerdict: string;
  riskReward: string;
  recommendedBuyBracket: string;
  positionSizing: string;
  judgeSummary: string;

  // Pricing Chart & Timing
  chartTitle: string;
  valuationStatus: string;
  idealBuyRange: string;
  actionStatus: string;
  timingAdvice: string;

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
    appTitle: "Antigravity Quantitative Investment Workstation",
    appSubtitle: "Macro Cycle Engine • SEC EDGAR / SEDAR+ Filing Audit • Multi-Agent CIO Arena",
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

    macroTitle: "North American Macro Economic Cycle Scanner",
    macroSubtitle: "Empirical proof array derived from FRED economic data, Fed & Bank of Canada NLP statements",
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

    freeCashFlow: "Free Cash Flow",
    peRatio: "P/E Ratio",
    moatRating: "Moat Rating",
    buyZone: "Ideal Buy Zone",
    fairValue: "DCF Intrinsic Fair Value",
    fiftyDaySma: "50-Day SMA",
    twoHundredDaySma: "200-Day SMA",
    rsi14: "RSI (14-Day)",
    arrMetric: "Annual Recurring Revenue (ARR)",
    nrrMetric: "Net Revenue Retention (NRR)",

    debateTitle: "Multi-Agent Institutional Investment Arena",
    bullCase: "🟢 Bull Case Advocate",
    bearCase: "🔴 Bear Case Prosecutor",
    cioVerdict: "⚖️ Chief Investment Officer (CIO) Final Verdict",
    riskReward: "Risk / Reward Ratio",
    recommendedBuyBracket: "Recommended Entry Bracket",
    positionSizing: "Position Sizing Advice",
    judgeSummary: "CIO Decision Rationale",

    chartTitle: "Valuation & Dynamic Price Channel Chart",
    valuationStatus: "Valuation Assessment",
    idealBuyRange: "Ideal Entry Bracket",
    actionStatus: "Action Status",
    timingAdvice: "Timing & Tactical Execution Advice",

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
    appTitle: "Antigravity 机构级量化投资工作站",
    appSubtitle: "宏观周期引擎 • SEC EDGAR / SEDAR+ 财报审计 • 多智能体 CIO 辩论阵列",
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

    macroTitle: "北美宏观经济周期扫描仪",
    macroSubtitle: "基于美联储 FRED 经济指标、美联储与加拿大央行 NLP 语句分析的客观实证数组",
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

    recsTitle: "宏观驱动多维度股票推荐阵列",
    recsSubtitle: "按宏观超配板块、蓝筹核心龙头与隐形金矿股精准分类",
    catSectorChampions: "🟢 超配板块精选",
    catMarketLeaders: "🔵 核心龙头",
    catGoldNuggets: "🪙 隐形金矿股",
    catSectorDesc: "与当前宏观环境 Overweight 板块 100% 契合的强现金流领头羊。",
    catLeaderDesc: "美股与加股大盘蓝筹核心标的，兼具宽护城河与真金白银现金流。",
    catGoldDesc: "非散户热搜的中小盘利基龙头，具高 FCF 转换率与强增长潜力。",
    whyInvestNow: "为什么现在推荐投资",
    companyBackground: "公司核心业务背景",
    growthCatalysts: "核心增长催化剂与营收驱动力",
    drillDownAnalysis: "剖析完整报告",
    supportLevel: "技术支撑位",
    score: "综合评分",
    showingStocks: "显示",

    freeCashFlow: "自由现金流",
    peRatio: "市盈率",
    moatRating: "护城河评级",
    buyZone: "理想买入区间",
    fairValue: "DCF 固有价值",
    fiftyDaySma: "50日均线",
    twoHundredDaySma: "200日均线",
    rsi14: "RSI 相对强弱",
    arrMetric: "年度订阅收入 (ARR)",
    nrrMetric: "净收入留存率 (NRR)",

    debateTitle: "多智能体机构投资辩论竞技场",
    bullCase: "🟢 多头辩护人",
    bearCase: "🔴 空头公诉人",
    cioVerdict: "⚖️ 首席投资官 (CIO) 最终裁决",
    riskReward: "风险/收益比",
    recommendedBuyBracket: "建议买入区间",
    positionSizing: "仓位管理建议",
    judgeSummary: "CIO 决策逻辑阐述",

    chartTitle: "估值与动态价格通道图表",
    valuationStatus: "估值状态",
    idealBuyRange: "理想买入区间",
    actionStatus: "操作指令",
    timingAdvice: "择时与战术执行建议",

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
    appTitle: "Antigravity 量化投资工作站 (Quantitative Workstation)",
    appSubtitle: "Macro Cycle Engine • SEC EDGAR / SEDAR+ 财报审计 • Multi-Agent CIO 辩论阵列",
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

    macroTitle: "北美宏观经济周期扫描仪 (North American Macro Cycle Scanner)",
    macroSubtitle: "基于 FRED 经济数据、Fed 与 Bank of Canada NLP 语句分析的客观实证数组",
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

    recsTitle: "宏观驱动股票推荐阵列 (Top Macro Recommendations)",
    recsSubtitle: "按 Overweight 板块、Blue-Chip 核心龙头与 Hidden Gold Nuggets 精准分类",
    catSectorChampions: "🟢 超配板块精选 (Sector Champions)",
    catMarketLeaders: "🔵 核心龙头 (Market Leaders)",
    catGoldNuggets: "🪙 隐形金矿股 (Hidden Gold Nuggets)",
    catSectorDesc: "与当前 Overweight 板块 100% 契合的强现金流领头羊。",
    catLeaderDesc: "美股与加股大盘蓝筹核心标的，兼具 Wide Moat 与强劲 FCF。",
    catGoldDesc: "非散户热搜的中小盘利基龙头，具高 FCF 转换率与强 upside 潜力。",
    whyInvestNow: "为什么现在推荐投资 (Why Invest Now)",
    companyBackground: "公司核心业务背景 (Company Background)",
    growthCatalysts: "核心增长催化剂 (Growth Catalysts)",
    drillDownAnalysis: "剖析完整报告 (Drill Down Analysis)",
    supportLevel: "技术支撑位 (Support Level)",
    score: "Score",
    showingStocks: "显示",

    freeCashFlow: "自由现金流 (Free Cash Flow)",
    peRatio: "市盈率 (P/E Ratio)",
    moatRating: "护城河评级 (Moat Rating)",
    buyZone: "理想买入区间 (Buy Zone)",
    fairValue: "DCF 固有价值 (Fair Value)",
    fiftyDaySma: "50日均线 (50D SMA)",
    twoHundredDaySma: "200日均线 (200D SMA)",
    rsi14: "RSI (14-Day)",
    arrMetric: "年度订阅收入 (ARR)",
    nrrMetric: "净收入留存率 (NRR)",

    debateTitle: "多智能体投资辩论竞技场 (Multi-Agent Investment Arena)",
    bullCase: "🟢 多头辩护人 (Bull Case Advocate)",
    bearCase: "🔴 空头公诉人 (Bear Case Prosecutor)",
    cioVerdict: "⚖️ CIO 最终裁决 (Chief Investment Officer Verdict)",
    riskReward: "风险/收益比 (Risk / Reward)",
    recommendedBuyBracket: "建议买入区间 (Entry Bracket)",
    positionSizing: "仓位管理建议 (Position Sizing)",
    judgeSummary: "CIO 决策逻辑 (Judge Summary)",

    chartTitle: "估值与动态价格通道 (Valuation & Price Channel)",
    valuationStatus: "估值状态 (Valuation Status)",
    idealBuyRange: "理想买入区间 (Ideal Buy Range)",
    actionStatus: "操作指令 (Action Status)",
    timingAdvice: "战术执行建议 (Timing Advice)",

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
