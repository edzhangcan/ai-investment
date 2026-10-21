# Prism Loop: 多维光谱智能投研工作站

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v12.0.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-162%2F162%20通过-brightgreen.svg)](backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Accessibility](https://img.shields.io/badge/无障碍-WCAG%20AAA-purple.svg)](#)
[![Theme](https://img.shields.io/badge/主题-明亮%20%2F%20暗黑-slate.svg)](#)

Prism Loop 是一款面向美股与加股自主投资者的桌面级投研工作站。它在一个高响应的统一界面中，直连交易所实时行情、宏观周期指标、SEC 10-K 与 SEDAR+ 连续 5 年的年报文本差异、多智能体对抗辩论、央行决议与讲话实时流式分析，以及基于自由现金流（DCF）的安全边际估值模型。

投资中最耗时的是翻阅上百页格式化的冗长年报，最容易犯错的是在高估值时盲目追高或在低估值时死守现金。Prism Loop 自动化完成这些繁琐分析，计算明确的建仓买入区间，核验企业增长催化剂与营收结构，并在建仓前评估下行风险。

---

## 解决的核心痛点

传统个人投研工具通常只提供静态的历史估值倍数（如历史市盈率、市净率），或者输出容易产生数字幻觉的大模型概括。专业机构在评估资产时，通常会同时交叉审视以下五个维度：

1. **宏观周期顺风性**：当前企业所处行业是受益于降息与通胀放缓，还是面临借贷成本上升与去库存压力？
2. **央行货币政策走向**：美联储与加拿大央行的利率决议如何改变贴现率与跨资产估值中枢？
3. **管理层披露漂移**：在最新的 10-K 年报中，管理层是否悄悄删除了原有的营收指引，或者新增了潜在的诉讼与监管风险披露？
4. **对抗式压力测试**：如果空头逻辑发酵、估值倍数回落，这只股票最致命的下行支撑位在哪里？
5. **估值安全边际**：在保证合理回报率的前提下，最高能接受的买入价格上限是多少？

Prism Loop 将这套机构投研流自动化，覆盖美加市场 135+ 重点标的，并支持任意股票的即时分析。

---

## 五大核心支柱

### 1. 央行讲话实时流与 NLP 政策解码引擎
通过 Server-Sent Events (SSE) 协议实时流式解析美联储 FOMC 与加拿大央行（BoC）利率声明及新闻发布会。引擎逐句提取鹰派与鸽派关键词，计算偏向情绪得分，量化政策立场相对前值的偏移幅度，并推导国债收益率、股票估值倍数、外汇及 80/20 杠铃配置的跨资产应对策略。

### 2. 北美宏观周期扫描仪
实时跟踪美联储 FRED 通胀（CPI）数据、加拿大央行利率决议、10Y-2Y 美债利差与宏观财经要闻，分别提供美国与加拿大的独立宏观视角。系统判断当前经济所处的商业周期阶段（扩张期、放缓期、收缩期、复苏期），并提示具备历史统计顺风的优势行业板块。

### 3. SEC 10-K 与 SEDAR+ 年报文本挖掘
对标的公司连续 5 年的年度 MD&A 章节进行纵向词频与情绪差分对比，自动捕获：
- 管理层最新增补的风险免责声明
- 悄悄删除或下调的营收与利润率前瞻指引
- 管理层叙事基调的变化趋势

### 4. 多智能体对抗辩论竞技场
每只标的都会经过独立智能体的多角度对抗审计：
- **看多先锋（Bull Case Advocate）**：分析护城河壁垒、单位经济模型、资本再投资回报率与短期增长催化剂。
- **看空检察官（Bear Case Prosecutor）**：审视债务到期压力、高估值风险、利润率挤压，以及跌破均线的技术面破位风险。
- **首席投资官（CIO）**：综合多空论据，计算真实的收益风险比（R:R），输出明确的投资裁决（BUY 积极买入、ACCUMULATE 分批建仓、WATCHLIST 保持观察、PASS 放弃观望）与仓位配置上限。

### 5. 通用估值引擎 2.0
基于企业商业模型采用专属估值体系，测算内在公允价值：
- **支付清算网络**：轻资产现金流过路费模型，匹配近 100% 自由现金流转化率。
- **另类资产管理**：基于计费资本规模（FBC）与业绩分成倍数估值。
- **商业银行与保险**：采用 PB-ROE 与超额收益模型（将存款与债务视为经营原材料，剔除不适用的净债务扣减）。
- **受监管公用事业与管网基建**：采用核准权益回报率（Allowed ROE）与股息折现模型（DDM）。
- **租赁零售与超市连锁**：按 IFRS 16 准则调整资本化门店租赁负债。
- **高质量成长平台**：融入经营杠杆与利润率平滑扩张曲线。
- **200 日均线支撑收敛机制**：当核心资产回调至机构持仓成本均线附近时，动态校准买入上限，避免机械死守现金而错失优质复利资产。

---

## 更多工作站特性

- **实时交易所行情直连**：直连美股（NYSE、NASDAQ）与加股（TSX、TSXV）实时行情接口，响应时间低于 50ms，采用 3 分钟内存缓存机制，杜绝虚构价格（如 `$KO`、`$NVDA`、`$SHOP.TO`、`$T.TO`、`$CAE.TO`）。
- **机构级公司背景与业务拆解**：内置 135+ 核心标的主营业务拆解、4 项具体催化剂与营收结构。未索引标的自动通过 Yahoo Search 与 Wikipedia 动态构建档案。
- **多语言与白话通俗解释**：支持英文（`EN`）、简体中文（`中`）与中英双语（`中/EN`）。所有专业指标均配备通俗生活化类比浮窗卡片。
- **一键辩论裁决社区分享**：支持将多空辩论与 CIO 裁决一键导出为格式化 Markdown 或图片卡片，方便在 Reddit（r/ValueInvesting、r/stocks）、X 与 Discord 投资社区讨论。
- **Discord 专属 Webhook 实时提醒**：支持自选股跌入买入区间提醒与每日早间宏观简报直接推送到 Discord 频道，无需任何第三方注册。
- **独立打印级投研备忘录**：内置独立的排版打印引擎，一键导出纯白底、无界面杂质的 A4 投研备忘录，支持直接打印或保存为 PDF。
- **极简依赖体积**：剔除未使用的前端第三方动画依赖（如 framer-motion），生产环境构建快速轻盈。

---

## 快速启动

### 环境准备
- **Python**: 3.11 或更高版本
- **Node.js**: 18.0 或更高版本
- **操作系统**: Windows、macOS 或 Linux

### 方式一：一键自动安装与启动（推荐）

#### Windows
1. 双击运行 `install.bat` 自动安装后端与前端依赖。
2. 双击运行 `start.bat` 启动服务，浏览器将自动打开 `http://localhost:3000`。

#### macOS / Linux
```bash
chmod +x install.sh start.sh
./install.sh
./start.sh
```

### 方式二：手动分步启动

```powershell
# 1. 配置并启动后端服务 (FastAPI 服务运行于 http://127.0.0.1:8000)
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py

# 2. 在新终端窗口中启动前端服务 (Vite 服务运行于 http://localhost:3000)
cd frontend
npm install
npm run dev
```

---

## 架构与代码地图

```
ai-investment/
├── backend/                  # FastAPI 后端与量化模型引擎
│   ├── agents/               # 多智能体辩论竞技场 (多头、空头、CIO)
│   ├── data_sources/         # 实时行情源、SEC EDGAR、SEDAR+、公司深度档案
│   ├── engines/              # 宏观周期、估值定价 (DCF)、基本面、年报文本挖掘、央行流式解析
│   ├── routers/              # REST 与 SSE 路由端点 (宏观、股票、辩论、央行讲话、预警)
│   └── tests/                # 162 项 Pytest 自动化回归与基准测试
├── frontend/                 # React 18 + TypeScript + Vite 前端应用
│   ├── src/
│   │   ├── components/       # UI 卡片、辩论面板、央行讲话控制台、交互图表
│   │   ├── utils/            # 备忘录打印、导出工具、本地存储、数学格式化
│   │   └── types/            # TypeScript 类型定义与 API 契约
│   └── vite.config.ts        # Rollup 代码拆分与打包配置
├── docs/                     # 产品设计规范、设计系统、投资哲学与需求积压
├── install.bat / install.sh  # 自动化一键依赖安装脚本
└── start.bat / start.sh      # 自动化一键工作站启动脚本
```

---

## 自动化测试与验证

```powershell
# 运行后端测试套件 (162/162 全部通过，0 警告)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# 验证前端 TypeScript 类型与生产打包构建
npm --prefix frontend run build
```

---

## 投资哲学与方法论致谢

Prism Loop 的投资理念、风险护栏与估值框架深度汲取自以下优秀投研内容：
- **《面基》播客**：核心认知模型包括“只做合格持有人”、“贝叶斯更新”、“树/粮/菜三元资产配置论”与事前交易宪法《纪律.md》。
- **老钱日日谈与开源投研资料库**：包括“穿透叙事的逆向 DCF 思考”、“美股宏观大看板”与“黄金四层拓扑结构”。

---

## 许可协议

本项目基于 MIT 协议开源。详见 [LICENSE](LICENSE) 文件。
