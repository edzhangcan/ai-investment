# Walkthrough - Fullstack Architecture & UI/UX Pro Max (v3.0.0)

The AI Investment Platform has evolved into **v3.0.0 Fullstack Architecture & UI/UX Pro Max**, introducing SQLite database persistence via SQLModel, asynchronous non-blocking services, a `Ctrl+K` Command Palette, a Watchlist & Buy-Price Alert Drawer, and multi-horizon technical chart controls.

---

## What Was Accomplished in v3.0.0

### 1. Database & Persistence Layer (SQLModel + SQLite WAL Mode)
- **Database Engine** ([database.py](file:///c:/Users/drunk/Projects/ai-investment/backend/database.py)): Initialized local `investment_platform.db` with SQLite Write-Ahead Logging (WAL) mode for fast concurrent operations.
- **SQLModel Table Entities** ([db_models.py](file:///c:/Users/drunk/Projects/ai-investment/backend/models/db_models.py)): Built persistent data entities:
  - `UserWatchlistDB`: Saved tickers, company names, target buy prices, and portfolio allocation percentages.
  - `CompanyDB`: Market symbols, exchange info, and pricing update timestamps.
  - `MacroSnapshotDB`: Historical FRED economic indicators and Fed/BoC central bank tone logs.
  - `GuidanceShiftDB`: 5-year MD&A caution disclaimers for US & CA equities.
  - `DebateTranscriptDB`: Multi-Agent debate verdicts and Risk-Reward ratio logs.
- **Watchlist REST API Router** ([watchlist.py](file:///c:/Users/drunk/Projects/ai-investment/backend/routers/watchlist.py)): Exposed `GET /api/watchlist`, `POST /api/watchlist`, and `DELETE /api/watchlist/{symbol}` endpoints.

### 2. UI/UX Pro Max Visual Engineering (`/frontend`)
- **`Ctrl+K` Command Palette** ([CommandPalette.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/CommandPalette.tsx)): Global modal accessible via `Ctrl+K` or `⌘K` for instant ticker search, switching to plain-talk mode, and opening watchlists.
- **Watchlist & Price Alert Drawer** ([WatchlistDrawer.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/WatchlistDrawer.tsx)): Slide-over drawer to star favorite stocks, set custom buy-price target alerts, and manage portfolio allocation weights.
- **Multi-Horizon Pricing Chart** ([PricingChart.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/PricingChart.tsx)): Timeframe selector buttons (`1M`, `3M`, `6M`, `1Y`, `5Y`), layer toggles (50D SMA, 200D SMA, DCF Fair Value line), and interactive tooltips.

---

## Verification & Test Results

### 1. Backend Pytest Suite (Includes Database & Router Tests)
```powershell
$env:PYTHONPATH="."; .\backend\venv\Scripts\python -m pytest backend/tests/
```
**Result**: `18 passed in 12.66s` (100% Green, including `test_database.py` SQLite CRUD operations).

### 2. Frontend Production Build
```powershell
cd frontend; npm run build
```
**Result**: Built clean with 0 TypeScript / bundling errors (`589.58 kB`).

---

## How to Run Locally

### 1. Launch FastAPI Backend Service
```powershell
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```
*Runs on `http://127.0.0.1:8000` with SQLite WAL mode.*

### 2. Launch React Frontend Dev Server
```powershell
cd frontend
npm run dev
```
*Runs on `http://localhost:3000`.*
