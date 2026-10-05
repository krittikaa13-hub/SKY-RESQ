"""
backend/optimization/graph_builder.py
NetworkX Dynamic Directed Graph Builder for UAV Swarm Communication Mesh
"""

import math
import networkx as nx
from typing import Dict, List, Tuple, Any, Optional
from backend.models.quantum_models import GraphNodeData, GraphEdgeData

class UAVNetworkGraphBuilder:
    """
    Constructs and dynamically updates a directed NetworkX graph representing
    the UAV swarm network with dynamic edge weights based on trust, risk, delay, and battery state.
    """

    def __init__(self, comm_range_meters: float = 350.0):
        self.comm_range_meters = comm_range_meters
        self.graph = nx.DiGraph()

    def build_graph_from_node_data(
        self,
        nodes: List[GraphNodeData],
        alpha_trust: float = 0.4,
        beta_risk: float = 0.3,
        gamma_delay: float = 0.2,
        delta_energy: float = 0.1,
    ) -> nx.DiGraph:
        """
        Builds a directed UAV swarm communication graph from node feature objects.
        Edges are created automatically if two nodes are within `comm_range_meters`.
        """
        self.graph.clear()

        # 1. Add Nodes with Rich Attributes
        for node in nodes:
            self.graph.add_node(
                node.node_id,
                trust_score=node.trust_score,
                risk_score=node.risk_score,
                delay_ms=node.delay_ms,
                bandwidth_mbps=node.bandwidth_mbps,
                battery_pct=node.battery_pct,
                packet_loss_rate=node.packet_loss_rate,
                cpu_usage_pct=node.cpu_usage_pct,
                queue_congestion=node.queue_congestion,
                signal_strength_dbm=node.signal_strength_dbm,
                is_malicious=node.is_malicious,
                x=node.x,
                y=node.y,
            )

        # 2. Add Directed Edges Based on Distance & Quality
        node_list = list(self.graph.nodes(data=True))
        for i in range(len(node_list)):
            u_id, u_data = node_list[i]
            for j in range(len(node_list)):
                if i == j:
                    continue
                v_id, v_data = node_list[j]

                # Euclidean Distance
                dist = math.hypot(u_data["x"] - v_data["x"], u_data["y"] - v_data["y"])

                # Connect if within communication range and target node is not malicious
                if dist <= self.comm_range_meters and not v_data["is_malicious"]:
                    # Combined edge delay = source queue delay + transmission delay based on distance
                    edge_delay = v_data["delay_ms"] + (dist / 100.0)

                    # Reliability = packet delivery rate * (1 - risk)
                    reliability = (1.0 - v_data["packet_loss_rate"]) * (1.0 - v_data["risk_score"])

                    # Edge cost formulation: Lower cost = better edge
                    # Cost = alpha * (100 - Trust_target) + beta * Risk_target * 100 + gamma * EdgeDelay + delta * (100 - Batt)
                    edge_cost = (
                        (alpha_trust * (100.0 - v_data["trust_score"]))
                        + (beta_risk * v_data["risk_score"] * 100.0)
                        + (gamma_delay * edge_delay)
                        + (delta_energy * (100.0 - v_data["battery_pct"]))
                    )
                    edge_cost = max(0.1, round(edge_cost, 2))

                    self.graph.add_edge(
                        u_id,
                        v_id,
                        weight=edge_cost,
                        distance_m=round(dist, 1),
                        delay_ms=round(edge_delay, 2),
                        bandwidth_mbps=min(u_data["bandwidth_mbps"], v_data["bandwidth_mbps"]),
                        reliability=round(max(0.01, reliability), 3),
                    )

        return self.graph

    def update_node_attribute(self, node_id: str, attribute: str, value: Any) -> bool:
        """Dynamically updates a node attribute in the graph."""
        if node_id in self.graph:
            self.graph.nodes[node_id][attribute] = value
            return True
        return False

    def get_neighbors(self, node_id: str) -> List[str]:
        """Returns list of outgoing neighbor node IDs."""
        if node_id in self.graph:
            return list(self.graph.successors(node_id))
        return []

    def get_subgraph_nodes(self) -> List[str]:
        """Returns list of all active node IDs in graph."""
        return list(self.graph.nodes())

    def get_subgraph_edges(self) -> List[Tuple[str, str, Dict[str, Any]]]:
        """Returns list of directed edges with attribute dicts."""
        return list(self.graph.edges(data=True))
