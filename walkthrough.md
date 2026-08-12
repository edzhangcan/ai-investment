# Walkthrough - Release v3.5.0: Historical 5-Year Backtesting Engine & Quantitative Analytics

We have completed **Item #2**: **Historical 5-Year Backtesting Engine**, successfully deployed and pushed to branch `main` ([`86f3459`](https://github.com/edzhangcan/ai-investment/commit/86f3459)) with release tag **`v3.5.0`**.

---

## What Was Built

### 1. Backend Backtesting Engine (`BacktestEngine`)
- **`backtest_engine.py`** ([backtest_engine.py](file:///c:/Users/drunk/Projects/ai-investment/backend/engines/backtest_engine.py)):
  - Evaluates 5-year historical rolling annual return trajectories (2021–2025) for target stock portfolios vs S&P 500 (`SPY`) and TSX 60 (`XIU.TO`) benchmarks.
  - Computes quantitative risk and performance metrics:
    - **CAGR (%)**: Compound Annual Growth Rate over 5 years.
    - **Sharpe Ratio**: Risk-adjusted excess return per unit of volatility (risk-free rate = 3.5%).
    - **Max Drawdown (%)**: Peak-to-trough maximum percentage decline.
    - **Win Rate (%)**: Percentage of outperforming annual cycles.
  - Generates annual alpha breakdown (`portfolio_return - benchmark_return`).
  - Full multi-language support (`en`, `zh`, `hybrid`).

### 2. REST API Endpoints (`/api/backtest`)
- **`backtest.py`** ([backtest.py](file:///c:/Users/drunk/Projects/ai-investment/backend/routers/backtest.py)):
  - `GET /api/backtest/stock/{ticker}?benchmark=SPY&lang=en`: Returns single-stock 5-year backtest vs benchmark.
  - `POST /api/backtest/run`: Executes custom multi-stock portfolio backtest simulation.

### 3. Interactive Backtesting Viewer (`BacktestViewer.tsx`)
- **`BacktestViewer.tsx`** ([BacktestViewer.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/BacktestViewer.tsx)):
  - Embedded inside the single-stock analysis view in `App.tsx`.
  - Benchmark switcher buttons (`S&P 500 (SPY)` vs `TSX 60 (XIU.TO)`).
  - 4 Quantitative metric badges: CAGR (%), Sharpe Ratio, Max Drawdown (%), Win Rate (%).
  - Year-by-year annual performance breakdown table (2021 – 2025) with alpha badges.

---

## Verification Results

### 1. Live API Execution (`GET /api/backtest/stock/NVDA?benchmark=SPY&lang=zh`)
```json
{
  "portfolio_symbols": ["NVDA"],
  "benchmark": "SPY",
  "period_years": 5,
  "cagr_pct": 71.12,
  "benchmark_cagr_pct": 13.7,
  "alpha_cagr_pct": 57.42,
  "sharpe_ratio": 0.67,
  "max_drawdown_pct": 50.3,
  "win_rate_pct": 80.0,
  "total_return_pct": 1367.19,
  "benchmark_total_return_pct": 90.04,
  "summary_note": "5 年历史回测 (2021-2025)：组合年化复利收益率 (CAGR) 达 71.12%，超越 SPY 基准的 13.7%。夏普比率 (Sharpe Ratio) 为 0.67。"
}
```

### 2. Automated Pytest Test Suite
```powershell
$env:PYTHONPATH="."; .\backend\venv\Scripts\python -m pytest backend/tests/ -v
```
**Result**: **`28/28 Pytest tests passed`** in 29.17s (100% Green).

### 3. Frontend Production Build
```powershell
cd frontend; npm run build
```
**Result**: **`0 TypeScript errors`**, clean production bundle built (`632.09 kB`).

### 4. Git Release & Tag
- Committed and pushed to `main` (`86f3459`).
- Release Tag [`v3.5.0`](https://github.com/edzhangcan/ai-investment/releases/tag/v3.5.0) live on GitHub.
