"""
backend/optimization/qubo_generator.py
Quadratic Unconstrained Binary Optimization (QUBO) Formulator for UAV Path Optimization
"""

import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Any, Optional
from backend.models.quantum_models import QuboMatrixResponse

class QuboGenerator:
    """
    Constructs the QUBO Matrix (x^T Q x) for the UAV secure routing problem.
    Variables x_e represent binary decision variables for selecting directed edge e = (u, v).
    """

    def construct_qubo_matrix(
        self,
        graph: nx.DiGraph,
        source_node: str,
        target_node: str,
        penalty_multiplier: float = 15.0,
    ) -> QuboMatrixResponse:
        """
        Builds the QUBO matrix and variable mappings for source-to-target path optimization.
        
        Variables: x_k corresponding to edge_k = (u, v).
        Cost = sum_k c_k x_k + Penalty * (Flow Conservation & Connectivity Constraints)
        """
        edges = list(graph.edges(data=True))
        num_vars = len(edges)

        if num_vars == 0:
            return QuboMatrixResponse(
                num_variables=0,
                variable_mapping={},
                inverse_mapping={},
                qubo_matrix=[],
                linear_terms={},
                quadratic_terms={},
                constant_offset=0.0,
            )

        # 1. Variable Mappings: edge_key -> qubit index
        var_map: Dict[str, int] = {}
        inv_map: Dict[int, str] = {}
        for idx, (u, v, data) in enumerate(edges):
            key = f"{u}->{v}"
            var_map[key] = idx
            inv_map[idx] = key

        qubo = np.zeros((num_vars, num_vars), dtype=float)
        constant_offset = 0.0

        # 2. Linear Terms: Edge Costs on Diagonal (Q_ii)
        for idx, (u, v, data) in enumerate(edges):
            key = f"{u}->{v}"
            cost = data.get("weight", 5.0)
            qubo[idx, idx] += cost

        P = penalty_multiplier

        # 3. Flow Constraints
        # A. Source Node Constraint: Outgoing from source - Incoming to source = 1
        # Penalty: P * ( sum_{v} x_{s->v} - sum_{u} x_{u->s} - 1 )^2
        src_out = [var_map[f"{u}->{v}"] for u, v, _ in edges if u == source_node]
        src_in = [var_map[f"{u}->{v}"] for u, v, _ in edges if v == source_node]

        # Add quadratic expansion for ( sum x_out - sum x_in - 1 )^2
        # = sum x_out^2 + sum x_in^2 + 2 sum_{i<j} x_i x_j - 2 sum x_out - 2 sum x_in ...
        constant_offset += P * 1.0

        for i in src_out:
            qubo[i, i] -= P  # Linear term from -2*P*x_i + P*x_i^2 = -P*x_i
        for i in src_in:
            qubo[i, i] += 3.0 * P

        for i in src_out:
            for j in src_out:
                if i < j:
                    qubo[i, j] += 2.0 * P
        for i in src_in:
            for j in src_in:
                if i < j:
                    qubo[i, j] += 2.0 * P
        for i in src_out:
            for j in src_in:
                if i != j:
                    row, col = min(i, j), max(i, j)
                    qubo[row, col] -= 2.0 * P

        # B. Target Node Constraint: Incoming to target - Outgoing from target = 1
        tgt_in = [var_map[f"{u}->{v}"] for u, v, _ in edges if v == target_node]
        tgt_out = [var_map[f"{u}->{v}"] for u, v, _ in edges if u == target_node]

        constant_offset += P * 1.0

        for i in tgt_in:
            qubo[i, i] -= P
        for i in tgt_out:
            qubo[i, i] += 3.0 * P

        for i in tgt_in:
            for j in tgt_in:
                if i < j:
                    qubo[i, j] += 2.0 * P
        for i in tgt_out:
            for j in tgt_out:
                if i < j:
                    qubo[i, j] += 2.0 * P

        # C. Intermediate Nodes: Incoming = Outgoing
        # Penalty: P * ( sum_{u} x_{u->k} - sum_{v} x_{k->v} )^2
        nodes = list(graph.nodes())
        for k in nodes:
            if k == source_node or k == target_node:
                continue

            k_in = [var_map[f"{u}->{v}"] for u, v, _ in edges if v == k]
            k_out = [var_map[f"{u}->{v}"] for u, v, _ in edges if u == k]

            for i in k_in:
                qubo[i, i] += P
            for i in k_out:
                qubo[i, i] += P

            for i in k_in:
                for j in k_in:
                    if i < j:
                        qubo[i, j] += 2.0 * P
            for i in k_out:
                for j in k_out:
                    if i < j:
                        qubo[i, j] += 2.0 * P
            for i in k_in:
                for j in k_out:
                    if i != j:
                        row, col = min(i, j), max(i, j)
                        qubo[row, col] -= 2.0 * P

        # Extract linear & quadratic dictionaries for JSON inspection
        linear_terms: Dict[str, float] = {}
        quadratic_terms: Dict[str, float] = {}

        for i in range(num_vars):
            var_i = inv_map[i]
            if abs(qubo[i, i]) > 1e-5:
                linear_terms[var_i] = round(float(qubo[i, i]), 3)
            for j in range(i + 1, num_vars):
                var_j = inv_map[j]
                if abs(qubo[i, j]) > 1e-5:
                    quadratic_terms[f"{var_i},{var_j}"] = round(float(qubo[i, j]), 3)

        qubo_matrix_list = np.round(qubo, 3).tolist()

        return QuboMatrixResponse(
            num_variables=num_vars,
            variable_mapping=var_map,
            inverse_mapping=inv_map,
            qubo_matrix=qubo_matrix_list,
            linear_terms=linear_terms,
            quadratic_terms=quadratic_terms,
            constant_offset=round(constant_offset, 3),
        )
