"""
Price Alerts REST Router
Exposes trigger history logs and trigger evaluation endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from backend.database import get_session
from backend.models.db_models import PriceAlertLogDB
from backend.services.alert_engine import alert_engine

router = APIRouter(prefix="/api/alerts", tags=["Price Alerts"])

class PriceAlertLogResponseSchema(BaseModel):
    id: int
    symbol: str
    company_name: str
    current_price: float
    target_buy_price: float
    notification_channel: str
    status: str
    message: str
    triggered_at: datetime

@router.get("/history", response_model=List[PriceAlertLogResponseSchema])
def get_alert_history(session: Session = Depends(get_session)):
    """Returns past triggered price alert history records."""
    logs = session.exec(
        select(PriceAlertLogDB).order_by(PriceAlertLogDB.triggered_at.desc())
    ).all()
    return logs

@router.post("/trigger-check")
async def trigger_price_alert_check(session: Session = Depends(get_session)):
    """Manually evaluates watchlist target buy prices against live market quotes."""
    results = await alert_engine.evaluate_watchlist_alerts(session)
    return {
        "status": "ok",
        "alerts_triggered_count": len(results),
        "triggered_alerts": results
    }

class FalsificationNotifyRequest(BaseModel):
    symbol: str
    company_name: Optional[str] = None
    current_price: float
    bottom_threshold: float
    reason: Optional[str] = None
    lang: Optional[str] = "en"

@router.post("/notify-falsification")
async def notify_falsification(payload: FalsificationNotifyRequest, session: Session = Depends(get_session)):
    """Dispatches an immediate Falsification Trigger alert to in-app log and Discord webhook."""
    from backend.services.notification_dispatcher import dispatcher
    from backend.models.db_models import get_utc_now
    
    # Save log entry
    log_entry = PriceAlertLogDB(
        symbol=payload.symbol.upper(),
        company_name=payload.company_name or payload.symbol.upper(),
        current_price=payload.current_price,
        target_buy_price=payload.bottom_threshold,
        notification_channel="IN_APP",
        status="FALSIFICATION_TRIGGERED",
        message=f"🚨 Falsification Triggered: ${payload.symbol.upper()} breached bottom threshold (${payload.current_price} < ${payload.bottom_threshold})",
        triggered_at=get_utc_now()
    )
    session.add(log_entry)
    session.commit()
    session.refresh(log_entry)

    dispatch_res = await dispatcher.dispatch_price_alert(
        symbol=payload.symbol.upper(),
        company_name=payload.company_name or payload.symbol.upper(),
        current_price=payload.current_price,
        target_buy_price=payload.bottom_threshold,
        session=session,
        alert_type="FALSIFICATION"
    )

    return {
        "status": "ok",
        "log_id": log_entry.id,
        "symbol": payload.symbol.upper(),
        "current_price": payload.current_price,
        "bottom_threshold": payload.bottom_threshold,
        "dispatch": dispatch_res
    }

@router.delete("/history")
def clear_all_alert_history(session: Session = Depends(get_session)):
    """Clears all triggered price alert history records."""
    logs = session.exec(select(PriceAlertLogDB)).all()
    count = len(logs)
    for log in logs:
        session.delete(log)
    session.commit()
    return {"status": "ok", "deleted_count": count}

@router.delete("/history/{alert_id}")
def delete_alert_history_item(alert_id: int, session: Session = Depends(get_session)):
    """Deletes a specific alert history record."""
    log = session.get(PriceAlertLogDB, alert_id)
    if not log:
        raise HTTPException(status_code=404, detail="Alert record not found")
    session.delete(log)
    session.commit()
    return {"status": "ok", "deleted_id": alert_id}

