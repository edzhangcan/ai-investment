"""
WhatsApp Router: REST endpoints for WhatsApp Messaging & Alert Engine
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlmodel import Session, select
from backend.database import get_session
from backend.models.db_models import WhatsAppConfigDB
from backend.engines.whatsapp_notifier import WhatsAppNotifier

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Messaging"])

class WhatsAppConfigRequest(BaseModel):
    phone_number: str = Field("+14165550199", description="Recipient WhatsApp Phone Number with country code")
    morning_digest_enabled: bool = Field(True, description="Enable daily 8:00 AM EST Macro & News digest")
    buy_alert_enabled: bool = Field(True, description="Enable bundled Watchlist BUY zone alerts")
    sell_alert_enabled: bool = Field(True, description="Enable bundled Watchlist DANGER/SELL zone alerts")
    lang: str = Field("en", description="Preferred language: en, zh, or hybrid")

class TriggerAlertRequest(BaseModel):
    recipient_phone: Optional[str] = None
    lang: str = Field("en", description="Target language")

@router.get("/config")
def get_whatsapp_config(session: Session = Depends(get_session)):
    """Fetches saved WhatsApp config and alert toggles."""
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    if not config:
        config = WhatsAppConfigDB(id=1, phone_number="+14165550199", morning_digest_enabled=True, buy_alert_enabled=True, sell_alert_enabled=True, lang="en")
        session.add(config)
        session.commit()
        session.refresh(config)
    return config

@router.post("/config")
def save_whatsapp_config(req: WhatsAppConfigRequest, session: Session = Depends(get_session)):
    """Saves/updates WhatsApp config and alert toggles."""
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    if not config:
        config = WhatsAppConfigDB(id=1)

    config.phone_number = req.phone_number.strip()
    config.morning_digest_enabled = req.morning_digest_enabled
    config.buy_alert_enabled = req.buy_alert_enabled
    config.sell_alert_enabled = req.sell_alert_enabled
    config.lang = req.lang

    session.add(config)
    session.commit()
    session.refresh(config)
    return config

@router.post("/test")
def trigger_whatsapp_test(req: TriggerAlertRequest):
    """Sends instant test WhatsApp message."""
    phone = req.recipient_phone or "+14165550199"
    return WhatsAppNotifier.send_test_message(recipient_phone=phone, lang=req.lang)

@router.post("/trigger-digest")
def trigger_morning_digest(req: TriggerAlertRequest):
    """Triggers 8:00 AM EST Daily Morning Macro & News Digest."""
    phone = req.recipient_phone or "+14165550199"
    return WhatsAppNotifier.send_morning_macro_digest(recipient_phone=phone, lang=req.lang)

@router.post("/trigger-alerts")
def trigger_bundled_alerts(req: TriggerAlertRequest):
    """Scans watchlist and dispatches bundled Buy/Sell zone WhatsApp alerts."""
    phone = req.recipient_phone or "+14165550199"
    buy_res = WhatsAppNotifier.send_bundled_buy_zone_alert(recipient_phone=phone, lang=req.lang)
    sell_res = WhatsAppNotifier.send_bundled_sell_zone_alert(recipient_phone=phone, lang=req.lang)
    return {
        "status": "success",
        "buy_alert": buy_res,
        "sell_alert": sell_res
    }
