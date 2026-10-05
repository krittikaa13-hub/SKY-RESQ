"""
backend/optimization/quantum_engine.py
Complete Hybrid Quantum-Classical Optimization Engine Architecture for Q-OPTIMA

Main Orchestrator orchestrating graph building, objective evaluation, constraint encoding,
QUBO matrix generation, Ising Hamiltonian compilation, parameterized quantum circuit synthesis,
QAOA execution, classical benchmarking, SQLite persistence, and real-time WebSocket broadcasting.
"""

import time
import json
from typing import Dict, List, Any, Optional, Callable

from backend.models.quantum_models import (
    QuantumOptimizationConfig,
    QuantumOptimizationResult,
    ClassicalRouteResult,
    HamiltonianResponse,
    QuboMatrixResponse,
    QuantumCircuitMetrics,
    QuantumVsClassicalComparison,
    QuantumEngineStatusResponse,
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
from backend.database.quantum_db import QuantumDatabaseManager
from backend.trust.trust_engine import trust_intelligence_engine

class QuantumOptimizationEngine:
    """
    Main Orchestrator for the Q-OPTIMA Quantum Optimization Engine.
    """

    def __init__(self):
        self.graph_builder = UAVNetworkGraphBuilder()
        self.objective_generator = ObjectiveFunctionGenerator()
        self.constraint_engine = ConstraintEngine()
        self.qubo_generator = QuboGenerator()
        self.hamiltonian_builder = HamiltonianBuilder()
        self.circuit_generator = QuantumCircuitGenerator()
        self.qaoa_engine = QaoaOptimizationEngine()
        self.classical_baselines = ClassicalRoutingBaselines()
        self.db = QuantumDatabaseManager()

        # Cache states
        self.last_config: QuantumOptimizationConfig = QuantumOptimizationConfig()
        self.last_qubo: Optional[QuboMatrixResponse] = None
        self.last_hamiltonian: Optional[HamiltonianResponse] = None
        self.last_result: Optional[QuantumOptimizationResult] = None
        self.last_classical_results: List[ClassicalRouteResult] = []

        # Event Subscribers for WebSockets
        self.event_subscribers: List[Callable[[Dict[str, Any]], None]] = []

    def subscribe_event(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Registers a callback for broadcasting WebSocket events."""
        self.event_subscribers.append(callback)

    def _broadcast_event(self, event_type: str, payload: Any) -> None:
        message = {"type": event_type, "payload": payload, "timestamp": time.time()}
        for callback in self.event_subscribers:
            try:
                callback(message)
            except Exception:
                pass

    def _fetch_node_data_from_trust_engine() -> List[GraphNodeData]:
        """Fetches active node telemetry and trust intelligence from TrustEngine."""
        nodes = []
        features_map = trust_intelligence_engine.features_map
        trust_map = trust_intelligence_engine.trust_scores_map
        risk_map = trust_intelligence_engine.risk_scores_map

        for idx, (node_id, feats) in enumerate(features_map.items()):
            t_obj = trust_map.get(node_id)
            r_obj = risk_map.get(node_id)

            t_score = t_obj.trust_score if t_obj else 85.0
            r_score = r_obj.risk_score if r_obj else 0.15

            # Circular layout coordinates for visualization
            angle = (2.0 * 3.14159 * idx) / max(1, len(features_map))
            x = round(200.0 * round(float(angle), 2), 1)
            y = round(200.0 * round(float(angle), 2), 1)

            nodes.append(
                GraphNodeData(
                    node_id=node_id,
                    trust_score=t_score,
                    risk_score=r_score,
                    delay_ms=feats.average_delay_ms,
                    bandwidth_mbps=100.0,
                    battery_pct=feats.battery_health_pct,
                    packet_loss_rate=feats.packet_loss_rate,
                    cpu_usage_pct=feats.queue_congestion * 100.0 + 20.0,
                    queue_congestion=feats.queue_congestion,
                    signal_strength_dbm=-65.0,
                    is_malicious=t_score < 30.0 or feats.attack_count > 0,
                    x=x,
                    y=y,
                )
            )

        return nodes

    def run_optimization_pipeline(
        self, config: Optional[QuantumOptimizationConfig] = None
    ) -> QuantumVsClassicalComparison:
        """
        Executes complete Quantum-Classical Optimization Pipeline.
        """
        if config is None:
            config = self.last_config
        self.last_config = config

        timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        # 1. Broadcast Start
        self._broadcast_event("OPTIMIZATION_STARTED", {"config": config.model_dump()})

        # 2. Build UAV Network Graph from Trust Intelligence Engine
        nodes_data = self._fetch_node_data_from_trust_engine()
        graph = self.graph_builder.build_graph_from_node_data(
            nodes_data,
            alpha_trust=config.alpha_trust,
            beta_risk=config.beta_risk,
            gamma_delay=config.gamma_delay,
            delta_energy=config.delta_energy,
        )

        # 3. Generate QUBO Matrix
        qubo = self.qubo_generator.construct_qubo_matrix(
            graph,
            source_node=config.source_node,
            target_node=config.target_node,
            penalty_multiplier=config.penalty_multiplier,
        )
        self.last_qubo = qubo

        # 4. Build Cost & Constraint Ising Hamiltonian
        hamiltonian = self.hamiltonian_builder.build_hamiltonian_from_qubo(qubo)
        self.last_hamiltonian = hamiltonian
        self._broadcast_event("HAMILTONIAN_BUILT", hamiltonian.model_dump())

        # 5. Synthesize Parameterized Quantum Circuit
        gamma_init, beta_init = self.qaoa_engine.initialize_parameters(config.p_layers, config.init_strategy)
        circuit_metrics = self.circuit_generator.generate_qaoa_circuit(
            hamiltonian, config.p_layers, gamma_init, beta_init
        )
        self._broadcast_event("CIRCUIT_GENERATED", circuit_metrics.model_dump())

        # 6. Solve with QAOA Engine
        qaoa_result = self.qaoa_engine.solve_qaoa(graph, qubo, hamiltonian, config)
        self.last_result = qaoa_result
        self._broadcast_event("SHOTS_COMPLETED", {"shots": config.shots, "fidelity": qaoa_result.fidelity})

        # 7. Solve Classical Baselines
        classical_results = self.classical_baselines.solve_all_baselines(
            graph, source=config.source_node, target=config.target_node
        )
        self.last_classical_results = classical_results

        # 8. Persist into SQLite DB
        self.db.save_formulation(qaoa_result.job_id, qubo, hamiltonian, timestamp_str)
        self.db.save_quantum_result(qaoa_result, timestamp_str)
        self.db.save_classical_results(qaoa_result.job_id, classical_results, timestamp_str)

        # 9. Comparative Benchmarking Analysis
        best_classical = min(classical_results, key=lambda c: c.total_cost) if classical_results else None
        best_class_alg = best_classical.algorithm if best_classical else "Dijkstra"

        dijkstra_res = next((c for c in classical_results if c.algorithm == "Dijkstra"), classical_results[0] if classical_results else None)
        dijkstra_exec = dijkstra_res.execution_time_ms if dijkstra_res else 1.0

        speedup_ratio = round((dijkstra_exec + 0.1) / max(0.1, qaoa_result.execution_time_ms), 2)
        
        cost_delta = round(
            ((qaoa_result.objective_value - (best_classical.total_cost if best_classical else 10.0)) / max(1.0, best_classical.total_cost if best_classical else 10.0)) * 100.0,
            2,
        )

        summary = (
            f"QAOA (p={config.p_layers}) computed optimal path {qaoa_result.best_route} with approximation ratio {qaoa_result.approximation_ratio:.2f} "
            f"and ground state energy {qaoa_result.ground_state_energy:.2f}. Comparative classical benchmark best algorithm: {best_class_alg}."
        )

        comparison = QuantumVsClassicalComparison(
            qaoa_result=qaoa_result,
            classical_results=classical_results,
            best_classical_algorithm=best_class_alg,
            qaoa_vs_dijkstra_speedup_ratio=speedup_ratio,
            qaoa_vs_dijkstra_cost_delta_pct=cost_delta,
            summary=summary,
        )

        # 10. Broadcast Finished
        self._broadcast_event("OPTIMIZATION_FINISHED", comparison.model_dump())

        return comparison

    def get_status() -> QuantumEngineStatusResponse:
        """Returns status of Quantum Engine."""
        nodes_cnt = len(trust_intelligence_engine.features_map)
        qubits = self.last_qubo.num_variables if self.last_qubo else nodes_cnt
        return QuantumEngineStatusResponse(
            status="READY",
            active_nodes_count=nodes_cnt,
            active_edges_count=self.graph_builder.graph.number_of_edges(),
            last_job_id=self.last_result.job_id if self.last_result else None,
            last_execution_time_ms=self.last_result.execution_time_ms if self.last_result else None,
            backend=self.last_config.simulation_backend,
            qubits_required=qubits,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
        )

    def reset(self) -> None:
        """Resets engine state and clears DB."""
        self.last_qubo = None
        self.last_hamiltonian = None
        self.last_result = None
        self.last_classical_results.clear()
        self.db.clear_all()

# Global Singleton Instance
quantum_optimization_engine = QuantumOptimizationEngine()
