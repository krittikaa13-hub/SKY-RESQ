"""
backend/trust/trust_engine.py
Complete Trust & Risk Intelligence Engine Architecture

Orchestrates real-time node telemetry ingestion, trust score evaluation, risk modeling,
historical memory tracking, node ranking calculations, health monitoring, and quantum coefficient generation.
"""

import time
import numpy as np
from typing import List, Dict, Any, Optional, Callable

from backend.models.trust_models import (
    NodeTelemetryFeatures,
    NodeTrustScore,
    NodeRiskScore,
    NodeHealthMetrics,
    NodeRankingSummary,
    NodeQuantumCoefficient,
    HistoricalMemorySnapshot,
    TrustEngineOverviewResponse,
)
from backend.trust.trust_score_engine import TrustScoreEngine
from backend.trust.risk_score_engine import RiskScoreEngine
from backend.trust.historical_memory import HistoricalMemoryModule
from backend.trust.ranking_engine import NodeRankingEngine
from backend.trust.quantum_interface import QuantumOptimizationInterface
from backend.database.trust_db import TrustDatabaseManager

class TrustAndRiskEngine:
    """
    Main Orchestrator for Q-OPTIMA Trust & Risk Intelligence Engine.
    """

    def __init__(self):
        self.trust_score_engine = TrustScoreEngine()
        self.risk_score_engine = RiskScoreEngine()
        self.historical_memory = HistoricalMemoryModule()
        self.ranking_engine = NodeRankingEngine()
        self.quantum_interface = QuantumOptimizationInterface()
        self.db = TrustDatabaseManager()

        # Active node state maps
        self.features_map: Dict[str, NodeTelemetryFeatures] = {}
        self.trust_scores_map: Dict[str, NodeTrustScore] = {}
        self.risk_scores_map: Dict[str, NodeRiskScore] = {}
        self.health_metrics_map: Dict[str, NodeHealthMetrics] = {}

        # WebSocket Event Subscribers
        self.event_subscribers: List[Callable[[Dict[str, Any]], None]] = []

        # Bootstrap default 12 UAV nodes baseline telemetry if empty
        self._bootstrap_default_nodes()

    def _bootstrap_default_nodes(self) -> None:
        """Bootstraps default UAV swarm telemetry nodes."""
        for i in range(12):
            node_id = f"node{i}"
            init_delay = round(3.5 + (i * 0.4), 2)
            init_batt = round(98.0 - (i * 1.5), 1)

            features = NodeTelemetryFeatures(
                node_id=node_id,
                average_delay_ms=init_delay,
                max_delay_ms=round(init_delay + 4.0, 2),
                delay_variance=0.8,
                attack_count=0,
                repeated_violations=0,
                communication_stability=0.98,
                battery_health_pct=init_batt,
                packet_success_rate=0.99,
                packet_loss_rate=0.01,
                hop_count=1,
                node_availability=1.0,
                queue_congestion=0.05,
                wind_stability=0.92,
                relay_reliability=0.97,
                total_packets_processed=120,
            )
            self.features_map[node_id] = features

            # Compute initial baseline
            t_score = self.trust_score_engine.compute_trust_score(features, previous_trust=90.0)
            r_score = self.risk_score_engine.compute_risk_score(features, t_score)

            self.trust_scores_map[node_id] = t_score
            self.risk_scores_map[node_id] = r_score

            self.health_metrics_map[node_id] = NodeHealthMetrics(
                node_id=node_id,
                battery_pct=init_batt,
                cpu_usage_pct=round(25.0 + (i * 2.0), 1),
                memory_usage_pct=round(35.0 + (i * 1.5), 1),
                temperature_celsius=round(42.0 + (i * 0.5), 1),
                comm_quality_pct=round(96.0 - (i * 0.5), 1),
                health_status="Healthy",
            )

    def subscribe_event(self, callback: Callable[[Dict[str, Any]], None]) -> None:
        """Subscribes an event handler (e.g. WebSocket broadcaster) for real-time events."""
        self.event_subscribers.append(callback)

    def _broadcast_event(self, event_type: str, payload: Any) -> None:
        message = {"type": event_type, "payload": payload, "timestamp": time.time()}
        for callback in self.event_subscribers:
            try:
                callback(message)
            except Exception:
                pass

    def update_node_telemetry(self, features: NodeTelemetryFeatures) -> Dict[str, Any]:
        """
        Ingests telemetry update for a node, recalculates trust, risk, historical memory, and health.
        """
        node_id = features.node_id
        self.features_map[node_id] = features

        prev_trust = (
            self.trust_scores_map[node_id].trust_score
            if node_id in self.trust_scores_map
            else 85.0
        )

        # 1. Trust Score Calculation
        t_score = self.trust_score_engine.compute_trust_score(features, previous_trust=prev_trust)
        self.trust_scores_map[node_id] = t_score

        # 2. Risk Score Calculation
        r_score = self.risk_score_engine.compute_risk_score(features, t_score)
        self.risk_scores_map[node_id] = r_score

        # 3. Historical Memory Update & Recovery Event Check
        is_attack = features.attack_count > 0
        is_violation = features.repeated_violations > 0
        mem_snapshot, recovery_event = self.historical_memory.update_node_memory(
            node_id, t_score.trust_score, is_attack=is_attack, is_violation=is_violation
        )

        timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        # 4. Update Node Health Metrics
        h_status = "Healthy"
        if features.battery_health_pct < 20.0 or t_score.trust_score < 30.0:
            h_status = "Critical"
        elif features.battery_health_pct < 45.0 or t_score.trust_score < 60.0:
            h_status = "Degraded"

        health_obj = NodeHealthMetrics(
            node_id=node_id,
            battery_pct=features.battery_health_pct,
            cpu_usage_pct=round(features.queue_congestion * 100.0 + 20.0, 1),
            memory_usage_pct=40.0,
            temperature_celsius=45.0,
            comm_quality_pct=round(features.communication_stability * 100.0, 1),
            health_status=h_status,
        )
        self.health_metrics_map[node_id] = health_obj

        # 5. Persist into SQLite DB
        self.db.save_trust_score(t_score, timestamp_str)
        self.db.save_risk_score(r_score, timestamp_str)
        self.db.save_health_metrics(health_obj, timestamp_str)

        if recovery_event:
            self.db.log_recovery_event(
                node_id=node_id,
                initial_trust=recovery_event["initial_trust"],
                recovered_trust=recovery_event["recovered_trust"],
                reason=recovery_event["reason"],
                timestamp_str=timestamp_str,
            )

        # 6. Broadcast Real-Time Events
        self._broadcast_event("TRUST_UPDATED", t_score.model_dump())
        self._broadcast_event("RISK_UPDATED", r_score.model_dump())
        self._broadcast_event("HEALTH_UPDATED", health_obj.model_dump())

        return {
            "trust": t_score.model_dump(),
            "risk": r_score.model_dump(),
            "health": health_obj.model_dump(),
            "memory": mem_snapshot.model_dump(),
        }

    def recalculate_all(self) -> None:
        """Forces a complete recalculation cycle across all registered node telemetry."""
        for node_id, features in self.features_map.items():
            self.update_node_telemetry(features)

        # Re-compute global rankings
        rankings = self.get_node_rankings()
        timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
        self.db.save_ranking_snapshot(rankings, timestamp_str)
        self._broadcast_event("RANKING_UPDATED", rankings.model_dump())

    def get_node_rankings(self) -> NodeRankingSummary:
        """Returns sorted node rankings across dimensions."""
        return self.ranking_engine.compute_rankings(
            self.features_map, self.trust_scores_map, self.risk_scores_map
        )

    def get_quantum_coefficients((
        self,
        alpha_trust_weight: float = 0.5,
        beta_risk_weight: float = 40.0,
        gamma_delay_weight: float = 15.0,
    ) -> List[NodeQuantumCoefficient]:
        """Generates exact coefficients for Quantum Optimization Hamiltonian."""
        return self.quantum_interface.generate_quantum_coefficients(
            self.features_map,
            self.trust_scores_map,
            self.risk_scores_map,
            alpha_trust_weight=alpha_trust_weight,
            beta_risk_weight=beta_risk_weight,
            gamma_delay_weight=gamma_delay_weight,
        )

    def get_overview() -> TrustEngineOverviewResponse:
        """Returns network-wide trust overview."""
        trusts = [t.trust_score for t in self.trust_scores_map.values()]
        risks = [r.risk_score for r in self.risk_scores_map.values()]

        mean_trust = float(np.mean(trusts)) if trusts else 85.0
        mean_risk = float(np.mean(risks)) if risks else 0.15

        trusted_cnt = sum(1 for t in trusts if t >= 75.0)
        compromised_cnt = sum(1 for t in trusts if t < 50.0)

        sys_status = "OPTIMAL"
        if compromised_cnt >= 3:
            sys_status = "HIGH THREAT LEVEL"
        elif compromised_cnt >= 1:
            sys_status = "WARNING"

        return TrustEngineOverviewResponse(
            network_mean_trust=round(mean_trust, 1),
            network_mean_risk=round(mean_risk, 3),
            active_nodes_count=len(self.features_map),
            trusted_nodes_count=trusted_cnt,
            compromised_nodes_count=compromised_cnt,
            system_status=sys_status,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime()),
        )

    def reset(self) -> None:
        """Resets all trust engine state and clears DB."""
        self.features_map.clear()
        self.trust_scores_map.clear()
        self.risk_scores_map.clear()
        self.health_metrics_map.clear()
        self.historical_memory.reset()
        self.db.clear_all()
        self._bootstrap_default_nodes()

# Global Singleton Instance
trust_intelligence_engine = TrustAndRiskEngine()
