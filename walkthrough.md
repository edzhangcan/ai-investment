# Walkthrough - Phase 2 Wrap-up: Full SEC EDGAR 10-K & SEDAR+ Text Mining Pipeline

We have completed the **Full SEC EDGAR 10-K & SEDAR+ Text Mining Pipeline**, successfully concluding all core intelligence objectives of **Phase 2** on branch `main` (`8722d5f`).

---

## What Was Built

### 1. Backend Text Mining Engine (`SECTextMiner`)
- **`sec_text_miner.py`** ([sec_text_miner.py](file:///c:/Users/drunk/Projects/ai-investment/backend/engines/sec_text_miner.py)):
  - Parses 5-year historical MD&A filings (Item 7 for US SEC 10-K, Annual MD&A for Canadian SEDAR+).
  - Calculates Levenshtein string distance & Cosine similarity ratio between consecutive filing years (2021–2025).
  - Extracts inserted & removed management risk disclaimers.
  - Tracks Year-over-Year (YoY) frequency trends for key risk keywords (`AI CapEx`, `export controls`, `supply chain`, `foreign exchange`, `macro uncertainty`).
  - Supports multi-language output (`en`, `zh`, `hybrid`).

### 2. REST API Endpoint
- **`GET /api/stock/{ticker}/filings/mining?lang=en|zh|hybrid`** ([stock.py](file:///c:/Users/drunk/Projects/ai-investment/backend/routers/stock.py)):
  - Returns structured 5-year text mining timeline, disclaimer deltas, and keyword frequency trends.

### 3. Frontend React Text Mining Viewer (`SecTextMiningViewer.tsx`)
- **`SecTextMiningViewer.tsx`** ([SecTextMiningViewer.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/components/SecTextMiningViewer.tsx)):
  - Embedded inside the single stock view in [App.tsx](file:///c:/Users/drunk/Projects/ai-investment/frontend/src/App.tsx).
  - Interactive year-by-year comparison buttons (`2025 vs 2024`, `2024 vs 2023`, `2023 vs 2022`).
  - Color-coded severity badges (`🔴 High Caution`, `🟡 Moderate Caution`, `🟢 Minimal Change`).
  - Extracted Risk Keyword Trend Pills (e.g. `AI CapEx (48x) +120%`).

---

## Verification Results

### 1. Automated Pytest Test Suite
```powershell
$env:PYTHONPATH="."; .\backend\venv\Scripts\python -m pytest backend/tests/ -v
```
**Result**: `24/24 passed` in 17.32s (100% Green).

### 2. Frontend Production Build
```powershell
cd frontend; npm run build
```
**Result**: `0 TypeScript errors`, clean production bundle built (`616.54 kB`).

### 3. Git Commit & Push
- Committed and pushed to `main` (`8722d5f`).
- Servers active on [http://localhost:3000](http://localhost:3000).
