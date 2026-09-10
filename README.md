# Prism Loop: Multi-Spectrum Equity Intelligence Workstation

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v8.9.1-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-80%2F80%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Accessibility](https://img.shields.io/badge/accessibility-WCAG%20AAA-purple.svg)](#)
[![Theme](https://img.shields.io/badge/theme-Light%20%2F%20Dark-slate.svg)](#)

Prism Loop is a desktop-grade equity research workstation built for self-directed investors in US and Canadian markets. It connects live exchange price feeds, macroeconomic cycle indicators, 5-year SEC 10-K and SEDAR+ filing text diffs, multi-agent AI debates, and discounted cash flow (DCF) margin of safety models in one fast interface.

Instead of scrolling through hundreds of pages of filing boilerplate or guessing whether a stock is overvalued, Prism Loop calculates concrete buy brackets, verifies revenue drivers and catalysts, and stress-tests downside risk before you allocate capital.

---

## The Problem Prism Loop Solves

Most retail tools give you either backward-looking static ratios (P/E, P/B) or ungrounded generative AI summaries that hallucinate numbers. Professional institutional desks look across multiple dimensions at once:

1. **Macro cycle alignment**: Is the business swimming with or against the interest rate and inflation tide?
2. **Management disclosure shifts**: Did the company quietly remove revenue guidance or add new litigation risks in its latest 10-K?
3. **Adversarial stress testing**: What is the strongest bear thesis against the stock, and what happens if multiples compress?
4. **Valuation margin of safety**: What is the maximum entry price that still gives you an adequate return buffer?

Prism Loop automates this multi-spectrum workflow across 130+ verified US and Canadian equities and any custom ticker you search.

---

## Four Core Pillars

### 1. Macro Cycle Scanner
Tracks US Federal Reserve CPI inflation data, Bank of Canada policy rate announcements, 10Y-2Y yield curve spreads, and economic releases. The scanner identifies which business cycle phase the economy is in (Expansion, Slowdown, Contraction, or Recovery) and highlights which sectors have historical tailwinds.

### 2. SEC 10-K & SEDAR+ Text Mining
Runs longitudinal word and sentiment diffs across 5 consecutive years of annual MD&A filings. The engine detects:
- Newly added risk factor disclosures
- Quietly removed revenue or margin guidance statements
- Executive tone shifts and keyword frequency changes

### 3. Multi-Agent Bull vs. Bear Debate Arena
Every analyzed stock undergoes a structured adversarial audit between specialized autonomous agents:
- **Bull Case Advocate**: Identifies structural moat strength, unit economics, reinvestment rate of return, and near-term catalysts.
- **Bear Case Prosecutor**: Probes debt maturities, valuation multiples, margin compression, and technical breakdown risk below moving averages.
- **Chief Investment Officer (CIO)**: Synthesizes both arguments, computes an authentic risk-reward ratio, and issues an actionable verdict (BUY, ACCUMULATE, WATCHLIST, or PASS) with target allocation limits.

### 4. DCF Valuation & Dynamic Margin of Safety
Computes intrinsic fair value using multi-stage Free Cash Flow projections. To prevent both overpaying for high-multiple growth stocks and sitting in cash during quality compounding runs, the engine applies an adaptive margin of safety:
- **High Multiple / Tech ($P/E > 38$)**: 20% Margin of Safety to defend against multiple compression.
- **Defensive / Low Multiple ($P/E < 20$)**: 10% Margin of Safety to prevent permanent cash drag.
- **Standard Equities**: 15% Margin of Safety with 50-day and 200-day moving average technical support floors.

---

## Additional Workstation Features

- **Live Market Feed Ingestion**: Connects directly to live exchange feeds for US (NYSE, NASDAQ) and Canadian (TSX, TSXV) stocks with sub-50ms query latency and a strict 3-minute in-memory cache. Live examples include `$KO`, `$NVDA`, `$SHOP.TO`, `$T.TO`, and `$CAE.TO`.
- **Institutional Corporate Knowledge Engine**: Includes verified business operations, 4 concrete catalysts, and revenue segment breakdowns for 135+ benchmark stocks. For unindexed tickers, it builds dynamic profiles via Yahoo Search and Wikipedia.
- **Bilingual and Plain-Language Support**: One-click toggle between English (`EN`), Simplified Chinese (`中`), and Hybrid (`中/EN`). Every financial term and agent role includes interactive definition hovercards with real-world analogies.
- **1-Click Debate Verdict Sharing**: Exports cleanly formatted Markdown verdicts or visual cards optimized for sharing on Reddit (r/ValueInvesting, r/stocks), X, and Discord communities.
- **Discord Direct Webhook Alerts**: Automatically sends morning macro briefs and watchlist target price triggers directly to your Discord server with zero third-party registration requirements.
- **Standalone A4 Research Memo Printing**: Generates clean, publication-grade research memos with 100% white background and no UI chrome, ready to print or save to PDF.

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

## Architecture & Codebase Map

```
ai-investment/
├── backend/                  # FastAPI backend & quantitative engines
│   ├── agents/               # Multi-Agent Debate Arena (Bull, Bear, CIO)
│   ├── data_sources/         # Real-time exchange feeds, SEC EDGAR, SEDAR+, Profiles
│   ├── engines/              # Macro, Pricing (DCF), Fundamental, SEC Text Miner, Backtest
│   ├── routers/              # REST endpoints (macro, stock, debate, alerts, watchlist)
│   └── tests/                # 80 Pytest automated regression & benchmark test cases
├── frontend/                 # React 18 + TypeScript + Vite application
│   ├── src/
│   │   ├── components/       # UI cards, debate arena, interactive charts, drawers
│   │   ├── utils/            # Memo printer, export tools, storage helpers, math formatters
│   │   └── types/            # TypeScript interfaces & API contract models
│   └── vite.config.ts        # Rollup code-splitting configuration (113 kB main chunk)
├── docs/                     # Product requirements, design system, philosophy & backlog
├── install.bat / install.sh  # Automated 1-click dependency installer
└── start.bat / start.sh      # Automated 1-click workstation launcher
```

---

## Automated Verification & Testing

```powershell
# Run backend test suite (80/80 passing, 0 warnings)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Verify frontend TypeScript types and production bundle build
npm --prefix frontend run build
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
