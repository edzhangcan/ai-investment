"""
Pytest global fixtures and initialization for Prism Loop test suite.
Ensures SQLite database tables and schema are created before any test executes.
"""

import pytest
from backend.database import init_db

@pytest.fixture(autouse=True, scope="session")
def setup_test_suite_database():
    """Initializes SQLite database tables for the entire test session."""
    init_db()
