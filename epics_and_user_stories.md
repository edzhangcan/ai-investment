# GitHub Issues Breakdown: Epics & User Stories

This document dissects the [Product Requirements Document (PRD)](file:///C:/Users/drunk/Projects/ai-investment/prd.md) and [Technical Implementation Plan v2.0](file:///C:/Users/drunk/Projects/ai-investment/implementation_plan_v2.md) into Epics containing actionable User Stories formatted as GitHub Issues.

---

## Overview Matrix & Execution Prioritization

| Issue ID | Epic | Title | Phase / Priority | RICE Score | Execution Order |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **#1 – #14** | Epics 1–6 | Phase 1 Foundation User Stories *(FastAPI, FRED, Pricing, Multi-Agent Arena, Jargon UI)* | `Phase 1 / DONE` | N/A | **Completed** |
| **#15** | Epic 1: Infrastructure | Real-Time Macroeconomic & Stock News Ingestion Pipeline (`news_client.py`) | `Phase 2A / P0` | 12.75 | **Step 1 (Data Layer)** |
| **#16** | Epic 2: Core Engines | In-Depth Macro Engine with Data Proof & Policy News Synthesis (`macro_engine.py`) | `Phase 2A / P0` | 29.69 | **Step 2 (Macro Engine)** |
| **#17** | Epic 2: Core Engines | Macro-Driven Top 3-5 Stock Recommendation Engine (`recommendation_engine.py`) | `Phase 2A / P0` | 20.77 | **Step 3 (Rec Engine)** |
| **#18** | Epic 1: Infrastructure | REST API Endpoints for Macro Dashboard & Stock News (`/api/macro/dashboard`) | `Phase 2A / P0` | 38.00 | **Step 4 (API Gateway)** |
| **#19** | Epic 5: Frontend Dashboard | Macro-First Landing Experience & Policy News UI (`MacroDashboard.tsx`) | `Phase 2B / P0` | N/A | **Phase 2B Step 1** |
| **#20** | Epic 5: Frontend Dashboard | Top 3-5 Recommended Stocks Grid & Drill-Down Navigation | `Phase 2B / P0` | N/A | **Phase 2B Step 2** |

---

## Phase 1 Epics & User Stories (#1 – #14)

*(Phase 1 User Stories #1 through #14 have been fully implemented and verified 100% green).*

---

## Phase 2A Execution Sequence (#15 $\rightarrow$ #16 $\rightarrow$ #17 $\rightarrow$ #18)

### Issue #15: [EPIC 1 / Phase 2A - Step 1] Real-Time Macroeconomic & Stock News Ingestion Pipeline
**Labels**: `phase-2a`, `data-pipeline`, `news`, `backend`, `p0`

#### User Story
> **As a** macro analyst & investor  
> **I want** the system to automatically fetch real-time macroeconomic policy news and stock-specific headlines from verified feeds  
> **So that** investment recommendations reflect the latest central bank policies and news events with credible source citations.

#### Description
Build `backend/data_sources/news_client.py` using open financial & policy news feeds (`Google News RSS`, `Yahoo Finance RSS`, `SEC Press Releases`), returning structured news payloads with caching.

#### Acceptance Criteria (BDD)
```gherkin
Given a request for macro or stock news
When NewsClient executes
Then it returns valid news items with title, source_name, url, published_at, and credibility tier tag
And caches responses locally to prevent rate limiting.
```

#### Tasks
- [ ] Create `backend/data_sources/news_client.py`
- [ ] Add RSS news parsers for macro policy news and stock-specific news
- [ ] Add in-memory cache wrapper (15-min TTL)

---

### Issue #16: [EPIC 2 / Phase 2A - Step 2] In-Depth Macro Engine with Data Proof & Policy News Synthesis
**Labels**: `phase-2a`, `macro-engine`, `zero-hallucination`, `backend`, `p0`

#### User Story
> **As an** investor  
> **I want** an in-depth macroeconomic evaluation displaying hard data points (CPI, GDP, 10Y/2Y yield spreads) and central bank policy news with clickable source citations  
> **So that** I receive a trustworthy macro cycle assessment with zero hallucinated claims.

#### Description
Upgrade `backend/engines/macro_engine.py` to synthesize narrative cycle assessment, empirical supporting facts list, and policy news feed with strict source citation registries.

#### Acceptance Criteria (BDD)
```gherkin
Given scheduled execution or manual trigger
When MacroEngine runs evaluate_macro_dashboard()
Then it returns cycle stage narrative, supporting indicator proof array (with source tags), and latest policy news items.
```

#### Tasks
- [ ] Upgrade `MacroEngine` to output detailed cycle assessment narrative
- [ ] Build empirical source citation registry (`FRED CPIAUCSL`, `FOMC Statement`, `BoC Press Release`)
- [ ] Integrate policy news synthesis

---

### Issue #17: [EPIC 2 / Phase 2A - Step 3] Macro-Driven Top 3-5 Stock Recommendation Engine
**Labels**: `phase-2a`, `recommendation-engine`, `macro-to-stock`, `backend`, `p0`

#### User Story
> **As a** beginner investor  
> **I want** the system to analyze current macroeconomic conditions and automatically recommend 3-5 specific US & Canadian stocks with "Why Invest Now" rationale and company business background  
> **So that** I receive actionable, well-explained stock picks without needing to know stock tickers upfront.

#### Description
Create `backend/engines/recommendation_engine.py` evaluating equities against current macro cycle phase and sector rotation overweights to select 3-5 top picks.

#### Acceptance Criteria (BDD)
```gherkin
Given current macro cycle "Overheat / Late Expansion"
When RecommendationEngine evaluates the US & Canadian stock universe
Then it selects 3 to 5 top recommended stocks (e.g., NVDA, MSFT, SHOP.TO, TD.TO, AAPL)
And outputs "Why Recommend" rationale, company business model overview, key snapshot metrics, and downside risk callouts.
```

#### Tasks
- [ ] Create `backend/engines/recommendation_engine.py`
- [ ] Implement macro cycle alignment scoring matrix
- [ ] Generate "Why Recommend" rationale & company business background overview

---

### Issue #18: [EPIC 1 / Phase 2A - Step 4] REST API Endpoints for Macro Dashboard & Stock News
**Labels**: `phase-2a`, `fastapi`, `api-router`, `backend`, `p0`

#### User Story
> **As a** frontend developer  
> **I want** unified REST API endpoints `/api/macro/dashboard` and `/api/stock/{ticker}/news`  
> **So that** the frontend dashboard can load the macro assessment, policy news, top 3-5 recommendations, and company background in fast, single API calls.

#### Description
Add `GET /api/macro/dashboard` endpoint in `backend/routers/macro.py` and `GET /api/stock/{ticker}/news` endpoint in `backend/routers/stock.py`, with Pytest coverage.

#### Acceptance Criteria (BDD)
```gherkin
Given a GET request to /api/macro/dashboard
When the server processes the request
Then it returns JSON containing macro_assessment, supporting_facts, policy_news, and recommended_stocks array (3-5 items).
```

#### Tasks
- [ ] Implement `GET /api/macro/dashboard` in `backend/routers/macro.py`
- [ ] Implement `GET /api/stock/{ticker}/news` in `backend/routers/stock.py`
- [ ] Write unit tests in `backend/tests/test_recommendation.py` and `backend/tests/test_news.py`
