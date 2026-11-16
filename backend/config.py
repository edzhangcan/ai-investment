"""
Configuration & Settings Management
Loads environment variables and sets default platform configurations.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "AI-Assisted Investment & Multi-Agent Debate Platform"
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    SQL_ECHO: bool = os.getenv("SQL_ECHO", "False").lower() == "true"

    # API Keys & Third-Party Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    FRED_API_KEY: str = os.getenv("FRED_API_KEY", "")

    # Defaults & Cache Settings
    DEFAULT_CACHE_TTL_SECONDS: int = 300  # 5 minutes
    DEFAULT_WACC: float = 0.08  # 8% Discount rate for DCF
    DEFAULT_TERMINAL_GROWTH: float = 0.03  # 3% Terminal growth

    # Security & CORS Whitelist
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


settings = Settings()
