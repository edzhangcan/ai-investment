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
from sqlalchemy import event
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

def init_db():
    """
    Creates database schema and tables if they do not exist.
    Registers all models imported from `backend.models.db_models`.
    """
    from backend.models import db_models  # Import registers SQLModel metadata
    SQLModel.metadata.create_all(engine)

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
