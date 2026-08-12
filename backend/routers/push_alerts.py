"""
Push Alerts REST API Router
Endpoints to get, update, and test Discord Webhook Push Notification configurations.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any

from backend.database import get_session
from backend.models.db_models import PushAlertConfigDB, get_utc_now
from backend.engines.push_notifier import PushNotifier

router = APIRouter(prefix="/api/push-alerts", tags=["Push Alert Config & Webhooks"])

class PushAlertConfigRequest(BaseModel):
    discord_webhook_url: Optional[str] = None
    is_discord_enabled: bool = False

class PushAlertTestRequest(BaseModel):
    discord_webhook_url: str

@router.get("/config")
def get_push_alert_config(session: Session = Depends(get_session)):
    """Fetches user's current push notification configuration."""
    config = session.exec(select(PushAlertConfigDB)).first()
    if not config:
        config = PushAlertConfigDB()
        session.add(config)
        session.commit()
        session.refresh(config)

    return {
        "discord_webhook_url": config.discord_webhook_url or "",
        "is_discord_enabled": config.is_discord_enabled,
        "updated_at": config.updated_at.isoformat() if config.updated_at else None
    }

@router.post("/config")
def save_push_alert_config(req: PushAlertConfigRequest, session: Session = Depends(get_session)):
    """Saves or updates Discord Webhook push notification config."""
    config = session.exec(select(PushAlertConfigDB)).first()
    if not config:
        config = PushAlertConfigDB()
        session.add(config)

    config.discord_webhook_url = req.discord_webhook_url.strip() if req.discord_webhook_url else None
    config.is_discord_enabled = req.is_discord_enabled
    config.updated_at = get_utc_now()

    session.commit()
    session.refresh(config)

    return {
        "success": True,
        "message": "Push alert configuration saved successfully",
        "config": {
            "discord_webhook_url": config.discord_webhook_url or "",
            "is_discord_enabled": config.is_discord_enabled
        }
    }

@router.post("/test")
def test_push_alert_channel(req: PushAlertTestRequest):
    """Dispatches an instant test embed to verify Discord Webhook URL connectivity."""
    url = req.discord_webhook_url.strip()
    if not url or not url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid Discord Webhook URL")

    res = PushNotifier.test_discord_connection(url)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Discord test failed"))

    return {
        "success": True,
        "message": "Instant test notification sent to Discord server channel!",
        "details": res
    }
