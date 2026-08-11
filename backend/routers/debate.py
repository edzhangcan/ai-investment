"""
WebSocket Live Debate Router
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.macro_engine import MacroEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.agents.agent_arena import MultiAgentArena

router = APIRouter(prefix="/ws", tags=["Multi-Agent Debate Streaming"])

@router.websocket("/debate/{ticker}")
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
        await asyncio.sleep(0.4)
        await websocket.send_json({
            "stage": "bull",
            "agent": "Bull Agent 🐂",
            "content": debate["bull_argument"]
        })

        # 2. Stream Bear Agent
        await asyncio.sleep(0.6)
        await websocket.send_json({
            "stage": "bear",
            "agent": "Bear Agent 🐻",
            "content": debate["bear_argument"]
        })

        # 3. Stream CIO Agent Verdict
        await asyncio.sleep(0.8)
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
