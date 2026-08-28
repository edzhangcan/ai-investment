"""
User Watchlist REST Router
Allows starring stocks, setting target buy price alert thresholds, and tracking portfolio allocations.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import List, Optional
from pydantic import BaseModel, Field

from backend.database import get_session
from backend.models.db_models import UserWatchlistDB

router = APIRouter(prefix="/api/watchlist", tags=["User Watchlist"])

class WatchlistCreateSchema(BaseModel):
    symbol: str = Field(min_length=1, max_length=15, description="Stock ticker symbol")
    company_name: str = Field(min_length=1, max_length=100, description="Company name")
    target_buy_price: Optional[float] = Field(default=None, gt=0, description="Target buy price threshold")
    portfolio_allocation_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Recommended portfolio allocation percentage")

class WatchlistResponseSchema(BaseModel):
    id: int
    symbol: str
    company_name: str
    target_buy_price: Optional[float]
    portfolio_allocation_pct: float

@router.get("", response_model=List[WatchlistResponseSchema])
def get_watchlist(session: Session = Depends(get_session)):
    """Returns all starred user watchlist items."""
    items = session.exec(select(UserWatchlistDB)).all()
    return items

@router.post("", response_model=WatchlistResponseSchema)
def add_or_update_watchlist(payload: WatchlistCreateSchema, session: Session = Depends(get_session)):
    """Adds a stock to the watchlist or updates target buy price."""
    normalized_symbol = payload.symbol.upper().strip()
    existing = session.exec(select(UserWatchlistDB).where(UserWatchlistDB.symbol == normalized_symbol)).first()
    
    if existing:
        existing.company_name = payload.company_name
        existing.target_buy_price = payload.target_buy_price
        existing.portfolio_allocation_pct = payload.portfolio_allocation_pct
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    new_item = UserWatchlistDB(
        symbol=normalized_symbol,
        company_name=payload.company_name,
        target_buy_price=payload.target_buy_price,
        portfolio_allocation_pct=payload.portfolio_allocation_pct
    )
    session.add(new_item)
    session.commit()
    session.refresh(new_item)
    return new_item

@router.post("/sync-targets", response_model=List[WatchlistResponseSchema])
def sync_watchlist_targets(session: Session = Depends(get_session)):
    """Synchronizes and updates all watchlist items with the latest computed ideal_buy_range_max."""
    from backend.data_sources.data_provider import data_provider_manager
    from backend.engines.pricing_engine import PricingEngine

    items = session.exec(select(UserWatchlistDB)).all()
    for item in items:
        try:
            quote = data_provider_manager.get_stock_quote(item.symbol)
            pricing = PricingEngine.evaluate_pricing_and_entry_zone(quote)
            new_target = pricing.get("ideal_buy_range_max")
            if new_target and new_target > 0:
                item.target_buy_price = new_target
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

