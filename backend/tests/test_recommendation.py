"""
Unit tests for RecommendationEngine (Top 3-5 macro-driven stock recommendations)
"""
import pytest
from backend.engines.recommendation_engine import RecommendationEngine

def test_get_top_recommendations():
    result = RecommendationEngine.get_top_recommendations()
    assert "macro_context" in result
    assert "recommended_stocks" in result
    assert result["recommended_stocks_count"] >= 3
    assert result["recommended_stocks_count"] <= 5

    first_pick = result["recommended_stocks"][0]
    assert "symbol" in first_pick
    assert "company_name" in first_pick
    assert "company_background" in first_pick
    assert "why_recommend_rationale" in first_pick
    assert "key_catalysts" in first_pick
    assert "key_metrics" in first_pick
    assert "action_status" in first_pick
