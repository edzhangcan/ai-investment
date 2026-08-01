"""
Macro Economy Router
"""

from fastapi import APIRouter
from backend.engines.macro_engine import MacroEngine
from backend.models.schemas import MacroAnalysisSchema

router = APIRouter(prefix="/api/macro", tags=["Macro Engine"])

@router.get("", response_model=MacroAnalysisSchema)
def get_macro_analysis():
    """Returns current US & Canada economic cycle status and sector rotation weights."""
    return MacroEngine.analyze_macro_environment()
