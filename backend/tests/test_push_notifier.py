"""
Pytest unit tests for PushNotifier and 4 Multi-Type Discord Webhook REST Endpoints
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from backend.main import app
from backend.database import get_session
from backend.engines.push_notifier import PushNotifier

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session
    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()

def test_push_notifier_send_discord_alert_invalid_url():
    res = PushNotifier.send_discord_alert("", "Test", "Test Body")
    assert res["success"] is False
    assert "Invalid Discord Webhook URL" in res["error"]

@patch("urllib.request.urlopen")
def test_push_notifier_multi_type_dispatchers(mock_urlopen):
    mock_response = MagicMock()
    mock_response.status = 204
    mock_urlopen.return_value.__enter__.return_value = mock_response

    webhook = "https://discord.com/api/webhooks/12345/test"

    # Test 1: Macro Digest (EN & ZH)
    res1 = PushNotifier.send_macro_digest_alert(webhook, lang="en")
    assert res1["success"] is True
    res1_zh = PushNotifier.send_macro_digest_alert(webhook, lang="zh")
    assert res1_zh["success"] is True

    # Test 2: Bundled Buy Alert
    res2 = PushNotifier.send_bundled_buy_alert(webhook, lang="en")
    assert res2["success"] is True

    # Test 3: Sell Danger Alert
    res3 = PushNotifier.send_sell_danger_alert(webhook, lang="en")
    assert res3["success"] is True

    # Test 4: Gold Nuggets Alert
    res4 = PushNotifier.send_gold_nuggets_alert(webhook, lang="en")
    assert res4["success"] is True

def test_push_alerts_config_crud_endpoints(client: TestClient):
    res_get = client.get("/api/push-alerts/config")
    assert res_get.status_code == 200

    test_webhook = "https://discord.com/api/webhooks/999/xyz"
    res_post = client.post("/api/push-alerts/config", json={
        "discord_webhook_url": test_webhook,
        "is_discord_enabled": True
    })
    assert res_post.status_code == 200
    assert res_post.json()["config"]["discord_webhook_url"] == test_webhook

@patch("backend.engines.push_notifier.PushNotifier.send_macro_digest_alert")
@patch("backend.engines.push_notifier.PushNotifier.send_bundled_buy_alert")
@patch("backend.engines.push_notifier.PushNotifier.send_sell_danger_alert")
@patch("backend.engines.push_notifier.PushNotifier.send_gold_nuggets_alert")
def test_multi_type_push_alert_test_endpoints(
    mock_gold, mock_sell, mock_buy, mock_macro, client: TestClient
):
    mock_macro.return_value = {"success": True, "status_code": 204}
    mock_buy.return_value = {"success": True, "status_code": 204}
    mock_sell.return_value = {"success": True, "status_code": 204}
    mock_gold.return_value = {"success": True, "status_code": 204}

    url = "https://discord.com/api/webhooks/123/abc"

    r1 = client.post("/api/push-alerts/test/macro-digest", json={"discord_webhook_url": url, "lang": "en"})
    assert r1.status_code == 200 and r1.json()["success"] is True

    r2 = client.post("/api/push-alerts/test/bundled-buy", json={"discord_webhook_url": url, "lang": "en"})
    assert r2.status_code == 200 and r2.json()["success"] is True

    r3 = client.post("/api/push-alerts/test/sell-danger", json={"discord_webhook_url": url, "lang": "en"})
    assert r3.status_code == 200 and r3.json()["success"] is True

    r4 = client.post("/api/push-alerts/test/gold-nuggets", json={"discord_webhook_url": url, "lang": "en"})
    assert r4.status_code == 200 and r4.json()["success"] is True

def test_dispatch_push_alert_endpoint(client: TestClient):
    with patch("backend.engines.push_notifier.PushNotifier.send_macro_digest_alert") as mock_macro:
        mock_macro.return_value = {"success": True, "status_code": 204}

        # 1. Dispatch with explicit URL
        url = "https://discord.com/api/webhooks/123/dispatch"
        res = client.post("/api/push-alerts/dispatch", json={
            "discord_webhook_url": url,
            "alert_type": "macro_digest",
            "lang": "en"
        })
        assert res.status_code == 200
        assert res.json()["success"] is True

        # 2. Save config and dispatch without explicit URL (fall back to DB config)
        client.post("/api/push-alerts/config", json={
            "discord_webhook_url": url,
            "is_discord_enabled": True
        })
        res2 = client.post("/api/push-alerts/dispatch", json={
            "alert_type": "macro_digest",
            "lang": "en"
        })
        assert res2.status_code == 200
        assert res2.json()["success"] is True

@patch("urllib.request.urlopen")
def test_push_notifier_branding_and_kyc_elimination(mock_urlopen):
    """Verifies that Discord embeds use official branding and contain zero KYC/KYB references."""
    captured_payloads = []
    
    def fake_urlopen(req, timeout=8):
        import json
        payload = json.loads(req.data.decode("utf-8"))
        captured_payloads.append(payload)
        mock_resp = MagicMock()
        mock_resp.status = 204
        mock_resp.__enter__.return_value = mock_resp
        mock_resp.__exit__.return_value = None
        return mock_resp

    mock_urlopen.side_effect = fake_urlopen
    url = "https://discord.com/api/webhooks/999/brand-check"

    # Test EN connection
    res_en = PushNotifier.test_discord_connection(url, lang="en")
    assert res_en["success"] is True
    
    # Test ZH connection
    res_zh = PushNotifier.test_discord_connection(url, lang="zh")
    assert res_zh["success"] is True

    # Assert branding across all payloads
    for p in captured_payloads:
        assert p["username"] == "Prism Loop Intelligence"
        assert len(p["embeds"]) == 1
        embed = p["embeds"][0]
        assert embed["author"]["name"] == "Prism Loop Autonomous Workstation"
        assert "Prism Loop" in embed["footer"]["text"]
        
        # Verify complete elimination of KYC / KYB keywords
        serialized = str(p).lower()
        assert "kyc" not in serialized
        assert "kyb" not in serialized

