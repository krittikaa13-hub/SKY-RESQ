"""
backend/security/attack_detector.py
DATAMUt Production Time-Delay Attack Detection Engine Architecture

Continuously monitors UAV multi-hop telemetry, calculates expected delays with wind compensation,
evaluates dynamic thresholds, classifies attacks deterministically, generates explainable evidence,
and produces trust/risk metrics for the Quantum Optimization interface.
"""

import time
import numpy as np
from typing import List, Dict, Any, Optional, Callable
from backend.models.detection_models import (
    TelemetryPacket,
    DelayBreakdown,
    ThresholdConfig,
    ThresholdEvaluationResult,
    ClassificationResult,
    DetectionEvidence,
    NodeTrustRiskOutput,
    DetectionStatusResponse,
)
from backend.security.delay_calculator import DelayCalculatorModule
from backend.security.threshold_evaluator import ThresholdEvaluatorEngine
from backend.security.attack_classifier import AttackClassifierEngine
from backend.security.evidence_generator import EvidenceGeneratorModule
from backend.database.detection_db import DetectionDatabaseManager

class TimeDelayAttackDetectionEngine:
    """
    Deterministic Time-Delay Attack Detection Engine for Multi-Hop UAV Networks.
    """

    def __init__(self, threshold_config: Optional[ThresholdConfig] = None):
        self.delay_calculator = DelayCalculatorModule()
        self.threshold_evaluator = ThresholdEvaluatorEngine(threshold_config)
        self.attack_classifier = AttackClassifierEngine()
        self.evidence_generator = EvidenceGeneratorModule()
        self.db = DetectionDatabaseManager()

        # Engine State
        self.is_active = True
        self.packets_analyzed = 0
        self.attacks_detected = 0

        # Per-node metric tracking
        self.node_metrics: Dict[str, Dict[str, Any]] = {}
        # Path sequence tracking for consecutive hop attack detection
        self.recent_hop_violations: Dict[str, bool] = {}

        # WebSocket / Event Listeners
        self.event_subscribers: List[Callable[[Dict[str, Any]], None]] = []

    def subscribe_event(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Subscribes an event handler (e.g. WebSocket broadcaster) to real-time detection events."""
        self.event_subscribers.append(callback)

    def _broadcast_event(self, event_type: str, payload: Any) -> None:
        message = {"type": event_type, "payload": payload, "timestamp": time.time()}
        for callback in self.event_subscribers:
            try:
                callback(message)
            except Exception:
                pass

    def _get_or_init_node_metrics(self, node_id: str) -> Dict[str, Any]:
        if node_id not in self.node_metrics:
            self.node_metrics[node_id] = {
                "trust_score": 100.0,
                "risk_score": 0.0,
                "attack_count": 0,
                "delays": [],
                "violation_count": 0,
                "last_status": "healthy",
                "trend": [],
            }
        return self.node_metrics[node_id]

    def process_packet(self, packet: TelemetryPacket) -> Dict[str, Any]:
        """
        Main Detection Pipeline Execution:
        Telemetry -> Delay Calculation -> Threshold Evaluation -> Attack Classification -> Evidence & Trust Update.
        """
        if not self.is_active:
            return {"status": "engine_inactive"}

        self.packets_analyzed += 1
        node_id = packet.current_node
        node_data = self._get_or_init_node_metrics(node_id)

        # 1. Delay Breakdown Calculation
        delay: DelayBreakdown = self.delay_calculator.compute_delay_breakdown(packet)

        # 2. Threshold Evaluation
        eval_result: ThresholdEvaluationResult = self.threshold_evaluator.evaluate(packet, delay)

        # 3. Check for multi-hop consecutive violations
        prev_hop = packet.source_node if packet.source_node != node_id else None
        consecutive_violations = 1
        if prev_hop and self.recent_hop_violations.get(prev_hop, False) and eval_result.is_violation:
            consecutive_violations = 2

        self.recent_hop_violations[node_id] = eval_result.is_violation

        # 4. Attack Classification
        classification: ClassificationResult = self.attack_classifier.classify(
            packet, delay, eval_result, consecutive_malicious_hops=consecutive_violations
        )

        timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        # 5. Node Metric & Trust Score Update
        node_data["delays"].append(delay.actual_delay_ms)
        if len(node_data["delays"]) > 100:
            node_data["delays"].pop(0)

        evidence: Optional[DetectionEvidence] = None

        if eval_result.is_violation and classification.classification != "Normal":
            self.attacks_detected += 1
            node_data["violation_count"] += 1

            if classification.classification in ["High Risk", "Malicious", "Critical"]:
                node_data["attack_count"] += 1

            # Deterministic Trust Score Decay
            # Penalty scales with confidence and violation magnitude
            trust_penalty = min(25.0, (eval_result.violation_ratio * 3.5) * (classification.confidence / 100.0))
            node_data["trust_score"] = max(0.0, node_data["trust_score"] - trust_penalty)

            # 6. Generate Evidence Record
            evidence = self.evidence_generator.generate_evidence(
                packet, delay, eval_result, classification
            )
            self.db.save_evidence(evidence)

        else:
            # Deterministic Trust Score Recovery on Normal Traffic (+0.25 up to 100)
            node_data["trust_score"] = min(100.0, node_data["trust_score"] + 0.25)

        # Deterministic Risk Score
        # Risk = 100 - Trust + (ViolationRatio Penalty)
        calculated_risk = max(0.0, min(100.0, (100.0 - node_data["trust_score"]) + (node_data["violation_count"] * 1.5)))
        node_data["risk_score"] = round(calculated_risk, 1)

        # Update historical trend array
        trend_entry = {
            "time": time.strftime("%H:%M:%S"),
            "trust": round(node_data["trust_score"], 1),
            "delay": round(delay.actual_delay_ms, 2),
            "expected": round(delay.expected_delay_ms, 2),
        }
        node_data["trend"].append(trend_entry)
        if len(node_data["trend"]) > 20:
            node_data["trend"].pop(0)

        # 7. Persist into SQLite DB
        self.db.save_packet_and_event(
            packet=packet,
            actual_delay_ms=delay.actual_delay_ms,
            expected_delay_ms=delay.expected_delay_ms,
            delay_diff_ms=delay.delay_difference_ms,
            attack_type=classification.attack_type,
            severity=classification.classification,
            confidence=classification.confidence,
            is_violation=eval_result.is_violation,
            timestamp_str=timestamp_str,
        )

        trust_output = NodeTrustRiskOutput(
            node_id=node_id,
            trust_score=round(node_data["trust_score"], 1),
            risk_score=round(node_data["risk_score"], 1),
            attack_count=node_data["attack_count"],
            average_delay_ms=round(float(np.mean(node_data["delays"])), 2) if node_data["delays"] else 0.0,
            max_delay_ms=round(float(np.max(node_data["delays"])), 2) if node_data["delays"] else 0.0,
            violation_count=node_data["violation_count"],
            status="compromised" if node_data["trust_score"] < 50.0 else "healthy",
            historical_trend=node_data["trend"],
        )

        self.db.save_node_trust(trust_output, timestamp_str)

        # 8. Broadcast WebSocket Event if violation occurred
        result_payload = {
            "packet_id": packet.packet_id,
            "node_id": node_id,
            "delay_breakdown": delay.model_dump(),
            "threshold_eval": eval_result.model_dump(),
            "classification": classification.model_dump(),
            "trust_metrics": trust_output.model_dump(),
            "evidence": evidence.model_dump() if evidence else None,
        }

        if eval_result.is_violation:
            self._broadcast_event("DETECTION_ALERT", result_payload)

        return result_payload

    def get_node_trust_summary(self) -> List[NodeTrustRiskOutput]:
        """Returns trust and risk metrics for all monitored nodes."""
        outputs = []
        for node_id, data in self.node_metrics.items():
            avg_delay = float(np.mean(data["delays"])) if data["delays"] else 0.0
            max_delay = float(np.max(data["delays"])) if data["delays"] else 0.0
            outputs.append(
                NodeTrustRiskOutput(
                    node_id=node_id,
                    trust_score=round(data["trust_score"], 1),
                    risk_score=round(data["risk_score"], 1),
                    attack_count=data["attack_count"],
                    average_delay_ms=round(avg_delay, 2),
                    max_delay_ms=round(max_delay, 2),
                    violation_count=data["violation_count"],
                    status="compromised" if data["trust_score"] < 50.0 else "healthy",
                    historical_trend=data["trend"],
                )
            )
        return outputs

    def get_status(self) -> DetectionStatusResponse:
        """Returns engine status summary."""
        return DetectionStatusResponse(
            status="active" if self.is_active else "stopped",
            packets_analyzed=self.packets_analyzed,
            attacks_detected=self.attacks_detected,
            active_threshold_mode=self.threshold_evaluator.config.threshold_type,
            monitored_nodes_count=len(self.node_metrics),
            system_time=time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
        )

    def set_threshold_config(self, config: ThresholdConfig) -> None:
        """Updates active threshold mode and parameters."""
        self.threshold_evaluator.set_config(config)

    def start(self) -> None:
        self.is_active = True

    def stop(self) -> None:
        self.is_active = False

    def reset(self) -> None:
        self.packets_analyzed = 0
        self.attacks_detected = 0
        self.node_metrics.clear()
        self.recent_hop_violations.clear()
        self.db.clear_all()

# Global Singleton Detection Engine Instance
datamut_engine = TimeDelayAttackDetectionEngine()
