# Implementation Plan - Phase 2 Item #1: Price Alert Triggers & Background Notification Engine

Build an asynchronous background price monitoring service that evaluates real-time market quotes against user target buy prices in `UserWatchlistDB`, logs trigger history in SQLite WAL database, dispatches notifications, and alerts users via frontend toast/badge banners.

## Proposed Architectural Changes

### 1. Database Entity Enhancements (`backend/models/db_models.py`)
- Add `PriceAlertLogDB` SQLModel table:
  - `id`: Optional[int] (Primary Key)
  - `symbol`: str (Indexed)
  - `company_name`: str
  - `current_price`: float
  - `target_buy_price`: float
  - `channel`: str (e.g. `"WEBHOOK"`, `"EMAIL"`, `"IN_APP"`)
  - `status`: str (e.g. `"TRIGGERED"`, `"SENT"`)
  - `triggered_at`: datetime

### 2. Backend Services & Background Scheduler
- [NEW] `backend/services/alert_engine.py`: Core price check engine comparing live quotes vs watchlist target prices.
- [NEW] `backend/services/notification_dispatcher.py`: Dispatcher supporting Webhook, Web Push payload, and logging notifications.
- [NEW] `backend/routers/alerts.py`: REST router exposing `GET /api/alerts/history` and `POST /api/alerts/trigger-check`.
- [MODIFY] `backend/main.py`: Wire background periodic task runner inside FastAPI `lifespan` event.

### 3. Frontend UI Components (`/frontend`)
- [NEW] `frontend/src/components/NotificationToast.tsx`: Toast popover banner alerting users when a starred stock drops into its target buy range.
- [MODIFY] `frontend/src/components/WatchlistDrawer.tsx`: Highlight triggered price alerts with animated amber/emerald badges.

---

## Verification Plan

### Automated Tests
- Pytest suite in `backend/tests/test_alerts.py`:
  - Test alert condition evaluation when `current_price <= target_buy_price`.
  - Test duplicate trigger cooldown prevention (prevent spamming alerts for the same price event).
  - Test `GET /api/alerts/history` and `POST /api/alerts/trigger-check` REST endpoints.

### Manual Verification
- Add `$NVDA` with target buy price `$220.00` (current price `$217.16`).
- Execute manual alert trigger check and verify alert log creation and UI toast banner display.
