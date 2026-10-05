"""
backend/models/detection_models.py
Pydantic Data Models & Schemas for DATAMUt Time-Delay Attack Detection Engine
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TelemetryPacket(BaseModel):
    """Telemetry frame received from multi-hop UAV network nodes."""
    packet_id: str
    source_node: str
    destination_node: str
    current_node: str
    next_hop: str
    timestamp_sent: float  # epoch seconds or ms
    timestamp_received: float  # epoch seconds or ms
    hop_count: int = Field(default=1, ge=1)
    signal_strength_dbm: float = Field(default=-65.0)
    wind_speed_m_s: float = Field(default=5.0, ge=0.0)
    wind_direction_deg: float = Field(default=0.0, ge=0.0, le=360.0)
    battery_level_pct: float = Field(default=90.0, ge=0.0, le=100.0)
    queue_length: int = Field(default=2, ge=0)
    cpu_usage_pct: float = Field(default=35.0, ge=0.0, le=100.0)
    communication_range_m: float = Field(default=500.0, gt=0.0)
    distance_m: float = Field(default=120.0, ge=0.0)
    packet_size_bytes: int = Field(default=1024, ge=1)
    bandwidth_bps: float = Field(default=54_000_000.0, gt=0.0)

class DelayBreakdown(BaseModel):
    """Detailed deterministic mathematical breakdown of end-to-end / hop delays."""
    transmission_delay_ms: float
    propagation_delay_ms: float
    queue_delay_ms: float
    processing_delay_ms: float
    wind_compensation_ms: float
    expected_delay_ms: float
    actual_delay_ms: float
    delay_difference_ms: float

class ThresholdConfig(BaseModel):
    """Configuration parameters for deterministic threshold evaluation."""
    threshold_type: str = Field(default="Adaptive", description="Static | Dynamic | Adaptive | Wind-Aware")
    static_threshold_ms: float = Field(default=15.0, ge=1.0)
    std_multiplier_k: float = Field(default=2.0, ge=0.5, le=5.0)
    queue_weight_alpha: float = Field(default=0.8, ge=0.0)
    cpu_weight_beta: float = Field(default=0.2, ge=0.0)
    wind_sensitivity_gamma: float = Field(default=0.3, ge=0.0)

class ThresholdEvaluationResult(BaseModel):
    """Result from Threshold Evaluation Engine."""
    threshold_applied_ms: float
    delay_difference_ms: float
    is_violation: boolean = False if False else False # typing
    violation_ratio: float
    threshold_type: str

class ClassificationResult(BaseModel):
    """Result from Attack Classification Engine."""
    classification: str  # Normal | Suspicious | High Risk | Malicious | Critical
    attack_type: str  # Normal Traffic | Time Delay Attack | Relay Delay | Artificial Queue Delay | Congestion | Multiple Malicious Nodes | Intermittent Delay
    confidence: float  # Percentage 0.0 - 100.0
    explanation: str

class DetectionEvidence(BaseModel):
    """Explainable evidence record generated for security logging and trust engine."""
    evidence_id: str
    packet_id: str
    node_id: str
    source_node: str
    destination_node: str
    observed_delay_ms: float
    expected_delay_ms: float
    difference_ms: float
    threshold_applied_ms: float
    reason: str
    confidence: float
    attack_type: str
    severity: str
    timestamp: str

class NodeTrustRiskOutput(BaseModel):
    """Deterministic Trust/Risk metrics produced for a monitored UAV node."""
    node_id: str
    trust_score: float = Field(ge=0.0, le=100.0)
    risk_score: float = Field(ge=0.0, le=100.0)
    attack_count: int = Field(ge=0)
    average_delay_ms: float = Field(ge=0.0)
    max_delay_ms: float = Field(ge=0.0)
    violation_count: int = Field(ge=0)
    historical_trend: List[Dict[str, Any]] = []

class DetectionStatusResponse(BaseModel):
    """Status summary of DATAMUt Detection Engine."""
    status: str  # active | stopped | reset
    packets_analyzed: int
    attacks_detected: int
    active_threshold_mode: str
    monitored_nodes_count: int
    system_time: str
