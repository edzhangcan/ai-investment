"""
FastAPI Main Application Server
Modular router architecture powering macro scanning, fundamental review, pricing engine, and multi-agent debate.
"""

import os
import sys
import logging

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routers import macro, stock, debate

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend service powering macro scanning, fundamental review, pricing engine, and multi-agent debate for US & CA equities.",
    version="1.0.0",
    debug=settings.DEBUG
)

# Enable CORS for Next.js / Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular Routers
app.include_router(macro.router)
app.include_router(stock.router)
app.include_router(debate.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "env": settings.ENV
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
