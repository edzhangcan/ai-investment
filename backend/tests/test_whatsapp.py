"""
Unit tests for WhatsApp Messaging & Alert Engine and REST Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.engines.whatsapp_notifier import WhatsAppNotifier

client = TestClient(app)

def test_whatsapp_notifier_morning_digest():
    res = WhatsAppNotifier.send_morning_macro_digest(recipient_phone="+14165550199", lang="en")
    assert res["status"] == "success"
    assert res["message_type"] == "MORNING_DIGEST"
    assert "Daily 8:00 AM Macro" in res["message_body"]

def test_whatsapp_notifier_bundled_buy_alert():
    res = WhatsAppNotifier.send_bundled_buy_zone_alert(recipient_phone="+14165550199", lang="zh")
    assert res["status"] == "success"
    assert res["message_type"] == "BUNDLED_BUY_ALERT"
    assert "自选股建仓安全区汇总提醒" in res["message_body"]

def test_whatsapp_notifier_bundled_sell_alert():
    res = WhatsAppNotifier.send_bundled_sell_zone_alert(recipient_phone="+14165550199", lang="en")
    assert res["status"] == "success"
    assert res["message_type"] == "BUNDLED_SELL_ALERT"
    assert "Watchlist DANGER / SELL Zone Alert" in res["message_body"]

def test_whatsapp_rest_endpoints():
    # Test GET config
    res_get = client.get("/api/whatsapp/config")
    assert res_get.status_code == 200
    assert "phone_number" in res_get.json()

    # Test POST config update
    payload = {
        "phone_number": "+14165550199",
        "morning_digest_enabled": True,
        "buy_alert_enabled": True,
        "sell_alert_enabled": True,
        "lang": "zh"
    }
    res_post = client.post("/api/whatsapp/config", json=payload)
    assert res_post.status_code == 200
    assert res_post.json()["lang"] == "zh"

    # Test POST test message
    res_test = client.post("/api/whatsapp/test", json={"recipient_phone": "+14165550199", "lang": "en"})
    assert res_test.status_code == 200
    assert res_test.json()["status"] == "success"
