"""
Pytest global fixtures and initialization for Prism Loop test suite.
Ensures an isolated SQLite test database is used so production database remains pristine.
"""

import os
import sys

# Ensure testing database is completely isolated from production investment_platform.db
TEST_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_investment.db"))
os.environ["TESTING"] = "true"
os.environ["DB_FILE"] = TEST_DB_PATH
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

import pytest
from backend.database import init_db, engine

@pytest.fixture(autouse=True, scope="session")
def setup_test_suite_database():
    """Initializes SQLite database tables on the isolated test database for the test session."""
    init_db()
    yield
    # Cleanup test database file after test run if desired
    try:
        engine.dispose()
        if os.path.exists(TEST_DB_PATH):
            os.remove(TEST_DB_PATH)
    except Exception:
        pass
