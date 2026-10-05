"""
backend/security/attack_classifier.py
Deterministic Attack Classification Engine for DATAMUt Pipeline

Classifies telemetry anomalies into distinct attack categories (Time Delay Attack, Relay Delay,
Artificial Queue Delay, Congestion, Multiple Malicious Nodes, Intermittent Delay, Normal Traffic)
and calculates deterministic confidence scores.
"""

from typing import Dict, List
from backend.models.detection_models import (
    TelemetryPacket,
    DelayBreakdown,
    ThresholdEvaluationResult,
    ClassificationResult,
)

class AttackClassifierEngine:
    """
    Deterministic Attack Classifier based on mathematical logic and rule evaluation.
    """

    def __init__(self):
        # Track node violation history to detect Intermittent and Multi-Node attacks
        self._node_recent_violations: Dict[str, List[bool]] = {}
        self._path_recent_delays: Dict[str, float] = {}

    def _record_node_event(self, node_id: str, is_violation: bool) -> List[bool]:
        if node_id not in self._node_recent_violations:
            self._node_recent_violations[node_id] = []
        
        history = self._node_recent_violations[node_id]
        history.append(is_violation)
        if len(history) > 10:
            history.pop(0)
        return history

    def classify(
        self,
        packet: TelemetryPacket,
        delay: DelayBreakdown,
        eval_result: ThresholdEvaluationResult,
        consecutive_malicious_hops: int = 1,
    ) -> ClassificationResult:
        """
        Deterministically classifies the packet telemetry frame.
        """
        history = self._record_node_event(packet.current_node, eval_result.is_violation)
        violation_rate = sum(history) / float(len(history)) if history else 0.0

        diff = delay.delay_difference_ms
        tau = eval_result.threshold_applied_ms
        v_ratio = eval_result.violation_ratio

        # 1. Normal Traffic
        if not eval_result.is_violation or diff <= 0:
            return ClassificationResult(
                classification="Normal",
                attack_type="Normal Traffic",
                confidence=round(min(99.9, 95.0 + (10.0 / (1.0 + max(0.0, diff)))), 1),
                explanation=f"Packet delay ({delay.actual_delay_ms:.2f}ms) is within normal expected tolerance ({delay.expected_delay_ms:.2f}ms + threshold {tau:.2f}ms).",
            )

        # 2. Multiple Malicious Nodes
        if consecutive_malicious_hops >= 2:
            return ClassificationResult(
                classification="Critical",
                attack_type="Multiple Malicious Nodes",
                confidence=round(min(99.5, 92.0 + (consecutive_malicious_hops * 3.0)), 1),
                explanation=f"Coordinated forwarding delay detected across {consecutive_malicious_hops} consecutive hops along route ({packet.current_node} -> {packet.next_hop}).",
            )

        # 3. Congestion (Legitimate load, not malicious attack)
        if packet.queue_length >= 8 and packet.cpu_usage_pct >= 75.0:
            return ClassificationResult(
                classification="Suspicious",
                attack_type="Congestion",
                confidence=round(min(95.0, 80.0 + (packet.queue_length * 1.5)), 1),
                explanation=f"Delay deviation ({diff:.2f}ms) correlates with heavy node hardware load (Queue: {packet.queue_length}, CPU: {packet.cpu_usage_pct:.1f}%). Likely legitimate network congestion.",
            )

        # 4. Artificial Queue Delay
        if packet.queue_length >= 5 and packet.cpu_usage_pct < 45.0:
            return ClassificationResult(
                classification="High Risk",
                attack_type="Artificial Queue Delay",
                confidence=round(min(98.0, 85.0 + (packet.queue_length * 2.0)), 1),
                explanation=f"Node reported elevated queue length ({packet.queue_length}) without corresponding CPU activity ({packet.cpu_usage_pct:.1f}%). Node is artificially delaying packet release.",
            )

        # 5. Intermittent Delay Attack
        if 0.25 <= violation_rate <= 0.65 and len(history) >= 6:
            return ClassificationResult(
                classification="High Risk",
                attack_type="Intermittent Delay",
                confidence=round(min(96.0, 82.0 + (violation_rate * 20.0)), 1),
                explanation=f"Node {packet.current_node} exhibits fluctuating delay violations ({violation_rate * 100:.0f}% rate) to bypass static threshold detection.",
            )

        # 6. Relay Delay
        if 1.0 < v_ratio <= 2.2 and packet.hop_count > 1:
            return ClassificationResult(
                classification="Suspicious" if v_ratio < 1.5 else "High Risk",
                attack_type="Relay Delay",
                confidence=round(min(94.0, 80.0 + (v_ratio * 6.0)), 1),
                explanation=f"Intermediate relay hop {packet.current_node} introduced unexplained forwarding latency (+{diff:.2f}ms over expected).",
            )

        # 7. Time Delay Attack (Direct Intentional Delay)
        severity = "Critical" if v_ratio > 3.0 else "Malicious"
        confidence = min(99.0, 88.0 + (v_ratio * 3.5))

        return ClassificationResult(
            classification=severity,
            attack_type="Time Delay Attack",
            confidence=round(confidence, 1),
            explanation=f"Deterministic delay violation detected on node {packet.current_node}. Actual delay ({delay.actual_delay_ms:.2f}ms) exceeded expected baseline ({delay.expected_delay_ms:.2f}ms) by {diff:.2f}ms (threshold: {tau:.2f}ms, ratio: {v_ratio:.2f}x).",
        )
