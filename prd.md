# Product Requirements Document (PRD): AI-Assisted Investment & Multi-Agent Debate Platform

**Document Version**: 1.0.0  
**Target Markets**: United States (US) & Canada (CA)  
**Status**: Pending Review  

---

## 1. Executive Summary & Product Vision

### 1.1 Mission Statement
Democratize institutional-grade equity and macroeconomic investment analysis for retail investors through an automated multi-agent AI system. The platform continuously monitors economic cycles, analyzes company fundamentals, computes valuation and technical entry zones, and orchestrates an adversarial debate (Bull vs. Bear vs. CIO) to deliver actionable, zero-jargon investment recommendations.

### 1.2 Core Pillars
1. **Macro Scanning (宏观扫描仪)**: North American (US Fed & Bank of Canada) economic cycle detection and sector rotation mapping.
2. **Fundamental Review (基本面审查官)**: Metric extraction (FCF, ARR, NRR, P/E), 5-year guidance wording delta tracking, and moat evaluation.
3. **Pricing & Technical Overlay (估值与择时器)**: Historical valuation bands, 50D/200D moving averages, mean reversion, and concrete buy-range triggers.
4. **Adversarial Multi-Agent Debate**: 🐂 Bull Agent vs. 🐻 Bear Agent refereed by a 👨‍⚖️ CIO Agent demanding empirical data evidence.
5. **Beginner Accessibility & Data Integrity**: Zero financial jargon without instant plain-language explanations; strict zero-hallucination policy ("严禁捏造数据").

---

## 2. Target Personas & Jobs-to-be-Done (JTBD)

### Personas
- **Primary: Beginner Retail Investor ("Alex")**
  - *Needs*: Clear, actionable investment advice free of confusing acronyms (FCF, ARR, DCF, NRR). Wants to avoid buying overhyped stocks at peak valuations.
- **Secondary: Semi-Pro / DIY Investor ("Jordan")**
  - *Needs*: Fast multi-perspective sanity checks (Bull vs. Bear argument debate), 5-year management statement drift analysis, and exact technical buy-zone targets.

### Key JTBD
> *"When I evaluate a stock or economic trend, I want to see both the growth potential and hidden downside risks clearly debated with real data, explained in plain language, so that I can make confident investment decisions with clear buy targets."*

---

## 3. Detailed Specifications & BDD Acceptance Criteria

### 3.1 Module 1: Macro Engine (宏观扫描仪)

#### Functional Scope
- **Data Ingestion**: Ingests Fed (FOMC) and Bank of Canada (BoC) rate decisions, speeches, press release transcripts, and key macroeconomic series (FRED: CPI, Core PCE, Unemployment, GDP Growth, 10Y/2Y Yield Curve).
- **Economic Cycle Classifier**: Categorizes the macroeconomic state into one of 4 canonical phases:
  1. *Recovery (复苏期)*: Low inflation, rising growth $\rightarrow$ Overweight Growth & Tech.
  2. *Overheat (过热期)*: High inflation, strong growth $\rightarrow$ Overweight Energy, Commodities, Industrials.
  3. *Stagflation (滞胀期)*: High inflation, slowing growth $\rightarrow$ Overweight Consumer Staples, Utilities, Gold.
  4. *Recession (衰退期)*: Falling inflation, negative growth $\rightarrow$ Overweight Fixed Income, Defensive High-Dividend.
- **Central Bank Sentiment Decoder**: Quantifies central bank hawkishness vs. dovishness via NLP score (-1.0 to +1.0) and tracks keyword frequency shifts (e.g. "patient", "transitory", "restrictive", "upside risks").

#### Acceptance Criteria (BDD)
```gherkin
Scenario: Automated Macro Economic Cycle & Sector Rotation Update
  Given Fed Core PCE data is released at 3.4% (above target) and BoC holds rates at 4.5%
  When the Macro Engine processes the latest economic series and central bank transcripts
  Then it must classify the current US & CA cycle (e.g., "Overheat / Late Expansion")
  And output recommended sector overweights (e.g., Energy & Financials) and underweights (e.g., Unprofitable Tech)
  And provide a plain-language summary: "Inflation remains sticky, so central banks are keeping interest rates high."
```

---

### 3.2 Module 2: Fundamental Engine (基本面审查官)

#### Functional Scope
- **Metric Extraction**: Sourced from SEC EDGAR (US) & SEDAR (CA) or financial data APIs:
  - Free Cash Flow (FCF) & FCF Yield
  - Annual Recurring Revenue (ARR) & Net Revenue Retention (NRR) for SaaS / Subscription businesses
  - P/E, P/S, EV/EBITDA, Debt-to-Equity, Operating Margin
- **Morningstar Economic Moat Scoring**: Evaluates 5 moat sources: Network Effects, Switching Costs, Cost Advantage, Intangible Assets, Efficient Scale.
- **5-Year Guidance Shift Tracker**: Compares 10-K/10-Q Item 7 ("MD&A") forward-looking statement sections over 5 consecutive years. Identifies added risk disclaimers, cautious phrasing inserts, or omitted growth targets.
- **Earnings Call Anomaly Detector**: Analyzes executive Q&A transcripts for defensive answers, manager stuttering/hedging words ("uncertainty", "headwinds", "challenging environment").

#### Acceptance Criteria (BDD)
```gherkin
Scenario: 5-Year Guidance Wording Delta Detection
  Given a user searches for company ticker "AAPL" or "SHOP.TO"
  When the Fundamental Engine analyzes 10-K filings from 2021 to 2026
  Then it must flag any new cautious forward-looking phrasing (e.g., "supply chain normalization constraints added in 2025")
  And highlight whether Free Cash Flow (FCF) growth matches reported Net Income growth.
```

