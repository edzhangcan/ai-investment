"""
WhatsApp Router: REST endpoints for WhatsApp Messaging & 1-on-1 Opt-In Webhook Listener
"""

from fastapi import APIRouter, HTTPException, Depends, Request, Form
from pydantic import BaseModel, Field
from typing import List, Optional
from sqlmodel import Session, select
from backend.database import get_session
from backend.models.db_models import WhatsAppConfigDB
from backend.engines.whatsapp_notifier import WhatsAppNotifier

router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Messaging"])

class WhatsAppConfigRequest(BaseModel):
    phone_number: str = Field("+14165550199", description="Recipient WhatsApp Phone Number with country code")
    bot_phone_number: str = Field("+14155238886", description="Sender Bot WhatsApp Phone Number")
    optin_keyword: str = Field("join invest-9821", description="Twilio Sandbox Join Keyword")
    morning_digest_enabled: bool = Field(True, description="Enable daily 8:00 AM EST Macro & News digest")
    buy_alert_enabled: bool = Field(True, description="Enable bundled Watchlist BUY zone alerts")
    sell_alert_enabled: bool = Field(True, description="Enable bundled Watchlist DANGER/SELL zone alerts")
    lang: str = Field("en", description="Preferred language: en, zh, or hybrid")

class TriggerAlertRequest(BaseModel):
    recipient_phone: Optional[str] = None
    lang: str = Field("en", description="Target language")

class SimulateOptInRequest(BaseModel):
    phone_number: str = Field("+14165550199", description="Simulated recipient phone number")
    optin_keyword: str = Field("join invest-9821", description="Opt-in keyword sent by user")
    lang: str = Field("en", description="Target language")

@router.get("/config")
def get_whatsapp_config(session: Session = Depends(get_session)):
    """Fetches saved WhatsApp config, verification status, and opt-in join keyword."""
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    if not config:
        config = WhatsAppConfigDB(
            id=1,
            phone_number="+14165550199",
            bot_phone_number="+14155238886",
            optin_keyword="join invest-9821",
            is_verified=False,
            verification_status="PENDING_OPT_IN",
            morning_digest_enabled=True,
            buy_alert_enabled=True,
            sell_alert_enabled=True,
            lang="en"
        )
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
    if req.bot_phone_number:
        config.bot_phone_number = req.bot_phone_number.strip()
    if req.optin_keyword:
        config.optin_keyword = req.optin_keyword.strip()
    config.morning_digest_enabled = req.morning_digest_enabled
    config.buy_alert_enabled = req.buy_alert_enabled
    config.sell_alert_enabled = req.sell_alert_enabled
    config.lang = req.lang

    session.add(config)
    session.commit()
    session.refresh(config)
    return config

@router.post("/incoming-webhook")
async def handle_incoming_whatsapp_webhook(
    request: Request,
    session: Session = Depends(get_session)
):
    """
    Twilio / Meta WhatsApp Inbound Webhook Listener.
    Receives incoming opt-in messages (e.g. "join invest-9821") from WhatsApp users.
    Sets is_verified = True and returns an instant auto-reply confirmation.
    """
    try:
        form_data = await request.form()
        from_number = form_data.get("From", "").replace("whatsapp:", "").strip()
        body_text = form_data.get("Body", "").strip().lower()

        config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
        if not config:
            config = WhatsAppConfigDB(id=1)

        target_keyword = config.optin_keyword.strip().lower()

        if target_keyword in body_text or "join" in body_text:
            config.phone_number = from_number or config.phone_number
            config.is_verified = True
            config.verification_status = "VERIFIED"
            session.add(config)
            session.commit()
            session.refresh(config)

            reply = WhatsAppNotifier.send_optin_confirmation_reply(recipient_phone=config.phone_number, lang=config.lang)
            return {
                "status": "success",
                "verified": True,
                "phone_number": config.phone_number,
                "reply": reply
            }

        return {"status": "received", "verified": config.is_verified}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@router.post("/verify-simulated")
def simulate_whatsapp_optin(
    req: SimulateOptInRequest,
    session: Session = Depends(get_session)
):
    """
    Developer / Local Testing Helper Endpoint.
    Simulates receiving a WhatsApp opt-in message to mark the phone number as VERIFIED.
    """
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    if not config:
        config = WhatsAppConfigDB(id=1)

    config.phone_number = req.phone_number.strip()
    config.is_verified = True
    config.verification_status = "VERIFIED"

    session.add(config)
    session.commit()
    session.refresh(config)

    reply = WhatsAppNotifier.send_optin_confirmation_reply(recipient_phone=config.phone_number, lang=req.lang)
    return {
        "status": "success",
        "verified": True,
        "phone_number": config.phone_number,
        "message": "Phone number successfully verified via simulated opt-in!",
        "reply": reply
    }

@router.post("/test")
def trigger_whatsapp_test(req: TriggerAlertRequest, session: Session = Depends(get_session)):
    """Sends instant test WhatsApp message."""
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    phone = req.recipient_phone or (config.phone_number if config else "+14165550199")
    return WhatsAppNotifier.send_test_message(recipient_phone=phone, lang=req.lang)

@router.post("/trigger-digest")
def trigger_morning_digest(req: TriggerAlertRequest, session: Session = Depends(get_session)):
    """Triggers 8:00 AM EST Daily Morning Macro & News Digest."""
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    phone = req.recipient_phone or (config.phone_number if config else "+14165550199")
    is_verified = config.is_verified if config else True
    return WhatsAppNotifier.send_morning_macro_digest(recipient_phone=phone, lang=req.lang, is_verified=is_verified)

@router.post("/trigger-alerts")
def trigger_bundled_alerts(req: TriggerAlertRequest, session: Session = Depends(get_session)):
    """Scans watchlist and dispatches bundled Buy/Sell zone WhatsApp alerts."""
    config = session.exec(select(WhatsAppConfigDB).where(WhatsAppConfigDB.id == 1)).first()
    phone = req.recipient_phone or (config.phone_number if config else "+14165550199")
    is_verified = config.is_verified if config else True

    buy_res = WhatsAppNotifier.send_bundled_buy_zone_alert(recipient_phone=phone, lang=req.lang, is_verified=is_verified)
    sell_res = WhatsAppNotifier.send_bundled_sell_zone_alert(recipient_phone=phone, lang=req.lang, is_verified=is_verified)
    return {
        "status": "success",
        "buy_alert": buy_res,
        "sell_alert": sell_res
    }
