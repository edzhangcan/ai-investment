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
        Supports BUY, SELL, and FALSIFICATION alert types.
        """
        upper_type = alert_type.upper()
        is_sell = upper_type == "SELL"
        is_falsification = upper_type == "FALSIFICATION"
        is_stop_loss = upper_type == "STOP_LOSS"
        is_discovery = upper_type in ["DISCOVERY_BUY", "REGULAR_DISCOVERY"]
        diff_pct = round(abs((target_buy_price - current_price) / max(0.01, target_buy_price)) * 100, 2)
        
        if is_falsification:
            event = "FALSIFICATION_THRESHOLD_BREACHED"
            msg = f"🚨 FALSIFICATION ALERT: Holding ${symbol} ({company_name}) has breached its bottom threshold! Current: ${current_price} < Floor: ${target_buy_price}. Mandatory exit rule active."
        elif is_stop_loss:
            event = "HOLDING_STOP_LOSS_TRIGGERED"
            msg = f"🚨 STOP-LOSS ALERT: Holding ${symbol} ({company_name}) drawdown breached -7% stop-loss in consolidation. Mandatory cut-loss rule active."
        elif is_sell:
            event = "PRICE_SELL_ZONE_TRIGGERED"
            msg = f"⚠️ ${symbol} ({company_name}) has reached your Profit-Taking Target! Current: ${current_price} >= Target: ${target_buy_price}"
        elif is_discovery:
            event = "REGULAR_UNIVERSE_DISCOVERY_BUY"
            msg = f"💎 VALUE DISCOVERY: Regular stock ${symbol} ({company_name}) dropped >=10% below Buy Ceiling to ${current_price}. Right-side momentum confirmed! Consider adding to Watchlist."
        else:
            event = "PRICE_BUY_ZONE_TRIGGERED"
            msg = f"🔥 ${symbol} ({company_name}) has entered your Target Buy Zone! Current: ${current_price} <= Target: ${target_buy_price}"

        payload = {
            "event": event,
            "symbol": symbol,
            "company_name": company_name,
            "current_price": current_price,
            "target_price": target_buy_price,
            "difference_pct": diff_pct,
            "alert_type": upper_type,
            "message": msg
        }

        logger.info(f"[DISPATCH ALERT] {payload['message']}")

        # Dispatch Discord Push Alert if enabled in DB
        discord_result = None
        if session:
            try:
                config = session.exec(select(PushAlertConfigDB)).first()
                if config and config.is_discord_enabled and config.discord_webhook_url:
                    if is_falsification:
                        title = f"🚨 FALSIFICATION ALERT: Holding ${symbol} Breached Floor"
                        description = (
                            f"⚠️ Owned holding **{company_name}** (`${symbol}`) has fallen below its **quantified 200D MA exit floor**!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Bottom Exit Floor**: `${target_buy_price}` (-3.0% buffer under 200D MA)\n"
                            f"• **Breakdown Margin**: `-{diff_pct}%` below floor\n\n"
                            f"**Investment Constitution Mandate**: Pre-trade falsification condition is met. Strictly prohibit averaging down on the left side. Execute stop-loss discipline."
                        )
                        color = PushNotifier.DISCORD_COLOR_FALSIFICATION
                        footer = "Prism Loop • Owned Holding Falsification Alert"
                    elif is_stop_loss:
                        title = f"🚨 STOP-LOSS ALERT: Holding ${symbol} Drawdown"
                        description = (
                            f"⚠️ Owned holding **{company_name}** (`${symbol}`) has triggered a **-7% stop-loss threshold** in consolidation!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Stop Floor**: `${target_buy_price}`\n\n"
                            f"**Mandatory Action**: Cut loss mechanically to protect portfolio survival."
                        )
                        color = PushNotifier.DISCORD_COLOR_FALSIFICATION
                        footer = "Prism Loop • Anti-Ruin Constitution Stop-Loss"
                    elif is_sell:
                        title = f"🔴 PROFIT-TAKING ALERT: ${symbol}"
                        description = (
                            f"**{company_name}** (`${symbol}`) has reached your **Profit-Taking / Sell Target**!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Target Sell Threshold**: `${target_buy_price}`\n"
                            f"• **Premium Margin**: `+{diff_pct}%` above anchor"
                        )
                        color = PushNotifier.DISCORD_COLOR_SELL_DANGER
                        footer = "Prism Loop • Profit-Taking / Resistance Alert"
                    elif is_discovery:
                        title = f"💎 VALUE DISCOVERY: ${symbol} at Deep Discount"
                        description = (
                            f"Regular universe stock **{company_name}** (`${symbol}`) is trading at a **deep 10%+ discount** below its DCF Buy Ceiling with **Right-Side Batting Zone confirmation**!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Buy Zone Ceiling**: `${target_buy_price}`\n"
                            f"• **Deep Discount**: `{diff_pct}%` below ceiling\n\n"
                            f"**Suggested Action**: Star and add to your Watchlist to monitor actively."
                        )
                        color = PushNotifier.DISCORD_COLOR_MACRO_DIGEST
                        footer = "Prism Loop • Regular Universe Opportunity Alert"
                    else:
                        title = f"🟢 WATCHLIST BUY ZONE ALERT: ${symbol}"
                        description = (
                            f"**{company_name}** (`${symbol}`) in your Watchlist has entered your **Target Buy Zone** with **Right-Side Batting Zone momentum**!\n\n"
                            f"• **Current Price**: `${current_price}`\n"
                            f"• **Target Buy Threshold**: `${target_buy_price}` (95% Buy Ceiling)\n"
                            f"• **Discount Margin**: `{diff_pct}%` below target"
                        )
                        color = PushNotifier.DISCORD_COLOR_BUY_ZONE
                        footer = "Prism Loop • Watchlist Buy Zone Alert"

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
