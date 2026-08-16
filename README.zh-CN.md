# Prism Loop: 多维光谱智能投研工作站

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v8.2.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-65%2F65%20通过-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/主题-明亮%2F暗黑双模式-slate.svg)](#)

Prism Loop 是一款开源的美股与加股投研工作站。它将实时交易所行情、宏观周期跟踪、SEC 10-K 与 SEDAR+ 年报文本挖掘、多智能体 AI 辩论以及现金流折现（DCF）估值整合在一个高对比度的统一界面中。

不同于传统冗长晦涩的财报阅读，Prism Loop 直接计算每只股票的安全边际买入区间，核验企业增长催化剂与核心营收构成，并提前提示潜在的下行风险。

---

## 核心功能

- **实时交易所行情直连**: 直连美股（NYSE/NASDAQ）与加股（TSX/TSXV）实时行情接口，响应时间低于 50ms。采用最长 3 分钟内存缓存机制，杜绝虚构价格与严重滞后。
- **机构级公司背景与业务拆解**: 为核心蓝筹与领军企业（如可口可乐 `$KO`、百事 `$PEP`、开市客 `$COST`、研科 `$T.TO`、Shopify `$SHOP.TO`、英伟达 `$NVDA` 等）提供结构化的主营业务概况、行业分类与营收拆解。对于其他任意股票，系统自动调用 Yahoo Search 与 Wikipedia API 进行实时动态解析与持久化缓存。
- **北美宏观周期扫描仪**: 跟踪美联储 FRED 通胀指标、加拿大央行利率决议、10Y-2Y 美债利差与宏观财经要闻，分析当前顺周期优势行业。
- **SEC 10-K 与 SEDAR+ 年报挖掘**: 对比连续 5 年的 MD&A 章节文本，自动标记管理层新增加的风险免责声明、删减的盈利指引与关键词频率变化。
- **多智能体对抗辩论与 CIO 裁决**: 针对目标股票组织看多先锋（剖析增长催化剂与护城河）与看空检察官（揭示估值风险与行业逆风）的对抗审计，最后由首席投资官（CIO）给出客观的投资胜率评分与建议仓位。
- **DCF 内在价值与买入区间**: 结合自由现金流折现、50 日均线与 200 日均线测算内在价值与理想建仓区间，买入前清晰掌握安全边际。
- **独立打印级投研备忘录**: 内置独立的 iframe 打印排版引擎，一键导出无冗余界面的纯白底 A4 投研备忘录，支持导出为 PDF 或 Markdown 格式。
- **Discord 实时推送提醒**: 当自选股价格跌入安全边际买入区间时，自动向指定的 Discord 频道发送即时提醒，并支持每日早间宏观政策简报。
- **通俗白话模式与双语支持**: 支持英文、简体中文与中英混合模式，集成金融术语生活化类比卡片，降低专业理解门槛。

---

## 快速启动

### 环境要求
- Python 3.11 或更高版本
- Node.js 18 或更高版本

### 方式一：一键自动安装与启动（推荐）

1. 双击运行 `install.bat`（Mac/Linux 用户运行 `./install.sh`）进行自动化依赖安装。
2. 双击运行 `start.bat`（Mac/Linux 用户运行 `./start.sh`）启动服务，系统将自动在默认浏览器中打开 `http://localhost:3000`。

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

## 项目结构

```
ai-investment/
├── backend/                  # FastAPI 后端服务与投研算法引擎
│   ├── agents/               # 多智能体对抗辩论竞技场 (Bull, Bear, CIO)
│   ├── data_sources/         # 实时交易所行情、SEC EDGAR、SEDAR+、公司背景库
│   ├── engines/              # 宏观分析、DCF 估值、基本面、年报挖掘、回测引擎
│   ├── routers/              # RESTful API 路由模块
│   └── tests/                # 65 个 Pytest 自动化测试与性能基准用例
├── frontend/                 # React 18 + TypeScript + Vite 前端工程
│   ├── src/
│   │   ├── components/       # 业务卡片、对话框、辩论竞技场、图表抽屉
│   │   ├── utils/            # 备忘录排版打印、数据格式化工具库
│   │   └── types/            # TypeScript 类型定义与接口契约
│   └── vite.config.ts        # Rollup 代码分包优化配置
├── docs/                     # 需求文档、架构设计与 RICE 需求优先级路线图
├── start.bat                 # Windows 一键启动脚本
└── start.sh                  # macOS/Linux 一键启动脚本
```

---

## 自动化测试

```powershell
# 运行全部后端 pytest 测试用例 (65/65 全部通过)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# 验证前端 TypeScript 类型与生产打包编译
npm --prefix frontend run build
```

---

## 开源协议

本项目采用 MIT 开源协议。详情请参阅 [LICENSE](LICENSE)。
