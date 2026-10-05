"""
backend/api/detection_router.py
FastAPI Router exposing DATAMUt Detection Engine endpoints for telemetry ingestion,
status monitoring, explainable evidence retrieval, threshold configuration, and node trust/risk metrics.
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any

from backend.models.detection_models import (
    TelemetryPacket,
    ThresholdConfig,
    DetectionStatusResponse,
    NodeTrustRiskOutput,
    DetectionEvidence,
)
from backend.security.attack_detector import datamut_engine

detection_router = APIRouter(prefix="/api/detection", tags=["DATAMUt Detection Engine"])

@detection_router.get("/status", response_model=DetectionStatusResponse)
async def get_detection_status():
    """Returns engine status summary, total packets analyzed, attacks detected, and active threshold mode."""
    return datamut_engine.get_status()

@detection_router.get("/events")
async def get_detection_events(limit: int = Query(default=50, ge=1, le=500)):
    """Returns recent packet detection event logs from database."""
    events = datamut_engine.db.get_recent_events(limit=limit)
    return {"success": True, "count": len(events), "events": events}

@detection_router.get("/evidence")
async def get_detection_evidence(limit: int = Query(default=50, ge=1, le=500)):
    """Returns explainable evidence records detailing observed delays, mathematical reasoning, and confidence."""
    evidence_records = datamut_engine.db.get_recent_evidence(limit=limit)
    return {"success": True, "count": len(evidence_records), "evidence": evidence_records}

@detection_router.get("/history")
async def get_detection_history(node_id: Optional[str] = None, limit: int = Query(default=100, ge=1, le=1000)):
    """Returns historical delay and node trust trend logs."""
    history = datamut_engine.db.get_node_trust_history(node_id=node_id, limit=limit)
    return {"success": True, "count": len(history), "history": history}

@detection_router.get("/trust", response_model=List[NodeTrustRiskOutput])
async def get_node_trust_metrics():
    """Returns real-time trust scores, risk scores, delay stats, and violation counts for all monitored UAV nodes."""
    return datamut_engine.get_node_trust_summary()

@detection_router.post("/start")
async def start_detection():
    """Starts the DATAMUt detection pipeline."""
    datamut_engine.start()
    return {"success": True, "message": "DATAMUt Time-Delay Attack Detection Engine active"}

@detection_router.post("/stop")
async def stop_detection():
    """Stops/pauses the DATAMUt detection pipeline."""
    datamut_engine.stop()
    return {"success": True, "message": "DATAMUt Time-Delay Attack Detection Engine stopped"}

@detection_router.post("/reset")
async def reset_detection():
    """Resets all metrics, thresholds, and clears detection database logs."""
    datamut_engine.reset()
    return {"success": True, "message": "DATAMUt Detection Engine state & database reset to baseline"}

@detection_router.post("/ingest")
async def ingest_telemetry_packet(packet: TelemetryPacket):
    """Processes a single multi-hop telemetry frame through the deterministic detection pipeline."""
    result = datamut_engine.process_packet(packet)
    return {"success": True, "data": result}

@detection_router.post("/threshold")
async def configure_threshold(config: ThresholdConfig):
    """Updates active threshold configuration (Static, Dynamic, Adaptive, Wind-Aware) and multipliers."""
    datamut_engine.set_threshold_config(config)
    return {
        "success": True,
        "message": f"Updated threshold mode to '{config.threshold_type}'",
        "config": config.model_dump(),
    }
