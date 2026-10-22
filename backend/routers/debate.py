"""
Multi-Agent Debate Router: WebSocket & Server-Sent Events (SSE) Streaming,
and REST endpoints with DB persistence.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
import asyncio
import json
import logging
from typing import Optional
from sqlmodel import Session

from backend.database import engine, get_session
from backend.models.db_models import DebateTranscriptDB
from backend.models.schemas import DebateSchema, DebateTranscriptSchema
from backend.data_sources.data_provider import DataProviderManager
from backend.engines.macro_engine import MacroEngine
from backend.engines.pricing_engine import PricingEngine
from backend.engines.fundamental_engine import FundamentalEngine
from backend.agents.agent_arena import MultiAgentArena

router = APIRouter(tags=["Multi-Agent Debate Streaming"])

def _run_debate_for_ticker(ticker: str, lang: str = "en", force_refresh: bool = False) -> dict:
    stock_data = DataProviderManager.get_stock_data(ticker, force_refresh=force_refresh)
    symbol = ticker.strip().upper()
    is_ca = (
        stock_data.get("market") == "CA"
        or stock_data.get("currency") == "CAD"
        or symbol.endswith(".TO")
        or symbol.endswith(".V")
    )
    country = "CA" if is_ca else "US"
    macro_data = MacroEngine.analyze_macro_environment(country=country, lang=lang)
    fundamental_data = FundamentalEngine.evaluate_fundamentals(stock_data, lang=lang)
    pricing_data = PricingEngine.evaluate_pricing_and_entry_zone(stock_data, lang=lang)
    return MultiAgentArena.run_debate(
        stock_data,
        macro_data,
        pricing_data,
        fundamental_data,
        lang=lang,
        country=country,
        verify_filings=force_refresh
    )

@router.websocket("/ws/debate/{ticker}")
@router.websocket("/debate/{ticker}")
async def stream_debate(websocket: WebSocket, ticker: str):
    """WebSocket route streaming real-time multi-agent debate steps to the frontend theater."""
    await websocket.accept()
    try:
        debate = _run_debate_for_ticker(ticker)

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

        # 3. Stream Round 2 Rebuttals
        await asyncio.sleep(0.5)
        await websocket.send_json({
            "stage": "rebuttal",
            "bull_rebuttal": debate.get("bull_rebuttal"),
            "bear_rebuttal": debate.get("bear_rebuttal")
        })

        # 4. Stream CIO Agent Verdict
        await asyncio.sleep(0.8)
        await websocket.send_json({
            "stage": "cio",
            "agent": "CIO Agent 👨‍⚖️",
            "content": debate["cio_verdict"],
            "falsification_price_level": debate.get("falsification_price_level"),
            "falsification_trigger_condition": debate.get("falsification_trigger_condition")
        })

    except WebSocketDisconnect:
        logging.info(f"WebSocket client disconnected for {ticker}")
    except Exception as e:
        await websocket.send_json({"error": str(e)})
        await websocket.close()

@router.post("/api/debate/{symbol}")
@router.get("/api/debate/{symbol}")
def run_and_save_debate(symbol: str, lang: str = "en", force_refresh: bool = False, session: Optional[Session] = Depends(get_session)):
    """
    Executes multi-agent debate (Opening, Round 2 Rebuttals, CIO Verdict),
    persists transcript and falsification trigger to SQLite, and returns DebateTranscriptSchema.
    Bypasses local quote cache and verifies SEC/SEDAR filings when force_refresh=True.
    """
    if not symbol or len(symbol.strip()) == 0:
        raise HTTPException(status_code=400, detail="Symbol cannot be empty")

    clean_sym = symbol.strip().upper()
    debate_result = _run_debate_for_ticker(clean_sym, lang=lang, force_refresh=force_refresh)

    # Persist transcript to SQLite
    try:
        sess = session or Session(engine)
        transcript = DebateTranscriptDB(
            symbol=clean_sym,
            bull_summary="; ".join(debate_result.get("bull_argument", {}).get("key_points", []))[:500],
            bear_summary="; ".join(debate_result.get("bear_argument", {}).get("key_points", []))[:500],
            cio_verdict=str(debate_result.get("cio_verdict", {}).get("verdict", "N/A")),
            risk_reward_ratio=float(debate_result.get("cio_verdict", {}).get("risk_reward_ratio", 1.0)),
            judge_summary=str(debate_result.get("cio_verdict", {}).get("judge_summary", ""))[:1000],
            bull_rebuttal=debate_result.get("bull_rebuttal"),
            bear_rebuttal=debate_result.get("bear_rebuttal"),
            falsification_price_level=debate_result.get("falsification_price_level"),
            falsification_trigger_condition=debate_result.get("falsification_trigger_condition"),
            source_mode=debate_result.get("provenance", {}).get("source_mode", "LIVE") if debate_result.get("provenance") else "LIVE"
        )
        sess.add(transcript)
        sess.commit()
    except Exception as e:
        logging.warning(f"Failed to persist debate transcript to database: {e}")

    return debate_result

@router.get("/api/debate/{symbol}/stream")
async def stream_debate_sse(symbol: str, lang: str = "en"):
    """
    Server-Sent Events (SSE) streaming endpoint for institutional debate.
    Yields events across 3 stages:
      1. 'opening': Bull & Bear opening theses
      2. 'rebuttal': Adversarial round-2 cross-examinations
      3. 'complete': CIO final verdict with quantified falsification price level
    """
    if not symbol or len(symbol.strip()) == 0:
        raise HTTPException(status_code=400, detail="Symbol cannot be empty")

    clean_sym = symbol.strip().upper()

    async def event_generator():
        # Execute debate
        debate = _run_debate_for_ticker(clean_sym, lang=lang)

        # 1. Opening stage
        opening_payload = {
            "stage": "opening",
            "symbol": clean_sym,
            "bull_argument": debate.get("bull_argument"),
            "bear_argument": debate.get("bear_argument")
        }
        yield f"data: {json.dumps(opening_payload)}\n\n"
        await asyncio.sleep(0.3)

        # 2. Rebuttal stage
        rebuttal_payload = {
            "stage": "rebuttal",
            "symbol": clean_sym,
            "bull_rebuttal": debate.get("bull_rebuttal"),
            "bear_rebuttal": debate.get("bear_rebuttal")
        }
        yield f"data: {json.dumps(rebuttal_payload)}\n\n"
        await asyncio.sleep(0.3)

        # 3. Complete stage
        complete_payload = {
            "stage": "complete",
            "symbol": clean_sym,
            "cio_verdict": debate.get("cio_verdict"),
            "falsification_price_level": debate.get("falsification_price_level"),
            "falsification_trigger_condition": debate.get("falsification_trigger_condition"),
            "provenance": debate.get("provenance")
        }
        yield f"data: {json.dumps(complete_payload)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
