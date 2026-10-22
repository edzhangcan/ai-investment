"""
==============================================================================
SQLite & SQLModel Database Layer (Write-Ahead Logging / Connection Pool)
==============================================================================
Developer Guide for Beginners:
------------------------------------------------------------------------------
1. SQLModel:
   - SQLModel combines SQLAlchemy (Python's leading ORM) and Pydantic (data validation).
   - Python classes defined in `db_models.py` map directly to database tables.

2. SQLite & WAL Mode (Write-Ahead Logging):
   - By default, SQLite locks the entire database during writes.
   - Enabling PRAGMA `journal_mode=WAL` allows concurrent readers and writers to operate
     simultaneously without blocking HTTP API requests.
   - PRAGMA `busy_timeout=60000` instructs SQLite to wait up to 60 seconds for lock release
     before throwing a "Database Locked" exception.
==============================================================================
"""

import os
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event, text
from backend.config import settings

# Step 1: Define SQLite File Path and Database URL
DB_FILE = os.path.join(os.path.dirname(__file__), "investment_platform.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

# Step 2: Create SQLModel Engine Instance
# check_same_thread=False allows FastAPI multi-threaded requests to use the same engine instance.
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False, "timeout": 30}
)

def ensure_schema_migrations() -> None:
    """
    Idempotent SQLite schema migration runner.
    Uses PRAGMA table_info to inspect existing columns and safely appends
    new columns via ALTER TABLE without destroying data or throwing errors.
    """
    migrations = [
        ("user_watchlists", "target_sell_price", "REAL"),
        ("user_watchlists", "bucket", "TEXT DEFAULT 'WATCHLIST'"),
        ("user_watchlists", "buy_in_price", "REAL"),
        ("user_watchlists", "buy_in_date", "TEXT"),
        ("user_watchlists", "shares_held", "REAL"),
        ("user_watchlists", "last_sell_price", "REAL"),
        ("user_watchlists", "last_sell_date", "TEXT"),
        ("user_watchlists", "realized_pnl_pct", "REAL"),
        ("user_watchlists", "updated_at", "TIMESTAMP"),
        ("recommendation_snapshots", "country", "TEXT DEFAULT 'US'"),
        ("debate_transcripts", "bull_rebuttal", "TEXT"),
        ("debate_transcripts", "bear_rebuttal", "TEXT"),
        ("debate_transcripts", "falsification_price_level", "REAL"),
        ("debate_transcripts", "falsification_trigger_condition", "TEXT"),
        ("debate_transcripts", "source_mode", "TEXT DEFAULT 'LIVE'"),
        ("guidance_shifts", "source_mode", "TEXT DEFAULT 'LIVE'"),
    ]
    with engine.begin() as conn:
        for table_name, col_name, col_type in migrations:
            try:
                res = conn.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
                existing_cols = {row[1] for row in res}
                if existing_cols and col_name not in existing_cols:
                    conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type}"))
            except Exception:
                pass
        try:
            # Backfill any null or empty bucket to WATCHLIST for existing data
            conn.execute(text("UPDATE user_watchlists SET bucket = 'WATCHLIST' WHERE bucket IS NULL OR bucket = ''"))
        except Exception:
            pass

def init_db():
    """
    Creates database schema and tables if they do not exist.
    Registers all models imported from `backend.models.db_models`.
    """
    from backend.models import db_models  # Import registers SQLModel metadata
    SQLModel.metadata.create_all(engine)
    ensure_schema_migrations()

def get_session():
    """
    FastAPI Dependency Generator:
    Yields a database session context for FastAPI route endpoints,
    ensuring connections are cleanly returned to the pool after each request.
    """
    with Session(engine) as session:
        yield session

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """
    SQLite Connection Pragmas Listener:
    Enforces WAL mode, 60s busy timeout, and NORMAL synchronous mode on every new connection.
    """
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA busy_timeout=60000")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()
