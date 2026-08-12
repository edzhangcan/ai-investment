"""
PushNotifier (Discord Incoming Webhook Engine)
Dispatches zero-KYC real-time push alerts to Discord channels.
Uses Python standard library urllib.request (zero 3rd-party dependencies).
"""

import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional, List

logger = logging.getLogger("PushNotifier")

class PushNotifier:
    """Zero-KYC Push Notification Dispatcher for Discord Webhooks."""

    DISCORD_COLOR_BUY_ZONE = 3066993   # Emerald Green #2ECC71
    DISCORD_COLOR_DANGER_ZONE = 15158332 # Rose Red #E74C3C
    DISCORD_COLOR_TEST = 3447003       # Tech Blue #3498DB

    @classmethod
    def send_discord_alert(
        cls,
        webhook_url: str,
        title: str,
        description: str,
        color: int = DISCORD_COLOR_BUY_ZONE,
        fields: Optional[List[Dict[str, Any]]] = None,
        footer_text: str = "AI Investment Platform • Real-Time Alert System"
    ) -> Dict[str, Any]:
        """
        Dispatches a rich embed alert message to a Discord Incoming Webhook URL.
        """
        if not webhook_url or not webhook_url.startswith("http"):
            return {"success": False, "error": "Invalid Discord Webhook URL"}

        embed_payload = {
            "title": title,
            "description": description,
            "color": color,
            "footer": {"text": footer_text},
            "fields": fields or []
        }

        body_data = {
            "username": "AI Investment Alert Bot",
            "avatar_url": "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/trending-up.svg",
            "embeds": [embed_payload]
        }

        try:
            json_bytes = json.dumps(body_data).encode("utf-8")
            req = urllib.request.Request(
                webhook_url,
                data=json_bytes,
                headers={
                    "Content-Type": "application/json",
                    "User-Agent": "AI-Investment-Platform/3.8.1"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=10) as response:
                status_code = response.status
                if status_code in (200, 204):
                    logger.info(f"Discord webhook alert sent successfully (HTTP {status_code})")
                    return {"success": True, "status_code": status_code}
                else:
                    return {"success": False, "error": f"Discord returned HTTP status {status_code}"}

        except Exception as e:
            logger.error(f"Failed to dispatch Discord webhook alert: {e}")
            return {"success": False, "error": str(e)}

    @classmethod
    def test_discord_connection(cls, webhook_url: str) -> Dict[str, Any]:
        """
        Sends an instant test embed to verify Discord Webhook connectivity.
        """
        title = "🧪 Discord Webhook Connected Successfully!"
        description = (
            "Congratulations! Your Discord channel is now connected to the **AI Investment Platform**.\n\n"
            "You will receive instant, real-time push alerts whenever stocks on your Watchlist drop into their target **BUY zone** or trigger **DANGER / STOP-LOSS** thresholds."
        )
        fields = [
            {"name": "Status", "value": "🟢 Active & Ready", "inline": True},
            {"name": "Channel Type", "value": "Discord Incoming Webhook", "inline": True},
            {"name": "KYC Requirement", "value": "Zero-KYC (Instant Setup)", "inline": True}
        ]

        return cls.send_discord_alert(
            webhook_url=webhook_url,
            title=title,
            description=description,
            color=cls.DISCORD_COLOR_TEST,
            fields=fields
        )
