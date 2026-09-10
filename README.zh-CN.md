# Prism Loop: 多维光谱智能投研工作站

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v8.9.1-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-80%2F80%20通过-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Accessibility](https://img.shields.io/badge/无障碍-WCAG%20AAA-purple.svg)](#)
[![Theme](https://img.shields.io/badge/主题-明亮%20%2F%20暗黑-slate.svg)](#)

Prism Loop 是一款面向美股与加股自主投资者的桌面级投研工作站。它在一个高响应的统一界面中，直连交易所实时行情、宏观周期指标、SEC 10-K 与 SEDAR+ 连续 5 年的年报文本差异、多智能体对抗辩论，以及基于自由现金流（DCF）的安全边际估值模型。

投资中最耗时的是翻阅上百页格式化的冗长年报，最容易犯错的是在高估值时盲目追高或在低估值时死守现金。Prism Loop 自动化完成这些繁琐分析，计算明确的建仓买入区间，核验企业增长催化剂与营收结构，并在建仓前评估下行风险。

---

## 解决的核心痛点

传统个人投研工具通常只提供静态的历史估值倍数（如历史市盈率、市净率），或者输出容易产生数字幻觉的大模型概括。专业机构在评估资产时，通常会同时交叉审视以下四个维度：

1. **宏观周期顺风性**：当前企业所处行业是受益于降息与通胀放缓，还是面临借贷成本上升与去库存压力？
2. **管理层披露漂移**：在最新的 10-K 年报中，管理层是否悄悄删除了原有的营收指引，或者新增了潜在的诉讼与监管风险披露？
3. **对抗式压力测试**：如果空头逻辑发酵、估值倍数回落，这只股票最致命的下行支撑位在哪里？
4. **估值安全边际**：在保证合理回报率的前提下，最高能接受的买入价格上限是多少？

Prism Loop 将这套机构投研流自动化，覆盖美加市场 130+ 重点标的，并支持任意股票的即时分析。

---

## 四大核心支柱

### 1. 北美宏观周期扫描仪
实时跟踪美联储 FRED 通胀（CPI）数据、加拿大央行利率决议、10Y-2Y 美债利差与宏观财经要闻。系统判断当前经济所处的商业周期阶段（扩张期、放缓期、收缩期、复苏期），并提示具备历史统计顺风的优势行业板块。

### 2. SEC 10-K 与 SEDAR+ 年报文本挖掘
对标的公司连续 5 年的年度 MD&A 章节进行纵向词频与情绪差分对比，自动捕获：
- 管理层最新增补的风险免责声明
- 悄悄删除或下调的营收与利润率前瞻指引
- 管理层叙事基调的变化趋势

### 3. 多智能体对抗辩论竞技场
每只标的都会经过独立智能体的多角度对抗审计：
- **看多先锋（Bull Case Advocate）**：分析护城河壁垒、单位经济模型、资本再投资回报率与短期增长催化剂。
- **看空检察官（Bear Case Prosecutor）**：审视债务到期压力、高估值风险、利润率挤压，以及跌破均线的技术面破位风险。
- **首席投资官（CIO）**：综合多空论据，计算真实的收益风险比（R:R），输出明确的投资裁决（BUY 积极买入、ACCUMULATE 分批建仓、WATCHLIST 保持观察、PASS 放弃观望）与仓位配置上限。

### 4. DCF 内在价值与自适应安全边际
基于多阶段自由现金流折现（DCF）测算内在价值。为平衡高估值成长股的回撤风险与优质白马股的踏空成本，系统采用自适应安全边际机制：
- **高估值/科技股（$P/E > 38$）**：采用 20% 安全边际，防范估值倍数剧烈回撤。
- **防御型/低估值股（$P/E < 20$）**：采用 10% 安全边际，避免因门槛过高导致资金长期闲置。
- **常规标的**：采用 15% 标准安全边际，并结合 50 日与 200 日均线作为技术面支撑底线。

---

## 更多工作站特性

- **实时交易所行情直连**：直连美股（NYSE、NASDAQ）与加股（TSX、TSXV）实时行情接口，响应时间低于 50ms，采用 3 分钟内存缓存机制，杜绝虚构价格（如 `$KO`、`$NVDA`、`$SHOP.TO`、`$T.TO`、`$CAE.TO`）。
- **机构级公司背景与业务拆解**：内置 135+ 核心标的的主营业务拆解、4 项具体催化剂与营收百分比。未索引标的自动通过 Yahoo Search 与 Wikipedia 动态生成。
- **多语言与白话通俗解释**：支持英文（`EN`）、简体中文（`中`）与中英双语（`中/EN`）。所有专业指标均配备通俗生活化类比浮窗卡片。
- **一键辩论裁决社区分享**：支持将多空辩论与 CIO 裁决一键导出为格式化 Markdown 或图片卡片，方便在 Reddit（r/ValueInvesting、r/stocks）、X 与 Discord 投资社区讨论。
- **Discord 专属 Webhook 实时提醒**：支持自选股跌入买入区间提醒与每日早间宏观简报直接推送到 Discord 频道，无需任何第三方注册。
- **独立打印级投研备忘录**：内置独立的排版打印引擎，一键导出纯白底、无界面杂质的 A4 投研备忘录，支持直接打印或保存为 PDF。

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

## 项目架构与目录索引

```
ai-investment/
├── backend/                  # FastAPI 后端服务与投研算法引擎
│   ├── agents/               # 多智能体对抗辩论竞技场 (Bull, Bear, CIO)
│   ├── data_sources/         # 实时交易所行情、SEC EDGAR、SEDAR+、公司背景库
│   ├── engines/              # 宏观分析、DCF 估值、基本面、年报挖掘、回测引擎
│   ├── routers/              # RESTful API 路由模块 (macro, stock, debate, alerts, watchlist)
│   └── tests/                # 80 个 Pytest 自动化测试与性能基准用例
├── frontend/                 # React 18 + TypeScript + Vite 前端工程
│   ├── src/
│   │   ├── components/       # 业务卡片、对话框、辩论竞技场、图表抽屉
│   │   ├── utils/            # 备忘录排版打印、数据格式化工具库
│   │   └── types/            # TypeScript 类型定义与接口契约
│   └── vite.config.ts        # Rollup 代码分包优化配置 (主入口仅 113 kB)
├── docs/                     # 需求文档、设计规范、投资方法论与 RICE 需求路线图
├── install.bat / install.sh  # 自动化一键依赖安装脚本
└── start.bat / start.sh      # 自动化一键启动脚本
```

---

## 自动化测试与验证

```powershell
# 运行全部后端 pytest 测试用例 (80/80 全部通过，0 警告)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# 验证前端 TypeScript 类型与生产打包编译
npm --prefix frontend run build
```

---

## 开源协议

本项目采用 MIT 开源协议。详情请参阅 [LICENSE](LICENSE)。
