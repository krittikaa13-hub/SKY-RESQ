"""
backend/optimization/objective_generator.py
Weighted Multi-Objective Function Generator for UAV Secure Path Optimization
"""

from typing import Dict, List, Any, Tuple
import networkx as nx

class ObjectiveFunctionGenerator:
    """
    Generates multi-objective cost evaluation functions and adaptive optimization weights.
    
    Objectives to Maximize:
    - Trust Score
    - Packet Delivery Reliability
    - Bandwidth
    - Battery Lifetime
    
    Objectives to Minimize:
    - Risk Score
    - Path Latency (Delay)
    - Hop Count
    - Energy Consumption
    """

    def __init__(
        self,
        alpha_trust: float = 0.4,
        beta_risk: float = 0.3,
        gamma_delay: float = 0.2,
        delta_energy: float = 0.1,
    ):
        self.alpha_trust = alpha_trust
        self.beta_risk = beta_risk
        self.gamma_delay = gamma_delay
        self.delta_energy = delta_energy

    def update_weights(
        self,
        alpha_trust: float,
        beta_risk: float,
        gamma_delay: float,
        delta_energy: float,
    ) -> None:
        """Adaptively updates multi-objective optimization weights."""
        total = alpha_trust + beta_risk + gamma_delay + delta_energy
        if total > 0:
            self.alpha_trust = alpha_trust / total
            self.beta_risk = beta_risk / total
            self.gamma_delay = gamma_delay / total
            self.delta_energy = delta_energy / total

    def evaluate_path_cost(self, graph: nx.DiGraph, path: List[str]) -> Dict[str, float]:
        """
        Evaluates complete path quality metrics and weighted cost.
        """
        if not path or len(path) < 2:
            return {
                "total_cost": 9999.0,
                "avg_trust": 0.0,
                "avg_risk": 1.0,
                "total_delay_ms": 9999.0,
                "min_battery_pct": 0.0,
                "hop_count": 0,
            }

        trusts = []
        risks = []
        delays = []
        batteries = []
        total_edge_weight = 0.0

        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            if not graph.has_edge(u, v):
                return {
                    "total_cost": 9999.0,
                    "avg_trust": 0.0,
                    "avg_risk": 1.0,
                    "total_delay_ms": 9999.0,
                    "min_battery_pct": 0.0,
                    "hop_count": len(path) - 1,
                }

            edge_data = graph[u][v]
            v_node = graph.nodes[v]

            trusts.append(v_node.get("trust_score", 50.0))
            risks.append(v_node.get("risk_score", 0.5))
            delays.append(edge_data.get("delay_ms", 10.0))
            batteries.append(v_node.get("battery_pct", 50.0))
            total_edge_weight += edge_data.get("weight", 10.0)

        avg_trust = sum(trusts) / len(trusts)
        avg_risk = sum(risks) / len(risks)
        total_delay = sum(delays)
        min_battery = min(batteries)
        hop_count = len(path) - 1

        # Multi-objective weighted cost function C = w_trust*(100 - trust) + w_risk*(risk*100) + w_delay*delay + w_energy*(100 - min_batt) + w_hop*hops
        cost = (
            (self.alpha_trust * (100.0 - avg_trust))
            + (self.beta_risk * avg_risk * 100.0)
            + (self.gamma_delay * total_delay)
            + (self.delta_energy * (100.0 - min_battery))
            + (2.0 * hop_count)
        )

        return {
            "total_cost": round(cost, 3),
            "avg_trust": round(avg_trust, 1),
            "avg_risk": round(avg_risk, 3),
            "total_delay_ms": round(total_delay, 2),
            "min_battery_pct": round(min_battery, 1),
            "hop_count": hop_count,
        }