---

### 3.3 Module 3: Pricing & Technical/Quant Engine (估值与择时器)

#### Functional Scope
- **Valuation Percentile Model**:
  - Computes 5-year historical P/E and P/S percentile channels (10th percentile = Deep Value, 50th = Fair Value, 90th = Overvalued).
  - Runs a simplified 2-Stage Discounted Cash Flow (DCF) model with transparent discount rate (WACC) and terminal growth rate assumptions.
- **Technical Overlay**:
  - Calculates 50-day and 200-day Simple Moving Averages (SMA).
  - Evaluates Mean Reversion distance ($\frac{\text{Price} - \text{SMA}_{200}}{\text{SMA}_{200}}$) and RSI momentum indicator.
  - Proxy Liquidity / Microstructure check to prevent slippage in recommended trade sizing.
- **Buy Zone Generator**: Synthesizes valuation lower-bounds with 50D/200D technical support lines to produce concrete price brackets:
  - *Ideal Buy Zone*: e.g., $140.00 – $148.50
  - *Fair Value Range*: e.g., $150.00 – $165.00
  - *Current Status*: e.g., "Overpriced by 12% relative to 50D MA"

#### Acceptance Criteria (BDD)
```gherkin
Scenario: Generating Actionable Technical Buy Bracket
  Given Ticker "MSFT" current price is $420, 200-Day SMA is $390, and DCF Fair Value is $395
  When the Pricing Engine evaluates valuation percentiles and technical support
  Then it must output an "Ideal Buy Range" of $385.00 – $398.00
  And advise the user: "Current price $420 is above the safe buying zone. Recommend setting a price alert at $398."
```

---

### 3.4 Module 4: Multi-Agent Debate System (三方 Agent 辩论系统)

#### Agent Responsibilities & Rules
1. 🐂 **Bull Agent (多头分析师)**:
   - Identifies competitive moats, ARR/FCF growth drivers, expansion opportunities, and positive macro tailwinds.
2. 🐻 **Bear Agent (空头分析师)**:
   - Scrutinizes overvaluation, margin compression, debt maturity cliffs, guidance wording shifts, and macro headwinds.
3. 👨‍⚖️ **CIO Agent (投委会主席 / 首席投资官)**:
   - Acts as impartial judge. Forces both agents to cite empirical numbers (no hand-waving).
   - Computes expected **Risk-Reward Ratio** (e.g. $2.50 upside per $1.00 downside risk).
   - Outputs final verdict: `PASS`, `HOLD / WATCH`, or `BUY`.

#### Acceptance Criteria (BDD)
```gherkin
Scenario: Multi-Agent Debate Execution with Empirical Proof Enforcement
  Given user triggers an analysis for Ticker "NVDA"
  When the Bull Agent claims "Revenue will double due to AI demand"
  Then the CIO Agent must require concrete proof (e.g., current Data Center ARR growth rate of 120%)
  And the Bear Agent must counter with valuation metrics (e.g., P/S ratio of 32x vs historical 15x average)
  And the CIO Agent must render a final verdict with explicit position sizing (e.g., "BUY max 3% portfolio allocation at or below $115").
```

---

### 3.5 Module 5: Beginner Accessibility & Zero-Hallucination Guardrails

#### Functional Specifications
- **Inline Smart Jargon Explainer**:
  - Every financial term (FCF, ARR, NRR, P/E, P/S, EV/EBITDA, DCF, 200D MA, Order Book) is wrapped in an interactive tag.
  - Hovering/tapping displays a non-technical 2-sentence explanation with real-world analogies (e.g., *"FCF / Free Cash Flow: The actual cash left in the company's pocket after paying all bills and building costs, like your savings after monthly expenses."*).
- **"Translate to Plain Talk" Global Toggle**:
  - Switches the interface view between "Institutional / Analyst View" and "Beginner / Plain Talk View".
- **Strict Data Transparency & Zero-Hallucination Gate**:
  - All financial metrics must carry an empirical source citation (`SEC 10-K FY2025`, `FRED Series CPIAUCSL`, `Yahoo Finance Live`).
  - If data is unavailable, the UI explicitly displays `[Data Pending / Unavailable]` rather than generating estimated figures.

---

## 4. Telemetry & Analytics Instrumentation Spec

| Event Name | Trigger Condition | Properties Recorded |
| :--- | :--- | :--- |
| `macro_scan_triggered` | Scheduled cron or user manual refresh | `cycle_stage`, `fed_sentiment_score`, `boc_sentiment_score` |
| `stock_analysis_requested` | User submits ticker search | `ticker`, `market` (US/CA), `price` |
| `agent_debate_completed` | CIO Agent issues verdict | `ticker`, `verdict` (BUY/HOLD/PASS), `risk_reward_ratio`, `buy_zone_min`, `buy_zone_max` |
| `jargon_tooltip_hovered` | User hovers/clicks financial term | `term` (e.g. FCF, DCF), `user_view_mode` |
| `plain_talk_toggled` | User toggles Plain Talk mode | `enabled` (boolean) |

---

## 5. Non-Functional Engineering Requirements (NFRs)

1. **Performance & Latency**:
   - Macro scan cache refresh: $\le 2$ seconds from redis/memory cache.
   - Multi-agent debate streaming: WebSocket token streaming response start $\le 1.5$ seconds.
2. **Reliability & Fallbacks**:
   - Dual-feed data architecture: primary financial API (e.g. FMP / SEC EDGAR) with automatic fallback to open feeds (`yfinance` / web search fallback).
3. **Localization & Market Coverage**:
   - Supports both USD ($) and CAD ($ CA) with automated currency conversion indicators.
   - Native Chinese (Simplified) and English bilingual interface support.
