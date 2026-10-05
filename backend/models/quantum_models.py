"""
backend/models/quantum_models.py
Pydantic Data Models & Schemas for Q-OPTIMA Quantum Optimization Engine
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class QuantumOptimizationConfig(BaseModel):
    """Configuration settings for QAOA Quantum Optimization execution."""
    p_layers: int = Field(default=3, ge=1, le=10)
    shots: int = Field(default=4096, ge=128, le=16384)
    optimizer: str = Field(default="COBYLA")  # COBYLA | SPSA | ADAM | GRADIENT_DESCENT | NELDER_MEAD
    max_iterations: int = Field(default=50, ge=5, le=500)
    source_node: str = Field(default="node0")
    target_node: str = Field(default="node11")
    alpha_trust: float = Field(default=0.4, ge=0.0, le=1.0)
    beta_risk: float = Field(default=0.3, ge=0.0, le=1.0)
    gamma_delay: float = Field(default=0.2, ge=0.0, le=1.0)
    delta_energy: float = Field(default=0.1, ge=0.0, le=1.0)
    penalty_multiplier: float = Field(default=10.0, ge=1.0, le=100.0)
    init_strategy: str = Field(default="Warm Start")  # Random | Warm Start | Classical | Adaptive
    simulation_backend: str = Field(default="QASM Simulator")  # Statevector Simulator | QASM Simulator | Noisy Simulator | Fake Backend

class GraphNodeData(BaseModel):
    """UAV Graph Node Attributes."""
    node_id: str
    trust_score: float = Field(ge=0.0, le=100.0)
    risk_score: float = Field(ge=0.0, le=1.0)
    delay_ms: float = Field(ge=0.0)
    bandwidth_mbps: float = Field(default=100.0, ge=0.0)
    battery_pct: float = Field(default=90.0, ge=0.0, le=100.0)
    packet_loss_rate: float = Field(default=0.02, ge=0.0, le=1.0)
    cpu_usage_pct: float = Field(default=30.0, ge=0.0, le=100.0)
    queue_congestion: float = Field(default=0.1, ge=0.0, le=1.0)
    signal_strength_dbm: float = Field(default=-65.0)
    is_malicious: bool = False
    x: float = 0.0
    y: float = 0.0

class GraphEdgeData(BaseModel):
    """UAV Directed Edge Attributes."""
    source: str
    target: str
    weight: float
    distance_m: float
    delay_ms: float
    bandwidth_mbps: float
    reliability: float

class QuboMatrixResponse(BaseModel):
    """QUBO Matrix Formulation Output."""
    num_variables: int
    variable_mapping: Dict[str, int]
    inverse_mapping: Dict[int, str]
    qubo_matrix: List[List[float]]
    linear_terms: Dict[str, float]
    quadratic_terms: Dict[str, float]
    constant_offset: float

class HamiltonianResponse(BaseModel):
    """Cost & Constraint Pauli Hamiltonian Representation."""
    num_qubits: int
    pauli_terms: List[Dict[str, Any]]  # e.g., [{"pauli": "Z0 Z1", "coeff": 2.5}]
    string_representation: str
    is_valid: bool
    qubit_mapping: Dict[str, int]

class QuantumCircuitMetrics(BaseModel):
    """Quantum Circuit Specification and Metrics."""
    num_qubits: int
    p_layers: int
    circuit_depth: int
    gate_count: Dict[str, int]
    cx_gate_count: int
    single_qubit_gates: int
    qasm_code: str
    transpiled_depth: int

class ClassicalRouteResult(BaseModel):
    """Route output calculated by a classical baseline algorithm."""
    algorithm: str  # Dijkstra | Bellman-Ford | A* | Greedy | MST | ILP
    path: List[str]
    total_cost: float
    total_trust: float
    total_risk: float
    total_delay_ms: float
    hop_count: int
    execution_time_ms: float
    is_feasible: bool

class QuantumOptimizationResult(BaseModel):
    """Complete QAOA Optimization Execution Output."""
    job_id: str
    optimal_bitstring: str
    best_route: List[str]
    alternative_routes: List[List[str]]
    objective_value: float
    approximation_ratio: float
    execution_time_ms: float
    circuit_depth: int
    shot_count: int
    ground_state_energy: float
    fidelity: float
    is_feasible: bool
    convergence_history: List[float]
    bitstring_distribution: Dict[str, int]

class QuantumVsClassicalComparison(BaseModel):
    """Comparative evaluation between Quantum QAOA and Classical Baselines."""
    qaoa_result: QuantumOptimizationResult
    classical_results: List[ClassicalRouteResult]
    best_classical_algorithm: str
    qaoa_vs_dijkstra_speedup_ratio: float
    qaoa_vs_dijkstra_cost_delta_pct: float
    summary: str

class QuantumEngineStatusResponse(BaseModel):
    """Overall status response for Quantum Engine Service."""
    status: str
    active_nodes_count: int
    active_edges_count: int
    last_job_id: Optional[str]
    last_execution_time_ms: Optional[float]
    backend: str
    qubits_required: int
    timestamp: str
