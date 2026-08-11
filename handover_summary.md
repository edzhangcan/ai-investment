# Project Handover & Context Summary: AI-Assisted Investment Platform

**Version**: `v2.0.0-macro-first`  
**Git Branch**: `feature/phase-2-enhancements`  
**Target Markets**: US ($NVDA, $AAPL, $MSFT) & Canada ($SHOP.TO, $TD.TO)  

---

## 1. Project Directory & Architecture Map

```
c:\Users\drunk\Projects\ai-investment
├── backend/
│   ├── agents/
│   │   └── agent_arena.py         # Multi-Agent Debate Arena (Bull vs Bear vs CIO with live Gemini LLM integration)
│   ├── data_sources/
│   │   ├── data_provider.py       # Resilient yfinance + SEC EDGAR & SEDAR data provider
│   │   ├── fred_client.py         # FRED Macro indicators & Central Bank transcripts client
│   │   ├── news_client.py         # RSS & Financial News Client for Macro Policy & Stock News
│   │   ├── sec_edgar_parser.py    # US SEC EDGAR 10-K/XBRL company facts & Item 7 MD&A parser
│   │   └── sedar_parser.py        # Canadian SEDAR+ TSX filings parser ($SHOP.TO, $TD.TO)
│   ├── engines/
│   │   ├── fundamental_engine.py  # 5-factor Morningstar Moat Scoring, 5-yr MD&A text diffing & FCF quality
│   │   ├── macro_engine.py        # Cycle classifier (Overheat, Recovery, etc.) & Fed/BoC NLP score
│   │   ├── pricing_engine.py      # Valuation percentiles, 2-stage DCF, 50D/200D SMA buy-zones
│   │   └── recommendation_engine.py # Macro-driven TOP 3-5 Stock Recommendation Engine
│   ├── models/
│   │   └── schemas.py             # Strongly-typed Pydantic schemas for API inputs/outputs
│   ├── routers/
│   │   ├── debate.py              # WebSocket live debate stream (/ws/debate/{ticker})
│   │   ├── macro.py               # REST macro analysis & dashboard router (/api/macro, /api/macro/dashboard)
│   │   └── stock.py               # REST stock analysis router (/api/stock/{ticker})
│   ├── tests/
│   │   ├── test_agents.py         # Pytest for Multi-Agent Arena debate outputs
│   │   ├── test_engines.py        # Pytest for calculation engines
│   │   ├── test_fundamental.py    # Pytest for 5-factor Moat & MD&A text diffing
│   │   ├── test_news.py           # Pytest for Central Bank policy news client
│   │   ├── test_recommendation.py # Pytest for TOP 3-5 recommendation engine
│   │   ├── test_router_macro.py   # Pytest for REST macro dashboard endpoint
│   │   └── test_sec_edgar.py      # Pytest for SEC EDGAR & SEDAR parsers
│   ├── config.py                  # Pydantic Settings & environment variable configuration
│   ├── main.py                    # FastAPI server entrypoint (run with python backend/main.py)
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── data/
│   │   └── jargon_dictionary.json # 50+ financial terms with plain-language everyday analogies
│   ├── src/
│   │   ├── api/client.ts          # Strongly-typed API fetch client (fetchMacroDashboard, fetchStockAnalysis)
│   │   ├── components/
│   │   │   ├── BilingualHoverCard.tsx # Bilingual EN/ZH hover layover provider
│   │   │   ├── DebateArena.tsx    # Multi-agent debate theater UI (Bull, Bear, CIO verdict)
│   │   │   ├── JargonTooltip.tsx  # Zero-jargon hover cards & explainer tooltips
│   │   │   ├── MacroDashboard.tsx # North American Economic Cycle & Policy News feed component
│   │   │   ├── MacroScannerBar.tsx# Macro economic cycle & sector rotation hero bar
            ├── RecommendedStocksGrid.tsx # TOP 3-5 Stock Recommendations Grid component
│   │   │   └── PricingChart.tsx   # Recharts valuation bands & 50D/200D SMA buy-zone chart
│   │   ├── types/index.ts         # TypeScript domain interfaces
│   │   ├── App.tsx                # Main interactive dashboard frame with Navigation Tabs system
│   │   ├── index.css              # Tailwind CSS styles
│   │   └── main.tsx               # React DOM entrypoint
│   ├── package.json               # Node.js dependencies
│   └── vite.config.ts             # Vite bundler configuration
├── prd.md                         # Product Requirements Document
├── implementation_plan.md         # Technical Implementation Plan
├── implementation_plan_v2.md      # Macro-First & Stock Recommendation Plan (v2.0)
├── epics_and_user_stories.md      # 6 Epics & 14 GitHub-formatted User Stories
├── ai_collaboration_proposal.md   # Subagent & AI Workflow Proposal
└── walkthrough.md                 # Complete verification & local setup instructions
```

---

## 2. Completed Features & User Stories Status

| Module | Title | Status | Verification |
| :--- | :--- | :--- | :--- |
| **Backend Core** | FastAPI Monorepo Setup & Data Provider Fallback | `DONE` | `pytest backend/tests/` 100% green (17/17 passed) |
| **Data Ingestion** | FRED Macro Data, Central Bank Transcripts & Policy News | `DONE` | `test_news.py` 100% green |
| **Filings Parser** | SEC EDGAR / SEDAR Filings Financial Metric & Guidance Parser | `DONE` | `test_sec_edgar.py` 100% green |
| **Macro Engine** | Economic Cycle Classifier & Central Bank Sentiment Decoder | `DONE` | `pytest` 100% green |
| **Fundamental Engine** | 5-Yr Guidance Shift Tracker & Morningstar Moat Assessor | `DONE` | `test_fundamental.py` 100% green |
| **Pricing Engine** | Valuation Percentiles, DCF & 50D/200D SMA Buy-Zone Overlay | `DONE` | `pytest` 100% green |
| **Recommendation Engine** | TOP 3-5 Macro-Driven Stock Recommendation Engine | `DONE` | `test_recommendation.py` 100% green |
| **Agent Arena** | Multi-Agent Debate Arena (Bull vs Bear vs CIO Verdict with Gemini LLM) | `DONE` | `test_agents.py` 100% green |
| **Frontend UI (Tab 1)** | Macro & Policy News Dashboard Component (`MacroDashboard.tsx`) | `DONE` | `npm run build` 0 errors |
| **Frontend UI (Tab 1)** | TOP 3-5 Stock Recommendation Grid (`RecommendedStocksGrid.tsx`) | `DONE` | `npm run build` 0 errors |
| **Frontend UI (Tab 2)** | Single Stock Deep-Dive Page with Drill-Down Navigation | `DONE` | `npm run build` 0 errors |
| **Plain-Talk Mode** | "Translate to Plain Talk" Global Interface & Bilingual Hover Layovers | `DONE` | `<BilingualHoverCard>` active |
| **Pytest Test Suite** | 17 Automated Unit & Integration Tests | `DONE` | `17 passed in 14.28s` |

---

## 3. How to Run Locally

### Start Backend FastAPI Server
```powershell
# In repository root c:\Users\drunk\Projects\ai-investment
$env:PYTHONPATH="."
.\backend\venv\Scripts\python backend/main.py
```
*Runs on `http://127.0.0.1:8000` with automatic reloader.*

### Start Frontend Dev Server
```powershell
cd frontend
npm run dev
```
*Runs on `http://localhost:3000`.*

### Run Full Backend Pytest Suite
```powershell
# In repository root
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/
```

### Run Frontend Production Build
```powershell
cd frontend
npm run build
```
