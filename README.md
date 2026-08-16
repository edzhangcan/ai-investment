# Prism Loop: Multi-Spectrum Equity Intelligence Workstation

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v8.2.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-65%2F65%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/theme-Dual--Mode%20Light%2FDark-slate.svg)](#)

Prism Loop is an open-source equity research workstation for investors in US and Canadian stock markets. It combines real-time market data, macroeconomic cycle tracking, automated SEC 10-K and SEDAR+ filing text mining, multi-agent AI debates, and discounted cash flow (DCF) valuation into a single, high-contrast interface.

Instead of reading through hundreds of filing pages or guessing whether a stock is fairly priced, Prism Loop calculates specific buy zones, verifies corporate growth catalysts, and highlights downside risks.

---

## Core Capabilities

- **Real-Time Live Market Ingestion**: Queries live exchange price feeds for US (NYSE/NASDAQ) and Canadian (TSX/TSXV) equities with sub-50ms latency. Prices are cached in memory for at most 3 minutes, giving you accurate market quotes without fabricated numbers.
- **Institutional Company Profiles**: Delivers verified corporate background summaries, sector classifications, and revenue breakdowns for market leaders (such as Coca-Cola `$KO`, PepsiCo `$PEP`, Costco `$COST`, TELUS `$T.TO`, Shopify `$SHOP.TO`, NVIDIA `$NVDA`). For other tickers, it dynamically queries Yahoo Search and Wikipedia APIs to build structured profiles.
- **North American Macro Cycle Scanner**: Tracks US FRED inflation data, Bank of Canada policy rate decisions, 10Y-2Y yield curve spreads, and financial headlines to identify which sectors are cyclically favored.
- **SEC 10-K and SEDAR+ Text Mining**: Analyzes 5-year longitudinal differences across annual MD&A filings. Flags newly added risk disclaimers, removed guidance phrases, and shifting executive focus keywords.
- **Multi-Agent Debate Arena and CIO Verdict**: Evaluates every stock through an adversarial audit between a Bull Case Advocate (growth catalysts and moat strength) and a Bear Case Prosecutor (margin compression and valuation risk). A Chief Investment Officer agent delivers a conviction score and position-sizing recommendation.
- **DCF Fair Value and Buy Zones**: Calculates intrinsic fair values and dynamic price brackets based on Free Cash Flow, 50-day SMA, and 200-day SMA so you know your margin of safety before placing a trade.
- **Standalone Investment Memo Printing**: Generates clean, publication-ready A4 research memos with 100% white background and no UI chrome, ready to print or export as PDF or Markdown.
- **Discord Push Alerts**: Dispatches real-time alerts to your Discord channel when watchlist stocks drop into their target buy zone, alongside daily morning macro policy updates.
- **Plain-Talk Mode and Bilingual Support**: Switch between English, Simplified Chinese, and Hybrid modes with popover definitions that explain financial terms in clear everyday language.

---

## Quick Start

### System Requirements
- Python 3.11 or newer
- Node.js 18 or newer

### Option 1: 1-Click Launch (Recommended)

1. Run `install.bat` (or `./install.sh` on macOS/Linux) once to install dependencies.
2. Run `start.bat` (or `./start.sh` on macOS/Linux) to start backend and frontend servers. Your browser will automatically open to `http://localhost:3000`.

### Option 2: Manual Terminal Setup

```powershell
# 1. Setup and start backend (FastAPI on http://127.0.0.1:8000)
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py

# 2. In a separate terminal, start frontend (Vite on http://localhost:3000)
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
ai-investment/
├── backend/                  # FastAPI Application & Financial Engines
│   ├── agents/               # Multi-Agent Debate Arena (Bull, Bear, CIO)
│   ├── data_sources/         # Real-time exchange feed, SEC EDGAR, SEDAR+, Company Profiles
│   ├── engines/              # Macro, Pricing (DCF), Fundamental, SEC Text Miner, Backtest
│   ├── routers/              # REST API endpoints (macro, stock, debate, alerts, portfolio)
│   └── tests/                # 65 Pytest test cases & latency benchmarks
├── frontend/                 # React 18 + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/       # UI cards, modals, debate arena, charts, drawers
│   │   ├── utils/            # Memo export engine, formatters, storage helpers
│   │   └── types/            # TypeScript interfaces & API contract models
│   └── vite.config.ts        # Rollup code-splitting chunks configuration
├── docs/                     # Product specs, architecture guides, and RICE backlog
├── start.bat                 # 1-Click launcher (Windows)
└── start.sh                  # 1-Click launcher (macOS/Linux)
```

---

## Automated Testing

```powershell
# Run the complete Pytest suite (65/65 passing)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Verify frontend TypeScript types and production build
npm --prefix frontend run build
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
