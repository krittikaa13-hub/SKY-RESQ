"""
backend/database/trust_db.py
Thread-Safe SQLite Persistence Layer for Q-OPTIMA Trust, Risk, Health, & Ranking Logs
"""

import sqlite3
import json
import os
import time
from typing import List, Dict, Any, Optional
from backend.models.trust_models import (
    NodeTrustScore,
    NodeRiskScore,
    NodeHealthMetrics,
    NodeRankingSummary,
)

DB_PATH = os.path.join(os.path.dirname(__file__), "qoptima_trust.db")

class TrustDatabaseManager:
    """
    SQLite Database Manager for Trust & Risk Intelligence Engine.
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initializes trust database schema if tables do not exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # 1. Trust History
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS trust_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id TEXT,
                    trust_score REAL,
                    category TEXT,
                    direct_telemetry_score REAL,
                    security_penalty REAL,
                    hardware_health_score REAL,
                    timestamp TEXT
                )
            """)

            # 2. Risk History
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS risk_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id TEXT,
                    risk_score REAL,
                    category TEXT,
                    threat_severity_component REAL,
                    timestamp TEXT
                )
            """)

            # 3. Node Health History
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS node_health_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id TEXT,
                    battery_pct REAL,
                    cpu_usage_pct REAL,
                    memory_usage_pct REAL,
                    temperature_celsius REAL,
                    comm_quality_pct REAL,
                    health_status TEXT,
                    timestamp TEXT
                )
            """)

            # 4. Ranking Snapshots
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ranking_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    rankings_json TEXT,
                    timestamp TEXT
                )
            """)

            # 5. Recovery Events
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS recovery_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id TEXT,
                    initial_trust REAL,
                    recovered_trust REAL,
                    delta REAL,
                    reason TEXT,
                    timestamp TEXT
                )
            """)

            conn.commit()

    def save_trust_score(self, score: NodeTrustScore, timestamp_str: str) -> None:
        """Saves node trust score snapshot."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO trust_history
                (node_id, trust_score, category, direct_telemetry_score, security_penalty, hardware_health_score, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    score.node_id,
                    score.trust_score,
                    score.category,
                    score.direct_telemetry_score,
                    score.security_penalty,
                    score.hardware_health_score,
                    timestamp_str,
                ),
            )
            conn.commit()

    def save_risk_score(self, score: NodeRiskScore, timestamp_str: str) -> None:
        """Saves node risk score snapshot."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO risk_history
                (node_id, risk_score, category, threat_severity_component, timestamp)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    score.node_id,
                    score.risk_score,
                    score.category,
                    score.threat_severity_component,
                    timestamp_str,
                ),
            )
            conn.commit()

    def save_health_metrics(self, health: NodeHealthMetrics, timestamp_str: str) -> None:
        """Saves node health snapshot."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO node_health_history
                (node_id, battery_pct, cpu_usage_pct, memory_usage_pct, temperature_celsius, comm_quality_pct, health_status, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    health.node_id,
                    health.battery_pct,
                    health.cpu_usage_pct,
                    health.memory_usage_pct,
                    health.temperature_celsius,
                    health.comm_quality_pct,
                    health.health_status,
                    timestamp_str,
                ),
            )
            conn.commit()

    def save_ranking_snapshot(self, ranking: NodeRankingSummary, timestamp_str: str) -> None:
        """Saves global ranking snapshot."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO ranking_snapshots (rankings_json, timestamp)
                VALUES (?, ?)
                """,
                (
                    ranking.model_dump_json(),
                    timestamp_str,
                ),
            )
            conn.commit()

    def log_recovery_event(self, node_id: str, initial_trust: float, recovered_trust: float, reason: str, timestamp_str: str) -> None:
        """Logs a trust recovery milestone event."""
        delta = round(recovered_trust - initial_trust, 2)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO recovery_events (node_id, initial_trust, recovered_trust, delta, reason, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (node_id, initial_trust, recovered_trust, delta, reason, timestamp_str),
            )
            conn.commit()

    def get_trust_history(self, node_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Queries trust score logs."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if node_id:
                cursor.execute(
                    "SELECT * FROM trust_history WHERE node_id = ? ORDER BY id DESC LIMIT ?",
                    (node_id, limit),
                )
            else:
                cursor.execute(
                    "SELECT * FROM trust_history ORDER BY id DESC LIMIT ?",
                    (limit,),
                )
            return [dict(row) for row in cursor.fetchall()]

    def get_risk_history(self, node_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Queries risk score logs."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if node_id:
                cursor.execute(
                    "SELECT * FROM risk_history WHERE node_id = ? ORDER BY id DESC LIMIT ?",
                    (node_id, limit),
                )
            else:
                cursor.execute(
                    "SELECT * FROM risk_history ORDER BY id DESC LIMIT ?",
                    (limit,),
                )
            return [dict(row) for row in cursor.fetchall()]

    def get_recent_recoveries(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Queries trust recovery history events."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM recovery_events ORDER BY id DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    def clear_all(self) -> None:
        """Resets database tables."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM trust_history")
            cursor.execute("DELETE FROM risk_history")
            cursor.execute("DELETE FROM node_health_history")
            cursor.execute("DELETE FROM ranking_snapshots")
            cursor.execute("DELETE FROM recovery_events")
            conn.commit()
