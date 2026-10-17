"""
Price Alert Monitoring Engine
Evaluates live stock quotes against user watchlists in SQLModel database, enforces anti-spam cooldowns, and logs alert triggers.
"""

import logging
import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from sqlmodel import Session, select

from backend.models.db_models import UserWatchlistDB, PriceAlertLogDB, ValuationAlertSettingsDB, get_utc_now
from backend.data_sources.data_provider import data_provider_manager
from backend.services.notification_dispatcher import dispatcher

logger = logging.getLogger(__name__)

COOLDOWN_HOURS = 12  # Prevent spamming alerts for the same stock within 12 hours

class PriceAlertEngine:
    def __init__(self):
        self._last_scheduled_dispatch: Dict[str, str] = {}

    async def evaluate_watchlist_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        Scans all starred watchlist items against user sensitivity settings and overrides.
        Evaluates both Buy Zone triggers (current_price <= target_buy) and
        Profit-Taking triggers (current_price >= target_sell).
        Triggers price alerts when condition is met and 12-hour anti-spam cooldown has elapsed.
        """
        triggered_results = []
        watchlist_items = session.exec(select(UserWatchlistDB)).all()

        # Load valuation and alert sensitivity settings
        settings_rec = session.exec(select(ValuationAlertSettingsDB)).first()
        custom_mos = settings_rec.global_mos_pct if settings_rec else None
        anchor_mode = settings_rec.technical_anchor_mode if settings_rec else "adaptive_balanced"
        overrides: Dict[str, Dict[str, Any]] = {}
        if settings_rec and settings_rec.ticker_overrides_json:
            try:
                overrides = json.loads(settings_rec.ticker_overrides_json)
            except Exception:
                overrides = {}

        for item in watchlist_items:
            try:
                # Fetch real-time price quote
                quote = data_provider_manager.get_stock_quote(item.symbol)
                current_price = quote.get("current_price", 0.0)
                if current_price <= 0:
                    continue

                override_data = overrides.get(item.symbol.upper(), {})

                # Compute dynamic pricing brackets using active settings
                from backend.engines.pricing_engine import PricingEngine
                pricing_eval = PricingEngine.evaluate_pricing_and_entry_zone(
                    quote,
                    custom_mos_pct=custom_mos,
                    anchor_mode=anchor_mode
                )

                # 1. Determine effective target buy price (override -> saved target -> dynamic ideal_buy_range_max)
                target_buy = override_data.get("target_buy")
                if not target_buy or target_buy <= 0:
                    target_buy = item.target_buy_price
                if not target_buy or target_buy <= 0:
                    target_buy = pricing_eval.get("ideal_buy_range_max")

                # 2. Determine effective target sell price (override -> saved target -> dynamic ideal_sell_range_min)
                target_sell = override_data.get("target_sell")
                if not target_sell or target_sell <= 0:
                    target_sell = item.target_sell_price
                if not target_sell or target_sell <= 0:
                    target_sell = pricing_eval.get("ideal_sell_range_min")

                cutoff = get_utc_now() - timedelta(hours=COOLDOWN_HOURS)

                # Evaluate Buy Zone Alert Trigger
                if target_buy and target_buy > 0 and current_price <= target_buy:
                    recent_buy = session.exec(
                        select(PriceAlertLogDB)
                        .where(PriceAlertLogDB.symbol == item.symbol)
                        .where(PriceAlertLogDB.status.in_(["TRIGGERED", "BUY_TRIGGERED"]))
                        .where(PriceAlertLogDB.triggered_at >= cutoff)
                    ).first()

                    if not recent_buy:
                        log_entry = PriceAlertLogDB(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=target_buy,
                            notification_channel="IN_APP",
                            status="BUY_TRIGGERED",
                            message=f"Stock ${item.symbol} reached target buy price (${current_price} <= ${target_buy})",
                            triggered_at=get_utc_now()
                        )
                        session.add(log_entry)
                        session.commit()
                        session.refresh(log_entry)

                        dispatch_res = await dispatcher.dispatch_price_alert(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=target_buy,
                            session=session,
                            alert_type="BUY"
                        )

                        triggered_results.append({
                            "log_id": log_entry.id,
                            "symbol": item.symbol,
                            "company_name": item.company_name,
                            "current_price": current_price,
                            "target_price": target_buy,
                            "alert_type": "BUY",
                            "dispatch": dispatch_res
                        })

                # Evaluate Sell / Profit-Taking Alert Trigger
                if target_sell and target_sell > 0 and current_price >= target_sell:
                    recent_sell = session.exec(
                        select(PriceAlertLogDB)
                        .where(PriceAlertLogDB.symbol == item.symbol)
                        .where(PriceAlertLogDB.status == "SELL_TRIGGERED")
                        .where(PriceAlertLogDB.triggered_at >= cutoff)
                    ).first()

                    if not recent_sell:
                        log_entry = PriceAlertLogDB(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=target_sell,
                            notification_channel="IN_APP",
                            status="SELL_TRIGGERED",
                            message=f"Stock ${item.symbol} reached profit-taking price (${current_price} >= ${target_sell})",
                            triggered_at=get_utc_now()
                        )
                        session.add(log_entry)
                        session.commit()
                        session.refresh(log_entry)

                        dispatch_res = await dispatcher.dispatch_price_alert(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=target_sell,
                            session=session,
                            alert_type="SELL"
                        )

                        triggered_results.append({
                            "log_id": log_entry.id,
                            "symbol": item.symbol,
                            "company_name": item.company_name,
                            "current_price": current_price,
                            "target_price": target_sell,
                            "alert_type": "SELL",
                            "dispatch": dispatch_res
                        })

                # Evaluate Falsification Bottom Threshold Trigger (decisive break below 200D MA)
                two_hundred_sma = float(pricing_eval.get("two_hundred_day_sma") or 0.0)
                if two_hundred_sma > 0:
                    bottom_threshold = round(two_hundred_sma * 0.97, 2)
                    if current_price < bottom_threshold:
                        recent_falsification = session.exec(
                            select(PriceAlertLogDB)
                            .where(PriceAlertLogDB.symbol == item.symbol)
                            .where(PriceAlertLogDB.status == "FALSIFICATION_TRIGGERED")
                            .where(PriceAlertLogDB.triggered_at >= cutoff)
                        ).first()

                        if not recent_falsification:
                            log_entry = PriceAlertLogDB(
                                symbol=item.symbol,
                                company_name=item.company_name,
                                current_price=current_price,
                                target_buy_price=bottom_threshold,
                                notification_channel="IN_APP",
                                status="FALSIFICATION_TRIGGERED",
                                message=f"🚨 Falsification Triggered: ${item.symbol} breached 200D MA floor (${current_price} < ${bottom_threshold})",
                                triggered_at=get_utc_now()
                            )
                            session.add(log_entry)
                            session.commit()
                            session.refresh(log_entry)

                            dispatch_res = await dispatcher.dispatch_price_alert(
                                symbol=item.symbol,
                                company_name=item.company_name,
                                current_price=current_price,
                                target_buy_price=bottom_threshold,
                                session=session,
                                alert_type="FALSIFICATION"
                            )

                            triggered_results.append({
                                "log_id": log_entry.id,
                                "symbol": item.symbol,
                                "company_name": item.company_name,
                                "current_price": current_price,
                                "target_price": bottom_threshold,
                                "alert_type": "FALSIFICATION",
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

    @classmethod
    def compute_trend_temperature(cls, df_ohlcv: Any) -> Dict[str, Any]:
        """
        Computes 4-state Trend Temperature: FREEZE (冻), FLAT (平), WARM (温), HOT (热).
        Grounded in volatility-normalized trend Z-score:
          sma_50 = 50-day moving average of close
          sma_200 = 200-day moving average of close
          ret_20d = (close[-1] / close[-21]) - 1.0
          vol_20d = close.pct_change().tail(20).std() * sqrt(252)
          z_trend = ret_20d / max(0.005, vol_20d / sqrt(12))
          vol_ratio = volume.tail(5).mean() / max(1.0, volume.tail(20).mean())

        Mapping:
          FREEZE (冻): close < sma_200 and z_trend < -0.8
          HOT (热): close > sma_50 and z_trend >= 1.2
          WARM (温): close > sma_50 and 0.3 <= z_trend < 1.2 and vol_ratio >= 1.0
          FLAT (平): Otherwise.
        """
        import pandas as pd
        import numpy as np

        if df_ohlcv is None or (isinstance(df_ohlcv, pd.DataFrame) and df_ohlcv.empty):
            return {
                "state": "FLAT",
                "state_label_en": "FLAT (Consolidation)",
                "state_label_zh": "平（震荡整理）",
                "z_trend": 0.0,
                "ret_20d_pct": 0.0,
                "vol_20d_pct": 0.0,
                "vol_ratio": 1.0,
                "sma_50": 0.0,
                "sma_200": 0.0,
                "transition": "NONE"
            }

        # Normalize column names
        close_col = "Close" if "Close" in df_ohlcv.columns else ("close" if "close" in df_ohlcv.columns else df_ohlcv.columns[0])
        close_series = df_ohlcv[close_col].dropna()

        vol_col = "Volume" if "Volume" in df_ohlcv.columns else ("volume" if "volume" in df_ohlcv.columns else None)
        vol_series = df_ohlcv[vol_col].dropna() if vol_col else pd.Series([1000000.0] * len(close_series), index=close_series.index)

        curr_close = float(close_series.iloc[-1])
        sma_50 = float(close_series.rolling(min(50, len(close_series))).mean().iloc[-1])
        sma_200 = float(close_series.rolling(min(200, len(close_series))).mean().iloc[-1])

        lookback = min(20, len(close_series) - 1)
        if lookback >= 5:
            ret_20d = float((curr_close / close_series.iloc[-(lookback + 1)]) - 1.0)
            daily_returns = close_series.pct_change().dropna().tail(lookback)
            daily_std = float(daily_returns.std()) if len(daily_returns) > 1 else 0.015
            vol_20d = daily_std * (252.0 ** 0.5)
        else:
            ret_20d = 0.0
            vol_20d = 0.20

        # Volatility-normalized Z score
        z_trend = round(ret_20d / max(0.005, vol_20d / (12.0 ** 0.5)), 2)

        # Volume confirmation ratio (last 5D vs last 20D)
        vol_5d_mean = float(vol_series.tail(min(5, len(vol_series))).mean()) if len(vol_series) > 0 else 1.0
        vol_20d_mean = float(vol_series.tail(min(20, len(vol_series))).mean()) if len(vol_series) > 0 else 1.0
        vol_ratio = round(vol_5d_mean / max(1.0, vol_20d_mean), 2)

        # State mapping
        if curr_close < sma_200 and z_trend < -0.8:
            state = "FREEZE"
            label_en = "FREEZE (Blood Chips Left-Side)"
            label_zh = "冻（血筹区：左侧勿抄底）"
        elif curr_close > sma_50 and z_trend >= 1.2:
            state = "HOT"
            label_en = "HOT (Fat-Tail Momentum)"
            label_zh = "热（肥尾主升浪）"
        elif curr_close > sma_50 and 0.3 <= z_trend < 1.2 and vol_ratio >= 1.0:
            state = "WARM"
            label_en = "WARM (Right-Side Batting Zone)"
            label_zh = "温（温转热右侧击球区）"
        else:
            state = "FLAT"
            label_en = "FLAT (Consolidation)"
            label_zh = "平（震荡整理）"

        return {
            "state": state,
            "state_label_en": label_en,
            "state_label_zh": label_zh,
            "z_trend": z_trend,
            "ret_20d_pct": round(ret_20d * 100.0, 2),
            "vol_20d_pct": round(vol_20d * 100.0, 2),
            "vol_ratio": vol_ratio,
            "sma_50": round(sma_50, 2),
            "sma_200": round(sma_200, 2),
            "transition": "NONE"
        }

alert_engine = PriceAlertEngine()
AlertEngine = PriceAlertEngine
