"""
Pytest unit tests for PushNotifier and Push Alerts REST API endpoints
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from backend.main import app
from backend.database import get_session
from backend.engines.push_notifier import PushNotifier
from backend.models.db_models import PushAlertConfigDB

# In-memory SQLite engine for testing
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
def test_push_notifier_send_discord_alert_success(mock_urlopen):
    mock_response = MagicMock()
    mock_response.status = 204
    mock_urlopen.return_value.__enter__.return_value = mock_response

    webhook_url = "https://discord.com/api/webhooks/12345/abcde"
    res = PushNotifier.send_discord_alert(
        webhook_url=webhook_url,
        title="Test Title",
        description="Test Description",
        fields=[{"name": "Field 1", "value": "Val 1", "inline": True}]
    )

    assert res["success"] is True
    assert res["status_code"] == 204
    mock_urlopen.assert_called_once()

def test_push_alerts_config_crud_endpoints(client: TestClient):
    # GET initial config
    res_get = client.get("/api/push-alerts/config")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert data_get["discord_webhook_url"] == ""
    assert data_get["is_discord_enabled"] is False

    # POST save config
    test_webhook = "https://discord.com/api/webhooks/999/xyz"
    res_post = client.post("/api/push-alerts/config", json={
        "discord_webhook_url": test_webhook,
        "is_discord_enabled": True
    })
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert data_post["success"] is True
    assert data_post["config"]["discord_webhook_url"] == test_webhook
    assert data_post["config"]["is_discord_enabled"] is True

    # GET updated config
    res_get_updated = client.get("/api/push-alerts/config")
    assert res_get_updated.status_code == 200
    assert res_get_updated.json()["discord_webhook_url"] == test_webhook
    assert res_get_updated.json()["is_discord_enabled"] is True

@patch("backend.engines.push_notifier.PushNotifier.test_discord_connection")
def test_push_alerts_test_endpoint_success(mock_test_conn, client: TestClient):
    mock_test_conn.return_value = {"success": True, "status_code": 204}

    res = client.post("/api/push-alerts/test", json={
        "discord_webhook_url": "https://discord.com/api/webhooks/123/abc"
    })
    assert res.status_code == 200
    assert res.json()["success"] is True
    assert "Instant test notification sent" in res.json()["message"]
