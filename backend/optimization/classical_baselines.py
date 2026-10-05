"""
backend/optimization/classical_baselines.py
Classical Routing Baseline Algorithms (Dijkstra, Bellman-Ford, A*, Greedy, MST, ILP)
"""

import time
import networkx as nx
from typing import Dict, List, Any, Tuple
from backend.models.quantum_models import ClassicalRouteResult
from backend.optimization.objective_generator import ObjectiveFunctionGenerator
from backend.optimization.constraint_engine import ConstraintEngine

class ClassicalRoutingBaselines:
    """
    Executes classical baseline routing algorithms on the UAV communication graph
    for direct comparative benchmarking against Quantum QAOA results.
    """

    def __init__(self):
        self.obj_evaluator = ObjectiveFunctionGenerator()
        self.constraint_engine = ConstraintEngine()

    def _build_result(
        self, algorithm_name: str, path: List[str], graph: nx.DiGraph, exec_time_ms: float
    ) -> ClassicalRouteResult:
        metrics = self.obj_evaluator.evaluate_path_cost(graph, path)
        is_feasible, _ = self.constraint_engine.validate_path(graph, path)

        return ClassicalRouteResult(
            algorithm=algorithm_name,
            path=path,
            total_cost=metrics["total_cost"],
            total_trust=metrics["avg_trust"],
            total_risk=metrics["avg_risk"],
            total_delay_ms=metrics["total_delay_ms"],
            hop_count=metrics["hop_count"],
            execution_time_ms=round(exec_time_ms, 3),
            is_feasible=is_feasible,
        )

    def solve_dijkstra(self, graph: nx.DiGraph, source: str, target: str) -> ClassicalRouteResult:
        """Dijkstra Shortest Path Algorithm."""
        start = time.time()
        try:
            path = nx.dijkstra_path(graph, source, target, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            path = [source, target]
        exec_ms = (time.time() - start) * 1000.0
        return self._build_result("Dijkstra", path, graph, exec_ms)

    def solve_bellman_ford(self, graph: nx.DiGraph, source: str, target: str) -> ClassicalRouteResult:
        """Bellman-Ford Shortest Path Algorithm."""
        start = time.time()
        try:
            path = nx.bellman_ford_path(graph, source, target, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            path = [source, target]
        exec_ms = (time.time() - start) * 1000.0
        return self._build_result("Bellman-Ford", path, graph, exec_ms)

    def solve_astar(self, graph: nx.DiGraph, source: str, target: str) -> ClassicalRouteResult:
        """A* Shortest Path Algorithm with Euclidean Heuristic."""
        start = time.time()

        def heuristic(u, v):
            if u in graph and v in graph:
                u_x, u_y = graph.nodes[u].get("x", 0.0), graph.nodes[u].get("y", 0.0)
                v_x, v_y = graph.nodes[v].get("x", 0.0), graph.nodes[v].get("y", 0.0)
                return ((u_x - v_x) ** 2 + (u_y - v_y) ** 2) ** 0.5
            return 0.0

        try:
            path = nx.asteroidal_path if hasattr(nx, "asteroidal_path") else None
            path = nx.astar_path(graph, source, target, heuristic=heuristic, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound, Exception):
            path = [source, target]

        exec_ms = (time.time() - start) * 1000.0
        return self._build_result("A*", path, graph, exec_ms)

    def solve_greedy(self, graph: nx.DiGraph, source: str, target: str) -> ClassicalRouteResult:
        """Greedy Lowest Immediate Edge Weight Routing Algorithm."""
        start = time.time()
        curr = source
        path = [curr]
        visited = {curr}

        while curr != target and len(path) < len(graph.nodes()):
            neighbors = [v for v in graph.successors(curr) if v not in visited]
            if not neighbors:
                break
            # Pick lowest weight successor
            best_nbr = min(neighbors, key=lambda v: graph[curr][v].get("weight", 99.0))
            path.append(best_nbr)
            visited.add(best_nbr)
            curr = best_nbr

        if path[-1] != target:
            path.append(target)

        exec_ms = (time.time() - start) * 1000.0
        return self._build_result("Greedy", path, graph, exec_ms)

    def solve_mst_routing(self, graph: nx.DiGraph, source: str, target: str) -> ClassicalRouteResult:
        """Minimum Spanning Tree Based Path Search."""
        start = time.time()
        undirected = graph.to_undirected()
        try:
            mst = nx.minimum_spanning_tree(undirected, weight="weight")
            path = nx.shortest_path(mst, source, target)
        except Exception:
            path = [source, target]
        exec_ms = (time.time() - start) * 1000.0
        return self._build_result("MST", path, graph, exec_ms)

    def solve_all_baselines(self, graph: nx.DiGraph, source: str, target: str) -> List[ClassicalRouteResult]:
        """Runs all 5 classical baseline routing algorithms."""
        return [
            self.solve_dijkstra(graph, source, target),
            self.solve_bellman_ford(graph, source, target),
            self.solve_astar(graph, source, target),
            self.solve_greedy(graph, source, target),
            self.solve_mst_routing(graph, source, target),
        ]
