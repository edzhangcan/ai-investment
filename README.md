# Institutional AI Investment Workstation

[English](README.md) | [中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v4.7.0-emerald.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-49%2F49%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An institutional-grade, AI-powered investment workstation for US and Canadian equities. The platform synthesizes macroeconomic indicators (FRED API, Fed/BoC monetary policy streams), authentic 5-year SEC 10-K & SEDAR+ official filings, Morningstar 5-Factor Moat metrics, 2-Stage DCF intrinsic fair valuation, technical support overlays (200D SMA & 14D RSI), multi-agent Bull/Bear/CIO investment debates, and multi-channel zero-KYC push notifications.

---

## 🌟 Core Features & Modules

### 1. 128-Stock North American Institutional Universe
- **Coverage**: 128 premier North American equities spanning US Tech Leaders, Canadian Energy & Banking Giants, and High-Growth Niche Gems (`NVDA`, `AAPL`, `MSFT`, `AMZN`, `GOOGL`, `META`, `TSLA`, `SHOP.TO`, `SU.TO`, `ENB.TO`, `TD.TO`, `PLTR`, `CRWD`, `CELH`, etc.).
- **Zero Fabrication Policy**: Free cash flow, revenue drivers, and corporate backgrounds are pulled from authentic SEC/SEDAR filings and institutional registries—never defaulted to static constants.

### 2. Multi-Factor Dynamic Composite Scoring Engine
- **Continuous Distribution (0 - 100)**: Evaluates stocks using a weighted quantitative formula:
  $$\text{Composite Score} = (0.35 \times \text{Macro Score}) + (0.40 \times \text{Fundamental Score}) + (0.25 \times \text{Pricing Score})$$
- Generates distinct, continuous scores per stock (e.g. NVDA `94/100`, AMZN `88/100`, SHOP.TO `87/100`, CELH `85/100`).

### 3. Authentic Corporate Profiles & Growth Catalysts (`company_profiles.py`)
- Provides verified business summaries, 3-4 specific key growth catalysts, and percentage-based revenue driver breakdowns across US and Canadian equities in English, Chinese, and Hybrid modes.
- Fallback dynamic lookup via `yfinance.longBusinessSummary` for unmapped searched tickers.

### 4. Multi-Agent AI Investment Arena
- Features real-time debates between **Bull Case Advocate 🐂**, **Bear Case Prosecutor 🐻**, and **Chief Investment Officer (CIO) 👨‍⚖️** with position sizing guidance, risk-reward ratios, and trade entry brackets.

### 5. Multi-Channel Zero-KYC Push Alerts (`push_notifier.py`)
- Automated notification dispatching across **Discord Webhooks**, **Custom Webhooks**, **Email SMTP**, and **Mobile Push** with zero user registration required.

---

## ⚡ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Setup
```powershell
# Navigate to project root, create virtual environment and install packages
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt

# Start FastAPI backend server (runs on http://127.0.0.1:8000)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```

### 2. Frontend Setup
```powershell
# Open a new terminal, install dependencies, and start dev server
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📁 Repository Architecture

```
ai-investment/
├── backend/
│   ├── data_sources/    # SEC EDGAR 10-K, SEDAR+, FRED API, News scrapers & Company Profiles
│   ├── database/        # SQLite WAL storage for watchlists, alert logs & snapshots
│   ├── engines/         # Macro, Fundamental, Pricing, Recommendation, Backtest, & Portfolio engines
│   ├── models/          # SQLModel database schemas & Pydantic REST models
│   ├── routers/         # FastAPI REST API route handlers
│   ├── services/        # Price Alert Engine & Multi-Channel Push Notifier
│   ├── tests/           # 49 Pytest automated unit tests
│   └── main.py          # FastAPI application entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components (Dashboard, Deep Dive, Pricing Chart, Debate Arena)
│   │   ├── context/     # Language Provider (EN / ZH / Hybrid)
│   │   ├── i18n/        # Multi-language translation dictionaries
│   │   └── App.tsx      # Main application dashboard
│   └── package.json
└── README.md
```

---

## 🧪 Testing & Verification

```powershell
# Run backend Pytest automated test suite (49 passing)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Run frontend TypeScript build check
cd frontend
npm run build
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
