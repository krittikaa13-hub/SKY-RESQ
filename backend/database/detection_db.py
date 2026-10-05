"""
backend/database/detection_db.py
Thread-Safe SQLite Persistence Layer for DATAMUt Telemetry, Events, Evidence & Trust Logs
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from backend.models.detection_models import (
    TelemetryPacket,
    DetectionEvidence,
    NodeTrustRiskOutput,
)

DB_PATH = os.path.join(os.path.dirname(__file__), "datamut_detection.db")

class DetectionDatabaseManager:
    """
    SQLite Database Manager for DATAMUt Detection Engine.
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initializes database tables if they do not exist."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Telemetry Packets
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS packets_telemetry (
                    packet_id TEXT PRIMARY KEY,
                    source_node TEXT,
                    destination_node TEXT,
                    current_node TEXT,
                    next_hop TEXT,
                    timestamp_sent REAL,
                    timestamp_received REAL,
                    actual_delay_ms REAL,
                    expected_delay_ms REAL,
                    delay_diff_ms REAL,
                    raw_data TEXT
                )
            """)

            # 2. Detection Events Log
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS detection_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    packet_id TEXT,
                    node_id TEXT,
                    attack_type TEXT,
                    severity TEXT,
                    confidence REAL,
                    is_violation INTEGER,
                    timestamp TEXT
                )
            """)

            # 3. Attack Evidence Records
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS attack_evidence (
                    evidence_id TEXT PRIMARY KEY,
                    packet_id TEXT,
                    node_id TEXT,
                    source_node TEXT,
                    destination_node TEXT,
                    observed_delay_ms REAL,
                    expected_delay_ms REAL,
                    difference_ms REAL,
                    threshold_applied_ms REAL,
                    reason TEXT,
                    confidence REAL,
                    attack_type TEXT,
                    severity TEXT,
                    timestamp TEXT
                )
            """)

            # 4. Node Trust History
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS node_trust_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    node_id TEXT,
                    trust_score REAL,
                    risk_score REAL,
                    attack_count INTEGER,
                    avg_delay_ms REAL,
                    violation_count INTEGER,
                    timestamp TEXT
                )
            """)
            
            conn.commit()

    def save_packet_and_event(
        self,
        packet: TelemetryPacket,
        actual_delay_ms: float,
        expected_delay_ms: float,
        delay_diff_ms: float,
        attack_type: str,
        severity: str,
        confidence: float,
        is_violation: bool,
        timestamp_str: str,
    ) -> None:
        """Saves telemetry packet and corresponding detection event into database."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Insert packet
            cursor.execute(
                """
                INSERT OR REPLACE INTO packets_telemetry
                (packet_id, source_node, destination_node, current_node, next_hop,
                 timestamp_sent, timestamp_received, actual_delay_ms, expected_delay_ms, delay_diff_ms, raw_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    packet.packet_id,
                    packet.source_node,
                    packet.destination_node,
                    packet.current_node,
                    packet.next_hop,
                    packet.timestamp_sent,
                    packet.timestamp_received,
                    actual_delay_ms,
                    expected_delay_ms,
                    delay_diff_ms,
                    packet.model_dump_json(),
                ),
            )

            # Insert event
            cursor.execute(
                """
                INSERT INTO detection_events
                (packet_id, node_id, attack_type, severity, confidence, is_violation, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    packet.packet_id,
                    packet.current_node,
                    attack_type,
                    severity,
                    confidence,
                    1 if is_violation else 0,
                    timestamp_str,
                ),
            )
            conn.commit()

    def save_evidence(self, evidence: DetectionEvidence) -> None:
        """Saves an explainable evidence record into SQLite."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO attack_evidence
                (evidence_id, packet_id, node_id, source_node, destination_node,
                 observed_delay_ms, expected_delay_ms, difference_ms, threshold_applied_ms,
                 reason, confidence, attack_type, severity, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    evidence.evidence_id,
                    evidence.packet_id,
                    evidence.node_id,
                    evidence.source_node,
                    evidence.destination_node,
                    evidence.observed_delay_ms,
                    evidence.expected_delay_ms,
                    evidence.difference_ms,
                    evidence.threshold_applied_ms,
                    evidence.reason,
                    evidence.confidence,
                    evidence.attack_type,
                    evidence.severity,
                    evidence.timestamp,
                ),
            )
            conn.commit()

    def save_node_trust(self, trust_output: NodeTrustRiskOutput, timestamp_str: str) -> None:
        """Logs node trust & risk snapshot to historical log."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO node_trust_history
                (node_id, trust_score, risk_score, attack_count, avg_delay_ms, violation_count, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    trust_output.node_id,
                    trust_output.trust_score,
                    trust_output.risk_score,
                    trust_output.attack_count,
                    trust_output.average_delay_ms,
                    trust_output.violation_count,
                    timestamp_str,
                ),
            )
            conn.commit()

    def get_recent_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Queries recent detection events."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM detection_events ORDER BY id DESC LIMIT ?
                """,
                (limit,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_recent_evidence(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Queries recent evidence logs."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT * FROM attack_evidence ORDER BY timestamp DESC LIMIT ?
                """,
                (limit,),
            )
            return [dict(row) for row in cursor.fetchall()]

    def get_node_trust_history(self, node_id: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Queries node trust history snapshots."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if node_id:
                cursor.execute(
                    """
                    SELECT * FROM node_trust_history WHERE node_id = ? ORDER BY id DESC LIMIT ?
                    """,
                    (node_id, limit),
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM node_trust_history ORDER BY id DESC LIMIT ?
                    """,
                    (limit,),
                )
            return [dict(row) for row in cursor.fetchall()]

    def clear_all(self) -> None:
        """Resets all detection tables."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM packets_telemetry")
            cursor.execute("DELETE FROM detection_events")
            cursor.execute("DELETE FROM attack_evidence")
            cursor.execute("DELETE FROM node_trust_history")
            conn.commit()
