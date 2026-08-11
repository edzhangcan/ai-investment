# Walkthrough - Macro-First AI Investment Platform (v2.0.0)

The AI Investment Platform has evolved into a **Macro-First Analysis & Top Stock Recommendation Platform (v2.0.0)** supporting both US ($NVDA, $AAPL, $MSFT) and Canadian ($SHOP.TO, $TD.TO, $XEQT.TO) markets.

---

## What Was Accomplished in v2.0.0

### 1. Macro-First Analysis & Policy News Feed
- **Macro Economic & Policy Dashboard** ([MacroDashboard.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/MacroDashboard.tsx)): Visualizes North American economic cycles (Overheat, Recovery, etc.) with real-time empirical data proof (CPI 3.4%, 10Y-2Y Yield Spread -0.15%, Fed Funds Rate 5.25%-5.50%, BoC Rate 4.75%).
- **Central Bank Policy News Client** ([news_client.py](file:///c:/Users/drunk/Projects/ai-investment/backend/data_sources/news_client.py)): Ingests real-time FOMC statements, Bank of Canada monetary policy releases, and SEC/SEDAR filing announcements with zero-hallucination source citations.

### 2. TOP 3-5 Macro-Driven Stock Recommendation Engine
- **Recommendation Engine** ([recommendation_engine.py](file:///c:/Users/drunk/Projects/ai-investment/backend/engines/recommendation_engine.py)): Scores stock universe against macro cycle overweights and outputs top recommended picks with core company business model backgrounds, growth catalysts, and "Why Recommend Now" investment rationale.
- **Recommendations Grid** ([RecommendedStocksGrid.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/RecommendedStocksGrid.tsx)): Structured cards featuring `Drill Down Full Analysis` action buttons for instant deep-dive navigation.

### 3. Real-Time Data Ingestion & Zero-Hallucination Enforcer
- **Candidate Symbol Auto-Resolution** ([data_provider.py](file:///c:/Users/drunk/Projects/ai-investment/backend/data_sources/data_provider.py)): Automatically resolves Canadian TSX ticker typos and missing suffixes (e.g. searching `XQET` automatically maps to `$XEQT.TO` - iShares Core Equity ETF Portfolio at `$46.07 CAD`).
- **Strict No-Fabrication Rule**: Removed all hardcoded generic fallback values ($150.0). Unlisted or missing tickers cleanly return `is_valid: False` with a clear "NO REAL DATA FOUND" card.
- **Dynamic Multi-Agent Debate Arena** ([agent_arena.py](file:///c:/Users/drunk/Projects/ai-investment/backend/agents/agent_arena.py)): Bull, Bear, and CIO agents dynamically evaluate exact real-time prices, currencies, and technical moving average support levels without hardcoded verdicts.

### 4. UI Bug Fixes & Layover Isolation
- **Isolated Popover Component State** ([BilingualHoverCard.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/BilingualHoverCard.tsx)): Isolated hover popover state to individual metric cards, resolving the 3-window overlap bug when hovering inside stock recommendation cards.

---

## Verification & Test Results

### 1. Backend Pytest Suite
```powershell
$env:PYTHONPATH="."; .\backend\venv\Scripts\python -m pytest backend/tests/
```
**Result**: `17 passed in 12.70s` (100% Green).

### 2. Frontend Production Build
```powershell
cd frontend; npm run build
```
**Result**: Built clean with 0 TypeScript / bundling errors (`581.46 kB`).

---

## How to Run Locally

### 1. Launch FastAPI Backend Service
```powershell
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```
*Runs on `http://127.0.0.1:8000`.*

### 2. Launch React Frontend Dev Server
```powershell
cd frontend
npm run dev
```
*Runs on `http://localhost:3000`.*
