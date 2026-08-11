"""
SQLModel Database Entities for Local SQLite Persistence
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)

class CompanyDB(SQLModel, table=True):
    __tablename__ = "companies"
    symbol: str = Field(primary_key=True, index=True)
    company_name: str
    market: str  # "US" or "CA"
    currency: str  # "USD" or "CAD"
    industry_sector: str = "Technology"
    last_price: float = 0.0
    updated_at: datetime = Field(default_factory=get_utc_now)

class MacroSnapshotDB(SQLModel, table=True):
    __tablename__ = "macro_snapshots"
    id: Optional[int] = Field(default=None, primary_key=True)
    cycle_stage: str
    cycle_code: str
    fed_tone: str
    boc_tone: str
    cpi_yoy: float
    yield_spread: float
    created_at: datetime = Field(default_factory=get_utc_now)

class GuidanceShiftDB(SQLModel, table=True):
    __tablename__ = "guidance_shifts"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)
    year_pair: str
    disclaimer: str
    severity: str
    created_at: datetime = Field(default_factory=get_utc_now)

class UserWatchlistDB(SQLModel, table=True):
    __tablename__ = "user_watchlists"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(unique=True, index=True)
    company_name: str
    target_buy_price: Optional[float] = None
    portfolio_allocation_pct: float = 0.0
    created_at: datetime = Field(default_factory=get_utc_now)

class DebateTranscriptDB(SQLModel, table=True):
    __tablename__ = "debate_transcripts"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)
    bull_summary: str
    bear_summary: str
    cio_verdict: str
    risk_reward_ratio: float
    judge_summary: str
    created_at: datetime = Field(default_factory=get_utc_now)
