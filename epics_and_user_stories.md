# GitHub Issues Breakdown: Epics & User Stories

This document dissects the [Product Requirements Document (PRD)](file:///C:/Users/drunk/.gemini/antigravity/brain/d719dda4-b889-4a73-859d-f64d0c54e030/prd.md) into 6 GitHub Epics containing 14 actionable User Stories formatted as GitHub Issues.

---

## Overview Matrix

| Issue ID | Epic | Title | Priority | Story Points |
| :--- | :--- | :--- | :--- | :--- |
| **#1** | Epic 1: Infrastructure | Backend FastAPI Monorepo Setup & Data Provider Fallback | `P0` | 5 |
| **#2** | Epic 1: Infrastructure | FRED Macro Data & Central Bank Transcripts Pipeline | `P0` | 5 |
| **#3** | Epic 1: Infrastructure | SEC EDGAR / SEDAR Financial Filings Metric Extractor | `P1` | 8 |
| **#4** | Epic 2: Core Engines | Macro Engine: Economic Cycle Classifier & Sentiment Decoder | `P0` | 8 |
| **#5** | Epic 2: Core Engines | Fundamental Engine: 5-Yr Guidance Shift Tracker & Moat Assessor | `P1` | 8 |
| **#6** | Epic 2: Core Engines | Pricing Engine: Valuation Percentiles, DCF & 50D/200D SMA Overlay | `P0` | 8 |
| **#7** | Epic 3: Multi-Agent Arena | Agent Orchestrator with Empirical Proof Enforcement | `P0` | 13 |
| **#8** | Epic 3: Multi-Agent Arena | WebSocket Live Debate Streaming API (`/ws/debate/{ticker}`) | `P1` | 5 |
| **#9** | Epic 4: Beginner UX | Jargon Context & Interactive Tooltip / Analogy Explainer | `P0` | 5 |
| **#10** | Epic 4: Beginner UX | "Translate to Plain Talk" Global Interface Toggle | `P1` | 3 |
| **#11** | Epic 5: Frontend Dashboard | Next.js 14 Dashboard Frame, Macro Hero Bar & Search | `P0` | 5 |
| **#12** | Epic 5: Frontend Dashboard | Interactive Technical Buy-Zone & Valuation Chart (Recharts) | `P1` | 5 |
| **#13** | Epic 5: Frontend Dashboard | Multi-Agent Debate Theater UI (Framer Motion Stream) | `P1` | 8 |
| **#14** | Epic 6: Testing & QA | Automated Pytest Engine Suite & Next.js E2E Verification | `P0` | 5 |

---

## Epic 1: Infrastructure & Data Pipelines (基建与数据管线)

### Issue #1: [EPIC 1] Backend FastAPI Monorepo Setup & Data Provider Fallback
**Labels**: `epic:infrastructure`, `backend`, `fastapi`, `p0`

#### User Story
> **As a** developer  
> **I want to** establish a clean FastAPI backend architecture with dual-feed financial provider fallbacks  
> **So that** the application remains resilient and operational even if individual financial APIs fail or hit rate limits.

#### Description
Set up `/backend` with FastAPI, Pydantic schemas, CORS middleware, `.env` key management, and a unified `DataProviderManager` wrapper that abstracts `yfinance`, FRED API, and SEC EDGAR with caching.

#### Acceptance Criteria (BDD)
```gherkin
Given a request for stock ticker "AAPL"
When the primary financial API experiences a timeout or 429 rate limit
Then the DataProviderManager must automatically switch to the secondary open fallback feed
And return valid stock data with an empirical source tag without throwing an unhandled exception.
```

#### Tasks
- [ ] Initialize Python 3.14 virtual environment & `backend/requirements.txt`
- [ ] Implement `main.py` with FastAPI, CORS, and health check route (`/api/health`)
- [ ] Build `DataProviderManager` wrapper for `yfinance` + fallback cached JSON feeds
- [ ] Write unit test `tests/test_data_provider.py`

---

### Issue #2: [EPIC 1] FRED Macro Data & Central Bank Transcripts Pipeline
**Labels**: `epic:infrastructure`, `data-pipeline`, `macro`, `p0`

#### User Story
> **As a** Macro Analyst Agent  
> **I want to** automatically fetch US Federal Reserve and Bank of Canada economic data and meeting transcripts  
> **So that** I have real-time data to evaluate macroeconomic cycles.

#### Description
Build scraper/ingestion modules for FRED macroeconomic series (CPI, Core PCE, GDP, 10Y/2Y Treasury Spread) and central bank (FOMC / BoC) statement transcripts.

#### Acceptance Criteria (BDD)
```gherkin
Given scheduled execution or manual trigger
When the Macro Scraper executes
Then it fetches latest FRED series and FOMC / BoC press release text
And caches data locally in memory/disk cache with a timestamp header.
```

#### Tasks
- [ ] Create `backend/data_sources/fred_client.py` for fetching inflation, yield curve, and GDP series
- [ ] Create `backend/data_sources/central_bank_scraper.py` for fetching FOMC and Bank of Canada statement texts
- [ ] Add caching wrapper to prevent redundant web calls

---

### Issue #3: [EPIC 1] SEC EDGAR / SEDAR Filings Financial Metric & Guidance Parser
**Labels**: `epic:infrastructure`, `sec-edgar`, `sedar`, `p1`

#### User Story
> **As a** Fundamental Analyst Agent  
> **I want to** parse 10-K/10-Q Item 7 ("MD&A") sections for US and Canadian companies  
> **So that** I can extract Free Cash Flow (FCF), SaaS ARR/NRR, and compare historical guidance wording.

#### Description
Implement filing parsers to pull annual and quarterly filings from SEC EDGAR (US) and SEDAR (Canada), extracting financial statement lines and MD&A text blocks.

#### Acceptance Criteria (BDD)
```gherkin
Given ticker "NVDA" (US) or "SHOP.TO" (CA)
When the Filings Parser requests 10-K filings for the past 5 years
Then it extracts Operating Cash Flow, CapEx, Net Income, and Item 7 MD&A text section for each year.
```

#### Tasks
- [ ] Build `backend/data_sources/sec_edgar_parser.py` (US SEC 10-K XML/HTML parser)
- [ ] Build `backend/data_sources/sedar_parser.py` (Canadian SEDAR filing wrapper)
- [ ] Extract FCF formula ($\text{Operating Cash Flow} - \text{CapEx}$) and ARR/NRR metric tags

---

## Epic 2: Analytical Engines (核心分析引擎)

### Issue #4: [EPIC 2] Macro Engine: Economic Cycle Classifier & Sentiment Decoder
**Labels**: `epic:core-engines`, `macro`, `nlp`, `p0`

#### User Story
> **As an** investor  
> **I want** the system to automatically analyze Fed & BoC speeches and economic series to determine the economic cycle  
> **So that** I know which sectors (e.g., Tech vs. Energy vs. Utilities) are currently favored.

#### Description
Develop `macro_engine.py` to classify economic phases (Recovery, Overheat, Stagflation, Recession) and run NLP keyword shift analysis on Fed/BoC statements.

#### Acceptance Criteria (BDD)
```gherkin
Given high inflation data (CPI > 3.5%) and GDP growth > 2.5%
When the Macro Engine evaluates the indicators
Then it classifies the cycle as "Overheat"
And outputs sector weightings favoring Commodities/Energy (+20%) and underweighting Long-Duration Tech (-15%).
```

#### Tasks
- [ ] Implement `MacroEngine.classify_cycle(indicators)` logic
- [ ] Build Central Bank NLP Sentiment Decoder calculating hawkishness score (-1.0 to +1.0)
- [ ] Map economic cycle to sector rotation recommendation list

---

### Issue #5: [EPIC 2] Fundamental Engine: 5-Year Guidance Shift Tracker & Moat Assessor
**Labels**: `epic:core-engines`, `fundamentals`, `moat`, `p1`

#### User Story
> **As a** fundamental reviewer  
> **I want to** see changes in management guidance wording over 5 years and Morningstar moat scores  
> **So that** I can spot subtle risk warnings or erosion in competitive advantage before earnings crash.

#### Description
Develop `fundamental_engine.py` to perform text diffing on 5-year MD&A forward-looking statements and calculate competitive moat scores across 5 Morningstar factors.

#### Acceptance Criteria (BDD)
```gherkin
Given 5 years of MD&A text for a target stock
When the Fundamental Engine analyzes the text history
Then it flags any new defensive phrasing inserted in recent years (e.g., "headwinds", "margin compression")
And outputs FCF Yield, ARR, NRR, and Moat Score (Wide/Narrow/None).
```

#### Tasks
- [ ] Implement guidance wording diff engine comparing year $N$ vs $N-1$
- [ ] Build Morningstar Moat Evaluator (Switching Costs, Network Effects, Intangibles, Cost Advantage, Scale)
- [ ] Calculate FCF quality ratio ($\text{FCF} / \text{Net Income}$)

---

### Issue #6: [EPIC 2] Pricing Engine: Valuation Percentiles, DCF & 50D/200D SMA Overlay
**Labels**: `epic:core-engines`, `pricing`, `technical-analysis`, `dcf`, `p0`

#### User Story
> **As an** investor  
> **I want** concrete "Ideal Buy Zone" price brackets combining historical P/E bands, 2-stage DCF, and 50D/200D moving averages  
> **So that** I know exactly what price to wait for before buying a stock.

#### Description
Develop `pricing_engine.py` to compute valuation channels (10th, 50th, 90th P/E percentiles), a transparent 2-Stage DCF model, 50-day and 200-day SMAs, and produce precise buy brackets.

#### Acceptance Criteria (BDD)
```gherkin
Given stock ticker "MSFT" with current price $420, 200D SMA of $390, and DCF Fair Value of $395
When the Pricing Engine processes valuation and technical support
Then it outputs an "Ideal Buy Range" of $385.00 – $398.00
And flags current market price status as "Overvalued (+6.3% above buy range)".
```

#### Tasks
- [ ] Implement historical P/E and P/S percentile calculation
- [ ] Implement 2-stage Discounted Cash Flow (DCF) model
- [ ] Compute 50-day and 200-day SMA, RSI momentum, and generate Buy Bracket JSON output

---

## Epic 3: Multi-Agent Debate Arena (三方 Agent 辩论系统)

### Issue #7: [EPIC 3] Agent Orchestrator with Empirical Proof Enforcement
**Labels**: `epic:multi-agent`, `llm`, `bull-bear-cio`, `p0`

#### User Story
> **As a** user  
> **I want** a Bull Agent and Bear Agent to debate stock merits while a CIO Agent enforces empirical proof and renders a final decision  
> **So that** I receive a balanced, data-backed verdict without hallucinated claims.

#### Description
Build `agent_arena.py` orchestrating `BullAgent`, `BearAgent`, and `CIOAgent`. The CIO Agent rejects unsourced claims and outputs final action advice (`BUY`, `HOLD`, `PASS`) with portfolio sizing recommendation.

#### Acceptance Criteria (BDD)
```gherkin
Given a ticker analysis prompt
When Bull Agent makes an un-backed growth claim
Then CIO Agent flags the statement, demands metric verification (FCF / ARR), and weighs it against Bear Agent's valuation risks
And outputs final verdict with explicit Risk-Reward ratio.
```

#### Tasks
- [ ] Implement `BullAgent` prompt & logic (moats, growth drivers, cash flows)
- [ ] Implement `BearAgent` prompt & logic (valuation bubble, macro headwinds, guidance risks)
- [ ] Implement `CIOAgent` referee logic (fact checker, Risk-Reward calculator, position sizer)

---

### Issue #8: [EPIC 3] WebSocket Live Debate Streaming API (`/ws/debate/{ticker}`)
**Labels**: `epic:multi-agent`, `websocket`, `streaming`, `p1`

#### User Story
> **As a** frontend user  
> **I want** the agent debate to stream live round-by-round via WebSocket  
> **So that** I can watch the Bull vs Bear argument unfold interactively.

#### Description
Implement FastAPI WebSocket route `/ws/debate/{ticker}` that streams agent thought events, back-and-forth arguments, and final verdict chunks.

#### Acceptance Criteria (BDD)
```gherkin
Given a WebSocket connection to `/ws/debate/NVDA`
When the debate starts
Then the server streams JSON frames with `agent` ("Bull" | "Bear" | "CIO"), `content_chunk`, and `timestamp` attributes.
```

#### Tasks
- [ ] Implement `/ws/debate/{ticker}` WebSocket route in FastAPI
- [ ] Connect agent arena streaming generators to WebSocket connection manager

---

## Epic 4: Beginner Accessibility & Plain Language UX (初学者零术语体验)

### Issue #9: [EPIC 4] Jargon Context & Interactive Tooltip / Analogy Explainer
**Labels**: `epic:beginner-ux`, `jargon-dictionary`, `frontend`, `react`, `p0`

#### User Story
> **As a** retail beginner investor  
> **I want** every financial term (FCF, ARR, DCF, P/E, 200D MA) to be clickable/hoverable with plain-language explanations and real-world analogies  
> **So that** I never feel confused by complex Wall Street terminology.

#### Description
Create `jargon_dictionary.json` and a React `JargonTooltip` component that wraps financial terms in the UI, displaying instant non-technical explanations on hover or tap.

#### Acceptance Criteria (BDD)
```gherkin
Given any rendered page showing the term "FCF" or "ARR"
When the user hovers or taps on the highlighted term
Then a tooltip or modal pops up showing a 2-sentence plain-language explanation with an everyday analogy.
```

#### Tasks
- [ ] Create `frontend/data/jargon_dictionary.json` with 50+ financial definitions & everyday analogies
- [ ] Create `JargonContext.tsx` provider
- [ ] Build reusable `<JargonTooltip term="FCF">` component with tooltip & modal fallback

---

### Issue #10: [EPIC 4] "Translate to Plain Talk" Global Interface Toggle
**Labels**: `epic:beginner-ux`, `plain-talk-toggle`, `frontend`, `p1`

#### User Story
> **As a** beginner  
> **I want** a top-level toggle to switch the entire report between "Analyst View" and "Plain Talk View"  
> **So that** I can read stock analysis in simple everyday language.

#### Description
Add a global header toggle that transforms financial metric cards, agent debate summaries, and recommendations into simplified everyday phrasing.

#### Acceptance Criteria (BDD)
```gherkin
Given an analysis report showing "Free Cash Flow Yield: 6.2%"
When the user turns on the "Plain Talk" toggle
Then the label changes to "Pocket Cash Return: 6.2% (Strong Cash Generation)".
```

#### Tasks
- [ ] Implement state management for `isPlainTalkEnabled`
- [ ] Add bilingual / plain-text mapping helpers for metric cards and agent summaries

---

## Epic 5: Frontend Dashboard & Visualizations (前端看板与图形化展示)

### Issue #11: [EPIC 5] Next.js 14 Dashboard Frame, Macro Hero Bar & Ticker Search
**Labels**: `epic:frontend`, `nextjs`, `ui`, `p0`

#### User Story
> **As a** user  
> **I want** a modern, responsive dashboard with a macro cycle hero bar and ticker search  
> **So that** I can quickly inspect macro conditions and analyze US/CA stocks.

#### Description
Create Next.js 14 App Router layout (`frontend/app/page.tsx`), header search bar supporting US (`$AAPL`) and Canadian (`$SHOP.TO`) tickers, and Macro Scanner status bar.

#### Acceptance Criteria (BDD)
```gherkin
Given the main dashboard page
When a user types "SHOP.TO" in the search bar and submits
Then the page fetches stock analysis from `/api/stock/SHOP.TO` and updates all dashboard modules cleanly.
```

#### Tasks
- [ ] Set up Next.js 14 + Tailwind CSS + Lucide icons
- [ ] Build Header with Ticker Search input + CAD/USD currency switcher
- [ ] Build Macro Hero Bar displaying economic cycle indicator and sector overweights

---

### Issue #12: [EPIC 5] Interactive Technical Buy-Zone & Valuation Chart (Recharts)
**Labels**: `epic:frontend`, `recharts`, `pricing-chart`, `p1`

#### User Story
> **As an** investor  
> **I want to** view a price chart with 50D/200D moving averages, DCF fair value line, and highlighted "Buy Zone" bracket  
> **So that** I visually see if the stock is currently in a safe entry zone.

#### Description
Build `PricingChart.tsx` using Recharts to plot 1-year historical price, 50D/200D moving average lines, DCF fair value reference line, and colored "Ideal Buy Range" container.

#### Acceptance Criteria (BDD)
```gherkin
Given pricing data for a stock
When `PricingChart` renders
Then it draws the price line, 50D MA line, 200D MA line, and highlights the target buy price range with a soft green band.
```

#### Tasks
- [ ] Integrate Recharts into `/frontend`
- [ ] Build `PricingChart.tsx` with responsive container, tooltips, and green Buy-Zone reference band

---

### Issue #13: [EPIC 5] Multi-Agent Debate Theater UI (Framer Motion Stream)
**Labels**: `epic:frontend`, `framer-motion`, `debate-ui`, `p1`

#### User Story
> **As a** user  
> **I want** an animated chat-style debate arena where Bull, Bear, and CIO comments pop up dynamically  
> **So that** watching the multi-agent analysis is engaging and visually intuitive.

#### Description
Build `DebateArena.tsx` with Framer Motion animations to display live WebSocket debate streams from Bull Analyst (green card), Bear Analyst (red card), and CIO Referee (gold card).

#### Acceptance Criteria (BDD)
```gherkin
Given a live WebSocket debate stream
When new agent messages arrive
Then the UI animates message bubbles sliding into view with clear agent avatars (🐂 Bull, 🐻 Bear, 👨‍⚖️ CIO).
```

#### Tasks
- [ ] Add Framer Motion to `/frontend`
- [ ] Build `DebateArena.tsx` with agent avatar badges, speech bubbles, and CIO Verdict modal callout

---

## Epic 6: Quality Assurance & E2E Testing (质量保障与验证)

### Issue #14: [EPIC 6] Automated Pytest Engine Suite & Next.js E2E Verification
**Labels**: `epic:testing`, `pytest`, `e2e`, `p0`

#### User Story
> **As a** developer  
> **I want** automated unit tests for all backend calculation engines and frontend build verification  
> **So that** math models, cycle classifiers, and UI rendering never regress.

#### Description
Build unit tests for Macro Engine, Fundamental Engine, Pricing Engine, and Agent Arena, plus automated Next.js build validation.

#### Acceptance Criteria (BDD)
```gherkin
Given the backend codebase
When running `pytest`
Then all test suites pass with 0 errors and coverage over calculation engines.
```

#### Tasks
- [ ] Create `backend/tests/test_macro.py`
- [ ] Create `backend/tests/test_fundamental.py`
- [ ] Create `backend/tests/test_pricing.py`
- [ ] Create `backend/tests/test_agents.py`
- [ ] Set up frontend build verification script (`npm run build`)
