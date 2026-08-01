"""
FastAPI Main Application Server
Exposes REST APIs for Macro Scanner, Fundamental Analysis, Pricing Engine, and Jargon Lookup.
Provides WebSocket endpoint `/ws/debate/{ticker}` for streaming live multi-agent debates.
"""

import os
import sys
import logging

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from backend.data_sources.data_provider import DataProviderManager

from backend.engines.macro_engine import MacroEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.agents.agent_arena import MultiAgentArena

app = FastAPI(
    title="AI-Assisted Investment Platform API",
    description="Backend service powering macro scanning, fundamental review, pricing engine, and multi-agent debate for US & CA equities.",
    version="1.0.0"
)

# Enable CORS for Next.js / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AI Investment Backend API", "version": "1.0.0"}

@app.get("/api/macro")
def get_macro_analysis():
    """Returns current US & Canada economic cycle status and sector rotation weights."""
    return MacroEngine.analyze_macro_environment()

@app.get("/api/stock/{ticker}")
def analyze_stock(ticker: str):
    """
    Synthesizes stock data, fundamental metrics, valuation models, technical overlays,
    and runs the Bull vs Bear vs CIO multi-agent debate.
    """
    stock_data = DataProviderManager.get_stock_data(ticker)
    macro_data = MacroEngine.analyze_macro_environment()
    fundamental_data = FundamentalEngine.evaluate_fundamentals(stock_data)
    pricing_data = PricingEngine.evaluate_pricing_and_entry_zone(stock_data)
    debate_data = MultiAgentArena.run_debate(stock_data, macro_data, pricing_data, fundamental_data)

    return {
        "stock": stock_data,
        "macro": macro_data,
        "fundamentals": fundamental_data,
        "pricing": pricing_data,
        "debate": debate_data
    }

@app.websocket("/ws/debate/{ticker}")
async def stream_debate(websocket: WebSocket, ticker: str):
    """WebSocket route streaming real-time multi-agent debate steps to the frontend theater."""
    await websocket.accept()
    try:
        stock_data = DataProviderManager.get_stock_data(ticker)
        macro_data = MacroEngine.analyze_macro_environment()
        fundamental_data = FundamentalEngine.evaluate_fundamentals(stock_data)
        pricing_data = PricingEngine.evaluate_pricing_and_entry_zone(stock_data)
        debate = MultiAgentArena.run_debate(stock_data, macro_data, pricing_data, fundamental_data)

        # 1. Stream Bull Agent
        await asyncio.sleep(0.5)
        await websocket.send_json({
            "stage": "bull",
            "agent": "Bull Agent 🐂",
            "content": debate["bull_argument"]
        })

        # 2. Stream Bear Agent
        await asyncio.sleep(0.8)
        await websocket.send_json({
            "stage": "bear",
            "agent": "Bear Agent 🐻",
            "content": debate["bear_argument"]
        })

        # 3. Stream CIO Agent Verdict
        await asyncio.sleep(1.0)
        await websocket.send_json({
            "stage": "cio",
            "agent": "CIO Agent 👨‍⚖️",
            "content": debate["cio_verdict"]
        })

    except WebSocketDisconnect:
        logging.info(f"WebSocket client disconnected for {ticker}")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()

if __name__ == "__main__":
    import sys
    import os
    import uvicorn
    # Automatically add repository root to sys.path
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

