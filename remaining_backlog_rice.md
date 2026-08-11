# RICE Prioritized Remaining Backlog & Phase Roadmap (Updated v3.1.0)

This document outlines the remaining backlog for the **AI-Assisted Investment & Multi-Agent Debate Platform**, prioritized using the **RICE Framework** (Reach $\times$ Impact $\times$ Confidence / Effort) and grouped logically into execution phases.

---

## 📐 RICE Framework Scoring Key

$$\text{RICE Score} = \frac{\text{Reach (0-100)} \times \text{Impact (0.25-3.0)} \times \text{Confidence (50\%-100\%)}}{\text{Effort (Person-Weeks / Points)}}$$

---

## 🏆 RICE Prioritization Master Table (Updated v3.1.0)

| Rank | Backlog Item | Phase | Status | Reach | Impact | Confidence | Effort | **RICE Score** |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| -- | **Multi-Category Stock Recommendation Engine (3 Pools, Zero Overlap)** | Phase 2 | **✅ DONE (v3.1.0)** | 100 | 3.0 | 95% | 3 | ~~95.00~~ |
| -- | **End-to-End Internationalization (i18n) Engine (EN / 中文 / Hybrid)** | Phase 2 | **✅ DONE (v3.1.0)** | 100 | 3.0 | 95% | 3 | ~~95.00~~ |
| -- | **Price Alert Triggers & Notification Engine** | Phase 2 | **✅ DONE (v3.0.0)** | 90 | 3.0 | 90% | 4 | ~~60.75~~ |
| -- | **React ErrorBoundary & Production Quality Audit** | Phase 4 | **✅ DONE (v3.1.0)** | 100 | 2.0 | 100% | 1 | ~~200.00~~ |
| **#1** | **GitHub Actions CI/CD Pipeline & Docker Containerization** | Phase 4 | **NEXT** | 100 | 1.0 | 100% | 2 | **50.00** |
| **#2** | **Portfolio Position Sizing & Rebalancing Calculator** | Phase 3 | Pending | 75 | 2.0 | 85% | 3 | **42.50** |
| **#3** | **Exportable PDF / Styled Markdown Investment Memos** | Phase 4 | Pending | 50 | 1.5 | 90% | 2 | **33.75** |
| **#4** | **Full SEC EDGAR 10-K & SEDAR+ Text Mining Pipeline** | Phase 2 | Pending | 80 | 2.0 | 90% | 5 | **28.80** |

---

## 🗓️ Phase-by-Phase Execution Roadmap

```mermaid
graph TD
    subgraph Completed Milestones v3.1.0
        F1[FastAPI + React Monorepo]
        F2[Macro Scanner & Policy News]
        F3[Multi-Category Recommendation Engine DONE]
        F4[End-to-End i18n System EN/ZH/Hybrid DONE]
        F5[Multi-Agent Debate Arena]
        F6[SQLite DB & Watchlist Drawer]
        F7[Price Alert Engine DONE]
        F8[React ErrorBoundary DONE]
    end

    subgraph Phase 4 Production DevOps NEXT
        P4_1[Docker Containerization & GitHub Actions CI/CD RICE 50.00]
    end

    subgraph Phase 3 Portfolio Personalization
        P3_1[Portfolio Position Sizing Calculator RICE 42.50]
    end

    subgraph Phase 4 Reporting & Exports
        P4_2[Exportable PDF/MD Investment Memos RICE 33.75]
    end

    subgraph Phase 2 Deep SEC Data Mining
        P2_1[Full SEC 10-K & SEDAR Text Mining Pipeline RICE 28.80]
    end

    F4 --> P4_1
    P4_1 --> P3_1
    P3_1 --> P4_2
    P4_2 --> P2_1
```

---

## Detailed Specifications for Remaining Items

### 🟣 #1 Next Up: GitHub Actions CI/CD Pipeline & Docker Containerization (RICE 50.00)
- **Phase**: Phase 4 DevOps
- **User Story**:  
  > *As a developer, I want automated Docker containerization (`docker-compose.yml`) and a GitHub Actions workflow running `pytest` & `npm run build` on every PR/push so that production builds and regression testing are 100% automated.*
- **Scope**: `.github/workflows/ci.yml`, `Dockerfile.backend`, `Dockerfile.frontend`, `docker-compose.yml`.

### 🔵 #2 Portfolio Position Sizing & Rebalancing Calculator (RICE 42.50)
- **Phase**: Phase 3 Personalization
- **User Story**:  
  > *As an investor, I want to enter my total portfolio cash balance (e.g. $50,000) and risk tolerance to get exact share counts to buy based on CIO position sizing advice (e.g. 3.5% weight = 15 shares of $NVDA).*
- **Scope**: `PortfolioCalculator.tsx` component integrated with CIO verdict sizing rules.

### 🟣 #3 Exportable PDF & Styled Markdown Investment Memos (RICE 33.75)
- **Phase**: Phase 4 Reporting
- **User Story**:  
  > *As an investor, I want to export the complete stock analysis report, Bull/Bear debate, and CIO verdict into a styled PDF/Markdown investment memo with one click.*
- **Scope**: HTML-to-PDF print memo exporter component.

### 🟢 #4 Full SEC EDGAR 10-K & SEDAR+ Text Mining Pipeline (RICE 28.80)
- **Phase**: Phase 2 Deep Data Mining
- **User Story**:  
  > *As an investor, I want deep automated text diffing across 5 consecutive years of 10-K MD&A sections so that subtle management warning shifts are highlighted automatically.*
- **Scope**: SEC EDGAR API XML/HTML parser with Levenshtein/Cosine similarity text diffing.
