"""
backend/api/quantum_router.py
FastAPI Router for Q-OPTIMA Quantum Optimization Engine REST APIs
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any

from backend.models.quantum_models import (
    QuantumOptimizationConfig,
    QuantumOptimizationResult,
    ClassicalRouteResult,
    HamiltonianResponse,
    QuboMatrixResponse,
    QuantumCircuitMetrics,
    QuantumVsClassicalComparison,
    QuantumEngineStatusResponse,
)
from backend.optimization.quantum_engine import quantum_optimization_engine

quantum_router = APIRouter(prefix="/api/qopt", tags=["Quantum Optimization Engine"])

@quantum_router.get("/status", response_model=QuantumEngineStatusResponse)
async def get_quantum_status():
    """Returns engine status, active node counts, qubit requirements, and backend status."""
    return quantum_optimization_engine.get_status()

@quantum_router.get("/result", response_model=Dict[str, Any])
async def get_latest_result():
    """Returns the latest QAOA optimization result and comparative classical results."""
    if not quantum_optimization_engine.last_result:
        # Run baseline optimization if no result cached yet
        quantum_optimization_engine.run_optimization_pipeline()

    return {
        "success": True,
        "quantum_result": quantum_optimization_engine.last_result.model_dump() if quantum_optimization_engine.last_result else None,
        "classical_results": [c.model_dump() for c in quantum_optimization_engine.last_classical_results],
    }

@quantum_router.get("/circuit", response_model=Dict[str, Any])
async def get_circuit_spec():
    """Returns circuit metrics, depth, gate counts, and OpenQASM 2.0 code."""
    if not quantum_optimization_engine.last_hamiltonian:
        quantum_optimization_engine.run_optimization_pipeline()

    config = quantum_optimization_engine.last_config
    hamiltonian = quantum_optimization_engine.last_hamiltonian
    metrics = quantum_optimization_engine.circuit_generator.generate_qaoa_circuit(
        hamiltonian, config.p_layers, [0.5] * config.p_layers, [0.5] * config.p_layers
    )
    return {"success": True, "metrics": metrics.model_dump()}

@quantum_router.get("/qubo", response_model=QuboMatrixResponse)
async def get_qubo_matrix():
    """Returns current QUBO formulation matrix and variable mappings."""
    if not quantum_optimization_engine.last_qubo:
        quantum_optimization_engine.run_optimization_pipeline()

    return quantum_optimization_engine.last_qubo

@quantum_router.get("/hamiltonian", response_model=HamiltonianResponse)
async def get_hamiltonian():
    """Returns Cost & Constraint Ising Hamiltonian Pauli terms and string representation."""
    if not quantum_optimization_engine.last_hamiltonian:
        quantum_optimization_engine.run_optimization_pipeline()

    return quantum_optimization_engine.last_hamiltonian

@quantum_router.get("/routes", response_model=Dict[str, Any])
async def get_routes_comparison():
    """Returns best quantum secure path and all classical baseline routes."""
    if not quantum_optimization_engine.last_result:
        quantum_optimization_engine.run_optimization_pipeline()

    q_route = quantum_optimization_engine.last_result.best_route if quantum_optimization_engine.last_result else []
    alt_routes = quantum_optimization_engine.last_result.alternative_routes if quantum_optimization_engine.last_result else []

    classical_routes = {
        c.algorithm: c.path for c in quantum_optimization_engine.last_classical_results
    }

    return {
        "success": True,
        "quantum_best_route": q_route,
        "quantum_alternative_routes": alt_routes,
        "classical_baseline_routes": classical_routes,
    }

@quantum_router.post("/run", response_model=QuantumVsClassicalComparison)
async def run_quantum_optimization(config: Optional[QuantumOptimizationConfig] = None):
    """Executes complete QAOA Quantum Optimization & Classical Baseline benchmarking pipeline."""
    if config is None:
        config = QuantumOptimizationConfig()
    return quantum_optimization_engine.run_optimization_pipeline(config)

@quantum_router.post("/reset")
async def reset_quantum_engine():
    """Resets quantum engine state and clears database logs."""
    quantum_optimization_engine.reset()
    return {"success": True, "message": "Quantum Optimization Engine state reset to baseline."}

@quantum_router.post("/export")
async def export_quantum_experiment_data():
    """Exports latest quantum experiment QUBO, Hamiltonian, and QAOA execution metrics JSON."""
    if not quantum_optimization_engine.last_result:
        quantum_optimization_engine.run_optimization_pipeline()

    return {
        "success": True,
        "job_id": quantum_optimization_engine.last_result.job_id,
        "config": quantum_optimization_engine.last_config.model_dump(),
        "qubo": quantum_optimization_engine.last_qubo.model_dump() if quantum_optimization_engine.last_qubo else None,
        "hamiltonian": quantum_optimization_engine.last_hamiltonian.model_dump() if quantum_optimization_engine.last_hamiltonian else None,
        "quantum_result": quantum_optimization_engine.last_result.model_dump() if quantum_optimization_engine.last_result else None,
        "classical_results": [c.model_dump() for c in quantum_optimization_engine.last_classical_results],
    }
