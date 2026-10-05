"""
backend/models/schemas.py
Pydantic Data Schemas for Q-OPTIMA FastAPIs & Qiskit Services
"""

from pydantic import BaseModel, Field
from typing import List, Optional

class UAVNodeModel(BaseModel):
    id: str
    name: str
    status: str
    trustScore: float = Field(ge=0, le=100)
    riskScore: float = Field(ge=0, le=100)
    x: float
    y: float
    battery: float
    latency: float
    packetCount: int
    maliciousPackets: int
    cluster: str

class QaoaRequestModel(BaseModel):
    p_layers: int = Field(default=3, ge=1, le=10)
    shots: int = Field(default=4096, ge=1024, le=8192)
    gamma: List[float]
    beta: List[float]
    backend_id: str = "ibm_sherbrooke"

class QaoaResponseModel(BaseModel):
    success: bool
    optimal_bitstring: str
    cost_expectation: float
    fidelity: float
    approximation_ratio: float
    job_id: str

class AttackSimulationRequest(BaseModel):
    attack_type: str
    target_node_id: str
    severity: str = "High"
