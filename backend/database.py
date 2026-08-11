"""
Database Infrastructure Layer (SQLModel + SQLite WAL Mode)
Manages connection sessions and table initialization for local persistence.
"""

import os
from sqlmodel import SQLModel, create_engine, Session
from backend.config import settings

# Path to SQLite database file
DB_FILE = os.path.join(os.path.dirname(__file__), "investment_platform.db")
DATABASE_URL = f"sqlite:///{DB_FILE}"

# Enable WAL (Write-Ahead Logging) mode for fast concurrent reads
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    connect_args={"check_same_thread": False}
)

def init_db():
    """Initializes database tables on application startup."""
    from backend.models import db_models  # Import to register SQLModel tables
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency injector yielding a database session."""
    with Session(engine) as session:
        yield session
