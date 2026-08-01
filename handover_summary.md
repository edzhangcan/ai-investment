# Project Handover & Context Summary: AI-Assisted Investment Platform

**Version**: `v0.1.0-phase1`  
**Git Branch**: `feature/phase-1-foundation`  
**Git Commit Tag**: `v0.1.0-phase1` (`f25d1af`)  
**Target Markets**: US ($NVDA, $AAPL, $MSFT) & Canada ($SHOP.TO, $TD.TO)  

---

## 1. Project Directory & Architecture Map

```
c:\Users\drunk\Projects\ai-investment
├── backend/
│   ├── agents/
│   │   └── agent_arena.py         # Multi-Agent Debate Arena (Bull vs Bear vs CIO)
│   ├── data_sources/
│   │   ├── data_provider.py       # Resilient yfinance + fallback stock data provider
│   │   └── fred_client.py         # FRED Macro indicators & Central Bank transcripts client
│   ├── engines/
│   │   ├── fundamental_engine.py  # FCF quality, Morningstar moats & 5-yr MD&A shift tracker
│   │   ├── macro_engine.py        # Cycle classifier (Overheat, Recovery, etc.) & Fed/BoC NLP score
│   │   └── pricing_engine.py      # Valuation percentiles, 2-stage DCF, 50D/200D SMA buy-zones
│   ├── models/
│   │   └── schemas.py             # Strongly-typed Pydantic schemas for API inputs/outputs
│   ├── routers/
│   │   ├── debate.py              # WebSocket live debate stream (/ws/debate/{ticker})
│   │   ├── macro.py               # REST macro analysis router (/api/macro)
│   │   └── stock.py               # REST stock analysis router (/api/stock/{ticker})
│   ├── tests/
│   │   └── test_engines.py        # Pytest unit tests (5/5 passing)
│   ├── config.py                  # Pydantic Settings & environment variable configuration
│   ├── main.py                    # FastAPI server entrypoint (run with python backend/main.py)
│   └── requirements.txt           # Python dependencies
├── frontend/
│   ├── data/
│   │   └── jargon_dictionary.json # 50+ financial terms with plain-language everyday analogies
│   ├── src/
│   │   ├── api/client.ts          # Strongly-typed API fetch client
│   │   ├── components/
│   │   │   ├── DebateArena.tsx    # Multi-agent debate theater UI (Bull, Bear, CIO verdict)
│   │   │   ├── JargonTooltip.tsx  # Zero-jargon hover cards & explainer tooltips
│   │   │   ├── MacroScannerBar.tsx# Macro economic cycle & sector rotation hero bar
│   │   │   └── PricingChart.tsx   # Recharts valuation bands & 50D/200D SMA buy-zone chart
│   │   ├── types/index.ts         # TypeScript domain interfaces
│   │   ├── App.tsx                # Main interactive dashboard frame
│   │   ├── index.css              # Tailwind CSS styles
│   │   └── main.tsx               # React DOM entrypoint
│   ├── package.json               # Node.js dependencies
│   └── vite.config.ts             # Vite bundler configuration
├── prd.md                         # Product Requirements Document
├── implementation_plan.md         # Technical Implementation Plan
├── epics_and_user_stories.md      # 6 Epics & 14 GitHub-formatted User Stories
├── ai_collaboration_proposal.md   # Subagent & AI Workflow Proposal
└── walkthrough.md                 # Complete verification & local setup instructions
```

---

## 2. Completed Phase 1 User Stories

| Issue | Title | Status | Verification |
| :--- | :--- | :--- | :--- |
| **#1** | Backend FastAPI Monorepo Setup & Data Provider Fallback | `DONE` | `pytest` 100% green |
| **#2** | FRED Macro Data & Central Bank Transcripts Pipeline | `DONE` | `pytest` 100% green |
| **#4** | Macro Engine: Economic Cycle Classifier & Sentiment Decoder | `DONE` | `pytest` 100% green |
| **#6** | Pricing Engine: Valuation Percentiles, DCF & 50D/200D SMA Overlay | `DONE` | `pytest` 100% green |
| **#7** | Agent Orchestrator with Empirical Proof Enforcement | `DONE` | `pytest` 100% green |
| **#8** | WebSocket Live Debate Streaming API (`/ws/debate/{ticker}`) | `DONE` | FastAPI route ready |
| **#9** | Jargon Context & Interactive Tooltip / Analogy Explainer | `DONE` | `<JargonTooltip>` component active |
| **#11**| Next.js / Vite React Dashboard Frame & Ticker Search | `DONE` | `npm run build` 0 errors |

---

## 3. How to Pick Up & Run Locally

### Start Backend FastAPI Server
```powershell
# In repository root c:\Users\drunk\Projects\ai-investment
.\backend\venv\Scripts\python backend/main.py
```
*Runs on `http://127.0.0.1:8000` with automatic reloader.*

### Start Frontend Dev Server
```powershell
cd frontend
npm run dev
```
*Runs on `http://localhost:3000`.*

### Run Backend Unit Tests
```powershell
# In repository root
$env:PYTHONPATH="."
.\backend\venv\Scripts\python -m pytest backend/tests/test_engines.py
```

### Run Frontend Production Build
```powershell
cd frontend
npm run build
```

---

## 4. Immediate Roadmap for Phase 2

When resuming in Phase 2, pick up from **Issue #3**, **Issue #5**, and **Issue #10**:

1. **Issue #3**: Enhance SEC EDGAR / SEDAR filings parser for full 10-K Item 7 text extraction.
2. **Issue #5**: Integrate live text diffing algorithm on 5-year MD&A forward-looking statement disclosures.
3. **Issue #10**: Expand "Translate to Plain Talk" global toggle across all agent debate bubbles and fundamental cards.
4. **LLM Integration**: Wire `google-genai` / `litellm` into `agent_arena.py` for live Gemini Pro / Flash prompt streaming.
