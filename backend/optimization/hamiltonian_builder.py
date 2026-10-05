"""
backend/optimization/hamiltonian_builder.py
Ising Hamiltonian Builder converting QUBO Formulations into Quantum Pauli Operators
"""

import numpy as np
from typing import Dict, List, Any, Tuple
from backend.models.quantum_models import QuboMatrixResponse, HamiltonianResponse

class HamiltonianBuilder:
    """
    Converts QUBO formulations (x_i in {0, 1}) into Ising Cost Hamiltonians (Z_i in {+1, -1}).
    
    Transformation Rule:
    x_i = (I - Z_i) / 2
    
    Quadratic Expansion:
    Q_ii x_i = Q_ii (I - Z_i) / 2 = Q_ii / 2 * I - Q_ii / 2 * Z_i
    Q_ij x_i x_j = Q_ij / 4 * (I - Z_i - Z_j + Z_i Z_j)
    """

    def build_hamiltonian_from_qubo(self, qubo: QuboMatrixResponse) -> HamiltonianResponse:
        """
        Converts QUBO matrix response into Pauli Operator terms and Z-Hamiltonian string.
        """
        num_vars = qubo.num_variables
        if num_vars == 0:
            return HamiltonianResponse(
                num_qubits=0,
                pauli_terms=[],
                string_representation="H = 0",
                is_valid=True,
                qubit_mapping={},
            )

        Q = np.array(qubo.qubo_matrix, dtype=float)
        
        # Coefficients for Z_i (h_i) and Z_i Z_j (J_ij)
        h = np.zeros(num_vars, dtype=float)
        J = np.zeros((num_vars, num_vars), dtype=float)
        constant = qubo.constant_offset

        # 1. Transform Diagonal Q_ii -> h_i Z_i
        for i in range(num_vars):
            q_ii = Q[i, i]
            constant += q_ii / 2.0
            h[i] -= q_ii / 2.0

        # 2. Transform Off-Diagonal Q_ij -> J_ij Z_i Z_j
        for i in range(num_vars):
            for j in range(i + 1, num_vars):
                q_ij = Q[i, j]
                if abs(q_ij) > 1e-6:
                    constant += q_ij / 4.0
                    h[i] -= q_ij / 4.0
                    h[j] -= q_ij / 4.0
                    J[i, j] += q_ij / 4.0

        # 3. Build Pauli Terms
        pauli_terms: List[Dict[str, Any]] = []

        # Constant Identity Term
        if abs(constant) > 1e-4:
            pauli_terms.append({
                "pauli": "I" * num_vars,
                "coeff": round(float(constant), 4),
                "type": "Identity",
            })

        # Single Z_i Terms
        for i in range(num_vars):
            if abs(h[i]) > 1e-4:
                p_str = ["I"] * num_vars
                p_str[i] = "Z"
                pauli_terms.append({
                    "pauli": "".join(p_str),
                    "coeff": round(float(h[i]), 4),
                    "type": "Single Z",
                    "qubit": i,
                })

        # Two-qubit Z_i Z_j Interaction Terms
        for i in range(num_vars):
            for j in range(i + 1, num_vars):
                if abs(J[i, j]) > 1e-4:
                    p_str = ["I"] * num_vars
                    p_str[i] = "Z"
                    p_str[j] = "Z"
                    pauli_terms.append({
                        "pauli": "".join(p_str),
                        "coeff": round(float(J[i, j]), 4),
                        "type": "ZZ Interaction",
                        "qubits": [i, j],
                    })

        # 4. Generate Human-Readable Operator String Representation
        string_parts = []
        for term in pauli_terms:
            coeff = term["coeff"]
            pauli = term["pauli"]
            if coeff >= 0:
                string_parts.append(f"+ {coeff:.3f}*{pauli}")
            else:
                string_parts.append(f"- {abs(coeff):.3f}*{pauli}")

        string_rep = "H_cost = " + " ".join(string_parts) if string_parts else "H_cost = 0"

        return HamiltonianResponse(
            num_qubits=num_vars,
            pauli_terms=pauli_terms,
            string_representation=string_rep,
            is_valid=True,
            qubit_mapping=qubo.inverse_mapping,
        )
