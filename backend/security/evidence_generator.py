"""
backend/security/evidence_generator.py
Explainable Evidence Generator for DATAMUt Pipeline

Constructs structured, verifiable audit evidence records detailing mathematical proofs,
observed telemetry deviations, and deterministic root cause explanations for cybersecurity logging.
"""

import time
import uuid
from backend.models.detection_models import (
    TelemetryPacket,
    DelayBreakdown,
    ThresholdEvaluationResult,
    ClassificationResult,
    DetectionEvidence,
)

class EvidenceGeneratorModule:
    """
    Explainable Evidence Generator for Time-Delay Attack Detection Engine.
    """

    def generate_evidence(
        self,
        packet: TelemetryPacket,
        delay: DelayBreakdown,
        eval_result: ThresholdEvaluationResult,
        classification: ClassificationResult,
    ) -> DetectionEvidence:
        """
        Generates a complete, structured evidence object.
        """
        evidence_id = f"evd-{uuid.uuid4().hex[:8]}"
        timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        # Construct comprehensive mathematical reasoning
        reason_text = (
            f"Node [{packet.current_node}] forwarding packet {packet.packet_id} "
            f"experienced actual delay of {delay.actual_delay_ms:.2f}ms vs expected {delay.expected_delay_ms:.2f}ms "
            f"(diff: +{delay.delay_difference_ms:.2f}ms, threshold: {eval_result.threshold_applied_ms:.2f}ms [{eval_result.threshold_type}]). "
            f"Breakdown -> Tx: {delay.transmission_delay_ms:.2f}ms, Prop: {delay.propagation_delay_ms:.4f}ms, "
            f"Queue: {delay.queue_delay_ms:.2f}ms, CPU Proc: {delay.processing_delay_ms:.2f}ms, Wind Comp: {delay.wind_compensation_ms:.2f}ms. "
            f"Assessment: {classification.explanation}"
        )

        return DetectionEvidence(
            evidence_id=evidence_id,
            packet_id=packet.packet_id,
            node_id=packet.current_node,
            source_node=packet.source_node,
            destination_node=packet.destination_node,
            observed_delay_ms=delay.actual_delay_ms,
            expected_delay_ms=delay.expected_delay_ms,
            difference_ms=delay.delay_difference_ms,
            threshold_applied_ms=eval_result.threshold_applied_ms,
            reason=reason_text,
            confidence=classification.confidence,
            attack_type=classification.attack_type,
            severity=classification.classification,
            timestamp=timestamp_str,
        )
