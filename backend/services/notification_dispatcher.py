"""
Notification Dispatcher Service
Handles Webhook payloads, In-App toast alerts, and Email/Logger notifications when stock price alert triggers fire.
"""

import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

class NotificationDispatcher:
    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url

    async def dispatch_price_alert(
        self,
        symbol: str,
        company_name: str,
        current_price: float,
        target_buy_price: float,
        channel: str = "IN_APP"
    ) -> Dict[str, Any]:
        """
        Dispatches a price alert notification to configured channels.
        """
        payload = {
            "event": "PRICE_BUY_ZONE_TRIGGERED",
            "symbol": symbol,
            "company_name": company_name,
            "current_price": current_price,
            "target_buy_price": target_buy_price,
            "discount_pct": round(((target_buy_price - current_price) / target_buy_price) * 100, 2),
            "message": f"🔥 {symbol} ({company_name}) has entered your Target Buy Zone! Current: ${current_price} <= Target: ${target_buy_price}"
        }

        logger.info(f"[DISPATCH ALERT] {payload['message']}")

        if channel == "WEBHOOK" and self.webhook_url:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.post(self.webhook_url, json=payload)
                    return {
                        "status": "SENT" if response.status_code == 200 else "WEBHOOK_ERROR",
                        "response_code": response.status_code,
                        "payload": payload
                    }
            except Exception as e:
                logger.error(f"Failed to send Webhook price alert: {e}")
                return {"status": "FAILED", "error": str(e), "payload": payload}

        return {"status": "DISPATCHED_IN_APP", "payload": payload}

dispatcher = NotificationDispatcher()
