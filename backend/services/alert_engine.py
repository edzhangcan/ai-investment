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

        for item in holdings:
            try:
                quote = data_provider_manager.get_stock_quote(item.symbol)
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
                bottom_threshold = round(two_hundred_sma * 0.97, 2) if two_hundred_sma > 0 else 0.0
                if override_data.get("falsification_floor"):
                    bottom_threshold = float(override_data["falsification_floor"])

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

        for item in watchlist_items:
            try:
                quote = data_provider_manager.get_stock_quote(item.symbol)
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

                # Determine effective target buy price (Override -> Saved Target -> Default 95% of Buy Ceiling)
                target_buy = override_data.get("target_buy")
                if not target_buy or target_buy <= 0:
                    target_buy = item.target_buy_price
                if not target_buy or target_buy <= 0:
                    buy_ceiling = float(pricing_eval.get("ideal_buy_range_max") or 0.0)
                    target_buy = round(buy_ceiling * 0.95, 2) if buy_ceiling > 0 else round(current_price * 0.95, 2)

                # Evaluate Batting Zone & Trend Temperature
                trend_eval = self.evaluate_symbol_trend_temperature(quote)
                is_right_side = trend_eval.get("is_right_side", False)
                trend_state = trend_eval.get("state", "FLAT")

                # Evaluate Dual-Trigger: Price in Buy Zone AND Right-Side Batting Zone
                if target_buy and target_buy > 0 and current_price <= target_buy:
                    if is_right_side:
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
                    else:
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
        from backend.models.db_models import RecommendationSnapshotDB
        from backend.engines.pricing_engine import PricingEngine

        tracked_symbols = {row.symbol.upper() for row in session.exec(select(UserWatchlistDB)).all()}
        snapshots = session.exec(select(RecommendationSnapshotDB).where(RecommendationSnapshotDB.lang == "en")).all()
        if not snapshots:
            return triggered_results

        cutoff = get_utc_now() - timedelta(hours=COOLDOWN_HOURS)

        for snap in snapshots:
            sym = snap.symbol.upper().strip()
            if sym in tracked_symbols:
                continue

            try:
                payload = json.loads(snap.financial_payload_json) if snap.financial_payload_json else {}
                quote = data_provider_manager.get_stock_quote(sym)
                current_price = float(quote.get("current_price") or payload.get("current_price") or 0.0)
                if current_price <= 0:
                    continue

                pricing_eval = PricingEngine.evaluate_pricing_and_entry_zone(quote)
                buy_ceiling = float(pricing_eval.get("ideal_buy_range_max") or payload.get("ideal_buy_range_max") or 0.0)
                if buy_ceiling <= 0:
                    continue

                regular_target = round(buy_ceiling * 0.90, 2)

                trend_eval = self.evaluate_symbol_trend_temperature(quote)
                is_right_side = trend_eval.get("is_right_side", False)
                trend_state = trend_eval.get("state", "FLAT")

                # Condition: Deep 10%+ discount below buy ceiling AND Right-Side Batting Zone
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

    @classmethod
    def evaluate_symbol_trend_temperature(cls, quote: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates trend temperature and batting zone for a given stock quote.
        Uses historical_series if available to compute volatility-normalized Z-score,
        otherwise falls back to 50D/200D SMA relationships.
        Returns dict with: state, hitting_zone ("RIGHT_SIDE" | "LEFT_SIDE"), is_right_side, label_en, label_zh.
        """
        import pandas as pd
        curr = float(quote.get("current_price") or 0.0)
        sma50 = float(quote.get("fifty_day_sma") or 0.0)
        sma200 = float(quote.get("two_hundred_day_sma") or 0.0)

        hist = quote.get("historical_series")
        state = "FLAT"
        if hist and isinstance(hist, list) and len(hist) >= 5:
            try:
                df = pd.DataFrame(hist)
                trend_res = cls.compute_trend_temperature(df)
                state = trend_res.get("state", "FLAT")
                if sma50 <= 0:
                    sma50 = float(trend_res.get("sma_50") or 0.0)
                if sma200 <= 0:
                    sma200 = float(trend_res.get("sma_200") or 0.0)
            except Exception:
                state = "FLAT"

        # Determine Right-Side vs Left-Side Batting Zone:
        # 1. State is HOT or WARM -> RIGHT_SIDE
        # 2. Or price is trading above both 50D and 200D moving averages -> WARM (Right-Side Batting Zone)
        # 3. Or price is decisively below 200D SMA or 50D SMA -> LEFT_SIDE (Falling knife / Left-Side watch)
        if state in ["WARM", "HOT"]:
            hitting_zone = "RIGHT_SIDE"
            is_right_side = True
        elif curr > 0 and sma50 > 0 and sma200 > 0 and curr >= sma50 and curr >= sma200:
            state = "WARM"
            hitting_zone = "RIGHT_SIDE"
            is_right_side = True
        elif curr > 0 and sma50 > 0 and curr >= sma50:
            state = "WARM"
            hitting_zone = "RIGHT_SIDE"
            is_right_side = True
        elif curr > 0 and sma200 > 0 and curr < sma200 * 0.98:
            state = "FREEZE"
            hitting_zone = "LEFT_SIDE"
            is_right_side = False
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
            "state_label_zh": label_zh
        }

alert_engine = PriceAlertEngine()
AlertEngine = PriceAlertEngine
