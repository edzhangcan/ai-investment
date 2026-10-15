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
        channel: str = "IN_APP",
        alert_type: str = "BUY"
    ) -> Dict[str, Any]:
        """
        Dispatches a price alert notification to configured channels (In-App, Discord Webhook).
        Supports both BUY and SELL alert types.
        """
        is_sell = alert_type.upper() == "SELL"
        diff_pct = round(abs((target_buy_price - current_price) / target_buy_price) * 100, 2)
        
        event = "PRICE_SELL_ZONE_TRIGGERED" if is_sell else "PRICE_BUY_ZONE_TRIGGERED"
        msg = (
            f"⚠️ ${symbol} ({company_name}) has reached your Profit-Taking Target! Current: ${current_price} >= Target: ${target_buy_price}"
            if is_sell else
            f"🔥 ${symbol} ({company_name}) has entered your Target Buy Zone! Current: ${current_price} <= Target: ${target_buy_price}"
        )

        payload = {
            "event": event,
            "symbol": symbol,
            "company_name": company_name,
            "current_price": current_price,
            "target_price": target_buy_price,
            "difference_pct": diff_pct,
            "alert_type": alert_type.upper(),
            "message": msg
        }

        logger.info(f"[DISPATCH ALERT] {payload['message']}")

        # Dispatch Discord Push Alert if enabled in DB
        discord_result = None
        if session:
            try:
                config = session.exec(select(PushAlertConfigDB)).first()
                if config and config.is_discord_enabled and config.discord_webhook_url:
                    if is_sell:
                        title = f"🔴 PROFIT-TAKING ALERT: ${symbol}"
                        description = (
                            f"**{company_name}** (`${symbol}`) has reached your **Profit-Taking / Sell Target**!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Target Sell Threshold**: `${target_buy_price}`\n"
                            f"• **Premium Margin**: `+{diff_pct}%` above anchor"
                        )
                        color = PushNotifier.DISCORD_COLOR_SELL_DANGER
                        footer = "Prism Loop • Profit-Taking / Resistance Alert"
                    else:
                        title = f"🟢 BUY ZONE ALERT: ${symbol}"
                        description = (
                            f"**{company_name}** (`${symbol}`) has entered your **Target Buy Zone**!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Target Buy Threshold**: `${target_buy_price}`\n"
                            f"• **Discount Margin**: `{diff_pct}%` below target"
                        )
                        color = PushNotifier.DISCORD_COLOR_BUY_ZONE
                        footer = "Prism Loop • Margin of Safety Buy Zone Alert"

                    fields = [
                        {"name": "Stock Ticker", "value": f"${symbol}", "inline": True},
                        {"name": "Trigger Price", "value": f"${current_price}", "inline": True},
                        {"name": "Target Price", "value": f"${target_buy_price}", "inline": True}
                    ]
                    discord_result = PushNotifier.send_discord_alert(
                        webhook_url=config.discord_webhook_url,
                        title=title,
                        description=description,
                        color=color,
                        fields=fields,
                        footer_text=footer
                    )
            except Exception as e:
                logger.error(f"Failed to check Discord alert config: {e}")

        return {
            "status": "DISPATCHED",
            "payload": payload,
            "discord_dispatch": discord_result
        }

dispatcher = NotificationDispatcher()
