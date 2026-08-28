"""
Price Alert Monitoring Engine
Evaluates live stock quotes against user watchlists in SQLModel database, enforces anti-spam cooldowns, and logs alert triggers.
"""

import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlmodel import Session, select

from backend.models.db_models import UserWatchlistDB, PriceAlertLogDB, get_utc_now
from backend.data_sources.data_provider import data_provider_manager
from backend.services.notification_dispatcher import dispatcher

logger = logging.getLogger(__name__)

COOLDOWN_HOURS = 12  # Prevent spamming alerts for the same stock within 12 hours

class PriceAlertEngine:
    def __init__(self):
        self._last_scheduled_dispatch: Dict[str, str] = {}

    async def evaluate_watchlist_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        Scans all starred watchlist items.
        If target_buy_price is set, evaluates current_price <= target_buy_price.
        If target_buy_price is not set, dynamically computes latest ideal_buy_range_max from PricingEngine.
        Triggers price alert if in buy zone and 12-hour anti-spam cooldown has elapsed.
        """
        triggered_results = []
        watchlist_items = session.exec(select(UserWatchlistDB)).all()

        for item in watchlist_items:
            try:
                # Fetch real-time price quote
                quote = data_provider_manager.get_stock_quote(item.symbol)
                current_price = quote.get("current_price", 0.0)

                # Determine effective target buy price: saved snapshot, or dynamic fallback from PricingEngine
                target_price = item.target_buy_price
                if not target_price or target_price <= 0:
                    from backend.engines.pricing_engine import PricingEngine
                    pricing_eval = PricingEngine.evaluate_pricing_and_entry_zone(quote)
                    target_price = pricing_eval.get("ideal_buy_range_max")

                if not target_price or target_price <= 0:
                    continue

                if current_price > 0 and current_price <= target_price:
                    # Check anti-spam cooldown threshold (12 hours)
                    cutoff = get_utc_now() - timedelta(hours=COOLDOWN_HOURS)
                    recent_alert = session.exec(
                        select(PriceAlertLogDB)
                        .where(PriceAlertLogDB.symbol == item.symbol)
                        .where(PriceAlertLogDB.triggered_at >= cutoff)
                    ).first()

                    if not recent_alert:
                        # Log trigger event in SQLite database
                        log_entry = PriceAlertLogDB(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=target_price,
                            notification_channel="IN_APP",
                            status="TRIGGERED",
                            message=f"Stock ${item.symbol} reached target buy price (${current_price} <= ${target_price})",
                            triggered_at=get_utc_now()
                        )
                        session.add(log_entry)
                        session.commit()
                        session.refresh(log_entry)

                        # Dispatch alert notification (In-App + Discord Webhook)
                        dispatch_res = await dispatcher.dispatch_price_alert(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=item.target_buy_price,
                            session=session
                        )

                        triggered_results.append({
                            "log_id": log_entry.id,
                            "symbol": item.symbol,
                            "company_name": item.company_name,
                            "current_price": current_price,
                            "target_buy_price": item.target_buy_price,
                            "dispatch": dispatch_res
                        })
            except Exception as e:
                logger.error(f"Error checking price alert for {item.symbol}: {e}")

        return triggered_results

    def evaluate_scheduled_triggers(self, session: Session) -> Dict[str, Any]:
        """
        Evaluates time-based scheduled triggers:
        - Daily 8:00 AM EST Macro Digest
        - Midday 12:00 PM EST Gold Nuggets Discovery
        """
        from backend.models.db_models import PushAlertConfigDB
        from backend.engines.push_notifier import PushNotifier

        config = session.exec(select(PushAlertConfigDB)).first()
        if not config or not config.is_discord_enabled or not config.discord_webhook_url:
            return {"status": "skipped", "reason": "Discord webhook not configured or disabled"}

        now_utc = get_utc_now()
        today_str = now_utc.strftime("%Y-%m-%d")
        current_hour = now_utc.hour

        dispatched = []

        # 1. Macro Digest (8:00 AM EST = 12:00-14:00 UTC)
        if 12 <= current_hour <= 14 and self._last_scheduled_dispatch.get("macro_digest") != today_str:
            res = PushNotifier.send_macro_digest_alert(config.discord_webhook_url, lang="en")
            if res.get("success"):
                self._last_scheduled_dispatch["macro_digest"] = today_str
                dispatched.append("macro_digest")

        # 2. Gold Nuggets (12:00 PM EST = 16:00-18:00 UTC)
        if 16 <= current_hour <= 18 and self._last_scheduled_dispatch.get("gold_nuggets") != today_str:
            res = PushNotifier.send_gold_nuggets_alert(config.discord_webhook_url, lang="en")
            if res.get("success"):
                self._last_scheduled_dispatch["gold_nuggets"] = today_str
                dispatched.append("gold_nuggets")

        return {
            "status": "ok",
            "dispatched": dispatched,
            "date": today_str,
            "hour_utc": current_hour
        }

    async def evaluate_scheduled_and_conditional_alerts(self, session: Session) -> Dict[str, Any]:
        """Runs both conditional watchlist evaluations and scheduled trigger evaluations."""
        conditional_results = await self.evaluate_watchlist_alerts(session)
        scheduled_results = self.evaluate_scheduled_triggers(session)
        return {
            "conditional_alerts": conditional_results,
            "scheduled_alerts": scheduled_results
        }

alert_engine = PriceAlertEngine()
