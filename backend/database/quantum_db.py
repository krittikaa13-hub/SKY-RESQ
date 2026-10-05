"""
backend/database/quantum_db.py
SQLite Database Manager for Q-OPTIMA Quantum Optimization Engine Results & Metrics
"""

import sqlite3
import json
import os
import time
from typing import List, Dict, Any, Optional
from backend.models.quantum_models import (
    QuantumOptimizationResult,
    ClassicalRouteResult,
    HamiltonianResponse,
    QuboMatrixResponse,
)

DB_PATH = os.path.join(os.path.dirname(__file__), "qoptima_quantum.db")

class QuantumDatabaseManager:
    """
    Thread-safe SQLite Database Manager for Quantum Optimization Engine experiments and metrics.
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initializes database schema for quantum engine logs."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # 1. Quantum Results Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quantum_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id TEXT UNIQUE,
                    optimal_bitstring TEXT,
                    best_route_json TEXT,
                    objective_value REAL,
                    approximation_ratio REAL,
                    execution_time_ms REAL,
                    circuit_depth INTEGER,
                    shot_count INTEGER,
                    ground_state_energy REAL,
                    fidelity REAL,
                    is_feasible INTEGER,
                    bitstring_distribution_json TEXT,
                    timestamp TEXT
                )
            """)

            # 2. Classical Results Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS classical_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id TEXT,
                    algorithm TEXT,
                    path_json TEXT,
                    total_cost REAL,
                    total_trust REAL,
                    total_risk REAL,
                    total_delay_ms REAL,
                    hop_count INTEGER,
                    execution_time_ms REAL,
                    is_feasible INTEGER,
                    timestamp TEXT
                )
            """)

            # 3. QUBO & Hamiltonian Formulations Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS qubo_hamiltonian_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    job_id TEXT,
                    qubo_json TEXT,
                    hamiltonian_json TEXT,
                    num_variables INTEGER,
                    timestamp TEXT
                )
            """)

            conn.commit()

    def save_quantum_result(self, result: QuantumOptimizationResult, timestamp_str: str) -> None:
        """Saves a QAOA optimization execution result."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO quantum_results
                (job_id, optimal_bitstring, best_route_json, objective_value, approximation_ratio, execution_time_ms, circuit_depth, shot_count, ground_state_energy, fidelity, is_feasible, bitstring_distribution_json, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    result.job_id,
                    result.optimal_bitstring,
                    json.dumps(result.best_route),
                    result.objective_value,
                    result.approximation_ratio,
                    result.execution_time_ms,
                    result.circuit_depth,
                    result.shot_count,
                    result.ground_state_energy,
                    result.fidelity,
                    1 if result.is_feasible else 0,
                    json.dumps(result.bitstring_distribution),
                    timestamp_str,
                ),
            )
            conn.commit()

    def save_classical_results(self, job_id: str, results: List[ClassicalRouteResult], timestamp_str: str) -> None:
        """Saves classical algorithm benchmark results."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for res in results:
                cursor.execute(
                    """
                    INSERT INTO classical_results
                    (job_id, algorithm, path_json, total_cost, total_trust, total_risk, total_delay_ms, hop_count, execution_time_ms, is_feasible, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        job_id,
                        res.algorithm,
                        json.dumps(res.path),
                        res.total_cost,
                        res.total_trust,
                        res.total_risk,
                        res.total_delay_ms,
                        res.hop_count,
                        res.execution_time_ms,
                        1 if res.is_feasible else 0,
                        timestamp_str,
                    ),
                )
            conn.commit()

    def save_formulation(self, job_id: str, qubo: QuboMatrixResponse, hamiltonian: HamiltonianResponse, timestamp_str: str) -> None:
        """Saves QUBO and Hamiltonian problem formulation snapshot."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO qubo_hamiltonian_logs
                (job_id, qubo_json, hamiltonian_json, num_variables, timestamp)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    job_id,
                    qubo.model_dump_json(),
                    hamiltonian.model_dump_json(),
                    qubo.num_variables,
                    timestamp_str,
                ),
            )
            conn.commit()

    def get_latest_quantum_result(self) -> Optional[Dict[str, Any]]:
        """Retrieves the most recent QAOA result."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM quantum_results ORDER BY id DESC LIMIT 1")
            row = cursor.fetchone()
            if row:
                res = dict(row)
                res["best_route"] = json.loads(res["best_route_json"])
                res["bitstring_distribution"] = json.loads(res["bitstring_distribution_json"])
                return res
            return None

    def get_classical_results_for_job(self, job_id: str) -> List[Dict[str, Any]]:
        """Retrieves classical benchmark results for a given job."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM classical_results WHERE job_id = ?", (job_id,))
            rows = cursor.fetchall()
            output = []
            for r in rows:
                item = dict(r)
                item["path"] = json.loads(item["path_json"])
                output.append(item)
            return output

    def clear_all(self) -> None:
        """Resets quantum database tables."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM quantum_results")
            cursor.execute("DELETE FROM classical_results")
            cursor.execute("DELETE FROM qubo_hamiltonian_logs")
            conn.commit()
