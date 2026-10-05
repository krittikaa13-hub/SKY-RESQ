"""
backend/trust/trust_score_engine.py
Deterministic Trust Scoring Engine for Q-OPTIMA

Computes multi-dimensional trust scores based on network telemetry, DATAMUt attack violations,
hardware health, exponential decay penalties, moving averages, and confidence factors.
"""

import math
from typing import Dict, Any, Tuple
from backend.models.trust_models import NodeTelemetryFeatures, NodeTrustScore

class TrustScoreEngine:
    """
    Deterministic Trust Scoring Engine.
    """

    def __init__(self, ewma_alpha: float = 0.35, confidence_threshold_packets: int = 50):
        self.ewma_alpha = ewma_alpha
        self.confidence_threshold_packets = confidence_threshold_packets

    def calculate_direct_telemetry_score(self, features: NodeTelemetryFeatures) -> float:
        """
        Calculates direct network telemetry score (0 - 100).
        """
        # Delay score: penalize delays beyond 5 ms baseline up to 50 ms
        delay_score = max(0.0, 100.0 * (1.0 - (features.average_delay_ms / 50.0)))
        delivery_score = 100.0 * features.packet_success_rate
        comm_score = 100.0 * features.communication_stability
        relay_score = 100.0 * features.relay_reliability

        telemetry_score = (
            (0.30 * delay_score)
            + (0.30 * delivery_score)
            + (0.20 * comm_score)
            + (0.20 * relay_score)
        )
        return min(100.0, max(0.0, telemetry_score))

    def calculate_security_penalty(self, features: NodeTelemetryFeatures) -> float:
        """
        Calculates deterministic security penalty (0 - 100) using exponential decay equations.
        """
        attack_penalty = min(100.0, features.attack_count * 20.0)
        
        # Exponential violation decay penalty: P = 100 * (1 - e^(-0.35 * n))
        exp_violation_penalty = 100.0 * (1.0 - math.exp(-0.35 * features.repeated_violations))
        variance_penalty = min(30.0, features.delay_variance * 5.0)

        total_penalty = (0.45 * attack_penalty) + (0.45 * exp_violation_penalty) + (0.10 * variance_penalty)
        return min(100.0, max(0.0, total_penalty))

    def calculate_hardware_health_score(self, features: NodeTelemetryFeatures) -> float:
        """
        Calculates hardware and environmental health score (0 - 100).
        """
        battery_score = features.battery_health_pct
        queue_score = 100.0 * (1.0 - features.queue_congestion)
        avail_score = 100.0 * features.node_availability
        wind_score = 100.0 * features.wind_stability

        hw_score = (
            (0.35 * battery_score)
            + (0.25 * queue_score)
            + (0.20 * avail_score)
            + (0.20 * wind_score)
        )
        return min(100.0, max(0.0, hw_score))

    def categorize_trust(self, trust_score: float) -> str:
        """Classifies trust score into categorical bucket."""
        if trust_score >= 90.0:
            return "Excellent"
        elif trust_score >= 75.0:
            return "Good"
        elif trust_score >= 50.0:
            return "Warning"
        elif trust_score >= 25.0:
            return "Poor"
        else:
            return "Critical"

    def compute_trust_score(
        self,
        features: NodeTelemetryFeatures,
        previous_trust: float = 85.0,
    ) -> NodeTrustScore:
        """
        Executes complete deterministic trust score calculation pipeline.
        """
        s_tel = self.calculate_direct_telemetry_score(features)
        p_sec = self.calculate_security_penalty(features)
        s_hw = self.calculate_hardware_health_score(features)

        # Raw Trust Score formula: 50% Telemetry + 30% Hardware - 60% Security Penalty
        raw_trust = (0.50 * s_tel) + (0.30 * s_hw) - (0.60 * p_sec)
        raw_trust = max(0.0, min(100.0, raw_trust))

        # EWMA Moving Average smoothing
        ewma_trust = (self.ewma_alpha * raw_trust) + ((1.0 - self.ewma_alpha) * previous_trust)

        # Sample size confidence adjustment factor c = min(1.0, packets / 50)
        confidence = min(1.0, features.total_packets_processed / float(self.confidence_threshold_packets))
        
        final_trust = (confidence * ewma_trust) + ((1.0 - confidence) * 85.0)
        final_trust = round(max(0.0, min(100.0, final_trust)), 1)

        category = self.categorize_trust(final_trust)

        # Trend direction
        if final_trust > previous_trust + 1.0:
            trend = "Improving"
        elif final_trust < previous_trust - 1.0:
            trend = "Degrading"
        else:
            trend = "Stable"

        return NodeTrustScore(
            node_id=features.node_id,
            trust_score=final_trust,
            category=category,
            direct_telemetry_score=round(s_tel, 1),
            security_penalty=round(p_sec, 1),
            hardware_health_score=round(s_hw, 1),
            confidence_factor=round(confidence, 2),
            moving_average_trust=round(ewma_trust, 1),
            trend_direction=trend,
        )
