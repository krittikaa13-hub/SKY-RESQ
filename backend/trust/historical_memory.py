"""
backend/trust/historical_memory.py
Historical Memory Module for Q-OPTIMA Trust & Risk Engine

Maintains temporal score memory (moving averages, best/worst scores, recovery milestones,
and historical trend buffers) for all nodes across simulation cycles.
"""

import time
from typing import Dict, List, Optional, Tuple
from backend.models.trust_models import HistoricalMemorySnapshot

class HistoricalMemoryModule:
    """
    Historical Memory Engine tracking temporal trust, risk, and recovery history.
    """

    def __init__(self, max_buffer_size: int = 50):
        self.max_buffer_size = max_buffer_size
        self._memory: Dict[str, Dict[str, Any]] = {}

    def get_or_init_node(self, node_id: str, initial_trust: float = 85.0) -> Dict[str, Any]:
        """Retrieves or initializes node memory state."""
        if node_id not in self._memory:
            self._memory[node_id] = {
                "current_trust": initial_trust,
                "previous_trust": initial_trust,
                "moving_average": initial_trust,
                "best_score": initial_trust,
                "worst_score": initial_trust,
                "attack_count": 0,
                "violation_count": 0,
                "recovery_count": 0,
                "history_buffer": [],
                "last_updated": time.strftime("%Y-%m-%d %H:%M:%S"),
            }
        return self._memory[node_id]

    def update_node_memory(
        self,
        node_id: str,
        trust_score: float,
        is_attack: bool = False,
        is_violation: bool = False,
    ) -> Tuple[HistoricalMemorySnapshot, Optional[Dict[str, Any]]]:
        """
        Updates node memory state and checks for recovery events.
        """
        node_mem = self.get_or_init_node(node_id)
        
        prev_trust = node_mem["current_trust"]
        node_mem["previous_trust"] = prev_trust
        node_mem["current_trust"] = trust_score

        # Best / Worst scores
        node_mem["best_score"] = max(node_mem["best_score"], trust_score)
        node_mem["worst_score"] = min(node_mem["worst_score"], trust_score)

        if is_attack:
            node_mem["attack_count"] += 1
        if is_violation:
            node_mem["violation_count"] += 1

        # Buffer history
        buf = node_mem["history_buffer"]
        buf.append(trust_score)
        if len(buf) > self.max_buffer_size:
            buf.pop(0)

        # Calculate moving average
        node_mem["moving_average"] = round(sum(buf) / float(len(buf)), 1)
        node_mem["last_updated"] = time.strftime("%Y-%m-%d %H:%M:%S")

        # Check for Recovery Milestone
        recovery_event = None
        if prev_trust < 50.0 and trust_score >= 65.0:
            node_mem["recovery_count"] += 1
            recovery_event = {
                "node_id": node_id,
                "initial_trust": prev_trust,
                "recovered_trust": trust_score,
                "delta": round(trust_score - prev_trust, 1),
                "reason": f"Node {node_id} successfully sustained normal telemetry and recovered trust above 65.0 threshold.",
                "timestamp": node_mem["last_updated"],
            }

        snapshot = HistoricalMemorySnapshot(
            node_id=node_id,
            current_trust=node_mem["current_trust"],
            previous_trust=node_mem["previous_trust"],
            moving_average=node_mem["moving_average"],
            best_score=node_mem["best_score"],
            worst_score=node_mem["worst_score"],
            attack_count=node_mem["attack_count"],
            violation_count=node_mem["violation_count"],
            recovery_count=node_mem["recovery_count"],
            last_updated=node_mem["last_updated"],
        )

        return snapshot, recovery_event

    def get_snapshot(self, node_id: str) -> HistoricalMemorySnapshot:
        """Returns snapshot for a single node."""
        node_mem = self.get_or_init_node(node_id)
        return HistoricalMemorySnapshot(
            node_id=node_id,
            current_trust=node_mem["current_trust"],
            previous_trust=node_mem["previous_trust"],
            moving_average=node_mem["moving_average"],
            best_score=node_mem["best_score"],
            worst_score=node_mem["worst_score"],
            attack_count=node_mem["attack_count"],
            violation_count=node_mem["violation_count"],
            recovery_count=node_mem["recovery_count"],
            last_updated=node_mem["last_updated"],
        )

    def reset(self) -> None:
        """Resets memory state."""
        self._memory.clear()
