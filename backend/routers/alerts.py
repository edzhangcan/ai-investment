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
