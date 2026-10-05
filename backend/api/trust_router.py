"""
backend/api/trust_router.py
FastAPI Router for Q-OPTIMA Trust & Risk Intelligence Engine REST Endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any

from backend.models.trust_models import (
    NodeTrustScore,
    NodeRiskScore,
    NodeHealthMetrics,
    NodeRankingSummary,
    NodeQuantumCoefficient,
    TrustEngineOverviewResponse,
)
from backend.trust.trust_engine import trust_intelligence_engine

trust_router = APIRouter(tags=["Trust & Risk Intelligence Engine"])

@trust_router.get("/api/trust", response_model=Dict[str, Any])
async def get_trust_overview():
    """Returns network trust overview and current node trust scores."""
    overview = trust_intelligence_engine.get_overview()
    scores = list(trust_intelligence_engine.trust_scores_map.values())
    return {
        "success": True,
        "overview": overview.model_dump(),
        "trust_scores": [s.model_dump() for s in scores],
    }

@trust_router.get("/api/risk", response_model=Dict[str, Any])
async def get_risk_overview():
    """Returns network risk overview and current node risk scores."""
    overview = trust_intelligence_engine.get_overview()
    scores = list(trust_intelligence_engine.risk_scores_map.values())
    return {
        "success": True,
        "overview": overview.model_dump(),
        "risk_scores": [r.model_dump() for r in scores],
    }

@trust_router.get("/api/node-ranking", response_model=NodeRankingSummary)
async def get_node_rankings():
    """Returns node rankings across 6 network dimensions (most trusted, least trusted, fastest relay, safest route, highest risk, lowest delay)."""
    return trust_intelligence_engine.get_node_rankings()

@trust_router.get("/api/node-health", response_model=List[NodeHealthMetrics])
async def get_node_health():
    """Returns hardware & communication health indicators (battery, CPU, memory, temperature, comm quality, status) for all nodes."""
    return list(trust_intelligence_engine.health_metrics_map.values())

@trust_router.get("/api/trust/history")
async def get_trust_history(node_id: Optional[str] = None, limit: int = Query(default=100, ge=1, le=1000)):
    """Returns historical trust logs from SQLite database."""
    history = trust_intelligence_engine.db.get_trust_history(node_id=node_id, limit=limit)
    return {"success": True, "count": len(history), "history": history}

@trust_router.get("/api/risk/history")
async def get_risk_history(node_id: Optional[str] = None, limit: int = Query(default=100, ge=1, le=1000)):
    """Returns historical risk logs from SQLite database."""
    history = trust_intelligence_engine.db.get_risk_history(node_id=node_id, limit=limit)
    return {"success": True, "count": len(history), "history": history}

@trust_router.get("/api/trust/quantum-coefficients", response_model=List[NodeQuantumCoefficient])
async def get_quantum_coefficients(
    alpha_trust: float = Query(default=0.5, ge=0.0, le=5.0),
    beta_risk: float = Query(default=40.0, ge=0.0, le=200.0),
    gamma_delay: float = Query(default=15.0, ge=0.0, le=100.0),
):
    """Generates exact cost weights, priority weights, constraint penalties, and QUBO diagonal parameters for QAOA Optimization Engine."""
    return trust_intelligence_engine.get_quantum_coefficients(
        alpha_trust_weight=alpha_trust,
        beta_risk_weight=beta_risk,
        gamma_delay_weight=gamma_delay,
    )

@trust_router.post("/api/trust/reset")
async def reset_trust_engine():
    """Resets trust and risk engine state to baseline."""
    trust_intelligence_engine.reset()
    return {"success": True, "message": "Trust & Risk Engine state reset to baseline."}

@trust_router.post("/api/trust/recalculate")
async def recalculate_trust_engine():
    """Forces complete recalculation cycle across all active nodes."""
    trust_intelligence_engine.recalculate_all()
    return {"success": True, "message": "Forced trust & risk recalculation complete."}
