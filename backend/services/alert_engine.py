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
    async def evaluate_watchlist_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        Scans all starred watchlist items with target_buy_price set.
        Triggers price alert if current_price <= target_buy_price and cooldown has elapsed.
        """
        triggered_results = []
        watchlist_items = session.exec(
            select(UserWatchlistDB).where(UserWatchlistDB.target_buy_price.is_not(None))
        ).all()

        for item in watchlist_items:
            if not item.target_buy_price or item.target_buy_price <= 0:
                continue

            try:
                # Fetch real-time price quote
                quote = data_provider_manager.get_stock_quote(item.symbol)
                current_price = quote.get("current_price", 0.0)

                if current_price > 0 and current_price <= item.target_buy_price:
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
                            target_buy_price=item.target_buy_price,
                            notification_channel="IN_APP",
                            status="TRIGGERED",
                            message=f"Stock ${item.symbol} reached target buy price (${current_price} <= ${item.target_buy_price})",
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

alert_engine = PriceAlertEngine()
