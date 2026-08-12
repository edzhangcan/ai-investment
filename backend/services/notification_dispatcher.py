"""
Notification Dispatcher Service
Handles Webhook payloads, In-App toast alerts, and Email/Logger notifications when stock price alert triggers fire.
"""

import logging
from typing import Dict, Any, Optional
from sqlmodel import Session, select
from backend.engines.push_notifier import PushNotifier
from backend.models.db_models import PushAlertConfigDB

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
        session: Optional[Session] = None,
        channel: str = "IN_APP"
    ) -> Dict[str, Any]:
        """
        Dispatches a price alert notification to configured channels (In-App, Discord Webhook).
        """
        discount_pct = round(((target_buy_price - current_price) / target_buy_price) * 100, 2)
        payload = {
            "event": "PRICE_BUY_ZONE_TRIGGERED",
            "symbol": symbol,
            "company_name": company_name,
            "current_price": current_price,
            "target_buy_price": target_buy_price,
            "discount_pct": discount_pct,
            "message": f"🔥 ${symbol} ({company_name}) has entered your Target Buy Zone! Current: ${current_price} <= Target: ${target_buy_price}"
        }

        logger.info(f"[DISPATCH ALERT] {payload['message']}")

        # Dispatch Discord Push Alert if enabled in DB
        discord_result = None
        if session:
            try:
                config = session.exec(select(PushAlertConfigDB)).first()
                if config and config.is_discord_enabled and config.discord_webhook_url:
                    title = f"🟢 BUY ZONE ALERT: ${symbol}"
                    description = (
                        f"**{company_name}** (`${symbol}`) has entered your **Target Buy Zone**!\n\n"
                        f"• **Current Price**: `${current_price}`\n"
                        f"• **Target Buy Threshold**: `${target_buy_price}`\n"
                        f"• **Discount Margin**: `{discount_pct}%` below target"
                    )
                    fields = [
                        {"name": "Stock Ticker", "value": f"${symbol}", "inline": True},
                        {"name": "Trigger Price", "value": f"${current_price}", "inline": True},
                        {"name": "Target Price", "value": f"${target_buy_price}", "inline": True}
                    ]
                    discord_result = PushNotifier.send_discord_alert(
                        webhook_url=config.discord_webhook_url,
                        title=title,
                        description=description,
                        color=PushNotifier.DISCORD_COLOR_BUY_ZONE,
                        fields=fields
                    )
            except Exception as e:
                logger.error(f"Failed to check Discord alert config: {e}")

        return {
            "status": "DISPATCHED",
            "payload": payload,
            "discord_dispatch": discord_result
        }

dispatcher = NotificationDispatcher()
