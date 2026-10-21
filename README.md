# Prism Loop: Multi-Spectrum Equity Intelligence Workstation

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v12.0.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-162%2F162%20passing-brightgreen.svg)](backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%20AAA-purple.svg)](#)
[![Theme](https://img.shields.io/badge/theme-Light%20%2F%20Dark-slate.svg)](#)

Prism Loop is a desktop-grade equity research workstation built for self-directed investors in US and Canadian markets. It connects live exchange price feeds, macroeconomic indicators, 5-year SEC 10-K and SEDAR+ filing text diffs, multi-agent AI debates, real-time central bank speech streaming, and discounted cash flow (DCF) margin of safety models in one fast interface.

Instead of scrolling through hundreds of pages of filing boilerplate or guessing whether a stock is overvalued, Prism Loop calculates concrete buy brackets, verifies revenue drivers and catalysts, and stress-tests downside risk before you allocate capital.

---

## Core Focus

Most retail tools give you either backward-looking static ratios (P/E, P/B) or ungrounded generative AI summaries that hallucinate numbers. Professional institutional desks look across multiple dimensions at once:

1. **Macro cycle alignment**: Is the business swimming with or against the interest rate and inflation tide?
2. **Central bank policy trajectory**: How are Federal Reserve or Bank of Canada rate signals shifting discount rates across asset classes?
3. **Management disclosure shifts**: Did the company quietly remove revenue guidance or add new litigation risks in its latest annual filing?
4. **Adversarial stress testing**: What is the strongest bear thesis against the stock, and what happens if multiples compress?
5. **Valuation margin of safety**: What is the maximum entry price that still gives you an adequate return buffer?

Prism Loop automates this multi-spectrum workflow across 135+ verified US and Canadian equities and any custom ticker you search.

---

## Five Core Pillars

### 1. Central Bank Speech Streaming and NLP Policy Engine
Streams real-time FOMC (Fed) and Bank of Canada (BoC) rate statements and press conferences over Server-Sent Events (SSE). The engine performs sentence-by-sentence NLP sentiment scoring, tracks cumulative policy shift deltas against prior baselines, and generates cross-asset guidance for sovereign yields, equity multiples, foreign exchange, and 80/20 barbell allocations.

### 2. North American Macro Cycle Scanner
Tracks US Federal Reserve CPI inflation data, Bank of Canada policy rate announcements, 10Y-2Y yield curve spreads, and economic releases with dedicated country views for the US and Canada. The scanner identifies which business cycle phase the economy is in (Expansion, Slowdown, Contraction, or Recovery) and highlights which sectors have historical tailwinds.

### 3. SEC 10-K and SEDAR+ Text Mining
Runs longitudinal word and sentiment diffs across 5 consecutive years of annual MD&A filings. The engine detects:
- Newly added risk factor disclosures
- Quietly removed revenue or margin guidance statements
- Executive tone shifts and keyword frequency changes

### 4. Multi-Agent Bull vs. Bear Debate Arena
Every analyzed stock undergoes a structured adversarial audit between specialized autonomous agents:
- **Bull Case Advocate**: Identifies structural moat strength, unit economics, reinvestment rate of return, and near-term catalysts.
- **Bear Case Prosecutor**: Probes debt maturities, valuation multiples, margin compression, and technical breakdown risk below moving averages.
- **Chief Investment Officer (CIO)**: Synthesizes both arguments, computes an authentic risk-reward ratio, and issues a clear verdict (BUY, ACCUMULATE, WATCHLIST, or PASS) with target allocation limits.

### 5. Universal Valuation Engine 2.0
Computes intrinsic fair value using multi-stage Free Cash Flow projections tailored to specific business models:
- **Payment Networks**: Cash tollbooth modeling with near 100% cash conversion.
- **Asset Managers**: Fee-bearing capital (FBC) and carried interest multiples.
- **Depository Banks and Insurers**: PB-ROE and Excess Returns models (debt is treated as operating raw material rather than financial leverage).
- **Regulated Utilities and Infrastructure**: Rate-base Dividend Discount Models (DDM) with authorized returns on equity.
- **Leased Retail and Supermarkets**: Balance-sheet adjustment for IFRS 16 capitalized store leases.
- **Secular Growth Platforms**: Operating leverage margin expansion curves.
- **200-Day SMA Support Guardrail**: Automatically anchors buy brackets to technical institutional cost basis when high-quality compounders consolidate near major moving averages.

---

## Additional Workstation Features

- **Live Market Feed Ingestion**: Connects directly to live exchange feeds for US (NYSE, NASDAQ) and Canadian (TSX, TSXV) stocks with sub-50ms query latency and a 3-minute in-memory cache. Live examples include `$KO`, `$NVDA`, `$SHOP.TO`, `$T.TO`, and `$CAE.TO`.
- **Institutional Corporate Knowledge Engine**: Includes verified business operations, 4 concrete catalysts, and revenue segment breakdowns for 135+ benchmark stocks. For unindexed tickers, it builds dynamic profiles via Yahoo Search and Wikipedia.
- **Bilingual and Plain-Language Support**: One-click toggle between English (`EN`), Simplified Chinese (`中`), and Hybrid (`中/EN`). Every financial term and agent role includes interactive definition hovercards with real-world analogies.
- **1-Click Debate Verdict Sharing**: Exports cleanly formatted Markdown verdicts or visual cards formatted for sharing on Reddit (r/ValueInvesting, r/stocks), X, and Discord communities.
- **Discord Direct Webhook Alerts**: Sends morning macro briefs and watchlist target price triggers directly to your Discord server with zero third-party registration requirements.
- **Standalone A4 Research Memo Printing**: Generates clean research memos with 100% white background and no UI chrome, ready to print or save to PDF.
- **Lean Dependency Footprint**: Bundled with Vite and zero unneeded runtime animation weight, ensuring fast load times and clean production builds.

---

## Quick Start

### Prerequisites
- **Python**: 3.11 or newer
- **Node.js**: 18.0 or newer
- **OS**: Windows, macOS, or Linux

### Option 1: 1-Click Launch (Recommended)

#### Windows
1. Double-click `install.bat` once to install backend and frontend dependencies.
2. Double-click `start.bat` to launch both servers. Your browser will automatically open `http://localhost:3000`.

#### macOS / Linux
```bash
chmod +x install.sh start.sh
./install.sh
./start.sh
```

### Option 2: Manual Terminal Setup

```powershell
# 1. Start the FastAPI backend (http://127.0.0.1:8000)
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py

# 2. In a separate terminal, start the React frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

---

## Architecture and Codebase Map

```
ai-investment/
├── backend/                  # FastAPI backend & quantitative engines
│   ├── agents/               # Multi-Agent Debate Arena (Bull, Bear, CIO)
│   ├── data_sources/         # Real-time exchange feeds, SEC EDGAR, SEDAR+, Profiles
│   ├── engines/              # Macro, Pricing (DCF), Fundamental, SEC Text Miner, Central Bank Streamer
│   ├── routers/              # REST & SSE endpoints (macro, stock, debate, speech, alerts)
│   └── tests/                # 162 Pytest automated regression & benchmark test cases
├── frontend/                 # React 18 + TypeScript + Vite application
│   ├── src/
│   │   ├── components/       # UI cards, debate arena, speech stream console, interactive charts
│   │   ├── utils/            # Memo printer, export tools, storage helpers, math formatters
│   │   └── types/            # TypeScript interfaces & API contract models
│   └── vite.config.ts        # Rollup code-splitting configuration
├── docs/                     # Product requirements, design system, philosophy & backlog
├── install.bat / install.sh  # Automated 1-click dependency installer
└── start.bat / start.sh      # Automated 1-click workstation launcher
```

---

## Automated Verification and Testing

```powershell
# Run backend test suite (162/162 passing, 0 warnings)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Verify frontend TypeScript types and production bundle build
npm --prefix frontend run build
```

---

## Conceptual Credits and Methodology Acknowledgments

The investment philosophy, risk guardrails, and valuation frameworks in Prism Loop draw inspiration from:
- **《面基》 (Mianji Podcast)**: Core mental models for Qualified Holders (*只做合格持有人*), Bayesian Updating (*贝叶斯更新*), Three-Part Equity Taxonomy (*树/粮/菜: Trees, Grain, Vegetables*), and Pre-Trade Investment Constitution (*《纪律.md》*).
- **老钱日日谈与开源投研资料库**: Methodologies for Reverse-DCF Narrative Penetration (*穿透叙事*), Big Picture Macro Indicators (*美股看板*), and Gold 4-Layer Topology (*黄金看板*).

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
