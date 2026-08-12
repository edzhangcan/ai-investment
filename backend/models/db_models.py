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

class PriceAlertLogDB(SQLModel, table=True):
    __tablename__ = "price_alert_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)
    company_name: str
    current_price: float
    target_buy_price: float
    notification_channel: str = "IN_APP"  # "IN_APP", "WHATSAPP", "WEBHOOK"
    status: str = "TRIGGERED"
    message: str = ""
    triggered_at: datetime = Field(default_factory=get_utc_now)

class WhatsAppConfigDB(SQLModel, table=True):
    __tablename__ = "whatsapp_configs"
    id: Optional[int] = Field(default=1, primary_key=True)
    phone_number: str = Field(default="+14165550199")
    morning_digest_enabled: bool = Field(default=True)
    buy_alert_enabled: bool = Field(default=True)
    sell_alert_enabled: bool = Field(default=True)
    lang: str = Field(default="en")
    updated_at: datetime = Field(default_factory=get_utc_now)
