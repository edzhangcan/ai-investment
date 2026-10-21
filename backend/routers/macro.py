"""
Macro Economy & Dashboard Router with multi-language support (en, zh, hybrid)
and multi-jurisdiction US & CA separation (PL-708)
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.responses import StreamingResponse
from backend.engines.macro_engine import MacroEngine
from backend.engines.recommendation_engine import RecommendationEngine
from backend.engines.central_bank_streamer import CentralBankSpeechStreamer
import asyncio
import json

from pydantic import BaseModel, Field
from typing import Optional, List

router = APIRouter(prefix="/api/macro", tags=["Macro Engine & Dashboard"])

class RefreshRecommendationsRequest(BaseModel):
    category: Optional[str] = None
    offset: int = 0
    lang: str = "en"
    country: str = Field(default="US", description="'US' or 'CA'")

@router.get("")
def get_macro_analysis(force_refresh: bool = False, lang: str = "en", country: str = "US"):
    """Returns current US & Canada economic cycle status and sector rotation weights."""
    return MacroEngine.analyze_macro_environment(force_refresh=force_refresh, lang=lang, country=country)

@router.get("/dashboard")
def get_macro_dashboard(force_refresh: bool = False, lang: str = "en", country: str = "US"):
    """
    Returns complete Macro Dashboard payload:
    Macro cycle assessment, empirical indicator proof array, policy news feed,
    and TOP macro-driven stock recommendations with 'Why Invest Now' rationale.
    Supports country='US' and country='CA'.
    """
    macro_data = MacroEngine.analyze_macro_environment(force_refresh=force_refresh, lang=lang, country=country)
    recommendations_data = RecommendationEngine.get_top_recommendations(
        force_refresh=force_refresh,
        lang=lang,
        country=country
    )

    return {
        "macro_assessment": macro_data,
        "policy_news": macro_data.get("policy_news", []),
        "empirical_supporting_facts": macro_data.get("empirical_supporting_facts", []),
        "credible_sources": macro_data.get("credible_sources", []),
        "recommendations": recommendations_data
    }

@router.get("/recommendations")
def get_recommendations(force_refresh: bool = False, lang: str = "en", country: str = "US"):
    """Returns top macro-driven recommendations for specific country jurisdiction ('US' or 'CA')."""
    return RecommendationEngine.get_top_recommendations(
        force_refresh=force_refresh,
        lang=lang,
        country=country
    )

@router.post("/recommendations/refresh")
def refresh_stock_recommendations(req: RefreshRecommendationsRequest):
    """
    Rotates and refreshes candidate stock recommendations for given category ('SECTOR', 'OVERALL', 'GOLD')
    and country ('US' or 'CA'). Returns fresh candidate batch matching macro criteria.
    """
    return RecommendationEngine.get_refreshed_recommendations(
        category=req.category,
        offset=req.offset,
        lang=req.lang,
        country=req.country
    )

# ==============================================================================
# PL-705: Central Bank Speech Streaming Endpoints (Fed FOMC & Bank of Canada)
# ==============================================================================

@router.get("/speeches")
def list_central_bank_speeches(country: Optional[str] = Query(None, description="'US' or 'CA'")):
    """Lists available central bank rate decision speeches and press conferences."""
    return CentralBankSpeechStreamer.get_available_speeches(country=country)

@router.get("/speech/{speech_id}")
def get_central_bank_speech(speech_id: str):
    """Retrieves full text and segment details of a specific central bank speech."""
    speech = CentralBankSpeechStreamer.get_speech_by_id(speech_id)
    if not speech:
        raise HTTPException(status_code=404, detail=f"Central bank speech '{speech_id}' not found")
    return speech

@router.get("/speech/{speech_id}/stream")
async def stream_central_bank_speech_sse(
    speech_id: str,
    speed: float = Query(1.0, ge=0.1, le=10.0, description="Speed multiplier (e.g. 1.0, 2.0, 5.0)"),
    lang: str = Query("en", description="'en' or 'zh'")
):
    """
    Server-Sent Events (SSE) streaming endpoint for central bank speeches.
    Streams real-time segment chunks with hawkish/dovish NLP signals,
    cumulative stance scores, and cross-asset market implications.
    """
    speech = CentralBankSpeechStreamer.get_speech_by_id(speech_id)
    if not speech:
        raise HTTPException(status_code=404, detail=f"Central bank speech '{speech_id}' not found")

    return StreamingResponse(
        CentralBankSpeechStreamer.generate_speech_stream(speech_id, speed_multiplier=speed, lang=lang),
        media_type="text/event-stream"
    )

@router.websocket("/ws/speech/{speech_id}")
async def stream_central_bank_speech_ws(
    websocket: WebSocket,
    speech_id: str,
    speed: float = 1.0,
    lang: str = "en"
):
    """
    WebSocket endpoint streaming live speech segments, NLP stance deltas,
    and market implications to connected clients.
    """
    await websocket.accept()
    speech = CentralBankSpeechStreamer.get_speech_by_id(speech_id)
    if not speech:
        await websocket.send_json({"event_type": "error", "error": f"Speech '{speech_id}' not found"})
        await websocket.close()
        return

    try:
        async for raw_event in CentralBankSpeechStreamer.generate_speech_stream(speech_id, speed_multiplier=speed, lang=lang):
            # Parse 'data: {...}\n\n' to JSON
            if raw_event.startswith("data: "):
                json_str = raw_event[6:].strip()
                payload = json.loads(json_str)
                await websocket.send_json(payload)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"event_type": "error", "error": str(e)})
        except Exception:
            pass

