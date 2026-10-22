"""
User Stock Tracking & Watchlist REST Router
Manages the mutually exclusive 3-bucket stock lifecycle:
- HOLDING: Owned stocks, buy-in price/date, shares, realized/unrealized P&L
- WATCHLIST: Monitored stocks with customizable target price (default 95% of buy ceiling)
- REGULAR: General candidate universe
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

from backend.database import get_session
from backend.models.db_models import UserWatchlistDB, TradeDecisionJournalDB, get_utc_now
from backend.data_sources.data_provider import data_provider_manager, DataProviderManager, FALLBACK_STOCK_DATA
from backend.engines.pricing_engine import PricingEngine
from backend.services.alert_engine import PriceAlertEngine

router = APIRouter(prefix="/api/watchlist", tags=["User Stock Tracking"])


class WatchlistCreateSchema(BaseModel):
    symbol: str = Field(min_length=1, max_length=15, description="Stock ticker symbol")
    company_name: str = Field(min_length=1, max_length=100, description="Company name")
    bucket: Optional[str] = Field(default="WATCHLIST", description="HOLDING, WATCHLIST, or REGULAR")
    target_buy_price: Optional[float] = Field(default=None, gt=0, description="Target buy price threshold")
    target_sell_price: Optional[float] = Field(default=None, gt=0, description="Target sell price threshold")
    portfolio_allocation_pct: float = Field(default=3.0, ge=0.0, le=100.0, description="Portfolio allocation percentage")
    buy_in_price: Optional[float] = Field(default=None, gt=0, description="Purchase price for holdings")
    buy_in_date: Optional[str] = Field(default=None, description="Purchase date (YYYY-MM-DD)")
    shares_held: Optional[float] = Field(default=None, ge=0, description="Shares held")


class SetBucketSchema(BaseModel):
    symbol: str = Field(min_length=1, max_length=15, description="Stock ticker symbol")
    company_name: Optional[str] = Field(default=None, max_length=100, description="Company name")
    bucket: str = Field(..., description="Target bucket: HOLDING, WATCHLIST, or REGULAR")
    buy_in_price: Optional[float] = Field(default=None, gt=0, description="Buy-in price per share")
    buy_in_date: Optional[str] = Field(default=None, description="Buy-in date (YYYY-MM-DD)")
    shares_held: Optional[float] = Field(default=None, ge=0, description="Number of shares held")
    target_buy_price: Optional[float] = Field(default=None, gt=0, description="Custom target buy threshold")
    target_sell_price: Optional[float] = Field(default=None, gt=0, description="Target profit-taking threshold")
    portfolio_allocation_pct: Optional[float] = Field(default=0.0, ge=0.0, le=100.0)
    is_additional_buy: Optional[bool] = Field(default=False, description="Add shares to existing holding position")


class SellHoldingSchema(BaseModel):
    symbol: str = Field(min_length=1, max_length=15, description="Stock ticker symbol")
    sell_off_price: float = Field(gt=0, description="Realized exit price per share")
    sell_off_date: str = Field(description="Exit date (YYYY-MM-DD)")
    post_sell_bucket: str = Field(default="REGULAR", description="Destination bucket after sell: REGULAR or WATCHLIST")
    notes: Optional[str] = Field(default=None, description="Optional exit thesis or discipline notes")


class WatchlistResponseSchema(BaseModel):
    id: Optional[int] = None
    symbol: str
    company_name: str
    bucket: str = "WATCHLIST"
    target_buy_price: Optional[float] = None
    target_sell_price: Optional[float] = None
    portfolio_allocation_pct: float = 0.0
    buy_in_price: Optional[float] = None
    buy_in_date: Optional[str] = None
    shares_held: Optional[float] = None
    last_sell_price: Optional[float] = None
    last_sell_date: Optional[str] = None
    realized_pnl_pct: Optional[float] = None
    holding_days: Optional[int] = None
    current_price: Optional[float] = None
    total_value: Optional[float] = None
    total_cost: Optional[float] = None
    unrealized_pnl_dollar: Optional[float] = None
    unrealized_pnl_pct: Optional[float] = None
    falsification_floor: Optional[float] = None
    batting_zone: Optional[str] = None
    trend_state: Optional[str] = None


def enrich_item_quote(
    item: UserWatchlistDB,
    allow_network: bool = False,
    holding_days_override: Optional[int] = None
) -> WatchlistResponseSchema:
    """Helper to attach live quote, unrealized P&L, and trend telemetry to an item."""
    from backend.data_sources.data_provider import DataProviderManager, FALLBACK_STOCK_DATA
    norm = item.symbol.upper().strip()
    quote = None
    with DataProviderManager._LOCK:
        if norm in DataProviderManager._CACHE:
            quote = DataProviderManager._CACHE[norm]

    if quote is None:
        if norm in FALLBACK_STOCK_DATA:
            quote = FALLBACK_STOCK_DATA[norm]
        elif allow_network:
            try:
                quote = data_provider_manager.get_stock_quote(item.symbol)
            except Exception:
                quote = {}
        else:
            quote = {}

    curr_price = float(quote.get("current_price") or 0.0)
    sma200 = float(quote.get("two_hundred_day_sma") or 0.0)
    floor = round(sma200 * 0.97, 2) if sma200 > 0 else None

    unrealized_pnl = None
    total_value = None
    total_cost = None
    unrealized_pnl_dollar = None

    if item.bucket == "HOLDING":
        shares = float(item.shares_held) if item.shares_held is not None else None
        buy_p = float(item.buy_in_price) if item.buy_in_price is not None else None
        effective_curr = curr_price if curr_price > 0 else (buy_p or 0.0)

        if shares is not None and shares > 0:
            total_value = round(shares * effective_curr, 2)
            if buy_p and buy_p > 0:
                total_cost = round(shares * buy_p, 2)
                unrealized_pnl_dollar = round(total_value - total_cost, 2)
                unrealized_pnl = round(((total_value - total_cost) / total_cost) * 100.0, 2)
        elif buy_p and buy_p > 0 and curr_price > 0:
            unrealized_pnl = round(((curr_price - buy_p) / buy_p) * 100.0, 2)

    holding_days = holding_days_override
    if holding_days is None and item.buy_in_date:
        try:
            d_buy = datetime.strptime(item.buy_in_date, "%Y-%m-%d")
            d_ref = datetime.strptime(item.last_sell_date, "%Y-%m-%d") if item.last_sell_date else datetime.now(timezone.utc)
            holding_days = max(0, (d_ref - d_buy).days)
        except Exception:
            holding_days = None

    trend_eval = PriceAlertEngine.evaluate_symbol_trend_temperature(quote) if quote else {}
    batting_zone = trend_eval.get("hitting_zone", "RIGHT_SIDE")
    trend_state = trend_eval.get("state", "WARM")

    return WatchlistResponseSchema(
        id=item.id,
        symbol=item.symbol,
        company_name=item.company_name,
        bucket=item.bucket or "WATCHLIST",
        target_buy_price=item.target_buy_price,
        target_sell_price=item.target_sell_price,
        portfolio_allocation_pct=item.portfolio_allocation_pct,
        buy_in_price=item.buy_in_price,
        buy_in_date=item.buy_in_date,
        shares_held=item.shares_held,
        last_sell_price=item.last_sell_price,
        last_sell_date=item.last_sell_date,
        realized_pnl_pct=item.realized_pnl_pct,
        holding_days=holding_days,
        current_price=curr_price if curr_price > 0 else None,
        total_value=total_value,
        total_cost=total_cost,
        unrealized_pnl_dollar=unrealized_pnl_dollar,
        unrealized_pnl_pct=unrealized_pnl,
        falsification_floor=floor,
        batting_zone=batting_zone,
        trend_state=trend_state
    )


@router.get("", response_model=List[WatchlistResponseSchema])
def get_watchlist(
    bucket: Optional[str] = Query(None, description="Filter by bucket: HOLDING, WATCHLIST, or ALL"),
    session: Session = Depends(get_session)
):
    """Returns tracked stocks filtered by bucket, enriched with live pricing, total values, and dynamic allocations."""
    query = select(UserWatchlistDB)
    if bucket and bucket.upper() != "ALL":
        query = query.where(UserWatchlistDB.bucket == bucket.upper())

    items = session.exec(query).all()

    # Calculate portfolio total value across all active holdings
    all_holdings = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.bucket == "HOLDING")).all()
    holding_values = {}
    for h in all_holdings:
        enr = enrich_item_quote(h, allow_network=False)
        if enr.total_value and enr.total_value > 0:
            holding_values[h.symbol] = enr.total_value

    portfolio_total_value = sum(holding_values.values())

    enriched_items = []
    for it in items:
        resp = enrich_item_quote(it, allow_network=False)
        if resp.bucket == "HOLDING":
            if portfolio_total_value > 0 and resp.total_value:
                resp.portfolio_allocation_pct = round((resp.total_value / portfolio_total_value) * 100.0, 2)
            elif portfolio_total_value > 0 and (resp.total_value is None or resp.total_value == 0):
                resp.portfolio_allocation_pct = 0.0
        enriched_items.append(resp)

    return enriched_items


@router.get("/status/{symbol}")
def get_stock_bucket_status(symbol: str, session: Session = Depends(get_session)):
    """Returns the single current active bucket and tracking record for a symbol."""
    norm = symbol.upper().strip()
    item = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm)).first()
    if not item:
        default_target = None
        try:
            from backend.data_sources.data_provider import DataProviderManager, FALLBACK_STOCK_DATA
            quote = None
            with DataProviderManager._LOCK:
                if norm in DataProviderManager._CACHE:
                    quote = DataProviderManager._CACHE[norm]
            if not quote and norm in FALLBACK_STOCK_DATA:
                quote = FALLBACK_STOCK_DATA[norm]
            if quote:
                pricing = PricingEngine.evaluate_pricing_and_entry_zone(quote)
                buy_ceiling = float(pricing.get("ideal_buy_range_max") or 0.0)
                if buy_ceiling > 0:
                    default_target = round(buy_ceiling * 0.95, 2)
        except Exception:
            pass

        return {
            "symbol": norm,
            "bucket": "REGULAR",
            "is_holding": False,
            "is_watchlist": False,
            "is_tracked": False,
            "target_buy_price": default_target,
            "data": None
        }

    status_data = enrich_item_quote(item, allow_network=False)
    if item.bucket == "HOLDING" and status_data.total_value:
        all_holdings = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.bucket == "HOLDING")).all()
        portfolio_total_val = sum((enrich_item_quote(h, allow_network=False).total_value or 0.0) for h in all_holdings)
        if portfolio_total_val > 0:
            status_data.portfolio_allocation_pct = round((status_data.total_value / portfolio_total_val) * 100.0, 2)

    return {
        "symbol": norm,
        "bucket": item.bucket,
        "is_holding": item.bucket == "HOLDING",
        "is_watchlist": item.bucket == "WATCHLIST",
        "is_tracked": True,
        "data": status_data
    }


@router.post("/set-bucket", response_model=WatchlistResponseSchema)
def set_stock_bucket(payload: SetBucketSchema, session: Session = Depends(get_session)):
    """
    Transitions a stock between HOLDING, WATCHLIST, and REGULAR.
    Enforces mutual exclusivity: any stock belongs to exactly one bucket.
    Supports additional buy-in (scale-in) blending for existing holdings.
    """
    norm = payload.symbol.upper().strip()
    target_bucket = payload.bucket.upper().strip()
    if target_bucket not in ["HOLDING", "WATCHLIST", "REGULAR"]:
        raise HTTPException(status_code=400, detail="Invalid bucket. Must be HOLDING, WATCHLIST, or REGULAR.")

    # High-Performance Fast Quote Lookup (Sub-millisecond)
    quote = None
    with DataProviderManager._LOCK:
        if norm in DataProviderManager._CACHE:
            quote = DataProviderManager._CACHE[norm]
    if not quote and norm in FALLBACK_STOCK_DATA:
        quote = FALLBACK_STOCK_DATA[norm]
    if not quote and (not payload.buy_in_price or target_bucket == "WATCHLIST"):
        try:
            quote = data_provider_manager.get_stock_quote(norm)
        except Exception:
            quote = {}
    elif not quote:
        quote = {}

    curr_price = float(quote.get("current_price") or payload.buy_in_price or 0.0)
    company_name = payload.company_name or quote.get("company_name") or f"{norm} Corp"

    # Case 1: Transition to REGULAR (Remove from tracked DB)
    if target_bucket == "REGULAR":
        existing = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm)).first()
        if existing:
            session.delete(existing)
            session.commit()
        return WatchlistResponseSchema(
            id=None,
            symbol=norm,
            company_name=company_name,
            bucket="REGULAR",
            current_price=curr_price if curr_price > 0 else None
        )

    # Case 2: Transition to HOLDING
    existing = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm)).first()
    buy_price = payload.buy_in_price or (existing.buy_in_price if existing else None) or curr_price
    buy_date = payload.buy_in_date or (existing.buy_in_date if existing else None) or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Case 3: Transition to WATCHLIST (Compute default 95% ceiling if needed)
    target_buy = payload.target_buy_price
    if target_bucket == "WATCHLIST" and (not target_buy or target_buy <= 0):
        try:
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(quote)
            buy_ceiling = float(pricing.get("ideal_buy_range_max") or 0.0)
            if buy_ceiling > 0:
                target_buy = round(buy_ceiling * 0.95, 2)
            elif curr_price > 0:
                target_buy = round(curr_price * 0.95, 2)
        except Exception:
            target_buy = round(curr_price * 0.95, 2) if curr_price > 0 else None

    if existing:
        existing.company_name = company_name
        existing.bucket = target_bucket
        if target_bucket == "HOLDING":
            # Check for additional buy-in (scale-in) blending
            if payload.is_additional_buy and existing.bucket == "HOLDING" and (existing.shares_held or 0) > 0:
                prev_shares = float(existing.shares_held or 0.0)
                prev_price = float(existing.buy_in_price or 0.0)
                add_shares = float(payload.shares_held or 0.0)
                add_price = float(payload.buy_in_price or curr_price)
                total_shares = prev_shares + add_shares
                if total_shares > 0:
                    total_cost = (prev_shares * prev_price) + (add_shares * add_price)
                    blended_price = round(total_cost / total_shares, 2)
                else:
                    blended_price = add_price
                existing.shares_held = total_shares
                existing.buy_in_price = blended_price
                existing.buy_in_date = payload.buy_in_date or buy_date
            else:
                existing.buy_in_price = buy_price
                existing.buy_in_date = buy_date
                if payload.shares_held is not None:
                    existing.shares_held = payload.shares_held
                if payload.portfolio_allocation_pct is not None:
                    existing.portfolio_allocation_pct = payload.portfolio_allocation_pct
        elif target_bucket == "WATCHLIST":
            if target_buy and target_buy > 0:
                existing.target_buy_price = target_buy
            if payload.target_sell_price:
                existing.target_sell_price = payload.target_sell_price
            if payload.portfolio_allocation_pct is not None:
                existing.portfolio_allocation_pct = payload.portfolio_allocation_pct
        existing.updated_at = get_utc_now()
        session.add(existing)
        session.commit()
        session.refresh(existing)
        resp = enrich_item_quote(existing, allow_network=False)
        if existing.bucket == "HOLDING" and resp.total_value:
            all_holdings = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.bucket == "HOLDING")).all()
            portfolio_total_val = sum((enrich_item_quote(h, allow_network=False).total_value or 0.0) for h in all_holdings)
            if portfolio_total_val > 0:
                resp.portfolio_allocation_pct = round((resp.total_value / portfolio_total_val) * 100.0, 2)
        return resp

    # Create new tracked record
    new_item = UserWatchlistDB(
        symbol=norm,
        company_name=company_name,
        bucket=target_bucket,
        target_buy_price=target_buy if target_bucket == "WATCHLIST" else None,
        target_sell_price=payload.target_sell_price,
        portfolio_allocation_pct=payload.portfolio_allocation_pct or 0.0,
        buy_in_price=buy_price if target_bucket == "HOLDING" else None,
        buy_in_date=buy_date if target_bucket == "HOLDING" else None,
        shares_held=payload.shares_held if target_bucket == "HOLDING" else None,
        created_at=get_utc_now(),
        updated_at=get_utc_now()
    )
    session.add(new_item)
    session.commit()
    session.refresh(new_item)
    resp = enrich_item_quote(new_item, allow_network=False)
    if new_item.bucket == "HOLDING" and resp.total_value:
        all_holdings = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.bucket == "HOLDING")).all()
        portfolio_total_val = sum((enrich_item_quote(h, allow_network=False).total_value or 0.0) for h in all_holdings)
        if portfolio_total_val > 0:
            resp.portfolio_allocation_pct = round((resp.total_value / portfolio_total_val) * 100.0, 2)
    return resp


@router.post("/sell-holding")
def sell_holding(payload: SellHoldingSchema, session: Session = Depends(get_session)):
    """
    Executes a disciplined sell-off for an owned HOLDING.
    Computes realized return %, logs decision journal entry, and transitions to post_sell_bucket.
    """
    norm = payload.symbol.upper().strip()
    item = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm)).first()
    if not item or item.bucket != "HOLDING":
        raise HTTPException(status_code=404, detail=f"Stock {norm} is not in HOLDING status.")

    buy_price = item.buy_in_price or payload.sell_off_price
    realized_pnl_pct = round(((payload.sell_off_price - buy_price) / buy_price) * 100.0, 2) if buy_price > 0 else 0.0

    # Calculate holding duration
    holding_days = 0
    if item.buy_in_date:
        try:
            d_buy = datetime.strptime(item.buy_in_date, "%Y-%m-%d")
            d_sell = datetime.strptime(payload.sell_off_date, "%Y-%m-%d")
            holding_days = max(0, (d_sell - d_buy).days)
        except Exception:
            holding_days = 0

    # Log to decision journal
    journal_entry = TradeDecisionJournalDB(
        symbol=norm,
        q1_urgent_fomo=False,
        q2_trend_temperature="FLAT",
        q3_crowd_consensus=f"Executed sell-off at ${payload.sell_off_price} (Holding period: {holding_days}d)",
        q4_bayesian_prior_pct=60.0,
        falsification_trigger=payload.notes or "Disciplined holding sell-off",
        decision_action="SELL",
        notes=f"Realized P&L: {realized_pnl_pct}% (Buy: ${buy_price}, Sell: ${payload.sell_off_price})",
        created_at=get_utc_now()
    )
    session.add(journal_entry)

    post_bucket = payload.post_sell_bucket.upper().strip()
    if post_bucket not in ["REGULAR", "WATCHLIST"]:
        post_bucket = "REGULAR"

    item.bucket = post_bucket
    item.last_sell_price = payload.sell_off_price
    item.last_sell_date = payload.sell_off_date
    item.realized_pnl_pct = realized_pnl_pct
    item.buy_in_price = None
    item.buy_in_date = None
    item.shares_held = None
    item.updated_at = get_utc_now()

    if post_bucket == "WATCHLIST":
        # Re-anchor target buy price to 95% ceiling using cached quote
        quote = None
        with DataProviderManager._LOCK:
            if norm in DataProviderManager._CACHE:
                quote = DataProviderManager._CACHE[norm]
        if not quote and norm in FALLBACK_STOCK_DATA:
            quote = FALLBACK_STOCK_DATA[norm]
        if not quote:
            try:
                quote = data_provider_manager.get_stock_quote(norm)
            except Exception:
                quote = {}
        try:
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(quote)
            buy_ceiling = float(pricing.get("ideal_buy_range_max") or 0.0)
            item.target_buy_price = round(buy_ceiling * 0.95, 2) if buy_ceiling > 0 else round(payload.sell_off_price * 0.90, 2)
        except Exception:
            item.target_buy_price = round(payload.sell_off_price * 0.90, 2)
    else:
        item.target_buy_price = None

    session.add(item)
    session.commit()
    session.refresh(item)

    return enrich_item_quote(item, allow_network=False, holding_days_override=holding_days)


@router.post("", response_model=WatchlistResponseSchema)
def add_or_update_watchlist(payload: WatchlistCreateSchema, session: Session = Depends(get_session)):
    """Backwards-compatible endpoint for adding or updating watchlist items."""
    set_payload = SetBucketSchema(
        symbol=payload.symbol,
        company_name=payload.company_name,
        bucket=payload.bucket or "WATCHLIST",
        target_buy_price=payload.target_buy_price,
        target_sell_price=payload.target_sell_price,
        portfolio_allocation_pct=payload.portfolio_allocation_pct,
        buy_in_price=payload.buy_in_price,
        buy_in_date=payload.buy_in_date,
        shares_held=payload.shares_held
    )
    return set_stock_bucket(set_payload, session)


@router.post("/sync-targets", response_model=List[WatchlistResponseSchema])
def sync_watchlist_targets(session: Session = Depends(get_session)):
    """Synchronizes watchlist targets to 95% of ideal buy ceiling and sell targets to sell floor."""
    from backend.models.db_models import ValuationAlertSettingsDB

    settings_rec = session.exec(select(ValuationAlertSettingsDB)).first()
    custom_mos = settings_rec.global_mos_pct if settings_rec else None
    anchor_mode = settings_rec.technical_anchor_mode if settings_rec else "adaptive_balanced"

    items = session.exec(select(UserWatchlistDB)).all()
    for item in items:
        try:
            quote = data_provider_manager.get_stock_quote(item.symbol)
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(
                quote,
                custom_mos_pct=custom_mos,
                anchor_mode=anchor_mode
            )
            buy_ceiling = float(pricing.get("ideal_buy_range_max") or 0.0)
            sell_target = float(pricing.get("ideal_sell_range_min") or 0.0)
            if item.bucket == "WATCHLIST" and buy_ceiling > 0:
                item.target_buy_price = round(buy_ceiling * 0.95, 2)
            if sell_target > 0:
                item.target_sell_price = sell_target
            session.add(item)
        except Exception:
            pass

    session.commit()
    for item in items:
        session.refresh(item)
    return [enrich_item_quote(it) for it in items]


@router.delete("/{symbol}")
def remove_from_watchlist(symbol: str, session: Session = Depends(get_session)):
    """Removes a stock from tracked items (sets it back to REGULAR status)."""
    norm = symbol.upper().strip()
    item = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == norm)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock not found in tracked list")

    session.delete(item)
    session.commit()
    return {"message": f"Successfully removed {norm} from tracking (status: REGULAR)"}


class DecisionJournalCreateSchema(BaseModel):
    symbol: str
    q1_urgent_fomo: bool = False
    q2_trend_temperature: str = "FLAT"
    q3_crowd_consensus: str = ""
    q4_bayesian_prior_pct: float = Field(60.0, ge=1.0, le=95.0, description="Bayesian Prior probability (strictly <= 95%)")
    falsification_trigger: str = Field(..., min_length=3, description="Specific factual event that disproves thesis")
    decision_action: str = "BUY"
    notes: Optional[str] = None


@router.post("/decision-journal")
def create_decision_journal_entry(payload: DecisionJournalCreateSchema, session: Session = Depends(get_session)):
    """Logs pre-trade four soul questions and Bayesian prior decision journal entry."""
    if payload.q4_bayesian_prior_pct > 95.0:
        raise HTTPException(status_code=400, detail="Bayesian prior probability cannot exceed 95.0% (Humility guardrail).")

    entry = TradeDecisionJournalDB(
        symbol=payload.symbol.upper().strip(),
        q1_urgent_fomo=payload.q1_urgent_fomo,
        q2_trend_temperature=payload.q2_trend_temperature,
        q3_crowd_consensus=payload.q3_crowd_consensus,
        q4_bayesian_prior_pct=payload.q4_bayesian_prior_pct,
        falsification_trigger=payload.falsification_trigger,
        decision_action=payload.decision_action,
        notes=payload.notes
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry


@router.get("/decision-journal/{ticker}")
def get_decision_journal_entries(ticker: str, session: Session = Depends(get_session)):
    """Retrieves decision journal records for target symbol."""
    norm = ticker.upper().strip()
    entries = session.exec(
        select(TradeDecisionJournalDB)
        .where(TradeDecisionJournalDB.symbol == norm)
        .order_by(TradeDecisionJournalDB.created_at.desc())
    ).all()
    return entries
