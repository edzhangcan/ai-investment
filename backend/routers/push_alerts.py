"""
Push Alerts REST API Router
Endpoints to get, update, and test 4 Multi-Type Discord Webhook Push Notifications.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, Dict, Any
import ipaddress
import urllib.parse

from backend.config import settings
from backend.database import get_session
from backend.models.db_models import PushAlertConfigDB, get_utc_now
from backend.engines.push_notifier import PushNotifier

router = APIRouter(prefix="/api/push-alerts", tags=["Push Alert Config & Webhooks"])

def validate_webhook_url(url: str) -> str:
    """
    Validates outbound webhook URLs against SSRF (Server-Side Request Forgery).
    Rejects private, loopback, link-local, and cloud metadata IP addresses.
    """
    if not url or not isinstance(url, str):
        raise HTTPException(status_code=400, detail="Invalid webhook URL")

    cleaned_url = url.strip()
    parsed = urllib.parse.urlparse(cleaned_url)
    if parsed.scheme not in ("https", "http"):
        raise HTTPException(status_code=400, detail="Webhook URL must use HTTP or HTTPS scheme.")

    # In production/default, require HTTPS unless DEBUG is explicitly True
    if parsed.scheme != "https" and not settings.DEBUG:
        raise HTTPException(status_code=400, detail="Webhook URL must use HTTPS.")

    hostname = (parsed.hostname or "").strip().lower()
    if not hostname:
        raise HTTPException(status_code=400, detail="Webhook URL missing valid hostname.")

    # Block loopback hostnames
    if hostname in ("localhost", "0.0.0.0", "::1", "127.0.0.1"):
        raise HTTPException(status_code=400, detail="Invalid webhook URL: Loopback addresses are not permitted.")

    # Block cloud metadata addresses (169.254.x.x)
    if hostname.startswith("169.254."):
        raise HTTPException(status_code=400, detail="Invalid webhook URL: Cloud metadata IP addresses are not permitted.")

    # Check if hostname is an IP address and verify if private/loopback/link_local
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved:
            raise HTTPException(status_code=400, detail="Invalid webhook URL: Private or reserved IP addresses are not permitted.")
    except ValueError:
        pass

    return cleaned_url

class PushAlertConfigRequest(BaseModel):
    discord_webhook_url: Optional[str] = None
    is_discord_enabled: bool = False

class PushAlertTestRequest(BaseModel):
    discord_webhook_url: str
    lang: str = "en"

class PushAlertDispatchRequest(BaseModel):
    discord_webhook_url: Optional[str] = None
    alert_type: str
    lang: str = "en"

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

    webhook_url = req.discord_webhook_url.strip() if req.discord_webhook_url else None
    if webhook_url:
        webhook_url = validate_webhook_url(webhook_url)

    config.discord_webhook_url = webhook_url
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
    """Dispatches an instant connection test embed to verify Discord Webhook URL."""
    url = validate_webhook_url(req.discord_webhook_url)

    res = PushNotifier.test_discord_connection(url, lang=req.lang)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Discord test failed"))

    return {
        "status": "ok",
        "success": True,
        "message": "Instant test notification sent to Discord server channel!",
        "details": res
    }

@router.post("/test/macro-digest")
def test_macro_digest_alert(req: PushAlertTestRequest):
    """1. Tests Daily 8:00 AM EST Macro & Policy Newsletter Digest."""
    url = validate_webhook_url(req.discord_webhook_url)

    res = PushNotifier.send_macro_digest_alert(url, lang=req.lang)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Macro digest dispatch failed"))

    return {"status": "ok", "success": True, "message": "Daily Macro & Policy Digest sent to Discord!", "details": res}

@router.post("/test/bundled-buy")
def test_bundled_buy_alert(req: PushAlertTestRequest):
    """2. Tests Bundled Watchlist Buy-In Notification (Single Combined Embed)."""
    url = validate_webhook_url(req.discord_webhook_url)

    res = PushNotifier.send_bundled_buy_alert(url, lang=req.lang)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Bundled buy alert dispatch failed"))

    return {"status": "ok", "success": True, "message": "Bundled Watchlist Buy-In alert sent to Discord!", "details": res}

@router.post("/test/sell-danger")
def test_sell_danger_alert(req: PushAlertTestRequest):
    """3. Tests Watchlist Sell & Danger Zone Risk Alert."""
    url = validate_webhook_url(req.discord_webhook_url)

    res = PushNotifier.send_sell_danger_alert(url, lang=req.lang)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Sell danger alert dispatch failed"))

    return {"status": "ok", "success": True, "message": "Watchlist Sell & Danger alert sent to Discord!", "details": res}

@router.post("/test/gold-nuggets")
def test_gold_nuggets_alert(req: PushAlertTestRequest):
    """4. Tests Gold Nuggets Discovery Alerts (8:00 AM & 12:00 PM EST)."""
    url = validate_webhook_url(req.discord_webhook_url)

    res = PushNotifier.send_gold_nuggets_alert(url, lang=req.lang)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Gold nuggets dispatch failed"))

    return {"status": "ok", "success": True, "message": "Gold Nuggets Discovery alert sent to Discord!", "details": res}

@router.post("/dispatch")
def dispatch_push_alert(req: PushAlertDispatchRequest, session: Session = Depends(get_session)):
    """Dispatches multi-type Discord push alert (macro_digest, bundled_buy, sell_danger, gold_nuggets)."""
    url = req.discord_webhook_url.strip() if req.discord_webhook_url else None
    
    # Fall back to database config if webhook URL is not provided in payload
    if not url:
        config = session.exec(select(PushAlertConfigDB)).first()
        if config and config.discord_webhook_url:
            url = config.discord_webhook_url.strip()

    if not url:
        raise HTTPException(status_code=400, detail="Invalid or missing Discord Webhook URL")

    url = validate_webhook_url(url)

    alert_type = req.alert_type.strip().lower()
    
    if alert_type == "macro_digest":
        res = PushNotifier.send_macro_digest_alert(url, lang=req.lang)
    elif alert_type == "bundled_buy":
        res = PushNotifier.send_bundled_buy_alert(url, lang=req.lang)
    elif alert_type == "sell_danger":
        res = PushNotifier.send_sell_danger_alert(url, lang=req.lang)
    elif alert_type == "gold_nuggets":
        res = PushNotifier.send_gold_nuggets_alert(url, lang=req.lang)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported alert type: {req.alert_type}")

    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Dispatch alert failed"))

    return {
        "status": "ok",
        "success": True,
        "message": f"Push alert ({alert_type}) dispatched successfully to Discord!",
        "details": res
    }
