# Walkthrough - Release v3.4.0: Portfolio Position Sizing & Rebalancing Calculator

We have completed **Item #1 on the RICE Backlog**: **Portfolio Position Sizing & Rebalancing Calculator**, successfully deployed and pushed to branch `main` ([`641ea76`](https://github.com/edzhangcan/ai-investment/commit/641ea76)) with release tag **`v3.4.0`**.

---

## What Was Built

### 1. Backend Portfolio Sizing Engine (`PortfolioEngine`)
- **`portfolio_engine.py`** ([portfolio_engine.py](file:///c:/Users/drunk/Projects/ai-investment/backend/engines/portfolio_engine.py)):
  - Evaluates user capital (e.g. $50,000 USD/CAD) against 3 risk profile models:
    - 🛡️ **Conservative**: Max 3% per stock, 40% Cash Buffer, 60% Equity Allocation.
    - ⚖️ **Balanced**: Max 5% per stock, 20% Cash Buffer, 80% Equity Allocation.
    - 🚀 **Aggressive**: Max 8% per stock, 10% Cash Buffer, 90% Equity Allocation.
  - Calculates target portfolio weights (%), dollar allocations ($), and **exact executable share counts** using `floor(Target Amount / Current Price)`.
  - Computes residual unallocated cash buffers retained in portfolio reserves.
  - Full multi-language support (`en`, `zh`, `hybrid`).

### 2. REST API Endpoint (`/api/portfolio/calculate`)
- **`portfolio.py`** ([portfolio.py](file:///c:/Users/drunk/Projects/ai-investment/backend/routers/portfolio.py)):
  - `POST /api/portfolio/calculate` endpoint accepting `{ cash_balance, risk_profile, currency, symbols, lang }` and returning structured position breakdown JSON.

### 3. Interactive Frontend Portfolio Calculator (`PortfolioCalculator.tsx`)
- **`PortfolioCalculator.tsx`** ([PortfolioCalculator.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/PortfolioCalculator.tsx)):
  - Embedded in header navigation trigger button (`Calculator`).
  - Interactive capital input field with preset buttons (`$10k`, `$25k`, `$50k`, `$100k`, `$250k`).
  - Risk profile toggle buttons (`🛡️ Conservative`, `⚖️ Balanced`, `🚀 Aggressive`).
  - Real-time share sizing table with exact executable share counts (e.g. `11 shares of $NVDA`), allocation amounts, and residual cash reserve gauge.

---

## Verification Results

### 1. Live API Execution (`POST /api/portfolio/calculate`)
```json
{
  "cash_balance": 50000.0,
  "currency": "USD",
  "risk_profile": "BALANCED",
  "risk_profile_label": "⚖️ 稳健型 (攻守兼备)",
  "equity_allocation_pct": 80.0,
  "cash_buffer_pct": 20.0,
  "total_allocated_dollars": 26911.6,
  "residual_unallocated_cash": 23088.4,
  "position_breakdown": [
    { "symbol": "NVDA", "current_price": 217.5, "target_weight_pct": 5.0, "executable_shares": 11, "actual_allocated_amount": 2392.5 },
    { "symbol": "SU.TO", "current_price": 88.25, "target_weight_pct": 5.0, "executable_shares": 28, "actual_allocated_amount": 2471.0 },
    { "symbol": "CRWD", "current_price": 221.9, "target_weight_pct": 5.0, "executable_shares": 11, "actual_allocated_amount": 2440.9 }
  ]
}
```

### 2. Automated Pytest Test Suite
```powershell
$env:PYTHONPATH="."; .\backend\venv\Scripts\python -m pytest backend/tests/ -v
```
**Result**: **`26/26 passed`** in 26.05s (100% Green).

### 3. Frontend Production Build
```powershell
cd frontend; npm run build
```
**Result**: **`0 TypeScript errors`**, clean production bundle built (`626.27 kB`).

### 4. Git Release & Tag
- Committed and pushed to `main` (`641ea76`).
- Release Tag [`v3.4.0`](https://github.com/edzhangcan/ai-investment/releases/tag/v3.4.0) live on GitHub.
- Servers active on [http://localhost:3000](http://localhost:3000).
