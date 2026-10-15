"""
Valuation & Alert Sensitivity Settings REST Router
Allows customizing platform-wide Margin of Safety discount, technical moving average anchor modes,
and per-stock trigger overrides with full persistence.
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlmodel import Session, select
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import json

from backend.database import get_session
from backend.models.db_models import ValuationAlertSettingsDB, get_utc_now

router = APIRouter(prefix="/api/settings/valuation-alerts", tags=["Valuation & Alert Settings"])

class TickerOverrideSchema(BaseModel):
    target_buy: Optional[float] = Field(default=None, gt=0, description="Custom buy zone trigger price")
    target_sell: Optional[float] = Field(default=None, gt=0, description="Custom sell / profit-taking trigger price")

class ValuationSettingsPayloadSchema(BaseModel):
    global_mos_pct: float = Field(default=15.0, ge=10.0, le=30.0, description="Global Margin of Safety discount (10% to 30%)")
    technical_anchor_mode: str = Field(default="adaptive_balanced", description="Anchor mode: adaptive_balanced, strict_200d, or tactical_pullback")
    ticker_overrides: Dict[str, TickerOverrideSchema] = Field(default_factory=dict, description="Per-ticker alert threshold overrides")

ALLOWED_ANCHOR_MODES = {"adaptive_balanced", "strict_200d", "tactical_pullback"}

def _get_or_create_settings(session: Session) -> ValuationAlertSettingsDB:
    settings = session.exec(select(ValuationAlertSettingsDB)).first()
    if not settings:
        settings = ValuationAlertSettingsDB(
            global_mos_pct=15.0,
            technical_anchor_mode="adaptive_balanced",
            ticker_overrides_json="{}"
        )
        session.add(settings)
        session.commit()
        session.refresh(settings)
    return settings

@router.get("")
def get_valuation_and_alert_settings(session: Session = Depends(get_session)):
    """Returns current active valuation sensitivity, anchor mode, and per-ticker alert overrides."""
    settings = _get_or_create_settings(session)
    overrides: Dict[str, Any] = {}
    try:
        overrides = json.loads(settings.ticker_overrides_json or "{}")
    except Exception:
        overrides = {}

    return {
        "global_mos_pct": settings.global_mos_pct,
        "technical_anchor_mode": settings.technical_anchor_mode,
        "ticker_overrides": overrides,
        "updated_at": settings.updated_at,
        "anchor_mode_descriptions": {
            "adaptive_balanced": {
                "name_en": "Adaptive Balanced",
                "name_zh": "自适应平衡模式 (Adaptive Balanced)",
                "description_en": "Synthesizes 50D SMA, 200D SMA support, and earnings multiples to eliminate cash drag while guarding against overvaluation.",
                "description_zh": "综合 50 日与 200 日均线支撑及估值倍数，在杜绝永久现金踏空的同时提供严密估值保护。"
            },
            "strict_200d": {
                "name_en": "Strict 200D SMA Support",
                "name_zh": "严格 200 日均线支撑 (Strict 200D SMA)",
                "description_en": "Anchors buy zones strictly at or below institutional 200-day moving average support for maximum cycle drawdown protection.",
                "description_zh": "严格将买入区间锚定在 200 日均线支撑位或以下，专注于周期大底与深度洗盘买点。"
            },
            "tactical_pullback": {
                "name_en": "Tactical 5% Pullback",
                "name_zh": "战术性 5% 回调突破 (Tactical Pullback)",
                "description_en": "Optimized for strong momentum compounders, setting triggers near the 50D SMA or mild 5% pullbacks off local peaks.",
                "description_zh": "专为强势成长复利股设计，将买入触发点设定在 50 日均线或自高点回调 5% 的强势中继位置。"
            }
        }
    }

@router.post("")
def update_valuation_and_alert_settings(
    payload: ValuationSettingsPayloadSchema,
    session: Session = Depends(get_session)
):
    """Updates user-configured Margin of Safety, technical anchor mode, and per-ticker trigger overrides."""
    if payload.technical_anchor_mode not in ALLOWED_ANCHOR_MODES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid technical_anchor_mode. Must be one of: {', '.join(ALLOWED_ANCHOR_MODES)}"
        )

    settings = _get_or_create_settings(session)
    settings.global_mos_pct = round(payload.global_mos_pct, 1)
    settings.technical_anchor_mode = payload.technical_anchor_mode

    # Clean and serialize overrides dict (converting keys to uppercase)
    cleaned_overrides = {}
    for sym, val in payload.ticker_overrides.items():
        norm_sym = sym.strip().upper()
        if norm_sym:
            cleaned_overrides[norm_sym] = {
                "target_buy": val.target_buy,
                "target_sell": val.target_sell
            }

    settings.ticker_overrides_json = json.dumps(cleaned_overrides)
    settings.updated_at = get_utc_now()

    session.add(settings)
    session.commit()
    session.refresh(settings)

    return {
        "status": "ok",
        "message": "Valuation and alert sensitivity settings updated successfully",
        "settings": {
            "global_mos_pct": settings.global_mos_pct,
            "technical_anchor_mode": settings.technical_anchor_mode,
            "ticker_overrides": cleaned_overrides,
            "updated_at": settings.updated_at
        }
    }

@router.post("/reset")
def reset_valuation_and_alert_settings(session: Session = Depends(get_session)):
    """Resets all settings and overrides back to institutional defaults (15% MoS, Adaptive Balanced)."""
    settings = _get_or_create_settings(session)
    settings.global_mos_pct = 15.0
    settings.technical_anchor_mode = "adaptive_balanced"
    settings.ticker_overrides_json = "{}"
    settings.updated_at = get_utc_now()

    session.add(settings)
    session.commit()
    session.refresh(settings)

    return {
        "status": "ok",
        "message": "Settings restored to institutional defaults",
        "settings": {
            "global_mos_pct": 15.0,
            "technical_anchor_mode": "adaptive_balanced",
            "ticker_overrides": {},
            "updated_at": settings.updated_at
        }
    }
