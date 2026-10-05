"""
backend/trust/ranking_engine.py
Node Ranking Engine for Q-OPTIMA Trust & Risk Architecture

Computes multi-dimensional rankings across trusted routes, delay speed, risk levels, and relay safety.
"""

from typing import List, Dict
from backend.models.trust_models import (
    NodeTelemetryFeatures,
    NodeTrustScore,
    NodeRiskScore,
    NodeRankingSummary,
)

class NodeRankingEngine:
    """
    Deterministic Node Ranking Engine.
    """

    def compute_rankings(
        self,
        features_map: Dict[str, NodeTelemetryFeatures],
        trust_scores_map: Dict[str, NodeTrustScore],
        risk_scores_map: Dict[str, NodeRiskScore],
    ) -> NodeRankingSummary:
        """
        Calculates sorted node rankings across 6 operational dimensions.
        """
        node_ids = list(features_map.keys())
        if not node_ids:
            return NodeRankingSummary(
                most_trusted=[],
                least_trusted=[],
                fastest_relay=[],
                safest_route=[],
                highest_risk=[],
                lowest_delay=[],
            )

        # 1. Most Trusted (Trust score descending)
        most_trusted = sorted(
            node_ids,
            key=lambda nid: trust_scores_map[nid].trust_score if nid in trust_scores_map else 0.0,
            reverse=True,
        )

        # 2. Least Trusted (Trust score ascending)
        least_trusted = list(reversed(most_trusted))

        # 3. Highest Risk (Risk score descending)
        highest_risk = sorted(
            node_ids,
            key=lambda nid: risk_scores_map[nid].risk_score if nid in risk_scores_map else 1.0,
            reverse=True,
        )

        # 4. Safest Route (Lowest risk score + high stability)
        safest_route = sorted(
            node_ids,
            key=lambda nid: (
                risk_scores_map[nid].risk_score if nid in risk_scores_map else 1.0
            ) - (0.1 * features_map[nid].communication_stability),
        )

        # 5. Fastest Relay / Lowest Delay (Average delay ascending)
        fastest_relay = sorted(
            node_ids,
            key=lambda nid: features_map[nid].average_delay_ms,
        )

        lowest_delay = list(fastest_relay)

        return NodeRankingSummary(
            most_trusted=most_trusted,
            least_trusted=least_trusted,
            fastest_relay=fastest_relay,
            safest_route=safest_route,
            highest_risk=highest_risk,
            lowest_delay=lowest_delay,
        )
