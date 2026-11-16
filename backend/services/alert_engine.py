"""
Price Alert Monitoring Engine
Evaluates live stock quotes against user watchlists in SQLModel database, enforces anti-spam cooldowns, and logs alert triggers.
"""

import os
import sys
import asyncio
import logging
import json
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from sqlmodel import Session, select

from backend.models.db_models import UserWatchlistDB, PriceAlertLogDB, ValuationAlertSettingsDB, get_utc_now
from backend.data_sources.data_provider import data_provider_manager, DataProviderManager, FALLBACK_STOCK_DATA
from backend.services.notification_dispatcher import dispatcher

logger = logging.getLogger(__name__)

COOLDOWN_HOURS = 12  # Prevent spamming alerts for the same stock within 12 hours

class PriceAlertEngine:
    """
    Price Alert, 3-Path Right-Side Batting Zone & Holdings Kill-Switch Engine.

    Architectural Invariants (PL-721 through PL-731):
    - 3-Bucket Isolation: Thesis Falsification alerts fire strictly for `bucket == 'HOLDING'`.
    - 3-Path Right-Side Engine (`_compute_trend_temperature_from_series`):
      Evaluated in pure Python (`<0.1ms`) with quote-level memoization (`_trend_eval_cache`):
        Path A (`TREND_CONTINUATION`), Path B (`SUPPORT_BOUNCE`), Path C (`BOTTOM_REVERSAL`).
    - Adaptive Kill-Switch Floor (`compute_adaptive_falsification_floor`):
      Below-200D entries anchor to `COST_BASIS_ATR_STOP` / `RECOVERY_SUPPORT_STOP` (-8% / 2x ATR),
      preventing false Day-0 breaches against overhead 200D SMA resistance.
    """

    def __init__(self):
        self._last_scheduled_dispatch: Dict[str, str] = {}

    async def evaluate_holding_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        1. Holdings Alert Evaluator:
        Monitors actively owned stocks (bucket == 'HOLDING') for:
        - Thesis Falsification Floor breaches (price < 200D SMA * 0.97)
        - Discipline Stop-Loss triggers (drawdown <= -7% in FREEZE/FLAT trend)
        - Profit-taking targets (price >= target_sell)
        Falsification alerts are strictly isolated to HOLDING stocks.
        """
        triggered_results = []
        holdings = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.bucket == "HOLDING")).all()
        if not holdings:
            return triggered_results

        settings_rec = session.exec(select(ValuationAlertSettingsDB)).first()
        custom_mos = settings_rec.global_mos_pct if settings_rec else None
        anchor_mode = settings_rec.technical_anchor_mode if settings_rec else "adaptive_balanced"
        overrides: Dict[str, Dict[str, Any]] = {}
        if settings_rec and settings_rec.ticker_overrides_json:
            try:
                overrides = json.loads(settings_rec.ticker_overrides_json)
            except Exception:
                overrides = {}

        cutoff = get_utc_now() - timedelta(hours=COOLDOWN_HOURS)

        symbols = [item.symbol for item in holdings]
        quotes_list = await asyncio.gather(*[
            data_provider_manager.get_stock_quote_async(s) for s in symbols
        ], return_exceptions=True)
        quotes_map = {
            s: q for s, q in zip(symbols, quotes_list) if isinstance(q, dict)
        }

        for item in holdings:
            try:
                quote = quotes_map.get(item.symbol) or {}
                current_price = float(quote.get("current_price") or 0.0)
                if current_price <= 0:
                    continue

                override_data = overrides.get(item.symbol.upper(), {})
                from backend.engines.pricing_engine import PricingEngine
                pricing_eval = PricingEngine.evaluate_pricing_and_entry_zone(
                    quote,
                    custom_mos_pct=custom_mos,
                    anchor_mode=anchor_mode
                )

                trend_eval = self.evaluate_symbol_trend_temperature(quote)
                trend_state = trend_eval.get("state", "FLAT")

                # A. Evaluate Thesis Falsification Kill-Switch Floor Breach (Holdings Only)
                two_hundred_sma = float(pricing_eval.get("two_hundred_day_sma") or quote.get("two_hundred_day_sma") or 0.0)
                fifty_sma = float(pricing_eval.get("fifty_day_sma") or quote.get("fifty_day_sma") or 0.0)
                adaptive_falsification = self.compute_adaptive_falsification_floor(
                    current_price=current_price,
                    sma_50=fifty_sma,
                    sma_200=two_hundred_sma,
                    buy_in_price=float(item.buy_in_price) if item.buy_in_price else None,
                    atr_14=float(quote.get("atr_14") or 0.0),
                    rsi_14=float(quote.get("rsi_14") or 0.0),
                    vol_ratio=float(quote.get("vol_ratio_5d_20d") or trend_eval.get("vol_ratio") or 1.0)
                )
                bottom_threshold = float(override_data.get("falsification_floor") or adaptive_falsification["falsification_floor"])

                if bottom_threshold > 0 and current_price < bottom_threshold:
                    recent_falsification = session.exec(
                        select(PriceAlertLogDB)
                        .where(PriceAlertLogDB.symbol == item.symbol)
                        .where(PriceAlertLogDB.status.in_(["FALSIFICATION_TRIGGERED", "SELL_DANGER_TRIGGERED"]))
                        .where(PriceAlertLogDB.triggered_at >= cutoff)
                    ).first()

                    if not recent_falsification:
                        diff_pct = round(((bottom_threshold - current_price) / bottom_threshold) * 100, 2)
                        log_entry = PriceAlertLogDB(
                            symbol=item.symbol,
                            company_name=item.company_name,
                            current_price=current_price,
                            target_buy_price=bottom_threshold,
                            notification_channel="IN_APP",
                            status="FALSIFICATION_TRIGGERED",
                            message=f"🚨 Holding Falsification Floor Breached: ${item.symbol} (${current_price} < ${bottom_threshold}, -{diff_pct}%)",
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
                            "breakdown_pct": diff_pct,
                            "alert_type": "FALSIFICATION",
                            "bucket": "HOLDING",
                            "dispatch": dispatch_res
                        })

                # B. Evaluate Discipline Stop-Loss on Holding (-7% Drawdown in Consolidation)
                if item.buy_in_price and item.buy_in_price > 0:
                    drawdown_pct = round(((current_price - item.buy_in_price) / item.buy_in_price) * 100.0, 2)
                    if drawdown_pct <= -7.0 and trend_state in ["FREEZE", "FLAT"]:
                        recent_stop = session.exec(
                            select(PriceAlertLogDB)
                            .where(PriceAlertLogDB.symbol == item.symbol)
                            .where(PriceAlertLogDB.status == "STOP_LOSS_TRIGGERED")
                            .where(PriceAlertLogDB.triggered_at >= cutoff)
                        ).first()

                        if not recent_stop:
                            stop_floor = round(item.buy_in_price * 0.93, 2)
                            log_entry = PriceAlertLogDB(
                                symbol=item.symbol,
                                company_name=item.company_name,
                                current_price=current_price,
                                target_buy_price=stop_floor,
                                notification_channel="IN_APP",
                                status="STOP_LOSS_TRIGGERED",
                                message=f"🚨 Holding Stop-Loss Triggered: ${item.symbol} drawdown {drawdown_pct}% in {trend_state} trend",
                                triggered_at=get_utc_now()
                            )
                            session.add(log_entry)
                            session.commit()
                            session.refresh(log_entry)

                            dispatch_res = await dispatcher.dispatch_price_alert(
                                symbol=item.symbol,
                                company_name=item.company_name,
                                current_price=current_price,
                                target_buy_price=stop_floor,
                                session=session,
                                alert_type="STOP_LOSS"
                            )

                            triggered_results.append({
                                "log_id": log_entry.id,
                                "symbol": item.symbol,
                                "company_name": item.company_name,
                                "current_price": current_price,
                                "target_price": stop_floor,
                                "drawdown_pct": drawdown_pct,
                                "alert_type": "STOP_LOSS",
                                "bucket": "HOLDING",
                                "dispatch": dispatch_res
                            })

                # C. Evaluate Holding Profit-Taking
                target_sell = override_data.get("target_sell") or item.target_sell_price
                if not target_sell or target_sell <= 0:
                    target_sell = pricing_eval.get("ideal_sell_range_min")

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
                            "bucket": "HOLDING",
                            "dispatch": dispatch_res
                        })

            except Exception as e:
                logger.error(f"Error evaluating holding alert for {item.symbol}: {e}")

        return triggered_results

    async def evaluate_watchlist_items_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        2. Watchlist Alert Evaluator:
        Monitors candidate compounders (bucket == 'WATCHLIST').
        Target Price threshold defaults to 95% of ideal buy zone ceiling (ideal_buy_range_max * 0.95).
        Triggers Buy Alert when:
          current_price <= target_buy_price AND is_right_side (trend WARM/HOT)
        Falsification danger alerts are NEVER fired for watchlist items.
        """
        triggered_results = []
        watchlist_items = session.exec(
            select(UserWatchlistDB).where(
                (UserWatchlistDB.bucket == "WATCHLIST") | (UserWatchlistDB.bucket == None)
            )
        ).all()
        if not watchlist_items:
            return triggered_results

        settings_rec = session.exec(select(ValuationAlertSettingsDB)).first()
        custom_mos = settings_rec.global_mos_pct if settings_rec else None
        anchor_mode = settings_rec.technical_anchor_mode if settings_rec else "adaptive_balanced"
        overrides: Dict[str, Dict[str, Any]] = {}
        if settings_rec and settings_rec.ticker_overrides_json:
            try:
                overrides = json.loads(settings_rec.ticker_overrides_json)
            except Exception:
                overrides = {}

        cutoff = get_utc_now() - timedelta(hours=COOLDOWN_HOURS)

        symbols = [item.symbol for item in watchlist_items]
        quotes_list = await asyncio.gather(*[
            data_provider_manager.get_stock_quote_async(s) for s in symbols
        ], return_exceptions=True)
        quotes_map = {
            s: q for s, q in zip(symbols, quotes_list) if isinstance(q, dict)
        }

        for item in watchlist_items:
            try:
                quote = quotes_map.get(item.symbol) or {}
                current_price = float(quote.get("current_price") or 0.0)
                if current_price <= 0:
                    continue

                override_data = overrides.get(item.symbol.upper(), {})
                from backend.engines.pricing_engine import PricingEngine
                pricing_eval = PricingEngine.evaluate_pricing_and_entry_zone(
                    quote,
                    custom_mos_pct=custom_mos,
                    anchor_mode=anchor_mode
                )

                buy_ceiling = float(pricing_eval.get("ideal_buy_range_max") or 0.0)

                # Determine effective target buy price:
                # 1. Custom ticker override in settings
                # 2. Saved target on watchlist item
                # 3. Default: 95% of ideal buy zone ceiling
                target_buy = override_data.get("target_buy")
                if not target_buy or target_buy <= 0:
                    target_buy = item.target_buy_price
                if not target_buy or target_buy <= 0:
                    if buy_ceiling > 0:
                        target_buy = round(buy_ceiling * 0.95, 2)
                    else:
                        continue  # No buy ceiling available, cannot establish buy zone

                # If item had no target_buy_price saved in DB, persist the 95% default
                if (not item.target_buy_price or item.target_buy_price <= 0) and buy_ceiling > 0:
                    item.target_buy_price = round(buy_ceiling * 0.95, 2)
                    session.add(item)
                    session.commit()

                # Evaluate Batting Zone & Trend Temperature
                trend_eval = self.evaluate_symbol_trend_temperature(quote)
                is_right_side = trend_eval.get("is_right_side", False)
                trend_state = trend_eval.get("state", "FLAT")

                # Condition 1: Must fall into buy zone (current_price <= target_buy AND current_price <= buy_ceiling if buy_ceiling > 0)
                in_buy_zone = (current_price <= target_buy) and (buy_ceiling <= 0 or current_price <= buy_ceiling)

                # Condition 2: Must be on Right-Side of Batting Zone
                if in_buy_zone and is_right_side:
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
                            message=f"Watchlist ${item.symbol} reached 95% target buy price (${current_price} <= ${target_buy}) with Right-Side Batting Zone ({trend_state})",
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
                            "batting_zone": "RIGHT_SIDE",
                            "trend_state": trend_state,
                            "alert_type": "BUY",
                            "bucket": "WATCHLIST",
                            "dispatch": dispatch_res
                        })
                elif in_buy_zone and not is_right_side:
                    logger.info(
                        f"[BUY ALERT SUPPRESSED] Watchlist ${item.symbol} is in buy zone (${current_price} <= ${target_buy}), "
                        f"but batting zone is LEFT_SIDE ({trend_state}). Awaiting right-side reversal confirmation."
                    )

            except Exception as e:
                logger.error(f"Error checking watchlist alert for {item.symbol}: {e}")

        return triggered_results

    async def evaluate_regular_universe_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        3. Regular Universe Opportunity Evaluator:
        Scans un-starred regular universe stocks.
        Triggers Opportunistic Value Discovery alert when:
          current_price <= ideal_buy_range_max * 0.90 (10%+ deep discount below buy ceiling)
          AND is_right_side (trend WARM/HOT)
        Dispatches DISCOVERY_BUY alert with suggestion to add stock to Watchlist.
        """
        triggered_results = []
        from backend.models.db_models import RecommendationSnapshotDB, ValuationAlertSettingsDB
        from backend.engines.pricing_engine import PricingEngine

        settings_rec = session.exec(select(ValuationAlertSettingsDB)).first()
        custom_mos = settings_rec.global_mos_pct if settings_rec else None
        anchor_mode = settings_rec.technical_anchor_mode if settings_rec else "adaptive_balanced"

        tracked_symbols = {row.symbol.upper().strip() for row in session.exec(select(UserWatchlistDB)).all()}
        snapshots = session.exec(select(RecommendationSnapshotDB).where(RecommendationSnapshotDB.lang == "en")).all()
        if not snapshots:
            return triggered_results

        cutoff = get_utc_now() - timedelta(hours=COOLDOWN_HOURS)

        # Collect candidate snapshots not in tracked holdings or watchlist
        candidate_snaps: Dict[str, Any] = {}
        for snap in snapshots:
            sym = snap.symbol.upper().strip()
            if sym not in tracked_symbols and sym not in candidate_snaps:
                candidate_snaps[sym] = snap

        candidate_symbols = list(candidate_snaps.keys())
        if not candidate_symbols:
            return triggered_results

        # Retrieve live quotes for candidate regular stocks
        quotes_list = await asyncio.gather(*[
            data_provider_manager.get_stock_quote_async(s) for s in candidate_symbols
        ], return_exceptions=True)
        quotes_map = {
            s: q for s, q in zip(candidate_symbols, quotes_list) if isinstance(q, dict) and q.get("current_price")
        }

        for sym, snap in candidate_snaps.items():
            try:
                quote = quotes_map.get(sym)
                if not quote:
                    with DataProviderManager._LOCK:
                        quote = DataProviderManager._CACHE.get(sym)
                if not quote:
                    continue

                current_price = float(quote.get("current_price") or 0.0)
                if current_price <= 0:
                    continue

                # Recalculate live pricing to get real ideal buy zone ceiling
                pricing_eval = PricingEngine.evaluate_pricing_and_entry_zone(
                    quote,
                    custom_mos_pct=custom_mos,
                    anchor_mode=anchor_mode
                )
                buy_ceiling = float(pricing_eval.get("ideal_buy_range_max") or quote.get("ideal_buy_range_max") or 0.0)
                if buy_ceiling <= 0:
                    try:
                        snap_payload = json.loads(snap.financial_payload_json) if snap and snap.financial_payload_json else {}
                        buy_ceiling = float(snap_payload.get("ideal_buy_range_max") or 0.0)
                    except Exception:
                        pass
                if buy_ceiling <= 0:
                    continue

                # Rule 4: Target price is strictly 90% of ideal buy zone ceiling
                regular_target = round(buy_ceiling * 0.90, 2)

                # Batting zone must be on the right side (trend WARM or HOT)
                trend_eval = self.evaluate_symbol_trend_temperature(quote)
                is_right_side = trend_eval.get("is_right_side", False)
                trend_state = trend_eval.get("state", "FLAT")

                # Condition: current_price is 90% or lower than ideal buy zone ceiling AND right-side batting zone
                if current_price <= regular_target and is_right_side:
                    recent_discovery = session.exec(
                        select(PriceAlertLogDB)
                        .where(PriceAlertLogDB.symbol == sym)
                        .where(PriceAlertLogDB.status == "REGULAR_DISCOVERY_TRIGGERED")
                        .where(PriceAlertLogDB.triggered_at >= cutoff)
                    ).first()

                    if not recent_discovery:
                        log_entry = PriceAlertLogDB(
                            symbol=sym,
                            company_name=snap.company_name,
                            current_price=current_price,
                            target_buy_price=regular_target,
                            notification_channel="IN_APP",
                            status="REGULAR_DISCOVERY_TRIGGERED",
                            message=f"💎 Value Discovery: Regular stock ${sym} at 10%+ discount to Buy Ceiling (${current_price} <= ${regular_target}) with Right-Side momentum ({trend_state}). Suggest adding to Watchlist.",
                            triggered_at=get_utc_now()
                        )
                        session.add(log_entry)
                        session.commit()
                        session.refresh(log_entry)

                        dispatch_res = await dispatcher.dispatch_price_alert(
                            symbol=sym,
                            company_name=snap.company_name,
                            current_price=current_price,
                            target_buy_price=regular_target,
                            session=session,
                            alert_type="DISCOVERY_BUY"
                        )

                        triggered_results.append({
                            "log_id": log_entry.id,
                            "symbol": sym,
                            "company_name": snap.company_name,
                            "current_price": current_price,
                            "target_price": regular_target,
                            "batting_zone": "RIGHT_SIDE",
                            "trend_state": trend_state,
                            "alert_type": "DISCOVERY_BUY",
                            "bucket": "REGULAR",
                            "dispatch": dispatch_res
                        })
                elif current_price <= regular_target and not is_right_side:
                    logger.info(
                        f"[REGULAR DISCOVERY SUPPRESSED] Stock ${sym} price ${current_price} <= ${regular_target}, "
                        f"but batting zone is LEFT_SIDE ({trend_state}). Awaiting right-side reversal confirmation."
                    )

            except Exception as e:
                logger.error(f"Error evaluating regular universe alert for {sym}: {e}")

        return triggered_results

    async def evaluate_watchlist_alerts(self, session: Session) -> List[Dict[str, Any]]:
        """
        Unified Conditional Alert Evaluator:
        Executes all 3 tiered alert pipelines:
        1. Holdings Alerts (Falsification floor breach, stop-loss, profit-taking)
        2. Watchlist Alerts (Target buy price <= 95% ceiling + right-side momentum)
        3. Regular Universe Alerts (Target buy price <= 90% ceiling + right-side momentum)
        """
        results = []
        results.extend(await self.evaluate_holding_alerts(session))
        results.extend(await self.evaluate_watchlist_items_alerts(session))
        results.extend(await self.evaluate_regular_universe_alerts(session))
        return results

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

    @staticmethod
    def hydrate_holding_context(
        stock_data: Dict[str, Any],
        symbol: str,
        session: Optional[Session] = None
    ) -> None:
        """
        Hydrates user tracking bucket, buy_in_price, and shares_held from UserWatchlistDB
        so downstream pricing, discipline audit, and debate falsification floor calculations
        accurately reflect whether the stock is a held position and its entry cost basis.
        """
        stock_data.setdefault("bucket", "NONE")
        norm_sym = symbol.strip().upper()

        def _apply(watch_rec: Optional[UserWatchlistDB]) -> None:
            if not watch_rec:
                return
            stock_data["bucket"] = watch_rec.bucket or "WATCHLIST"
            if watch_rec.buy_in_price is not None and watch_rec.buy_in_price > 0:
                stock_data["buy_in_price"] = float(watch_rec.buy_in_price)
            if watch_rec.shares_held is not None:
                stock_data["shares_held"] = float(watch_rec.shares_held)

        try:
            if session and hasattr(session, "exec"):
                rec = session.exec(
                    select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm_sym)
                ).first()
                _apply(rec)
            else:
                from backend.database import engine as db_engine
                with Session(db_engine) as own_session:
                    rec = own_session.exec(
                        select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm_sym)
                    ).first()
                    _apply(rec)
        except Exception as exc:
            logger.debug("Skipping holding context hydration for %s: %s", norm_sym, exc)

    @classmethod
    def compute_adaptive_falsification_floor(
        cls,
        current_price: float,
        sma_50: float,
        sma_200: float,
        buy_in_price: Optional[float] = None,
        atr_14: Optional[float] = None,
        rsi_14: Optional[float] = None,
        vol_ratio: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        PL-726.5.1: Adaptive Thesis Falsification Floor & Two-Tier Exit Alerts.
        Eliminates the Day-0 Falsification Paradox when buy_in_price < 200D SMA.
        """
        eff_atr = float(atr_14) if (atr_14 and float(atr_14) > 0) else round(max(current_price or 1.0, 1.0) * 0.022, 2)
        has_entry = (buy_in_price is not None and float(buy_in_price) > 0)
        curr_p = float(current_price or 1.0)
        ref_p = float(buy_in_price) if has_entry else curr_p

        # Case A: Position entered or trading below or near 200D SMA (Contrarian / Recovery regime)
        # PL-729.4: Eliminates the Day-0 Falsification Paradox whenever ref_p < 200D SMA or when 50D < 200D
        is_below_200d_recovery = bool(
            sma_200 > 0 and (
                ref_p < sma_200 * 0.985 or
                (has_entry and ref_p < sma_200) or
                (sma_50 > 0 and sma_50 < sma_200 and ref_p < sma_200 * 1.01)
            )
        )
        if is_below_200d_recovery:
            # Anchor to disciplined -7% to -8% or 2.0x ATR below cost basis / reference price, NEVER above reference price
            cost_atr_floor = round(max(ref_p * 0.92, ref_p - 2.0 * eff_atr), 2)
            # If 50D SMA is established below reference price, allow breathing room below 50D SMA
            if sma_50 > 0 and sma_50 < ref_p:
                sma50_floor = round(sma_50 - 0.8 * eff_atr, 2)
                falsification_floor = min(cost_atr_floor, max(sma50_floor, ref_p * 0.90))
            else:
                falsification_floor = cost_atr_floor
            floor_type = "COST_BASIS_ATR_STOP" if has_entry else "RECOVERY_SUPPORT_STOP"
        # Case B: Trend entry above 200D SMA or unspecified entry
        elif sma_200 > 0:
            structural_200d_floor = round(sma_200 * 0.97, 2)
            if has_entry:
                cost_stop = round(max(ref_p * 0.92, ref_p - 2.5 * eff_atr), 2)
                falsification_floor = round(max(structural_200d_floor, min(cost_stop, ref_p * 0.95)), 2)
            else:
                falsification_floor = round(min(curr_p * 0.95, structural_200d_floor), 2)
            floor_type = "STRUCTURAL_200D_STOP"
        else:
            falsification_floor = round(max(0.01, (ref_p * 0.93 if has_entry else curr_p * 0.90)), 2)
            floor_type = "TRAILING_PCT_STOP"

        # Tier-1 Early 50D SMA Breakdown Trim
        early_trim_level = round(sma_50 - 1.0 * eff_atr, 2) if (sma_50 and sma_50 > 0) else None
        is_early_trim_breach = bool(
            early_trim_level and
            current_price < early_trim_level and
            current_price > falsification_floor and
            (vol_ratio is None or float(vol_ratio) >= 1.15)
        )

        # Oversold Capitulation Bounce Guard (RSI < 30)
        is_oversold_bounce_guard = bool(rsi_14 is not None and float(rsi_14) < 30.0)
        oversold_guidance = (
            "RSI(14) is deeply oversold (<30); avoid market-selling into an intraday panic flush—stage trims into a 10D/20D EMA reflex bounce unless the hard closing stop is broken."
            if is_oversold_bounce_guard else ""
        )

        return {
            "falsification_floor": falsification_floor,
            "floor_type": floor_type,
            "early_trim_level": early_trim_level,
            "is_early_trim_breach": is_early_trim_breach,
            "is_oversold_bounce_guard": is_oversold_bounce_guard,
            "oversold_guidance": oversold_guidance
        }

    @staticmethod
    def _compute_wilder_rsi_from_list(closes_list: List[float]) -> float:
        if len(closes_list) < 15:
            return 54.0
        deltas = [closes_list[i] - closes_list[i - 1] for i in range(1, len(closes_list))]
        avg_gain = sum(max(d, 0.0) for d in deltas[:14]) / 14.0
        avg_loss = sum(max(-d, 0.0) for d in deltas[:14]) / 14.0
        for d in deltas[14:]:
            avg_gain = (avg_gain * 13.0 + max(d, 0.0)) / 14.0
            avg_loss = (avg_loss * 13.0 + max(-d, 0.0)) / 14.0
        if avg_loss == 0.0:
            return 100.0
        rs = avg_gain / avg_loss
        return round(100.0 - (100.0 / (1.0 + rs)), 2)

    @staticmethod
    def _empty_trend_temperature() -> Dict[str, Any]:
        return {
            "state": "FLAT",
            "state_label_en": "FLAT (Consolidation)",
            "state_label_zh": "平（震荡整理）",
            "hitting_zone": "LEFT_SIDE",
            "is_right_side": False,
            "is_recently_falling": False,
            "right_side_path": "NONE",
            "z_trend": 0.0,
            "ret_3d_pct": 0.0,
            "ret_5d_pct": 0.0,
            "ret_10d_pct": 0.0,
            "ret_20d_pct": 0.0,
            "vol_20d_pct": 0.0,
            "vol_ratio": 1.0,
            "sma_20": 0.0,
            "sma_50": 0.0,
            "sma_200": 0.0,
            "ema_10": 0.0,
            "low_10d": 0.0,
            "rsi_14": 54.0,
            "rsi_3d_delta": 0.0,
            "atr_14": 0.0,
            "up_down_vol_ratio_10d": 1.0,
            "is_high_volume_distribution": False,
            "has_recent_3d_shock": False,
            "is_post_shock_unsettled": False,
            "sma_50_slope_5d_pct": 0.0,
            "transition": "NONE",
            "is_fresh_right_side_pivot": False,
        }

    @classmethod
    def _compute_trend_temperature_from_series(
        cls,
        closes_list: List[float],
        vols_list: List[float],
        highs_list: Optional[List[float]] = None,
        lows_list: Optional[List[float]] = None,
        current_price: Optional[float] = None,
        _compute_transition: bool = True,
    ) -> Dict[str, Any]:
        """Pure-Python O(N) core for 4-state Trend Temperature & 3-Path Right-Side Engine (zero Pandas overhead)."""
        import math

        if not closes_list:
            return cls._empty_trend_temperature()

        closes = list(closes_list)
        if current_price is not None and float(current_price) > 0:
            closes[-1] = float(current_price)

        n_pts = len(closes)
        curr_close = float(closes[-1])
        w20 = min(20, n_pts)
        w50 = min(50, n_pts)
        w200 = min(200, n_pts)
        sma_20 = sum(closes[-w20:]) / w20
        sma_50 = sum(closes[-w50:]) / w50
        sma_200 = sum(closes[-w200:]) / w200

        # Multi-horizon returns
        ret_3d = ((curr_close / closes[-min(4, n_pts)]) - 1.0) if n_pts >= 2 else 0.0
        ret_5d = ((curr_close / closes[-min(6, n_pts)]) - 1.0) if n_pts >= 2 else 0.0
        ret_10d = ((curr_close / closes[-min(11, n_pts)]) - 1.0) if n_pts >= 2 else 0.0
        ret_20d = ((curr_close / closes[-min(21, n_pts)]) - 1.0) if n_pts >= 2 else 0.0

        # Exponential Moving Average (span=min(10, max(2, n_pts)), adjust=False)
        span = min(10, max(2, n_pts))
        alpha = 2.0 / (span + 1.0)
        ema_10 = closes[0]
        one_minus_alpha = 1.0 - alpha
        for val in closes[1:]:
            ema_10 = alpha * val + one_minus_alpha * ema_10

        low_10d = min(closes[-min(10, n_pts):])

        rsi_14 = cls._compute_wilder_rsi_from_list(closes)
        rsi_14_prev = cls._compute_wilder_rsi_from_list(closes[:-3]) if n_pts >= 18 else rsi_14
        rsi_3d_delta = round(rsi_14 - rsi_14_prev, 2)

        # 14-day ATR approximation
        if highs_list and lows_list and len(highs_list) == len(lows_list):
            w_atr = min(14, len(highs_list))
            tr_vals = [abs(h - l) for h, l in zip(highs_list[-w_atr:], lows_list[-w_atr:])]
            tr_mean = (sum(tr_vals) / len(tr_vals)) if tr_vals else 0.0
            atr_14 = float(tr_mean) if tr_mean > 0 else round(curr_close * 0.022, 2)
        else:
            diffs = [abs(closes[i] - closes[i - 1]) for i in range(1, n_pts)][-min(14, max(1, n_pts - 1)):]
            diff_mean = (sum(diffs) / len(diffs)) if diffs else 0.0
            atr_14 = float(diff_mean * 1.35) if diff_mean > 0 else round(curr_close * 0.022, 2)

        # 10D Up vs Down volume ratio
        vols = vols_list if vols_list else [1000000.0] * n_pts
        if n_pts >= 11 and len(vols) >= 11:
            up_vol = sum(vols[i] for i in range(-10, 0) if closes[i] >= closes[i - 1])
            down_vol = sum(vols[i] for i in range(-10, 0) if closes[i] < closes[i - 1])
            if down_vol <= 0.0:
                up_down_vol_ratio_10d = 2.0 if up_vol > 0 else 1.0
            else:
                up_down_vol_ratio_10d = round(up_vol / down_vol, 2)
        else:
            up_down_vol_ratio_10d = 1.0

        # Daily returns & 20D annualized volatility (sample std ddof=1)
        all_rets = [
            (closes[i] / closes[i - 1]) - 1.0
            for i in range(1, n_pts)
            if closes[i - 1] != 0.0
        ]
        daily_returns = all_rets[-min(20, max(2, n_pts - 1)):]
        if len(daily_returns) > 1:
            mean_r = sum(daily_returns) / len(daily_returns)
            var_r = sum((r - mean_r) ** 2 for r in daily_returns) / (len(daily_returns) - 1)
            daily_std = math.sqrt(max(0.0, var_r))
        else:
            daily_std = 0.015
        vol_20d = daily_std * (252.0 ** 0.5)

        z_trend = round(ret_20d / max(0.005, vol_20d / (12.0 ** 0.5)), 2)

        # Volume confirmation ratio (last 5D vs last 20D)
        n_vol = len(vols)
        vol_5d_mean = (sum(vols[-min(5, n_vol):]) / min(5, n_vol)) if n_vol > 0 else 1.0
        vol_20d_mean = (sum(vols[-min(20, n_vol):]) / min(20, n_vol)) if n_vol > 0 else 1.0
        vol_ratio = round(vol_5d_mean / max(1.0, vol_20d_mean), 2)

        # PL-726.3.1: 50D SMA 5-day slope and volume distribution veto
        if n_pts >= 55:
            sma50_prev = sum(closes[-55:-5]) / 50.0
            sma_50_slope_5d_pct = round(((sma_50 - sma50_prev) / sma50_prev) * 100.0, 3) if sma50_prev > 0 else 0.0
        else:
            sma_50_slope_5d_pct = 0.0

        is_high_volume_distribution = bool(vol_ratio >= 1.25 and (ret_5d < -0.015 or ret_10d < -0.025))

        # PL-726.3.2: 3-Day Post-Shock Stabilization Rule
        recent_daily_rets = [
            (closes[-k] - closes[-k - 1]) / closes[-k - 1]
            for k in range(1, min(4, n_pts))
            if closes[-k - 1] > 0
        ]
        has_recent_3d_shock = any(r <= -0.035 for r in recent_daily_rets)
        is_post_shock_unsettled = bool(has_recent_3d_shock and (curr_close < sma_20 or ret_5d < 0.0))

        # PL-727.2: Anti-Knife Pre-Filter: Must pass before ANY Right-Side path can activate
        last_1d_ret = ((curr_close - closes[-2]) / closes[-2]) if n_pts >= 2 and closes[-2] > 0 else 0.0
        anti_knife_passed = bool(
            not is_high_volume_distribution and
            not is_post_shock_unsettled and
            ret_5d >= -0.005 and
            last_1d_ret >= -0.008
        )

        base_falling_guard = bool(
            (ret_5d < -0.008) or
            (ret_10d < -0.012) or
            (ret_20d < 0.0) or
            (curr_close < sma_20 * 0.995) or
            is_high_volume_distribution or
            is_post_shock_unsettled
        )

        # Path A: Primary Uptrend Continuation (TREND_CONTINUATION)
        is_path_a_hot = bool(
            not base_falling_guard and
            curr_close > sma_50 and
            z_trend >= 1.2 and
            ret_5d >= 0.0
        )
        is_path_a_warm = bool(
            not base_falling_guard and
            ret_5d >= -0.003 and
            ret_20d > 0.0 and (
                (curr_close > sma_50 and z_trend >= 0.25) or
                (curr_close >= sma_200 and curr_close >= sma_20 and ret_5d >= 0.01)
            )
        )

        # Path B: Pullback Bounce off 50D / 200D SMA Structural Support (SUPPORT_BOUNCE)
        is_macro_uptrend_intact = bool(
            sma_50 > 0 and sma_200 > 0 and
            sma_50 >= sma_200 * 0.98 and
            curr_close >= sma_200 * 0.985 and
            ret_20d >= -0.085 and
            ((sma_50 * 0.97 <= curr_close <= sma_50 * 1.035) or (sma_200 * 0.985 <= curr_close <= sma_200 * 1.04))
        )
        is_recovery_support_bounce = bool(
            sma_50 > 0 and sma_20 > 0 and sma_200 > 0 and
            sma_50 < sma_200 and
            curr_close >= min(sma_20, sma_50) * 0.985 and
            curr_close <= max(sma_20, sma_50) * 1.045 and
            curr_close <= sma_200 * 0.965 and
            ret_20d >= -0.15
        )
        is_turn_confirmed = bool(
            anti_knife_passed and
            ret_3d >= 0.008 and
            ret_5d >= 0.002 and
            (curr_close >= ema_10 * 0.998 or curr_close >= low_10d + 0.8 * atr_14) and
            35.0 <= rsi_14 <= 66.0 and
            rsi_3d_delta >= 0.0 and
            up_down_vol_ratio_10d >= 0.95
        )
        is_path_b_support_bounce = bool(
            (is_macro_uptrend_intact or is_recovery_support_bounce) and
            is_turn_confirmed
        )

        # Path C: Bottom Reversal / Pocket Pivot Reclaiming 20D SMA (BOTTOM_REVERSAL)
        is_path_c_bottom_reversal = bool(
            anti_knife_passed and
            sma_20 > 0 and
            curr_close > sma_20 * 1.002 and
            (ema_10 >= sma_20 * 0.995 or ret_3d >= 0.015) and
            ret_5d >= 0.012 and
            ret_10d >= 0.005 and
            curr_close >= low_10d + 0.8 * atr_14 and
            up_down_vol_ratio_10d >= 0.95 and
            45.0 <= rsi_14 <= 70.0 and
            rsi_3d_delta >= 0.0
        )

        if is_path_a_hot:
            state = "HOT"
            right_side_path = "TREND_CONTINUATION"
            is_recently_falling = False
            label_en = "HOT (Fat-Tail Momentum)"
            label_zh = "热（肥尾主升浪）"
        elif is_path_c_bottom_reversal:
            state = "WARM"
            right_side_path = "BOTTOM_REVERSAL"
            is_recently_falling = False
            label_en = "WARM (Right-Side Bottom Reversal)"
            label_zh = "温（底部站上20日线右侧拐点）"
        elif is_path_b_support_bounce:
            state = "WARM"
            right_side_path = "SUPPORT_BOUNCE"
            is_recently_falling = False
            label_en = "WARM (Right-Side Support Bounce)"
            label_zh = "温（均线支撑右侧反弹拐点）"
        elif is_path_a_warm:
            state = "WARM"
            right_side_path = "TREND_CONTINUATION"
            is_recently_falling = False
            label_en = "WARM (Right-Side Batting Zone)"
            label_zh = "温（温转热右侧击球区）"
        elif curr_close < sma_200 and (curr_close < sma_20 or ret_5d < -0.005) and (z_trend < -0.4 or ret_20d < -0.025 or curr_close < sma_50):
            state = "FREEZE"
            right_side_path = "NONE"
            is_recently_falling = base_falling_guard
            label_en = "FREEZE (Blood Chips Left-Side)"
            label_zh = "冻（血筹区：左侧勿抄底）"
        else:
            state = "FLAT"
            right_side_path = "NONE"
            is_recently_falling = base_falling_guard
            label_en = "FLAT (Consolidation)"
            label_zh = "平（震荡整理）"

        hitting_zone = "RIGHT_SIDE" if state in ["WARM", "HOT"] else "LEFT_SIDE"

        # 5-Day State Transition Detection
        transition = "NONE"
        if _compute_transition and n_pts >= 15:
            prev_closes = closes_list[:-5]
            if len(prev_closes) >= 5:
                prev_vols = vols_list[:-5] if len(vols_list) == len(closes_list) else vols_list
                prev_highs = highs_list[:-5] if highs_list and len(highs_list) == len(closes_list) else highs_list
                prev_lows = lows_list[:-5] if lows_list and len(lows_list) == len(closes_list) else lows_list
                prev_eval = cls._compute_trend_temperature_from_series(
                    prev_closes, prev_vols, prev_highs, prev_lows, current_price=None, _compute_transition=False
                )
                prev_state = str(prev_eval.get("state") or "FLAT")
                if prev_state in ("FREEZE", "FLAT") and state in ("WARM", "HOT"):
                    transition = f"{prev_state}_TO_{state}"
                elif prev_state == "WARM" and state == "HOT":
                    transition = "WARM_TO_HOT"
                elif prev_state in ("WARM", "HOT") and state in ("FLAT", "FREEZE"):
                    transition = f"{prev_state}_TO_{state}"

        is_fresh_right_side_pivot = bool(
            transition in ("FLAT_TO_WARM", "FREEZE_TO_WARM", "FLAT_TO_HOT", "FREEZE_TO_HOT") or
            right_side_path in ("SUPPORT_BOUNCE", "BOTTOM_REVERSAL")
        )

        return {
            "state": state,
            "state_label_en": label_en,
            "state_label_zh": label_zh,
            "hitting_zone": hitting_zone,
            "is_right_side": hitting_zone == "RIGHT_SIDE",
            "is_recently_falling": is_recently_falling,
            "right_side_path": right_side_path,
            "z_trend": z_trend,
            "ret_3d_pct": round(ret_3d * 100.0, 2),
            "ret_5d_pct": round(ret_5d * 100.0, 2),
            "ret_10d_pct": round(ret_10d * 100.0, 2),
            "ret_20d_pct": round(ret_20d * 100.0, 2),
            "vol_20d_pct": round(vol_20d * 100.0, 2),
            "vol_ratio": vol_ratio,
            "sma_20": round(sma_20, 2),
            "sma_50": round(sma_50, 2),
            "sma_200": round(sma_200, 2),
            "ema_10": round(ema_10, 2),
            "low_10d": round(low_10d, 2),
            "rsi_14": rsi_14,
            "rsi_3d_delta": rsi_3d_delta,
            "atr_14": round(atr_14, 2),
            "up_down_vol_ratio_10d": up_down_vol_ratio_10d,
            "is_high_volume_distribution": is_high_volume_distribution,
            "has_recent_3d_shock": has_recent_3d_shock,
            "is_post_shock_unsettled": is_post_shock_unsettled,
            "sma_50_slope_5d_pct": sma_50_slope_5d_pct,
            "transition": transition,
            "is_fresh_right_side_pivot": is_fresh_right_side_pivot,
        }

    @classmethod
    def compute_trend_temperature(
        cls,
        df_ohlcv: Any,
        current_price: Optional[float] = None,
        _compute_transition: bool = True
    ) -> Dict[str, Any]:
        """
        Computes 4-state Trend Temperature: FREEZE (冻), FLAT (平), WARM (温), HOT (热).
        Supports both raw `list[dict]` (fast path) and `pd.DataFrame` inputs identically.
        Grounded in multi-horizon momentum (3D, 5D, 10D, 20D), volatility Z-score, and 3-Path Right-Side Engine:
          Path A: TREND_CONTINUATION (primary uptrend continuation)
          Path B: SUPPORT_BOUNCE (healthy pullback bounce holding 50D/200D SMA support)
          Path C: BOTTOM_REVERSAL (pocket pivot reclaiming 20D SMA)
        """
        if df_ohlcv is None:
            return cls._empty_trend_temperature()

        if isinstance(df_ohlcv, list):
            if not df_ohlcv:
                return cls._empty_trend_temperature()
            closes_list: List[float] = []
            vols_list: List[float] = []
            highs_list: List[float] = []
            lows_list: List[float] = []
            has_vol = False
            has_hl = False
            for row in df_ohlcv:
                c = row.get("Close") if "Close" in row else row.get("close")
                if c is not None:
                    closes_list.append(float(c))
                v = row.get("Volume") if "Volume" in row else row.get("volume")
                if v is not None:
                    has_vol = True
                    vols_list.append(float(v))
                h = row.get("High") if "High" in row else row.get("high")
                l = row.get("Low") if "Low" in row else row.get("low")
                if h is not None and l is not None:
                    has_hl = True
                    highs_list.append(float(h))
                    lows_list.append(float(l))
            if not has_vol:
                vols_list = [1000000.0] * len(closes_list)
            return cls._compute_trend_temperature_from_series(
                closes_list,
                vols_list,
                highs_list if has_hl else None,
                lows_list if has_hl else None,
                current_price=current_price,
                _compute_transition=_compute_transition,
            )

        import pandas as pd
        if isinstance(df_ohlcv, pd.DataFrame):
            if df_ohlcv.empty:
                return cls._empty_trend_temperature()
            close_col = "Close" if "Close" in df_ohlcv.columns else ("close" if "close" in df_ohlcv.columns else df_ohlcv.columns[0])
            close_series = df_ohlcv[close_col].dropna().astype(float)
            closes_list = close_series.tolist()
            vol_col = "Volume" if "Volume" in df_ohlcv.columns else ("volume" if "volume" in df_ohlcv.columns else None)
            vols_list = df_ohlcv[vol_col].dropna().astype(float).tolist() if vol_col else [1000000.0] * len(closes_list)
            high_col = "High" if "High" in df_ohlcv.columns else ("high" if "high" in df_ohlcv.columns else None)
            low_col = "Low" if "Low" in df_ohlcv.columns else ("low" if "low" in df_ohlcv.columns else None)
            highs_list = df_ohlcv[high_col].dropna().astype(float).tolist() if (high_col and low_col) else None
            lows_list = df_ohlcv[low_col].dropna().astype(float).tolist() if (high_col and low_col) else None
            return cls._compute_trend_temperature_from_series(
                closes_list,
                vols_list,
                highs_list,
                lows_list,
                current_price=current_price,
                _compute_transition=_compute_transition,
            )

        return cls._empty_trend_temperature()

    @classmethod
    def evaluate_symbol_trend_temperature(cls, quote: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates trend temperature and batting zone for a given stock quote.
        Uses historical_series fast-path with quote-level memoization to avoid redundant recomputation.
        PL-725: Strictly prevents falling prices from being marked RIGHT_SIDE.
        """
        curr = float(quote.get("current_price") or 0.0)
        sma50 = float(quote.get("fifty_day_sma") or 0.0)
        sma200 = float(quote.get("two_hundred_day_sma") or 0.0)

        hist = quote.get("historical_series")
        if hist and isinstance(hist, list) and len(hist) >= 5:
            last_close = hist[-1].get("close") if isinstance(hist[-1], dict) else None
            cache_sig = (curr, len(hist), last_close)
            cached_pair = quote.get("_trend_eval_cache")
            if isinstance(cached_pair, tuple) and len(cached_pair) == 2 and cached_pair[0] == cache_sig:
                return dict(cached_pair[1])
            try:
                trend_res = cls.compute_trend_temperature(hist, current_price=curr)
                quote["_trend_eval_cache"] = (cache_sig, trend_res)
                return dict(trend_res)
            except Exception:
                pass

        # Fallback when historical_series is not available:
        # A stock is WARM (RIGHT_SIDE) only if holding around or above 50D & 200D SMA support.
        if curr > 0 and sma200 > 0 and curr < sma200 * 0.94 and (sma50 <= 0 or curr < sma50 * 0.96):
            state = "FREEZE"
            hitting_zone = "LEFT_SIDE"
            is_right_side = False
        elif curr > 0 and sma50 > 0 and sma200 > 0 and curr >= sma50 * 0.98 and curr >= sma200 * 0.96:
            state = "WARM"
            hitting_zone = "RIGHT_SIDE"
            is_right_side = True
        else:
            state = "FLAT"
            hitting_zone = "LEFT_SIDE"
            is_right_side = False

        label_en = "WARM (Right-Side Batting Zone)" if is_right_side else ("FREEZE (Blood Chips Left-Side)" if state == "FREEZE" else "FLAT (Left-Side Consolidation)")
        label_zh = "温（温转热右侧击球区）" if is_right_side else ("冻（血筹区：左侧勿抄底）" if state == "FREEZE" else "平（左侧整理待右侧确认）")

        return {
            "state": state,
            "hitting_zone": hitting_zone,
            "is_right_side": is_right_side,
            "state_label_en": label_en,
            "state_label_zh": label_zh,
            "right_side_path": "TREND_CONTINUATION" if is_right_side else "NONE",
            "ret_3d_pct": 0.0,
            "ret_5d_pct": 0.0,
            "ret_10d_pct": 0.0,
            "ret_20d_pct": 0.0,
            "z_trend": 0.0,
            "is_recently_falling": False,
            "sma_20": round(sma50, 2),
            "sma_50": round(sma50, 2),
            "sma_200": round(sma200, 2),
            "ema_10": round(sma50, 2),
            "low_10d": round(curr, 2),
            "rsi_14": 50.0,
            "rsi_3d_delta": 0.0,
            "atr_14": round(curr * 0.022, 2) if curr > 0 else 0.0,
            "up_down_vol_ratio_10d": 1.0,
            "is_high_volume_distribution": False,
            "has_recent_3d_shock": False,
            "is_post_shock_unsettled": False,
            "sma_50_slope_5d_pct": 0.0,
            "transition": "NONE",
            "is_fresh_right_side_pivot": False
        }

alert_engine = PriceAlertEngine()
AlertEngine = PriceAlertEngine
