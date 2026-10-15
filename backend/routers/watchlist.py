"""
User Watchlist REST Router
Allows starring stocks, setting target buy price alert thresholds, and tracking portfolio allocations.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel, Field

from backend.database import get_session
from backend.models.db_models import UserWatchlistDB, TradeDecisionJournalDB

router = APIRouter(prefix="/api/watchlist", tags=["User Watchlist"])

class WatchlistCreateSchema(BaseModel):
    symbol: str = Field(min_length=1, max_length=15, description="Stock ticker symbol")
    company_name: str = Field(min_length=1, max_length=100, description="Company name")
    target_buy_price: Optional[float] = Field(default=None, gt=0, description="Target buy price threshold (lower bound)")
    target_sell_price: Optional[float] = Field(default=None, gt=0, description="Target sell price threshold (upper bound)")
    portfolio_allocation_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Recommended portfolio allocation percentage")

class WatchlistResponseSchema(BaseModel):
    id: int
    symbol: str
    company_name: str
    target_buy_price: Optional[float]
    target_sell_price: Optional[float] = None
    portfolio_allocation_pct: float

@router.get("", response_model=List[WatchlistResponseSchema])
def get_watchlist(session: Session = Depends(get_session)):
    """Returns all starred user watchlist items."""
    items = session.exec(select(UserWatchlistDB)).all()
    return items

@router.post("", response_model=WatchlistResponseSchema)
def add_or_update_watchlist(payload: WatchlistCreateSchema, session: Session = Depends(get_session)):
    """Adds a stock to the watchlist or updates target buy/sell prices."""
    normalized_symbol = payload.symbol.upper().strip()
    existing = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == normalized_symbol)).first()
    
    if existing:
        existing.company_name = payload.company_name
        existing.target_buy_price = payload.target_buy_price
        existing.target_sell_price = payload.target_sell_price
        existing.portfolio_allocation_pct = payload.portfolio_allocation_pct
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    new_item = UserWatchlistDB(
        symbol=normalized_symbol,
        company_name=payload.company_name,
        target_buy_price=payload.target_buy_price,
        target_sell_price=payload.target_sell_price,
        portfolio_allocation_pct=payload.portfolio_allocation_pct
    )
    session.add(new_item)
    session.commit()
    session.refresh(new_item)
    return new_item

@router.post("/sync-targets", response_model=List[WatchlistResponseSchema])
def sync_watchlist_targets(session: Session = Depends(get_session)):
    """Synchronizes and updates all watchlist items with the latest computed ideal_buy_range_max and ideal_sell_range_min."""
    from backend.data_sources.data_provider import data_provider_manager
    from backend.engines.pricing_engine import PricingEngine
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
            new_target = pricing.get("ideal_buy_range_max")
            new_sell_target = pricing.get("ideal_sell_range_min")
            if new_target and new_target > 0:
                item.target_buy_price = new_target
            if new_sell_target and new_sell_target > 0:
                item.target_sell_price = new_sell_target
            session.add(item)
        except Exception:
            pass

    session.commit()
    for item in items:
        session.refresh(item)
    return items

@router.delete("/{symbol}")
def remove_from_watchlist(symbol: str, session: Session = Depends(get_session)):
    """Removes a stock from the watchlist."""
    normalized_symbol = symbol.upper().strip()
    item = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == normalized_symbol)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Stock not found in watchlist")
    
    session.delete(item)
    session.commit()
    return {"message": f"Successfully removed {normalized_symbol} from watchlist"}

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

