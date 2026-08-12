"""
Configuration & Settings Management
Loads environment variables and sets default platform configurations.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True)

    APP_NAME: str = "AI-Assisted Investment & Multi-Agent Debate Platform"
    ENV: str = os.getenv("ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # API Keys & Third-Party Services
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    FRED_API_KEY: str = os.getenv("FRED_API_KEY", "")

    # Twilio WhatsApp REST API Credentials
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
    
    # Defaults & Cache Settings
    DEFAULT_CACHE_TTL_SECONDS: int = 300  # 5 minutes
    DEFAULT_WACC: float = 0.08  # 8% Discount rate for DCF
    DEFAULT_TERMINAL_GROWTH: float = 0.03  # 3% Terminal growth

settings = Settings()

