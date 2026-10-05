"""
backend/trust/quantum_interface.py
Quantum Interface Module for Q-OPTIMA Trust & Risk Engine

Transforms trust, risk, delay, and stability metrics into mathematical Hamiltonian coefficients,
QUBO diagonal penalties, and node priority weights for the QAOA Quantum Optimization Engine.
"""

from typing import List, Dict
from backend.models.trust_models import (
    NodeTelemetryFeatures,
    NodeTrustScore,
    NodeRiskScore,
    NodeQuantumCoefficient,
)

class QuantumOptimizationInterface:
    """
    Transforms trust and risk intelligence outputs into quantum objective coefficients.
    """

    def generate_quantum_coefficients(
        self,
        features_map: Dict[str, NodeTelemetryFeatures],
        trust_scores_map: Dict[str, NodeTrustScore],
        risk_scores_map: Dict[str, NodeRiskScore],
        alpha_trust_weight: float = 0.5,
        beta_risk_weight: float = 40.0,
        gamma_delay_weight: float = 15.0,
    ) -> List[NodeQuantumCoefficient]:
        """
        Generates QAOA / QUBO optimization coefficients for every monitored node.
        
        Cost Formulation:
        Cost_i = alpha * (100 - Trust_i) + beta * Risk_i + gamma * DelayScore_i
        
        Priority Weight w_i = (Trust_i / 100) * (1 - Risk_i)
        
        QUBO Diagonal Penalty Q_ii = Cost_i * (1 + ConstraintWeight_i)
        """
        coefficients: List[NodeQuantumCoefficient] = []

        for node_id, features in features_map.items():
            trust_obj = trust_scores_map.get(node_id)
            risk_obj = risk_scores_map.get(node_id)

            trust = trust_obj.trust_score if trust_obj else 85.0
            risk = risk_obj.risk_score if risk_obj else 0.15

            # Delay Score normalized between 0.0 and 1.0 (0.0 = fast, 1.0 = slow)
            delay_score = min(1.0, features.average_delay_ms / 50.0)

            # Priority Weight: Higher trust + lower risk -> higher priority selection
            priority_weight = round((trust / 100.0) * (1.0 - risk), 3)

            # Constraint Weight: quadratic penalty factor if node is risky or compromised
            constraint_weight = round(1.0 + (12.0 * (risk ** 2)), 2)

            # Optimization Cost C_i: Minimization target for QAOA Hamiltonian
            cost = (
                (alpha_trust_weight * (100.0 - trust))
                + (beta_risk_weight * risk)
                + (gamma_delay_weight * delay_score)
            )
            cost = round(max(0.0, cost), 3)

            # QUBO diagonal penalty Q_ii
            qubo_diag = round(cost * constraint_weight, 3)

            coeff = NodeQuantumCoefficient(
                node_id=node_id,
                trust_score=round(trust, 1),
                risk_score=round(risk, 3),
                delay_score=round(delay_score, 3),
                priority_weight=priority_weight,
                constraint_weight=constraint_weight,
                optimization_cost=cost,
                qubo_diagonal_penalty=qubo_diag,
            )
            coefficients.append(coeff)

        return coefficients
