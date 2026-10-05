"""
backend/optimization/constraint_engine.py
Constraint Validation & Encoding Engine for UAV Swarm Secure Path Optimization
"""

from typing import Dict, List, Any, Tuple
import networkx as nx

class ConstraintEngine:
    """
    Validates operational constraints and enforces bounds across candidate paths in the UAV network.
    
    Supported Constraints:
    - Maximum Hop Count
    - Battery Threshold
    - Trust Threshold
    - Risk Threshold
    - Delay Threshold
    - Exclude Malicious Nodes
    - Graph Connectivity
    """

    def __init__(
        self,
        max_hops: int = 6,
        min_battery_pct: float = 20.0,
        min_trust_score: float = 50.0,
        max_risk_score: float = 0.6,
        max_total_delay_ms: float = 100.0,
    ):
        self.max_hops = max_hops
        self.min_battery_pct = min_battery_pct
        self.min_trust_score = min_trust_score
        self.max_risk_score = max_risk_score
        self.max_total_delay_ms = max_total_delay_ms

    def validate_path(self, graph: nx.DiGraph, path: List[str]) -> Tuple[bool, List[str]]:
        """
        Validates if a path satisfies all hard constraints.
        Returns (is_feasible, list_of_violation_reasons).
        """
        violations = []
        if not path or len(path) < 2:
            return False, ["Path is empty or has fewer than 2 nodes."]

        # 1. Hop Count Constraint
        hop_count = len(path) - 1
        if hop_count > self.max_hops:
            violations.append(f"Hop count {hop_count} exceeds maximum allowed limit {self.max_hops}.")

        # 2. Connectivity & Edge Existence
        total_delay = 0.0
        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            if not graph.has_edge(u, v):
                violations.append(f"No directed edge exists between {u} and {v}.")
                return False, violations

            edge_data = graph[u][v]
            total_delay += edge_data.get("delay_ms", 10.0)

        # 3. Total Delay Constraint
        if total_delay > self.max_total_delay_ms:
            violations.append(f"Total path delay {total_delay:.1f}ms exceeds threshold {self.max_total_delay_ms}ms.")

        # 4. Node Level Constraints (Trust, Risk, Battery, Malicious)
        for node_id in path:
            if node_id not in graph:
                violations.append(f"Node {node_id} does not exist in graph.")
                continue

            ndata = graph.nodes[node_id]

            if ndata.get("is_malicious", False):
                violations.append(f"Node {node_id} is flagged as malicious.")

            if ndata.get("trust_score", 100.0) < self.min_trust_score:
                violations.append(f"Node {node_id} trust score {ndata.get('trust_score'):.1f} below min threshold {self.min_trust_score}.")

            if ndata.get("risk_score", 0.0) > self.max_risk_score:
                violations.append(f"Node {node_id} risk score {ndata.get('risk_score'):.3f} exceeds max threshold {self.max_risk_score}.")

            if ndata.get("battery_pct", 100.0) < self.min_battery_pct:
                violations.append(f"Node {node_id} battery level {ndata.get('battery_pct'):.1f}% below min threshold {self.min_battery_pct}%.")

        is_feasible = len(violations) == 0
        return is_feasible, violations

    def calculate_penalty(self, graph: nx.DiGraph, path: List[str], penalty_multiplier: float = 100.0) -> float:
        """
        Calculates a numerical penalty value for constraint violations to add to QUBO objective functions.
        """
        is_feasible, violations = self.validate_path(graph, path)
        if is_feasible:
            return 0.0
        return len(violations) * penalty_multiplier
