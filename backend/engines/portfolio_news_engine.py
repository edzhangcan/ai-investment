"""
PortfolioNewsEngine: Tactical News & Portfolio Analysis Engine (PL-722)
Gathers daily/recent US & Canadian market news and Key Institutional Investor commentary,
ranks by relevance to user Holdings and Watchlist, and synthesizes daily/tomorrow
action advice, opportunities, and risks.
"""

from __future__ import annotations
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlmodel import Session, select

from backend.models.db_models import UserWatchlistDB
from backend.models.schemas import (
    PortfolioNewsItemSchema,
    KeyInvestorPostSchema,
    TacticalAdviceItemSchema,
    DailyPortfolioBriefingSchema,
    TrackedPositionPulseSchema,
    PortfolioSummaryMetaSchema,
    PortfolioNewsAnalysisResponseSchema,
    DataProvenanceSchema,
)
from backend.routers.watchlist import enrich_item_quote, get_portfolio_total_value
from backend.data_sources.news_client import NewsClient
from backend.data_sources.data_provider import data_provider_manager, FALLBACK_STOCK_DATA, DataProviderManager
from backend.engines.pricing_engine import PricingEngine
from backend.services.alert_engine import PriceAlertEngine
from backend.config import settings

logger = logging.getLogger("PortfolioNewsEngine")

DEFAULT_DEMO_HOLDINGS = ["NVDA", "MSFT", "COST"]
DEFAULT_DEMO_WATCHLIST = ["RY.TO", "SHOP.TO", "CNQ.TO"]


