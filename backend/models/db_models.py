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
    source_mode: Optional[str] = Field(default="LIVE")
    created_at: datetime = Field(default_factory=get_utc_now)

class UserWatchlistDB(SQLModel, table=True):
    __tablename__ = "user_watchlists"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(unique=True, index=True)
    company_name: str
    target_buy_price: Optional[float] = None
    target_sell_price: Optional[float] = None
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
    bull_rebuttal: Optional[str] = Field(default=None)
    bear_rebuttal: Optional[str] = Field(default=None)
    falsification_price_level: Optional[float] = Field(default=None)
    falsification_trigger_condition: Optional[str] = Field(default=None)
    source_mode: Optional[str] = Field(default="LIVE")
    created_at: datetime = Field(default_factory=get_utc_now)

class PriceAlertLogDB(SQLModel, table=True):
    __tablename__ = "price_alert_logs"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)
    company_name: str
    current_price: float
    target_buy_price: float
    notification_channel: str = "IN_APP"  # "IN_APP", "DISCORD", "TELEGRAM"
    status: str = "TRIGGERED"
    message: str = ""
    triggered_at: datetime = Field(default_factory=get_utc_now)

class PushAlertConfigDB(SQLModel, table=True):
    __tablename__ = "push_alert_configs"
    id: Optional[int] = Field(default=None, primary_key=True)
    discord_webhook_url: Optional[str] = Field(default=None)
    is_discord_enabled: bool = Field(default=False)
    updated_at: datetime = Field(default_factory=get_utc_now)

class RecommendationSnapshotDB(SQLModel, table=True):
    __tablename__ = "recommendation_snapshots"
    id: Optional[int] = Field(default=None, primary_key=True)
    country: str = Field(default="US", index=True)  # "US" or "CA"
    category: str = Field(index=True)  # "SECTOR", "OVERALL", "GOLD"
    symbol: str = Field(index=True)
    company_name: str
    category_badge: str
    total_recommendation_score: float
    financial_payload_json: str  # Serialized JSON of recommendation item
    lang: str = Field(default="en", index=True)
    updated_at: datetime = Field(default_factory=get_utc_now)

class ValuationAlertSettingsDB(SQLModel, table=True):
    __tablename__ = "valuation_alert_settings"
    id: Optional[int] = Field(default=None, primary_key=True)
    global_mos_pct: float = Field(default=15.0)  # 10.0 to 30.0%
    technical_anchor_mode: str = Field(default="adaptive_balanced")  # "adaptive_balanced", "strict_200d", "tactical_pullback"
    ticker_overrides_json: str = Field(default="{}")  # JSON string mapping symbol -> {"target_buy": float, "target_sell": float}
    updated_at: datetime = Field(default_factory=get_utc_now)

class TradeDecisionJournalDB(SQLModel, table=True):
    __tablename__ = "trade_decision_journals"
    id: Optional[int] = Field(default=None, primary_key=True)
    symbol: str = Field(index=True)
    q1_urgent_fomo: bool = Field(default=False)
    q2_trend_temperature: str = Field(default="FLAT")  # "FREEZE", "FLAT", "WARM", "HOT"
    q3_crowd_consensus: str = Field(default="")
    q4_bayesian_prior_pct: float = Field(default=60.0)  # Capped at <= 95.0%
    falsification_trigger: str = Field(default="")
    decision_action: str = Field(default="BUY")  # "BUY", "PASS", "WATCH"
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=get_utc_now)
