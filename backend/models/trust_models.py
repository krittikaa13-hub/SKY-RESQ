"""
backend/models/trust_models.py
Pydantic Data Models & Schemas for Q-OPTIMA Trust & Risk Intelligence Engine
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class NodeTelemetryFeatures(BaseModel):
    """Telemetry features collected per node for trust/risk computation."""
    node_id: str
    average_delay_ms: float = Field(default=5.0, ge=0.0)
    max_delay_ms: float = Field(default=12.0, ge=0.0)
    delay_variance: float = Field(default=1.2, ge=0.0)
    attack_count: int = Field(default=0, ge=0)
    repeated_violations: int = Field(default=0, ge=0)
    communication_stability: float = Field(default=0.95, ge=0.0, le=1.0)
    battery_health_pct: float = Field(default=92.0, ge=0.0, le=100.0)
    packet_success_rate: float = Field(default=0.98, ge=0.0, le=1.0)
    packet_loss_rate: float = Field(default=0.02, ge=0.0, le=1.0)
    hop_count: int = Field(default=1, ge=1)
    node_availability: float = Field(default=0.99, ge=0.0, le=1.0)
    queue_congestion: float = Field(default=0.1, ge=0.0, le=1.0)
    wind_stability: float = Field(default=0.90, ge=0.0, le=1.0)
    relay_reliability: float = Field(default=0.96, ge=0.0, le=1.0)
    total_packets_processed: int = Field(default=100, ge=0)

class NodeTrustScore(BaseModel):
    """Trust Score output and breakdown for a single UAV node."""
    node_id: str
    trust_score: float = Field(ge=0.0, le=100.0)
    category: str  # Excellent | Good | Warning | Poor | Critical
    direct_telemetry_score: float
    security_penalty: float
    hardware_health_score: float
    confidence_factor: float
    moving_average_trust: float
    trend_direction: str  # Improving | Stable | Degrading

class NodeRiskScore(BaseModel):
    """Risk Score output and breakdown for a single UAV node."""
    node_id: str
    risk_score: float = Field(ge=0.0, le=1.0)
    category: str  # Very Low | Low | Medium | High | Critical
    trust_risk_component: float
    threat_severity_component: float
    hardware_risk_component: float
    environmental_risk_component: float

class NodeHealthMetrics(BaseModel):
    """Hardware & Communication Health Indicators."""
    node_id: str
    battery_pct: float = Field(ge=0.0, le=100.0)
    cpu_usage_pct: float = Field(ge=0.0, le=100.0)
    memory_usage_pct: float = Field(ge=0.0, le=100.0)
    temperature_celsius: float
    comm_quality_pct: float = Field(ge=0.0, le=100.0)
    health_status: str  # Healthy | Degraded | Critical

class NodeRankingSummary(BaseModel):
    """Ranked lists of UAV nodes across core network dimensions."""
    most_trusted: List[str]
    least_trusted: List[str]
    fastest_relay: List[str]
    safest_route: List[str]
    highest_risk: List[str]
    lowest_delay: List[str]

class NodeQuantumCoefficient(BaseModel):
    """Mathematical coefficients passed directly to the Quantum Optimization Engine."""
    node_id: str
    trust_score: float = Field(ge=0.0, le=100.0)
    risk_score: float = Field(ge=0.0, le=1.0)
    delay_score: float = Field(ge=0.0, le=1.0)
    priority_weight: float = Field(ge=0.0, le=1.0)
    constraint_weight: float = Field(ge=0.0)
    optimization_cost: float
    qubo_diagonal_penalty: float

class HistoricalMemorySnapshot(BaseModel):
    """Snapshot of historical node performance memory."""
    node_id: str
    current_trust: float
    previous_trust: float
    moving_average: float
    best_score: float
    worst_score: float
    attack_count: int
    violation_count: int
    recovery_count: int
    last_updated: str

class TrustEngineOverviewResponse(BaseModel):
    """Overall status and trust summary across the UAV network swarm."""
    network_mean_trust: float
    network_mean_risk: float
    active_nodes_count: int
    trusted_nodes_count: int
    compromised_nodes_count: int
    system_status: str
    timestamp: str
