"""
Unit & Integration Test Suite for Central Bank Speech Streaming & Real-Time NLP (PL-705)
"""

import pytest
import json
import asyncio
from fastapi.testclient import TestClient
from backend.main import app
from backend.engines.central_bank_streamer import CentralBankSpeechStreamer

client = TestClient(app)

def test_available_speeches_filtering():
    """Verifies speech metadata filtering by country (US, CA, and all)."""
    all_speeches = CentralBankSpeechStreamer.get_available_speeches()
    assert len(all_speeches) >= 3

    us_speeches = CentralBankSpeechStreamer.get_available_speeches(country="US")
    assert all(s["country"] == "US" for s in us_speeches)
    assert any(s["id"] == "fomc-latest-2026" for s in us_speeches)

    ca_speeches = CentralBankSpeechStreamer.get_available_speeches(country="CA")
    assert all(s["country"] == "CA" for s in ca_speeches)
    assert any(s["id"] == "boc-latest-2026" for s in ca_speeches)

def test_get_speech_by_id():
    """Verifies complete speech retrieval and 404 behavior."""
    speech = CentralBankSpeechStreamer.get_speech_by_id("fomc-latest-2026")
    assert speech is not None
    assert speech["metadata"]["speaker"] == "Jerome H. Powell, Chair"
    assert len(speech["segments"]) == 6

    missing = CentralBankSpeechStreamer.get_speech_by_id("non-existent-speech")
    assert missing is None

def test_segment_nlp_analysis():
    """Verifies hawkish and dovish n-gram sentiment scoring."""
    hawkish_text = "Economic activity has expanded, but inflation remains elevated and upside risks persist with restrictive policy."
    nlp_hawk = CentralBankSpeechStreamer.analyze_segment_nlp(hawkish_text)
    assert len(nlp_hawk["hawkish_terms"]) > 0
    assert nlp_hawk["segment_sentiment"] > 0
    assert "Hawkish" in nlp_hawk["stance"]

    dovish_text = "With progress on inflation, Governing Council agreed that rate reduction and easing excess demand are underway."
    nlp_dove = CentralBankSpeechStreamer.analyze_segment_nlp(dovish_text)
    assert len(nlp_dove["dovish_terms"]) > 0
    assert nlp_dove["segment_sentiment"] < 0
    assert "Dovish" in nlp_dove["stance"]

    neutral_text = "Good afternoon. We are focused on our dual mandate."
    nlp_neutral = CentralBankSpeechStreamer.analyze_segment_nlp(neutral_text)
    assert nlp_neutral["segment_sentiment"] == 0.0

def test_derive_market_implications():
    """Verifies multi-asset market implications in EN and ZH."""
    imp_hawk_en = CentralBankSpeechStreamer.derive_market_implications(0.40, 0.15, "US", lang="en")
    assert "treasury_yields" in imp_hawk_en
    assert "equity_multiples" in imp_hawk_en
    assert "barbell_strategy" in imp_hawk_en
    assert "Upward pressure" in imp_hawk_en["treasury_yields"]

    imp_dove_zh = CentralBankSpeechStreamer.derive_market_implications(-0.35, -0.25, "CA", lang="zh")
    assert "收益率" in imp_dove_zh["treasury_yields"]
    assert "杠铃" in imp_dove_zh["barbell_strategy"]

def test_speech_stream_generator_flow():
    """Verifies that the async stream generator yields init, chunk, and complete events."""
    async def _collect():
        events = []
        async for raw in CentralBankSpeechStreamer.generate_speech_stream("boc-latest-2026", speed_multiplier=10.0, lang="en"):
            assert raw.startswith("data: ")
            data = json.loads(raw[6:].strip())
            events.append(data)
        return events

    events = asyncio.run(_collect())


    assert len(events) >= 8  # 1 init + 6 chunks + 1 complete
    assert events[0]["event_type"] == "init"
    assert events[0]["metadata"]["id"] == "boc-latest-2026"

    # Middle chunks
    chunks = [e for e in events if e["event_type"] == "chunk"]
    assert len(chunks) == 6
    assert chunks[0]["segment"]["index"] == 1
    assert chunks[-1]["segment"]["index"] == 6
    assert chunks[-1]["progress_pct"] == 100.0

    # Final event
    complete = events[-1]
    assert complete["event_type"] == "complete"
    assert "final_score" in complete
    assert "stance_delta" in complete
    assert "market_implications" in complete

def test_api_speeches_endpoint():
    """Tests GET /api/macro/speeches REST endpoint."""
    resp = client.get("/api/macro/speeches")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) >= 3

    resp_ca = client.get("/api/macro/speeches?country=CA")
    assert resp_ca.status_code == 200
    assert all(s["country"] == "CA" for s in resp_ca.json())

def test_api_speech_detail_endpoint():
    """Tests GET /api/macro/speech/{id} endpoint."""
    resp = client.get("/api/macro/speech/fomc-latest-2026")
    assert resp.status_code == 200
    assert resp.json()["metadata"]["id"] == "fomc-latest-2026"

    resp_404 = client.get("/api/macro/speech/non-existent-id")
    assert resp_404.status_code == 404

def test_api_speech_stream_sse_endpoint():
    """Tests GET /api/macro/speech/{id}/stream SSE endpoint."""
    with client.stream("GET", "/api/macro/speech/fomc-latest-2026/stream?speed=10.0&lang=en") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        lines = []
        for line in response.iter_lines():
            if line and line.startswith("data: "):
                lines.append(json.loads(line[6:]))
        assert len(lines) >= 8
        assert lines[0]["event_type"] == "init"
        assert lines[-1]["event_type"] == "complete"
