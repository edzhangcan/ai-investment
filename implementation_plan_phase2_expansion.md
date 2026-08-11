# Implementation Plan - Phase 2 Intelligence Expansion & Multi-Category Recommendations

This proposal specifies the detailed User Stories, Acceptance Criteria (Given/When/Then format), Prompt Engineering designs, and technical architecture for:
1. **Multi-Category Stock Recommendation Engine Expansion** (*Highest Priority New Requirement*)
2. **SaaS Subscription Metric Tracker (ARR / NRR) & Morningstar 5-Factor Moat Automation** (*Phase 2 Item #5*)

---

## 📖 Story 1 (Highest Priority): Multi-Category Macro Recommendation Expansion

### 🎯 Story Specification
- **As an** investor in US & Canadian markets,
- **I want** top stock recommendations categorized into 3 distinct strategic pools:
  1. **Sector Overweight Champions** (4 stocks strictly aligned with current macro overweight sectors with alignment scores),
  2. **Overall Market Leaders** (4-6 high-conviction mega/large-cap core holdings),
  3. **Hidden Gold Nuggets (隐形金矿股)** (4-6 non-mainstream / mid-cap / niche growth stocks with stellar cash flow metrics and high upside potential),
- **So that** my portfolio balances macro sector positioning, blue-chip stability, and high-upside alpha generation without sector misalignment.

### 🧪 Acceptance Criteria (Given / When / Then)

#### Scenario 1: Sector Overweight Alignment Enforcer
- **Given** the Macro Scanner identifies cycle stage `OVERHEAT` with `recommended_overweights: ["Energy & AI Infrastructure", "Financials & Banks"]`,
- **When** `RecommendationEngine.get_recommendations()` executes,
- **Then** all 4 stocks in `sector_overweight_stocks` MUST belong strictly to Energy, Tech Infrastructure, or Financials, with `macro_alignment_score >= 0.85`.

#### Scenario 2: Hidden Gold Nuggets (隐形金矿股) Discovery
- **Given** candidate pool of US and TSX equities,
- **When** generating `gold_nugget_stocks`,
- **Then** the engine MUST filter out top 10 mega-caps (e.g. $AAPL, $MSFT, $NVDA), selecting 4-6 mid-cap/niche leaders with:
  - FCF Conversion Rate ($\text{FCF} / \text{Net Income} \ge 1.0$),
  - Revenue Growth $\ge 15\%$,
  - Economic Moat Rating (`Wide Moat` or `Narrow Moat`),
  - Clear rationale explaining why it is overlooked by mainstream retail investors.

#### Scenario 3: UI Multi-Category Grid Navigation
- **Given** the user is viewing Tab 1 (`📊 Macro Scan & Top Stock Recommendations`),
- **When** scrolling to the recommendations section,
- **Then** 3 tabbed / sectioned card grids MUST display:
  - 🟢 **Category 1: Sector Overweight Champions (4 Stocks)**
  - 🔵 **Category 2: Overall Market Leaders (4-6 Stocks)**
  - 🪙 **Category 3: Hidden Gold Nuggets 隐形金矿股 (4-6 Stocks)**

---

## 🤖 Prompt Engineering Optimization Strategy

We optimize `backend/engines/recommendation_engine.py` using structured JSON schemas, zero-hallucination empirical guardrails, and category-specific exemplars.

### Optimized System Prompt Template (`RecommendationEngine`)

```text
SYSTEM PROMPT: You are the Chief Investment Officer (CIO) and Senior Quantitative Analyst.
Your task is to generate 3 distinct lists of verified stock recommendations for US & Canadian equity markets based strictly on empirical macro data.

STRICT GUARDRAILS:
1. NEVER fabricate current prices, P/E ratios, or FCF figures.
2. CATEGORY 1 (sector_overweight_stocks): Exactly 4 stocks belonging STRICTLY to macro overweight sectors.
3. CATEGORY 2 (overall_recommended_stocks): 4-6 high-conviction mega/large-cap market leaders.
4. CATEGORY 3 (gold_nugget_stocks): 4-6 non-mainstream / mid-cap / niche growth stocks with stellar FCF quality and high upside potential (exclude top 10 mega-caps).

JSON OUTPUT SCHEMA:
{
  "macro_cycle_code": "OVERHEAT",
  "sector_overweight_stocks": [ ... 4 items ... ],
  "overall_recommended_stocks": [ ... 4-6 items ... ],
  "gold_nugget_stocks": [ ... 4-6 items ... ]
}
```

---

## 📖 Story 2: SaaS Metric Tracker (ARR / NRR) & Automated Moat Scorer

### 🎯 Story Specification
- **As a** fundamental analyst reviewing subscription & software equities ($SHOP.TO, $MSFT, $CRM),
- **I want** automated tracking of Annual Recurring Revenue (ARR), Net Revenue Retention (NRR), and 5-Factor Morningstar Moat Scoring,
- **So that** I can assess SaaS cash flow durability and competitive moat strength automatically.

### 🧪 Acceptance Criteria (Given / When / Then)

#### Scenario 1: SaaS Subscription Metric Extraction
- **Given** a software ticker (e.g. $SHOP.TO or $MSFT),
- **When** `FundamentalEngine.evaluate_fundamentals()` runs,
- **Then** the result includes:
  - `arr_billions`: Annualized recurring revenue in $B,
  - `nrr_pct`: Net revenue retention percentage (e.g. `118%`),
  - `saas_health_badge`: `"High Retention (115%+ NRR)"`.

#### Scenario 2: Morningstar 5-Factor Moat Scoring
- **Given** any stock candidate,
- **When** evaluating moat rating,
- **Then** the engine computes individual scores (0 to 10) across 5 factors:
  1. Network Effects (网络效应)
  2. Switching Costs (转换成本)
  3. Cost Advantage (成本优势)
  4. Intangible Assets / Patents (无形资产/专利)
  5. Efficient Scale (有效规模)

---

## 📁 Proposed Technical Changes

### Backend Component Modifications
- [MODIFY] `backend/models/schemas.py`: Update `StockRecommendation`, `StockRecommendationResponse`, and `FundamentalReview` Pydantic models to support 3 recommendation categories and SaaS ARR/NRR/Moat factor breakdown.
- [MODIFY] `backend/data_sources/data_provider.py`: Add baseline data for Gold Nugget candidates (e.g. $CELH, $ONT.TO, $CSU.TO, $MELI, $CRWD, $NET).
- [MODIFY] `backend/engines/recommendation_engine.py`: Implement multi-category generation pipeline.
- [MODIFY] `backend/engines/fundamental_engine.py`: Implement 5-Factor Moat scoring matrix and ARR/NRR extraction.
- [MODIFY] `backend/routers/macro.py`: Return expanded 3-category recommendations payload in `GET /api/macro/dashboard`.

### Frontend Component Modifications
- [MODIFY] `frontend/src/types/index.ts`: Update TypeScript interfaces for `StockRecommendation` and `MacroDashboardResponse`.
- [MODIFY] `frontend/src/components/RecommendedStocksGrid.tsx`: Redesign component into a multi-category tabbed / sectioned grid with category badges (🟢 Sector Champions, 🔵 Overall Leaders, 🪙 Hidden Gold Nuggets).

---

## 🧪 Verification & Test Plan

1. **Pytest Engine Tests (`backend/tests/test_recommendation.py`)**:
   - Verify `sector_overweight_stocks` count == 4 and macro alignment score >= 0.85.
   - Verify `overall_recommended_stocks` count between 4 and 6.
   - Verify `gold_nugget_stocks` count between 4 and 6, and verify mega-caps are excluded.
   - Verify SaaS ARR / NRR metric parsing for $SHOP.TO and $MSFT.
2. **Frontend Build & UI Verification**:
   - Run `npm run build` in `/frontend`.
   - Verify category switcher tabs on [http://localhost:3000](http://localhost:3000).
