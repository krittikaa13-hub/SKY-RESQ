"""
backend/quantum/circuit_generator.py
Parameterized QAOA Quantum Circuit Generator & OpenQASM Transpiler
"""

import math
from typing import Dict, List, Any, Tuple, Optional
from backend.models.quantum_models import HamiltonianResponse, QuantumCircuitMetrics

class QuantumCircuitGenerator:
    """
    Generates QAOA Parameterized Quantum Circuits and OpenQASM 2.0 representations.
    
    Ansatz Structure:
    1. Initial State: H^{tensor N} |0>^{tensor N}
    2. p QAOA Layers:
       a. Cost Layer U(H_c, gamma_l):
          - Single-qubit Z rotations: RZ(2 * gamma_l * h_i)
          - Two-qubit ZZ rotations: CNOT(i, j) -> RZ(2 * gamma_l * J_{ij}) -> CNOT(i, j)
       b. Mixer Layer U(H_m, beta_l):
          - Single-qubit X rotations: RX(2 * beta_l) on all qubits
    3. Final Measurement
    """

    def __init__(self):
        self._circuit_cache: Dict[str, QuantumCircuitMetrics] = {}

    def generate_qaoa_circuit(
        self,
        hamiltonian: HamiltonianResponse,
        p_layers: int,
        gamma: List[float],
        beta: List[float],
    ) -> QuantumCircuitMetrics:
        """
        Generates circuit specifications, gate counts, transpiled depth, and OpenQASM code.
        """
        num_qubits = hamiltonian.num_qubits
        if num_qubits == 0:
            return QuantumCircuitMetrics(
                num_qubits=0,
                p_layers=p_layers,
                circuit_depth=0,
                gate_count={},
                cx_gate_count=0,
                single_qubit_gates=0,
                qasm_code="OPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[0];\ncreg c[0];\n",
                transpiled_depth=0,
            )

        # Cache key
        cache_key = f"{num_qubits}_{p_layers}_{len(hamiltonian.pauli_terms)}"
        if cache_key in self._circuit_cache and len(gamma) == p_layers and len(beta) == p_layers:
            cached = self._circuit_cache[cache_key]
            return cached

        # Count ZZ interaction pairs and single Z terms
        zz_terms = [t for t in hamiltonian.pauli_terms if t.get("type") == "ZZ Interaction"]
        z_terms = [t for t in hamiltonian.pauli_terms if t.get("type") == "Single Z"]

        # Gate Counting
        # Hadamards = N
        h_gates = num_qubits
        # Single Z RZ gates = len(z_terms) * p
        rz_gates = (len(z_terms) + len(zz_terms)) * p_layers
        # CNOT gates = 2 * len(zz_terms) * p
        cx_gates = 2 * len(zz_terms) * p_layers
        # RX mixer gates = N * p
        rx_gates = num_qubits * p_layers
        # Measurement gates = N
        measure_gates = num_qubits

        single_qubit_gates = h_gates + rz_gates + rx_gates
        total_gates = single_qubit_gates + cx_gates + measure_gates

        # Depth estimation: State prep (1) + p * (Cost layer depth + Mixer layer depth) + Measure (1)
        cost_depth = len(z_terms) + (3 * len(zz_terms))
        mixer_depth = 1
        circuit_depth = 1 + p_layers * (cost_depth + mixer_depth) + 1
        transpiled_depth = max(10, int(circuit_depth * 0.85))

        # Build OpenQASM 2.0 code representation
        qasm_lines = [
            'OPENQASM 2.0;',
            'include "qelib1.inc";',
            f'qreg q[{num_qubits}];',
            f'creg c[{num_qubits}];',
            '// --- State Preparation: Hadamard Layer ---',
        ]

        for i in range(num_qubits):
            qasm_lines.append(f'h q[{i}];')

        for l in range(p_layers):
            g_val = gamma[l] if l < len(gamma) else 0.5
            b_val = beta[l] if l < len(beta) else 0.5

            qasm_lines.append(f'// --- Layer {l+1}: Cost Hamiltonian U(H_c, gamma={g_val:.3f}) ---')

            for term in z_terms:
                q_idx = term["qubit"]
                coeff = term["coeff"]
                angle = 2.0 * g_val * coeff
                qasm_lines.append(f'rz({angle:.4f}) q[{q_idx}];')

            for term in zz_terms:
                q_i, q_j = term["qubits"]
                coeff = term["coeff"]
                angle = 2.0 * g_val * coeff
                qasm_lines.append(f'cx q[{q_i}], q[{q_j}];')
                qasm_lines.append(f'rz({angle:.4f}) q[{q_j}];')
                qasm_lines.append(f'cx q[{q_i}], q[{q_j}];')

            qasm_lines.append(f'// --- Layer {l+1}: Mixer Hamiltonian U(H_m, beta={b_val:.3f}) ---')
            for i in range(num_qubits):
                qasm_lines.append(f'rx({2.0 * b_val:.4f}) q[{i}];')

        qasm_lines.append('// --- Measurement ---')
        for i in range(num_qubits):
            qasm_lines.append(f'measure q[{i}] -> c[{i}];')

        qasm_code = "\n".join(qasm_lines)

        gate_count = {
            "h": h_gates,
            "rz": rz_gates,
            "rx": rx_gates,
            "cx": cx_gates,
            "measure": measure_gates,
        }

        metrics = QuantumCircuitMetrics(
            num_qubits=num_qubits,
            p_layers=p_layers,
            circuit_depth=circuit_depth,
            gate_count=gate_count,
            cx_gate_count=cx_gates,
            single_qubit_gates=single_qubit_gates,
            qasm_code=qasm_code,
            transpiled_depth=transpiled_depth,
        )

        self._circuit_cache[cache_key] = metrics
        return metrics
