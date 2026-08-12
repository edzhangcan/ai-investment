"""
Unit tests for WhatsApp 1-on-1 Verified Opt-In Flow & Webhook Engine
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.engines.whatsapp_notifier import WhatsAppNotifier

client = TestClient(app)

def test_whatsapp_simulated_optin_verification():
    # 1. Check initial config or trigger simulated opt-in
    payload = {
        "phone_number": "+14165550199",
        "optin_keyword": "join invest-9821",
        "lang": "en"
    }

    res_optin = client.post("/api/whatsapp/verify-simulated", json=payload)
    assert res_optin.status_code == 200
    data = res_optin.json()

    assert data["status"] == "success"
    assert data["verified"] is True
    assert data["phone_number"] == "+14165550199"

    # 2. Check config status endpoint returns VERIFIED
    res_config = client.get("/api/whatsapp/config")
    assert res_config.status_code == 200
    config_data = res_config.json()
    assert config_data["is_verified"] is True
    assert config_data["verification_status"] == "VERIFIED"

def test_whatsapp_verified_outbound_digest():
    res_digest = client.post("/api/whatsapp/trigger-digest", json={"recipient_phone": "+14165550199", "lang": "zh"})
    assert res_digest.status_code == 200
    digest_data = res_digest.json()

    assert digest_data["status"] == "success"
    assert "晨报" in digest_data["message_body"]