class PortfolioNewsEngine:
    """Aggregates, scores, and synthesizes news and key investor commentary for active portfolios."""

    ACTION_TAG_EXPLANATIONS: Dict[str, str] = {
        "HOLD_CORE": "Price trades safely above the 200D SMA x 0.97 falsification floor with intact business fundamentals. Hold core position without over-trading and let free cash flow compound.",
        "DEFEND_FLOOR": "Critical Risk Guard: Price is within 3% of or has breached the 200D SMA x 0.97 falsification floor. Do not average down on the left side; prepare mechanical stop-loss exit if daily close breaks the floor.",
        "WATCH_PULLBACK": "Watchlist target is trading above its 95% Ideal Buy Ceiling or remains in a Left-Side (Freeze/Flat) trend. Wait patiently for a pullback into the buy zone with Right-Side momentum confirmation.",
        "SCALE_IN_READY": "Right-Side Entry Window Active: Price has pulled back to or below the 95% Buy Ceiling while confirming Right-Side (Warm/Hot) trend support. Eligible for a disciplined 2%–4% satellite entry.",
        "TRIM_EXTENDED": "Position shows +25% or greater unrealized gains above cost basis. Protect open profits by trailing your stop-loss floor upward or trimming excess weight if allocation exceeds your 4% satellite cap.",
    }

    @classmethod
    def analyze_portfolio_and_news(
        cls,
        session: Session,
        market: str = "ALL",
        force_refresh: bool = False
    ) -> Dict[str, Any]:
        """
        Main entry point for Portfolio News Analysis:
        1. Loads active HOLDING and WATCHLIST positions (or seeds demo bellwethers if empty).
        2. Concurrently fetches and ranks stock news and Key Investor commentary.
        3. Computes daily position pulse telemetry and day_signal.
        4. Synthesizes Today & Tomorrow Action Advice, Opportunities, and Risks.
        """
        market_norm = market.upper().strip() if market else "ALL"
        now_utc = datetime.now(timezone.utc)
        date_label = now_utc.strftime("%A, %B %d, %Y")

        # Step 1: Query Tracked Positions
        db_items = session.exec(
            select(UserWatchlistDB).where(UserWatchlistDB.bucket.in_(["HOLDING", "WATCHLIST"]))
        ).all()

        is_demo_portfolio = len(db_items) == 0
        working_items: List[UserWatchlistDB] = []

        if is_demo_portfolio:
            # Construct in-memory demo portfolio of core US & CA bellwethers
            for sym in DEFAULT_DEMO_HOLDINGS:
                working_items.append(
                    UserWatchlistDB(
                        id=None,
                        symbol=sym,
                        company_name=cls._resolve_company_name(sym),
                        bucket="HOLDING",
                        buy_in_price=cls._resolve_baseline_price(sym) * 0.92,
                        buy_in_date="2026-08-01",
                        shares_held=25.0,
                        portfolio_allocation_pct=3.5,
                    )
                )
            for sym in DEFAULT_DEMO_WATCHLIST:
                buy_target = round(cls._resolve_baseline_price(sym) * 0.95, 2)
                working_items.append(
                    UserWatchlistDB(
                        id=None,
                        symbol=sym,
                        company_name=cls._resolve_company_name(sym),
                        bucket="WATCHLIST",
                        target_buy_price=buy_target,
                        portfolio_allocation_pct=3.0,
                    )
                )
        else:
            working_items = list(db_items)

        # Build position lookup sets
        holding_symbols = [it.symbol.upper() for it in working_items if it.bucket == "HOLDING"]
        watchlist_symbols = [it.symbol.upper() for it in working_items if it.bucket == "WATCHLIST"]
        all_tracked_symbols = holding_symbols + watchlist_symbols

        # Step 2: Compute Position Pulse Telemetry
        tracked_positions: List[Dict[str, Any]] = []
        total_portfolio_value = 0.0

        for it in working_items:
            pulse = cls._build_position_pulse(it)
            if it.bucket == "HOLDING" and pulse.get("total_value"):
                total_portfolio_value += pulse["total_value"]
            tracked_positions.append(pulse)

        # Allocate dynamic portfolio allocation weights for holdings
        if total_portfolio_value > 0:
            for p in tracked_positions:
                if p["bucket"] == "HOLDING" and p.get("total_value"):
                    p["portfolio_allocation_pct"] = round((p["total_value"] / total_portfolio_value) * 100.0, 2)

        # Filter tracked positions for display if specific market requested
        display_positions = [
            p for p in tracked_positions
            if market_norm == "ALL" or p["market"] == market_norm
        ]

        # Step 3: Fetch Batch News & Key Investor Commentary
        raw_news_dict = NewsClient.fetch_batch_stock_news(all_tracked_symbols, force_refresh=force_refresh)
        macro_news_us = NewsClient.fetch_macro_news(force_refresh=force_refresh, country="US")
        macro_news_ca = NewsClient.fetch_macro_news(force_refresh=force_refresh, country="CA")

        # Score and rank news items
        scored_news: List[Dict[str, Any]] = []
        news_id_counter = 1

        # 3A: Add stock-specific news
        for sym, items in raw_news_dict.items():
            sym_market = "CA" if (sym.endswith(".TO") or sym.endswith(".V")) else "US"
            if market_norm != "ALL" and sym_market != market_norm:
                continue

            bucket = "HOLDING" if sym in holding_symbols else ("WATCHLIST" if sym in watchlist_symbols else "MARKET")
            matching_pos = next((p for p in tracked_positions if p["symbol"] == sym), None)

            for item in items:
                sentiment = cls._classify_sentiment(item.get("title", "") + " " + item.get("summary", ""))
                relevance = cls._calculate_relevance(bucket, item.get("credibility_tier", ""), sentiment)
                impact_note = cls._build_impact_note(sym, bucket, matching_pos, item, sentiment)

                scored_news.append({
                    "id": f"news-{sym}-{news_id_counter}",
                    "symbol": sym,
                    "company_name": matching_pos["company_name"] if matching_pos else sym,
                    "market": sym_market,
                    "bucket": bucket,
                    "title": item.get("title", "Financial Disclosure"),
                    "summary": item.get("summary", ""),
                    "portfolio_impact_note": impact_note,
                    "source": item.get("source", "Financial Media"),
                    "url": item.get("url", "https://finance.yahoo.com"),
                    "published_at": item.get("published_at", "Recent"),
                    "credibility_tier": item.get("credibility_tier", "Tier-2 Financial Media"),
                    "sentiment": sentiment,
                    "relevance_score": relevance,
                })
                news_id_counter += 1

        # 3B: Add macro benchmark policy news
        if market_norm in ["ALL", "US"]:
            for item in macro_news_us:
                scored_news.append({
                    "id": f"news-macro-us-{news_id_counter}",
                    "symbol": "SPY / US",
                    "company_name": "US Macroeconomic Benchmark",
                    "market": "US",
                    "bucket": "MARKET",
                    "title": item.get("title", ""),
                    "summary": item.get("summary", ""),
                    "portfolio_impact_note": "Federal Reserve monetary policy and inflation dynamics set the baseline discount rate (WACC) for all US equity valuations.",
                    "source": item.get("source", "Federal Reserve / BLS"),
                    "url": item.get("url", "https://www.federalreserve.gov"),
                    "published_at": item.get("published_at", "Recent"),
                    "credibility_tier": item.get("credibility_tier", "Tier-1 Official Central Bank"),
                    "sentiment": cls._classify_sentiment(item.get("title", "")),
                    "relevance_score": 55.0,
                })
                news_id_counter += 1

        if market_norm in ["ALL", "CA"]:
            for item in macro_news_ca:
                scored_news.append({
                    "id": f"news-macro-ca-{news_id_counter}",
                    "symbol": "TSX / CA",
                    "company_name": "Canadian Macro Benchmark",
                    "market": "CA",
                    "bucket": "MARKET",
                    "title": item.get("title", ""),
                    "summary": item.get("summary", ""),
                    "portfolio_impact_note": "Bank of Canada monetary easing cycle creates multiple re-rating tailwinds and lower borrowing costs for Canadian dividend compounders.",
                    "source": item.get("source", "Bank of Canada / StatCan"),
                    "url": item.get("url", "https://www.bankofcanada.ca"),
                    "published_at": item.get("published_at", "Recent"),
                    "credibility_tier": item.get("credibility_tier", "Tier-1 Official Central Bank"),
                    "sentiment": cls._classify_sentiment(item.get("title", "")),
                    "relevance_score": 55.0,
                })
                news_id_counter += 1

        # Sort news feed descending by relevance score
        scored_news.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Update position pulse with news count & latest headline
        for p in display_positions:
            rel_items = [n for n in scored_news if n["symbol"] == p["symbol"]]
            p["related_news_count"] = len(rel_items)
            p["latest_headline"] = rel_items[0]["title"] if rel_items else None
            p["latest_news_url"] = rel_items[0]["url"] if rel_items else f"https://finance.yahoo.com/quote/{p['symbol']}/news"
            p["latest_news_source"] = rel_items[0]["source"] if rel_items else "Yahoo Finance"

        # Step 4: Fetch Key Investor Commentary
        raw_investor_posts = NewsClient.fetch_key_investor_commentary(all_tracked_symbols, market=market_norm)
        processed_investor_posts: List[Dict[str, Any]] = []

        for p in raw_investor_posts:
            rel_syms = p.get("related_symbols", [])
            matched_bucket = "MARKET"
            if any(s in holding_symbols for s in rel_syms):
                matched_bucket = "HOLDING"
            elif any(s in watchlist_symbols for s in rel_syms):
                matched_bucket = "WATCHLIST"

            processed_investor_posts.append({
                "id": p.get("id", "inv-post"),
                "investor_name": p.get("investor_name", "Superinvestor"),
                "institution": p.get("institution", "Institutional Fund"),
                "market": p.get("market", "US"),
                "title": p.get("title", ""),
                "commentary": p.get("commentary", ""),
                "key_takeaway": p.get("key_takeaway", ""),
                "related_symbols": rel_syms,
                "matched_bucket": matched_bucket,
                "stance": p.get("stance", "HIGH_CONVICTION"),
                "published_at": p.get("published_at", "Recent"),
                "source_url": p.get("source_url", "https://www.sec.gov"),
            })

        # Step 5: Synthesize Daily & Tomorrow Tactical Briefing
        briefing = cls._synthesize_daily_briefing(
            date_label=date_label,
            market=market_norm,
            tracked_positions=display_positions,
            news_feed=scored_news,
            investor_posts=processed_investor_posts,
        )

        active_catalyst_count = sum(1 for n in scored_news if n["sentiment"] in ["BULLISH", "RISK_ALERT"])

        summary_meta = {
            "holdings_count": len(holding_symbols),
            "watchlist_count": len(watchlist_symbols),
            "total_portfolio_value": round(total_portfolio_value, 2),
            "active_catalyst_count": active_catalyst_count,
            "is_demo_portfolio": is_demo_portfolio,
            "holding_symbols": holding_symbols,
            "watchlist_symbols": watchlist_symbols,
        }

        provenance = {
            "source_mode": "CACHED" if not force_refresh else "LIVE",
            "provider": "NewsClient + SEC/SEDAR + PricingEngine",
            "fetched_at": now_utc.isoformat(),
            "staleness_seconds": 0,
            "warning_banner": "Demo bellwether positions shown. Mark any equity as Holding or Watchlist to personalize." if is_demo_portfolio else None,
        }

        return {
            "portfolio_summary": summary_meta,
            "briefing": briefing,
            "news_feed": scored_news[:25],
            "investor_posts": processed_investor_posts,
            "tracked_positions": display_positions,
            "provenance": provenance,
        }

    @classmethod
    def _build_position_pulse(cls, item: UserWatchlistDB) -> Dict[str, Any]:
        """Enriches a tracked position with live quote, price distances, and day_signal."""
        norm_sym = item.symbol.upper().strip()
        is_ca = norm_sym.endswith(".TO") or norm_sym.endswith(".V")
        market = "CA" if is_ca else "US"
        currency = "CAD" if is_ca else "USD"

        # Lookup quote from cache
        quote = None
        with DataProviderManager._LOCK:
            if norm_sym in DataProviderManager._CACHE:
                quote = DataProviderManager._CACHE[norm_sym]
        if not quote and norm_sym in FALLBACK_STOCK_DATA:
            quote = FALLBACK_STOCK_DATA[norm_sym]
        if not quote:
            try:
                quote = data_provider_manager.get_stock_quote(norm_sym)
            except Exception:
                quote = {}

        curr_p = float(quote.get("current_price") or item.buy_in_price or cls._resolve_baseline_price(norm_sym))
        sma200 = float(quote.get("two_hundred_day_sma") or (curr_p * 0.95))
        falsification_floor = round(sma200 * 0.97, 2) if sma200 > 0 else None

        trend_eval = PriceAlertEngine.evaluate_symbol_trend_temperature(quote) if quote else {}
        batting_zone = trend_eval.get("hitting_zone", "RIGHT_SIDE")
        trend_state = trend_eval.get("state", "WARM")

        unrealized_pnl = None
        total_value = None
        dist_to_target = None
        dist_to_floor = None

        if item.bucket == "HOLDING":
            buy_p = float(item.buy_in_price or curr_p)
            shares = float(item.shares_held or 10.0)
            total_value = round(shares * curr_p, 2)
            if buy_p > 0:
                unrealized_pnl = round(((curr_p - buy_p) / buy_p) * 100.0, 2)
            if falsification_floor and curr_p > 0:
                dist_to_floor = round(((curr_p - falsification_floor) / falsification_floor) * 100.0, 2)
        elif item.bucket == "WATCHLIST":
            target_p = float(item.target_buy_price or (curr_p * 0.95))
            if target_p > 0:
                dist_to_target = round(((curr_p - target_p) / target_p) * 100.0, 2)

        # Day signal logic
        day_signal = "HOLD_CORE"
        if item.bucket == "HOLDING":
            if falsification_floor and curr_p <= falsification_floor * 1.03:
                day_signal = "DEFEND_FLOOR"
            elif unrealized_pnl is not None and unrealized_pnl >= 25.0:
                day_signal = "TRIM_EXTENDED"
            else:
                day_signal = "HOLD_CORE"
        elif item.bucket == "WATCHLIST":
            target_p = float(item.target_buy_price or (curr_p * 0.95))
            if curr_p <= target_p and batting_zone == "RIGHT_SIDE":
                day_signal = "SCALE_IN_READY"
            else:
                day_signal = "WATCH_PULLBACK"

        day_signal_explanation = cls.ACTION_TAG_EXPLANATIONS.get(day_signal, "")

        return {
            "symbol": norm_sym,
            "company_name": item.company_name or cls._resolve_company_name(norm_sym),
            "market": market,
            "currency": currency,
            "bucket": item.bucket,
            "current_price": round(curr_p, 2),
            "buy_in_price": round(item.buy_in_price, 2) if item.buy_in_price else None,
            "target_buy_price": round(item.target_buy_price, 2) if item.target_buy_price else None,
            "falsification_floor": falsification_floor,
            "unrealized_pnl_pct": unrealized_pnl,
            "distance_to_target_pct": dist_to_target,
            "distance_to_floor_pct": dist_to_floor,
            "portfolio_allocation_pct": item.portfolio_allocation_pct or 0.0,
            "batting_zone": batting_zone,
            "trend_state": trend_state,
            "related_news_count": 0,
            "latest_headline": None,
            "latest_news_url": f"https://finance.yahoo.com/quote/{norm_sym}/news",
            "latest_news_source": "Yahoo Finance",
            "day_signal": day_signal,
            "day_signal_explanation": day_signal_explanation,
            "total_value": total_value,
        }

    @classmethod
    def _synthesize_daily_briefing(
        cls,
        date_label: str,
        market: str,
        tracked_positions: List[Dict[str, Any]],
        news_feed: List[Dict[str, Any]],
        investor_posts: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Produces tactical Action Advice, Opportunities, and Risks in English."""
        action_advice: List[Dict[str, Any]] = []
        opportunities: List[Dict[str, Any]] = []
        risks: List[Dict[str, Any]] = []

        # 1. Action Advice from Tracked Positions
        for pos in tracked_positions:
            sym = pos["symbol"]
            bucket = pos["bucket"]
            curr_p = pos["current_price"]
            floor = pos.get("falsification_floor")
            target = pos.get("target_buy_price")
            pnl = pos.get("unrealized_pnl_pct")
            day_sig = pos.get("day_signal", "HOLD_CORE")
            sig_expl = cls.ACTION_TAG_EXPLANATIONS.get(day_sig, "")

            # Resolve best matching news or investor disclosure source for this ticker
            rel_news = next((n for n in news_feed if n["symbol"] == sym), None)
            rel_inv = next((inv for inv in investor_posts if sym in inv.get("related_symbols", [])), None)
            if rel_news:
                act_source_url = rel_news["url"]
                act_source_name = rel_news["source"]
            elif rel_inv:
                act_source_url = rel_inv["source_url"]
                act_source_name = f"{rel_inv['investor_name']} ({rel_inv['institution']})"
            else:
                act_source_url = f"https://finance.yahoo.com/quote/{sym}/news"
                act_source_name = f"{sym} Financial Disclosures"

            if bucket == "HOLDING":
                if floor and curr_p <= floor * 1.03:
                    action_advice.append({
                        "symbol": sym,
                        "bucket": "HOLDING",
                        "market": pos["market"],
                        "category": "ACTION",
                        "urgency": "HIGH",
                        "headline": f"{sym}: Defend Falsification Floor (${floor:.2f})",
                        "rationale": f"Price is within 3% of or below the 200D SMA x 0.97 floor (${floor:.2f}). Current price is ${curr_p:.2f} ({pnl:+.1f}% P&L).",
                        "tactical_instruction": "Per discipline rules, do not average down on the left side. Prepare defensive stop-loss execution if the daily close decisively breaks below the floor.",
                        "time_horizon": "Today & Tomorrow",
                        "reference_price": curr_p,
                        "threshold_price": floor,
                        "source_url": act_source_url,
                        "source_name": act_source_name,
                        "action_tag": day_sig,
                        "action_tag_explanation": sig_expl,
                    })
                elif pnl is not None and pnl >= 25.0:
                    action_advice.append({
                        "symbol": sym,
                        "bucket": "HOLDING",
                        "market": pos["market"],
                        "category": "ACTION",
                        "urgency": "MEDIUM",
                        "headline": f"{sym}: Protect Open Gains ({pnl:+.1f}%)",
                        "rationale": f"Position shows significant unrealized appreciation at ${curr_p:.2f} against your ${pos.get('buy_in_price', curr_p):.2f} cost basis.",
                        "tactical_instruction": "Maintain core holding. Consider raising your mental stop-loss or rebalancing back to target allocation if position exceeds your maximum satellite risk budget.",
                        "time_horizon": "Today & Tomorrow",
                        "reference_price": curr_p,
                        "threshold_price": floor,
                        "source_url": act_source_url,
                        "source_name": act_source_name,
                        "action_tag": day_sig,
                        "action_tag_explanation": sig_expl,
                    })
                else:
                    action_advice.append({
                        "symbol": sym,
                        "bucket": "HOLDING",
                        "market": pos["market"],
                        "category": "ACTION",
                        "urgency": "LOW",
                        "headline": f"{sym}: Hold Core Position ({pos['trend_state']} Trend)",
                        "rationale": f"Trading comfortably at ${curr_p:.2f} above the ${floor or 0:.2f} falsification floor. Trend temperature is {pos['trend_state']}.",
                        "tactical_instruction": f"Hold active position (weight: {pos['portfolio_allocation_pct']:.1f}%). No scale-in required; let business compounding continue undisturbed.",
                        "time_horizon": "Today & Tomorrow",
                        "reference_price": curr_p,
                        "threshold_price": floor,
                        "source_url": act_source_url,
                        "source_name": act_source_name,
                        "action_tag": day_sig,
                        "action_tag_explanation": sig_expl,
                    })
            elif bucket == "WATCHLIST":
                if target and curr_p <= target and pos["batting_zone"] == "RIGHT_SIDE":
                    action_advice.append({
                        "symbol": sym,
                        "bucket": "WATCHLIST",
                        "market": pos["market"],
                        "category": "ACTION",
                        "urgency": "HIGH",
                        "headline": f"{sym}: Right-Side Entry Triggered (<= ${target:.2f})",
                        "rationale": f"Price (${curr_p:.2f}) has pulled back into the 95% buy zone ceiling (${target:.2f}) with right-side momentum ({pos['trend_state']} trend).",
                        "tactical_instruction": "Consider initiating a disciplined 2.0% satellite entry. Complete the Pre-Trade Soul Check before executing.",
                        "time_horizon": "Today & Tomorrow",
                        "reference_price": curr_p,
                        "threshold_price": target,
                        "source_url": act_source_url,
                        "source_name": act_source_name,
                        "action_tag": day_sig,
                        "action_tag_explanation": sig_expl,
                    })
                else:
                    dist_str = f"{pos.get('distance_to_target_pct', 0):+.1f}%"
                    action_advice.append({
                        "symbol": sym,
                        "bucket": "WATCHLIST",
                        "market": pos["market"],
                        "category": "ACTION",
                        "urgency": "LOW",
                        "headline": f"{sym}: Patiently Track Toward ${target or 0:.2f} Target",
                        "rationale": f"Current price ${curr_p:.2f} is {dist_str} away from the target buy threshold. Batting zone is {pos['batting_zone']}.",
                        "tactical_instruction": "Do not chase prices on green days. Wait patiently for mean reversion into the target buy bracket with volume stabilization.",
                        "time_horizon": "Today & Tomorrow",
                        "reference_price": curr_p,
                        "threshold_price": target,
                        "source_url": act_source_url,
                        "source_name": act_source_name,
                        "action_tag": day_sig,
                        "action_tag_explanation": sig_expl,
                    })

        # 2. Opportunities Radar
        bullish_news = [n for n in news_feed if n["sentiment"] == "BULLISH"][:3]
        for n in bullish_news:
            opportunities.append({
                "symbol": n["symbol"],
                "bucket": n["bucket"] if n["bucket"] in ["HOLDING", "WATCHLIST"] else "PORTFOLIO",
                "market": n["market"],
                "category": "OPPORTUNITY",
                "urgency": "MEDIUM",
                "headline": f"{n['symbol']}: {n['title'][:65]}...",
                "rationale": n["summary"][:140] + ("..." if len(n["summary"]) > 140 else ""),
                "tactical_instruction": n["portfolio_impact_note"],
                "time_horizon": "Today & Tomorrow",
                "reference_price": None,
                "threshold_price": None,
                "source_url": n["url"],
                "source_name": n["source"],
            })

        # Augment opportunities with key investor stance
        bullish_investors = [inv for inv in investor_posts if inv["stance"] in ["BULLISH", "HIGH_CONVICTION"]][:2]
        for inv in bullish_investors:
            opportunities.append({
                "symbol": ", ".join(inv["related_symbols"][:3]) or "NORTH_AMERICA",
                "bucket": "PORTFOLIO",
                "market": inv["market"] if inv["market"] in ["US", "CA"] else "US",
                "category": "OPPORTUNITY",
                "urgency": "LOW",
                "headline": f"{inv['investor_name']} ({inv['institution']}): {inv['title'][:55]}...",
                "rationale": inv["key_takeaway"],
                "tactical_instruction": f"Institutional Conviction: {inv['commentary'][:150]}...",
                "time_horizon": "Multi-Week Outlook",
                "reference_price": None,
                "threshold_price": None,
                "source_url": inv["source_url"],
                "source_name": f"{inv['investor_name']} ({inv['institution']})",
            })

        # 3. Risks & Falsification Watchouts
        bearish_news = [n for n in news_feed if n["sentiment"] in ["BEARISH", "RISK_ALERT"]][:3]
        for n in bearish_news:
            risks.append({
                "symbol": n["symbol"],
                "bucket": n["bucket"] if n["bucket"] in ["HOLDING", "WATCHLIST"] else "PORTFOLIO",
                "market": n["market"],
                "category": "RISK",
                "urgency": "HIGH" if n["bucket"] == "HOLDING" else "MEDIUM",
                "headline": f"{n['symbol']}: {n['title'][:65]}...",
                "rationale": n["summary"][:140] + ("..." if len(n["summary"]) > 140 else ""),
                "tactical_instruction": "Evaluate corporate disclosure against your margin of safety. If fundamental premise deteriorates, refrain from adding capital.",
                "time_horizon": "Immediate",
                "reference_price": None,
                "threshold_price": None,
                "source_url": n["url"],
                "source_name": n["source"],
            })

        cautious_investors = [inv for inv in investor_posts if inv["stance"] in ["DEFENSIVE", "CAUTIOUS"]][:2]
        for inv in cautious_investors:
            risks.append({
                "symbol": ", ".join(inv["related_symbols"][:3]) or "MACRO",
                "bucket": "PORTFOLIO",
                "market": inv["market"] if inv["market"] in ["US", "CA"] else "US",
                "category": "RISK",
                "urgency": "MEDIUM",
                "headline": f"{inv['investor_name']}: {inv['title'][:60]}...",
                "rationale": inv["key_takeaway"],
                "tactical_instruction": "Preserve liquidity buffer. Avoid taking speculative equity bets with borrowed capital or high net debt companies.",
                "time_horizon": "Today & Tomorrow",
                "reference_price": None,
                "threshold_price": None,
                "source_url": inv["source_url"],
                "source_name": f"{inv['investor_name']} ({inv['institution']})",
            })

        # Build executive summary narrative
        holdings_count = sum(1 for p in tracked_positions if p["bucket"] == "HOLDING")
        watchlist_count = sum(1 for p in tracked_positions if p["bucket"] == "WATCHLIST")
        exec_summary = (
            f"Tactical portfolio overview for {date_label}: Tracking {holdings_count} active holdings and {watchlist_count} watchlist targets across North American markets. "
            f"Overall market conditions reflect selective earnings-driven dispersion. Maintain defensive floors on held assets ({len([a for a in action_advice if a['urgency'] == 'HIGH'])} positions warranting elevated vigilance) "
            f"while exercising patience for right-side buy triggers on watchlisted compounders."
        )

        return {
            "date_label": date_label,
            "market_regime_context": f"North American Equity Session ({market} Scope)",
            "executive_summary": exec_summary,
            "action_advice": action_advice,
            "opportunities": opportunities,
            "risks": risks,
        }

    @staticmethod
    def _classify_sentiment(text: str) -> str:
        t = (text or "").lower()
        downside_terms = ["drop", "miss", "cut", "headwind", "risk", "probe", "decline", "fall", "warning", "slump", "loss", "restrictive", "sticky"]
        upside_terms = ["expand", "record", "accelerate", "beat", "growth", "strong", "raise", "surge", "gain", "profit", "dividend", "buyback", "easing"]

        d_count = sum(1 for term in downside_terms if term in t)
        u_count = sum(1 for term in upside_terms if term in t)

        if d_count > u_count:
            return "BEARISH" if d_count <= 2 else "RISK_ALERT"
        if u_count > d_count:
            return "BULLISH"
        return "NEUTRAL"

    @staticmethod
    def _calculate_relevance(bucket: str, credibility: str, sentiment: str) -> float:
        score = 50.0
        if bucket == "HOLDING":
            score += 40.0
        elif bucket == "WATCHLIST":
            score += 25.0
        else:
            score += 5.0

        if "Tier-1" in credibility:
            score += 10.0
        if sentiment in ["BULLISH", "RISK_ALERT"]:
            score += 5.0
        return min(100.0, score)

    @staticmethod
    def _build_impact_note(symbol: str, bucket: str, pos: Optional[Dict[str, Any]], item: Dict[str, Any], sentiment: str) -> str:
        curr_p = pos.get("current_price") if pos else None
        floor = pos.get("falsification_floor") if pos else None
        target = pos.get("target_buy_price") if pos else None
        pnl = pos.get("unrealized_pnl_pct") if pos else None

        if bucket == "HOLDING":
            floor_str = f"${floor:.2f}" if floor else "200D SMA support"
            pnl_str = f"{pnl:+.1f}%" if pnl is not None else "neutral"
            return f"Active Holding ({symbol}): Assess headline against your {floor_str} defensive floor and current {pnl_str} unrealized return."
        elif bucket == "WATCHLIST":
            target_str = f"${target:.2f}" if target else "95% buy ceiling"
            return f"Watchlist Target ({symbol}): Factor news development into your {target_str} target purchase price and right-side momentum status."
        else:
            return f"Market Benchmark ({symbol}): Catalyst influences sector valuation multiples and broader North American investor sentiment."

    @staticmethod
    def _resolve_company_name(symbol: str) -> str:
        names = {
            "NVDA": "NVIDIA Corporation",
            "MSFT": "Microsoft Corporation",
            "COST": "Costco Wholesale",
            "AAPL": "Apple Inc.",
            "BRK-B": "Berkshire Hathaway",
            "RY.TO": "Royal Bank of Canada",
            "TD.TO": "Toronto-Dominion Bank",
            "SHOP.TO": "Shopify Inc.",
            "CNQ.TO": "Canadian Natural Resources",
            "ENB.TO": "Enbridge Inc.",
            "BMO.TO": "Bank of Montreal",
        }
        return names.get(symbol.upper(), f"{symbol.upper()} Corp")

    @staticmethod
    def _resolve_baseline_price(symbol: str) -> float:
        prices = {
            "NVDA": 128.50,
            "MSFT": 448.20,
            "COST": 885.00,
            "AAPL": 224.30,
            "BRK-B": 452.10,
            "RY.TO": 158.40,
            "TD.TO": 78.50,
            "SHOP.TO": 105.20,
            "CNQ.TO": 48.60,
            "ENB.TO": 51.80,
            "BMO.TO": 122.30,
        }
        return prices.get(symbol.upper(), 100.0)
