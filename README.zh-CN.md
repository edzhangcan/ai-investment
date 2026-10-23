# Prism Loop: 多维光谱智能投研工作站

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v13.0.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-195%2F195%20通过-brightgreen.svg)](backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Accessibility](https://img.shields.io/badge/无障碍-WCAG%20AAA-purple.svg)](#)
[![Theme](https://img.shields.io/badge/主题-明亮%20%2F%20暗黑-slate.svg)](#)
[![Markets](https://img.shields.io/badge/市场-美股%20%26%20加股-amber.svg)](#)

Prism Loop 是一款面向美股与加股自主投资者的桌面级投研工作站。它在一个高响应的统一界面中，直连交易所实时行情、宏观周期指标、SEC 10-K 与 SEDAR+ 连续 5 年的年报文本差异、多智能体对抗辩论、央行决议与讲话实时流式分析、自由现金流（DCF）安全边际估值模型，以及持仓纪律管理。

投资者无需翻阅上百页格式化的冗长年报，也不用依赖容易产生数字幻觉的大模型概括。Prism Loop 计算明确的买入价格区间，核验企业增长催化剂与营收结构，并在建仓前后严格执行防亏损纪律。

---

## 解决的核心痛点

传统个人投研工具通常只提供静态的历史估值倍数（如历史市盈率、市净率），或者输出不可验证的通用 AI 文本。专业机构在评估资产时，通常会跨维度审视以下关键问题：

1. **宏观周期顺风性**：当前企业所处行业是受益于利率与通胀周期，还是面临借贷成本上升与去库存压力？
2. **央行货币政策走向**：美联储与加拿大央行的利率决议如何改变系统流动性与跨资产贴现率？
3. **管理层披露变化**：在最新的 10-K 年报中，管理层是否删除了原有的营收指引，或者新增了潜在的诉讼与监管风险披露？
4. **对抗式压力测试**：如果空头逻辑发酵、估值倍数回落，这只股票最致命的下行风险与技术破位点在哪里？
5. **估值安全边际**：在保证合理预期回报率的前提下，最高能接受的买入价格上限是多少？
6. **持仓防守纪律**：当持仓逻辑遭遇事实证伪或趋势破坏时，如何坚决执行止损，杜绝盲目补仓摊薄成本？

Prism Loop 将这套机构投研流自动化，覆盖美加市场 135+ 重点标的，并支持任意股票代码的即时分析。

---

## 工作站预览

### 宏观周期扫描仪与央行实时流
美联储与加拿大央行货币政策实时流式解析，逐句 NLP 情绪打分与鹰鸽偏向仪表盘，结合 4 层黄金拓扑与官方权威宏观数据源。

![Macro Economic Scanner and Central Bank Streamer](docs/screenshots/workstation-full.png)

### 3 状态股票生命周期与动态组合估值
按持仓库（Holdings）、自选池（Watchlist）与发现池（Regular）分级归档，实时动态核算总市值、盈亏百分比与动态资产配置占比。

![Top Stock Recommendations and 3-Bucket Management](docs/screenshots/workstation-picks.png)

### 技术均线叠加、买入区间与 Reverse-DCF 穿透
交互式技术图表叠加 50 日均线、200 日均线与 DCF 公允价值带，联动 Reverse-DCF 计算推导当前股价隐含的 10 年净利倍数与复合年化增长率（CAGR）。

![Single Stock Deep-Dive and Valuation Overlay](docs/screenshots/workstation-deepdive.png)

---

## 核心架构

### 1. 3 状态股票生命周期与动态组合估值
将跟踪标的严格划分为三种独立的操作状态：
- **持仓库（Holdings）**：记录实际持有的标的。用户输入持股数量与买入成本，系统实时动态计算单票持仓市值、累计盈亏百分比（Up/Down %），以及当前股票占整体持仓组合的真实资金配置权重（$\text{单票市值} / \text{持仓总市值}$）。支持随时追加买入，移除不适用的建议仓位限制。
- **自选池（Watchlist）**：高胜率观察标的，预设目标买入价。当市价接近目标买入价 5% 以内时（95% 敏感阈值），系统主动发出建仓提醒。标的移入自选池后，自动从常规发现池中剔除。
- **常规发现池（Regular / Deep Value Discoveries）**：系统基于量化基本面筛选出的潜在价值标的。设置严格的 90% 深度折价阈值与右侧均线企稳确认，杜绝过早接飞刀导致的虚假警报。

### 2. 持仓纪律与防亏损证伪斩仓机制
以数学规则代替情绪化主观交易，守护本金安全：
- **结构性破位止损下限**：当持仓标的跌破 200 日均线的 97%（$200\text{D SMA} \times 0.97$）时，系统立即触发紧急斩仓警报。
- **杜绝越跌越买（Anti-Averaging Down）**：当标的核心基本面逻辑破裂或技术趋势破坏时，系统严禁推荐追加买入摊平成本。
- **交易前灵魂自拷问**：在执行建仓前，要求记录核心投资假设、预期业绩催化剂与明确的退出条件。

### 3. 宏观周期扫描仪与央行实时流
双国视角覆盖美国与加拿大宏观经济周期：
- **央行讲话实时流**：通过 Server-Sent Events (SSE) 协议实时传输美联储（FOMC）与加拿大央行（BoC）利率决议与发布会文本。逐句运行 NLP 自然语言处理算法，量化鹰派与鸽派情绪得分，计算相对基准的政策偏移幅度。
- **商业周期阶段判定**：基于 FRED 与加拿大央行权威数据（CPI 通胀、政策利率、10Y-2Y 美债利差），将宏观环境划分为扩张期、放缓期、收缩期与复苏期，并提示具备历史统计优势的配置行业。
- **宏观大局观指标**：通过修正版巴菲特指标（将量化宽松后扩大的央行资产负债表纳入分母修正）、居民金融资产权益占比（AIAE）与股权风险溢价（ERP）评估整体市场水位。
- **4 层黄金拓扑看板**：从即期动量、TIPS 实际利率脱钩、主权央行购金储备与地缘尾部对冲四个层次全景跟踪主权信用扩张与黄金定价逻辑。

### 4. 通用估值引擎 2.0 与 Reverse-DCF 叙事穿透
针对不同商业模式采用专属估值方法：
- **重资产与周期制造**：按跨周期常态化经营现金流（Mid-Cycle Normalized FCF）与维持性资本开支折算。
- **支付清算网络**：匹配轻资产现金过路费模型与近 100% 自由现金流转化率。
- **金融机构与保险**：采用 PB-ROE 与超额收益模型（将存款与债务视作经营原材料，不扣减净债务）。
- **受监管公用事业与管网基建**：采用核准权益回报率（Allowed ROE）与股息折现模型（DDM）。
- **优质成长平台**：融入多阶段折现与利润率平滑扩张曲线。
- **200 日均线支撑机制**：当核心复利资产回调至机构持仓成本均线附近时，动态校准买入上限，避免死守现金错失机会。
- **Reverse-DCF 叙事穿透**：推导当前市价所要求的 10 年净利润倍数（$E_0 \times (E_{10}/E_0) = E_{10}$）与所需维持的 10 年复合年化增长率（CAGR），识别过高市场预期带来的估值陷阱。

### 5. 多智能体对抗辩论竞技场
每只标的均经过独立专业智能体对抗审计：
- **看多先锋（Bull Case Advocate）**：深入分析护城河壁垒、单位经济模型、资本再投资回报率与行业长期红利。
- **看空检察官（Bear Case Prosecutor）**：全面审查债务到期压力、估值倍数回落、利润率受损与技术破位风险。
- **首席投资官（CIO）**：平衡双方论据，评估真实收益风险比（R:R），输出清晰的投资裁决（BUY 积极买入、ACCUMULATE 分批建仓、WATCHLIST 保持观察、PASS 放弃观望）与仓位配置上限。

### 6. 年报文本纵向挖掘（SEC EDGAR 与 SEDAR+）
纵向对比企业连续 5 年的 MD&A 年报披露内容：
- 识别新补充的风险警示与法律诉讼事项。
- 捕获管理层静默删除或调低的原有前瞻指引。
- 跟踪高管披露用词与叙事基调的历史演变。

---

## 更多工作站特性

- **低延迟交易所行情直连**：直连美股（NYSE、NASDAQ）与加股（TSX、TSXV）实时行情接口，响应时间低于 50ms，采用 3 分钟内存缓存机制。
- **交互式通知中心**：顶部铃铛图标展示未读数量徽标，支持单个消息确认与一键跳转标的深度分析。
- **Discord 专属 Webhook 提醒**：支持自选股买入区间触发与每日早间宏观简报直接推送到 Discord 频道，无需任何第三方云服务订阅。
- **多语言与白话通俗解释**：支持英文（`EN`）、简体中文（`中`）与中英双语（`中/EN`）。所有专业术语均配备通俗易懂的浮窗说明卡片。
- **打印级 A4 投研备忘录**：一键生成纯白底、无界面杂质的标准化投研备忘录，便于 PDF 归档或纸质打印。
- **精简依赖体积**：基于 Vite 构建，采用原生浏览器动画，页面响应迅捷，构建体积轻盈。

---

## 快速启动

### 环境准备
- **Python**: 3.11 或更高版本
- **Node.js**: 18.0 或更高版本
- **支持系统**: Windows、macOS 或 Linux

### 方式一：一键自动安装与启动（推荐）

#### Windows
1. 双击运行 `install.bat` 安装后端与前端依赖。
2. 双击运行 `start.bat` 启动服务，系统将自动使用默认浏览器打开 `http://localhost:3000`。

#### macOS / Linux
```bash
chmod +x install.sh start.sh
./install.sh
./start.sh
```

### 方式二：手动分步启动

```powershell
# 1. 启动 FastAPI 后端服务 (http://127.0.0.1:8000)
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py

# 2. 在新终端启动 React 前端服务 (http://localhost:3000)
cd frontend
npm install
npm run dev
```

---

## 项目结构

```
ai-investment/
├── backend/                  # FastAPI 后端服务与核心量化引擎
│   ├── agents/               # 多智能体辩论竞技场 (Bull, Bear, CIO)
│   ├── data_sources/         # 交易所行情直连、SEC EDGAR、SEDAR+、公司档案
│   ├── engines/              # 宏观周期、DCF 估值、基本面、年报挖掘、央行实时流
│   ├── routers/              # REST 与 SSE 接口路由 (macro, stock, debate, speech, alerts)
│   └── tests/                # 195 项自动化 pytest 回归与基准测试
├── frontend/                 # React 18 + TypeScript + Vite 前端工作站
│   ├── src/
│   │   ├── components/       # UI 界面组件、辩论看板、图表、模态框、通知中心
│   │   ├── context/          # 语言与全局状态提供者
│   │   ├── utils/            # 备忘录排版、导出工具、数学格式化函数
│   │   └── types/            # TypeScript 接口定义与 API 契约模型
│   └── vite.config.ts        # Vite 打包与代码分块配置
├── docs/                     # 架构规格说明、设计规范与系统拓扑
│   └── screenshots/          # 工作站界面截图与品牌设计素材
├── install.bat / install.sh  # 一键依赖安装脚本
└── start.bat / start.sh      # 一键工作站启动脚本
```

---

## 自动化测试验证

运行后端完整测试套件：
```powershell
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v
```

校验前端 TypeScript 类型定义并构建生产版本包：
```powershell
npm --prefix frontend run build
```

---

## 投资理念与方法论致谢

Prism Loop 的投资框架、风控守则与估值模型深度汲取了以下知识体系的养分：
- **《面基》播客**：只做合格持有人心智模型、贝叶斯更新原则、树/粮/菜三元股权分类体系，以及买前投资宪法（《纪律.md》）。
- **老钱日日谈与开源投研资料库**：穿透叙事的 Reverse-DCF 逆向推演法、宏观大局观看板指标体系统，以及黄金 4 层分析拓扑模型。

---

## 开源协议

基于 MIT 开源协议发布。详情请查阅 [LICENSE](LICENSE)。
