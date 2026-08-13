# Investment Workstation

[English](README.md) | [中文](README.zh-CN.md)

[![Release](https://img.shields.io/badge/release-v4.3.0-emerald.svg)](https://github.com/edzhangcan/ai-investment/tags)
[![Tests](https://img.shields.io/badge/pytest-32%2F32%20passing-brightgreen.svg)](file:///c:/Users/drunk/Projects/ai-investment/backend/tests)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

An AI-assisted investment workstation for US and Canadian stocks. The app analyzes central bank policy statements, scans FRED economic indicators, monitors 21 selected stocks across 3 categories, and generates Margin of Safety buy zones and multi-agent AI debates.

## Key Features

- **Macro Cycle Scanner**: Tracks US and Canadian inflation, interest rates, and yield curve data alongside Fed and Bank of Canada policy news.
- **Categorized Stock Recommendations**: Ranks 21 stocks into Sector Overweight Champions, Blue-Chip Leaders, and Mid-Cap Gold Nuggets.
- **Margin of Safety Buy Zones**: Calculates dynamic entry prices based on 200-day moving averages and 2-stage DCF intrinsic values.
- **Multi-Agent AI Arena**: Runs Bull, Bear, and CIO agent debates with risk-reward ratios and final trade verdicts.
- **Position Sizing Calculator**: Computes exact share counts and cash buffers for Conservative, Balanced, and Aggressive risk models.
- **Discord Push Alerts**: Sends automated webhook embeds for macro updates, buy signals, sell warnings, and gold nuggets with zero account registration.
- **Export Memos**: Generates 1-click Markdown (.md) or PDF investment memos.
- **Bilingual Interface**: Toggle between English, Chinese, or Hybrid mode with popover explanations for jargon.

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Setup
```powershell
# Create virtual environment and install packages
python -m venv backend/venv
.\backend\venv\Scripts\pip install -r backend/requirements.txt

# Start backend server (runs on http://127.0.0.1:8000)
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

## Project Structure

```
ai-investment/
├── backend/
│   ├── data_sources/    # Market quotes, FRED, SEC EDGAR, and news scrapers
│   ├── database/        # SQLite WAL storage for watchlists and alerts
│   ├── engines/         # Macro, pricing, fundamental, backtest, and alert engines
│   ├── routers/         # REST API endpoints
│   ├── tests/           # 32 Pytest automated tests
│   ├── main.py          # FastAPI server entry point
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/  # React UI components and modals
│   │   ├── context/     # Language provider (EN / ZH / Hybrid)
│   │   ├── i18n/        # Translation dictionaries
│   │   └── App.tsx      # Main application dashboard
│   └── package.json
└── README.md
```

## Testing

```powershell
# Backend unit tests (32 passing)
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/ -v

# Frontend build check
cd frontend
npm run build
```

## License

Distributed under the MIT License. See `LICENSE` for details.
