"""
backend/tests/test_quantum_engine.py
Unit Tests for Q-OPTIMA Quantum Optimization Engine
"""

import pytest
import networkx as nx
from backend.models.quantum_models import (
    QuantumOptimizationConfig,
    GraphNodeData,
)
from backend.optimization.graph_builder import UAVNetworkGraphBuilder
from backend.optimization.objective_generator import ObjectiveFunctionGenerator
from backend.optimization.constraint_engine import ConstraintEngine
from backend.optimization.qubo_generator import QuboGenerator
from backend.optimization.hamiltonian_builder import HamiltonianBuilder
from backend.quantum.circuit_generator import QuantumCircuitGenerator
from backend.quantum.qaoa_engine import QaoaOptimizationEngine
from backend.optimization.classical_baselines import ClassicalRoutingBaselines
from backend.optimization.quantum_engine import QuantumOptimizationEngine

def test_graph_builder():
    builder = UAVNetworkGraphBuilder(comm_range_meters=350.0)
    nodes = [
        GraphNodeData(node_id="node0", trust_score=95.0, risk_score=0.05, delay_ms=3.0, x=0.0, y=0.0),
        GraphNodeData(node_id="node1", trust_score=90.0, risk_score=0.10, delay_ms=4.0, x=100.0, y=0.0),
        GraphNodeData(node_id="node2", trust_score=85.0, risk_score=0.15, delay_ms=5.0, x=200.0, y=0.0),
    ]
    graph = builder.build_graph_from_node_data(nodes)
    assert graph.number_of_nodes() == 3
    assert graph.number_of_edges() > 0
    assert graph.has_edge("node0", "node1")

def test_objective_generator():
    obj_gen = ObjectiveFunctionGenerator()
    builder = UAVNetworkGraphBuilder()
    nodes = [
        GraphNodeData(node_id="node0", trust_score=90.0, risk_score=0.1, delay_ms=2.0, x=0.0, y=0.0),
        GraphNodeData(node_id="node1", trust_score=85.0, risk_score=0.2, delay_ms=4.0, x=100.0, y=0.0),
    ]
    graph = builder.build_graph_from_node_data(nodes)
    cost_info = obj_gen.evaluate_path_cost(graph, ["node0", "node1"])
    assert cost_info["total_cost"] > 0
    assert cost_info["hop_count"] == 1

def test_constraint_engine():
    c_eng = ConstraintEngine(max_hops=3, min_battery_pct=20.0, min_trust_score=50.0)
    builder = UAVNetworkGraphBuilder()
    nodes = [
        GraphNodeData(node_id="node0", trust_score=90.0, battery_pct=90.0, x=0.0, y=0.0),
        GraphNodeData(node_id="node1", trust_score=85.0, battery_pct=80.0, x=100.0, y=0.0),
        GraphNodeData(node_id="node2", trust_score=20.0, battery_pct=10.0, x=200.0, y=0.0),  # Failing node
    ]
    graph = builder.build_graph_from_node_data(nodes)

    feasible, violations = c_eng.validate_path(graph, ["node0", "node1"])
    assert feasible is True

    feasible_bad, violations_bad = c_eng.validate_path(graph, ["node0", "node1", "node2"])
    assert feasible_bad is False
    assert len(violations_bad) > 0

def test_qubo_generator_and_hamiltonian_builder():
    builder = UAVNetworkGraphBuilder()
    nodes = [
        GraphNodeData(node_id="node0", trust_score=90.0, x=0.0, y=0.0),
        GraphNodeData(node_id="node1", trust_score=85.0, x=100.0, y=0.0),
        GraphNodeData(node_id="node2", trust_score=80.0, x=200.0, y=0.0),
    ]
    graph = builder.build_graph_from_node_data(nodes)

    qubo_gen = QuboGenerator()
    qubo_res = qubo_gen.construct_qubo_matrix(graph, source_node="node0", target_node="node2")
    assert qubo_res.num_variables > 0
    assert len(qubo_res.qubo_matrix) == qubo_res.num_variables

    h_builder = HamiltonianBuilder()
    h_res = h_builder.build_hamiltonian_from_qubo(qubo_res)
    assert h_res.num_qubits == qubo_res.num_variables
    assert len(h_res.pauli_terms) > 0
    assert "H_cost" in h_res.string_representation

def test_circuit_generator():
    circ_gen = QuantumCircuitGenerator()
    h_res = HamiltonianBuilder().build_hamiltonian_from_qubo(
        QuboGenerator().construct_qubo_matrix(
            UAVNetworkGraphBuilder().build_graph_from_node_data([
                GraphNodeData(node_id="node0", x=0.0, y=0.0),
                GraphNodeData(node_id="node1", x=100.0, y=0.0),
            ]),
            source_node="node0",
            target_node="node1",
        )
    )
    metrics = circ_gen.generate_qaoa_circuit(h_res, p_layers=2, gamma=[0.5, 0.6], beta=[0.4, 0.3])
    assert metrics.num_qubits == h_res.num_qubits
    assert metrics.circuit_depth > 0
    assert "OPENQASM 2.0" in metrics.qasm_code

def test_qaoa_and_classical_baselines():
    builder = UAVNetworkGraphBuilder()
    nodes = [
        GraphNodeData(node_id="node0", trust_score=95.0, x=0.0, y=0.0),
        GraphNodeData(node_id="node1", trust_score=90.0, x=100.0, y=0.0),
        GraphNodeData(node_id="node2", trust_score=85.0, x=200.0, y=0.0),
    ]
    graph = builder.build_graph_from_node_data(nodes)
    qubo = QuboGenerator().construct_qubo_matrix(graph, "node0", "node2")
    hamiltonian = HamiltonianBuilder().build_hamiltonian_from_qubo(qubo)

    qaoa_solver = QaoaOptimizationEngine()
    cfg = QuantumOptimizationConfig(p_layers=2, shots=1024, source_node="node0", target_node="node2")
    q_res = qaoa_solver.solve_qaoa(graph, qubo, hamiltonian, cfg)

    assert q_res.job_id is not None
    assert len(q_res.best_route) >= 2
    assert q_res.fidelity > 0.0

    baselines = ClassicalRoutingBaselines()
    class_results = baselines.solve_all_baselines(graph, "node0", "node2")
    assert len(class_results) == 5
    assert class_results[0].algorithm == "Dijkstra"

def test_full_quantum_engine_pipeline():
    orchestrator = QuantumOptimizationEngine()
    cfg = QuantumOptimizationConfig(p_layers=2, shots=1024, source_node="node0", target_node="node1")
    comparison = orchestrator.run_optimization_pipeline(cfg)

    assert comparison.qaoa_result is not None
    assert len(comparison.classical_results) == 5
    assert comparison.best_classical_algorithm in ["Dijkstra", "Bellman-Ford", "A*", "Greedy", "MST"]
    assert comparison.qaoa_vs_dijkstra_speedup_ratio >= 0.0
