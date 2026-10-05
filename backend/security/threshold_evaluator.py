"""
backend/security/threshold_evaluator.py
Deterministic Threshold Evaluation Engine for DATAMUt Pipeline

Supports Static, Dynamic, Adaptive, and Wind-Aware thresholds to dynamically evaluate
whether observed network packet forwarding delays violate legitimate boundaries.
"""

import numpy as np
from typing import Dict, List, Optional
from backend.models.detection_models import (
    TelemetryPacket,
    DelayBreakdown,
    ThresholdConfig,
    ThresholdEvaluationResult,
)

class ThresholdEvaluatorEngine:
    """
    Deterministic Threshold Evaluation Engine.
    """

    def __init__(self, config: Optional[ThresholdConfig] = None):
        self.config = config or ThresholdConfig()
        # Per-node rolling window history of recent delay differences
        self._node_delay_history: Dict[str, List[float]] = {}
        self._max_history_window = 50

    def set_config(self, config: ThresholdConfig) -> None:
        """Update active threshold configuration parameters."""
        self.config = config

    def update_node_history(self, node_id: str, delay_diff_ms: float) -> None:
        """Appends delay difference to rolling statistical window for node."""
        if node_id not in self._node_delay_history:
            self._node_delay_history[node_id] = []
        
        history = self._node_delay_history[node_id]
        history.append(delay_diff_ms)
        if len(history) > self._max_history_window:
            history.pop(0)

    def calculate_threshold(self, packet: TelemetryPacket) -> float:
        """
        Calculates the active threshold boundary in milliseconds according to selected mode.
        """
        threshold_mode = self.config.threshold_type
        base_threshold = self.config.static_threshold_ms

        if threshold_mode == "Static":
            return base_threshold

        elif threshold_mode == "Dynamic":
            # Rolling window mu + k * sigma
            history = self._node_delay_history.get(packet.current_node, [])
            if len(history) >= 5:
                mean_delay = float(np.mean(history))
                std_delay = float(np.std(history))
                dynamic_t = mean_delay + (self.config.std_multiplier_k * std_delay)
                return max(base_threshold * 0.5, dynamic_t)
            return base_threshold

        elif threshold_mode == "Adaptive":
            # Adaptive to queue & CPU load
            queue_expansion = self.config.queue_weight_alpha * packet.queue_length
            cpu_ratio = max(0.0, min(100.0, packet.cpu_usage_pct)) / 100.0
            cpu_expansion = self.config.cpu_weight_beta * cpu_ratio * base_threshold
            
            adaptive_t = base_threshold + queue_expansion + cpu_expansion
            return max(5.0, adaptive_t)

        elif threshold_mode == "Wind-Aware":
            # Wind-scaled threshold
            wind_factor = 1.0 + (self.config.wind_sensitivity_gamma * (packet.wind_speed_m_s / 10.0))
            return base_threshold * wind_factor

        else:
            return base_threshold

    def evaluate(
        self, packet: TelemetryPacket, delay: DelayBreakdown
    ) -> ThresholdEvaluationResult:
        """
        Evaluates actual delay difference against calculated threshold boundary.
        """
        self.update_node_history(packet.current_node, delay.delay_difference_ms)
        
        applied_threshold = self.calculate_threshold(packet)
        diff = delay.delay_difference_ms
        is_violation = diff > applied_threshold
        violation_ratio = round(diff / applied_threshold, 3) if applied_threshold > 0 else 0.0

        return ThresholdEvaluationResult(
            threshold_applied_ms=round(applied_threshold, 3),
            delay_difference_ms=round(diff, 3),
            is_violation=is_violation,
            violation_ratio=violation_ratio,
            threshold_type=self.config.threshold_type,
        )
