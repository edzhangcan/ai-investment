# Prism Loop — Multi-Spectrum Equity Intelligence Workstation

[English](README.md) | [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v7.0.0-sky.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-60%2F60%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/theme-Dual--Mode%20Light%2FDark-slate.svg)](#)

**Prism Loop** is an institutional-grade equity intelligence workstation built for everyday investors in US and Canadian stock markets. It combines macroeconomic cycle tracking, automated SEC 10-K / SEDAR+ filing text mining, multi-agent adversarial debates, and discounted cash flow (DCF) fair value pricing into a clean, high-contrast dashboard.

Instead of drowning in hundreds of pages of financial filings or guessing whether a stock is overvalued, Prism Loop gives you clear margin-of-safety buy zones, verified growth catalysts, and objective downside risk warnings.

---

## 💎 Core Architecture & Capabilities

- **🏛️ North American Macro Cycle Scanner**: Real-time tracking of US FRED inflation rates, Bank of Canada (BoC) policy rate stances, 10Y-2Y yield curve spreads, and economic policy feeds to identify which sectors (e.g., Tech infrastructure, Commercial Banking, Energy) are cyclically favored.
- **📄 SEC 10-K & SEDAR+ Text Mining Pipeline**: 5-year longitudinal Levenshtein delta diffing across annual MD&A filings. Automatically detects newly inserted corporate risk disclaimers, removed guidance phrases, and shifting executive focus keywords.
- **⚖️ Multi-Agent Debate Arena & CIO Verdict**: Every stock undergoes an adversarial audit between a **Bull Case Advocate** (growth catalysts & moat) and a **Bear Case Prosecutor** (margin compression & macro vulnerabilities), concluded by a **Chief Investment Officer (CIO)** agent with an objective conviction score and position-sizing allocation advice.
- **🎯 DCF Fair Value & Margin of Safety Buy Zones**: Calculates intrinsic fair values and dynamic price brackets based on free cash flow (FCF), 50-day SMA, and 200-day SMA. Know your exact entry ceiling and floor before placing a trade.
- **🔔 Zero-KYC Discord Push Webhook Engine**: Get real-time mobile notifications directly on your Discord server when watchlist stocks drop into their target buy zone, or receive daily 8:00 AM EST macro policy briefings.
- **💡 Plain-Talk Mode & Bilingual Dictionary**: Switch freely between English, Simplified Chinese, and Hybrid modes with popover definitions that translate Wall Street financial jargon into intuitive everyday analogies.
- **💼 Position Sizing & Rebalancing Calculator**: Calculate executable share counts based on risk appetite (Conservative, Balanced, Aggressive) with support for CAD and USD portfolios starting from $5,000.
- **📑 Institutional Investment Memo Export**: 1-click export to printable PDF or raw Markdown with institutional headers and provenance watermarks.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11 or newer
- Node.js 18 or newer

### Option A: 1-Click Launch (Recommended)

1. Run `install.bat` (or `./install.sh` on macOS/Linux) once to configure dependencies automatically.
2. Run `start.bat` (or `./start.sh` on macOS/Linux) anytime to launch the workstation. Your default browser will open automatically to `http://localhost:3000`.

### Option B: Manual Terminal Setup

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

## 🧪 Verification & Testing

```powershell
# Run the complete pytest test suite (60/60 passing)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Verify frontend build & type check
npm --prefix frontend run build
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
