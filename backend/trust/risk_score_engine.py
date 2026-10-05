"""
backend/trust/risk_score_engine.py
Deterministic Risk Score Engine for Q-OPTIMA

Calculates holistic risk scores (0.0 to 1.0) combining trust score inverse, threat severity,
hardware degradation, and environmental volatility.
"""

from backend.models.trust_models import NodeTelemetryFeatures, NodeTrustScore, NodeRiskScore

class RiskScoreEngine:
    """
    Deterministic Risk Score Engine.
    """

    def categorize_risk(self, risk_score: float) -> str:
        """Categorizes numerical risk score into standardized level."""
        if risk_score >= 0.85:
            return "Critical"
        elif risk_score >= 0.60:
            return "High"
        elif risk_score >= 0.35:
            return "Medium"
        elif risk_score >= 0.15:
            return "Low"
        else:
            return "Very Low"

    def compute_risk_score(
        self,
        features: NodeTelemetryFeatures,
        trust_score_obj: NodeTrustScore,
    ) -> NodeRiskScore:
        """
        Computes multi-component risk score scaled strictly between 0.0 and 1.0.
        """
        # 1. Trust Risk Component (Inverse of Trust Score)
        r_trust = 1.0 - (trust_score_obj.trust_score / 100.0)

        # 2. Threat Severity Component
        r_threat = min(
            1.0,
            (0.30 * features.attack_count)
            + (0.20 * features.repeated_violations)
            + (0.10 * features.delay_variance),
        )

        # 3. Hardware Degradation Component
        batt_risk = 1.0 - (features.battery_health_pct / 100.0)
        queue_risk = features.queue_congestion
        avail_risk = 1.0 - features.node_availability
        r_hw = min(1.0, (0.40 * batt_risk) + (0.35 * queue_risk) + (0.25 * avail_risk))

        # 4. Environmental Volatility Component
        r_env = min(1.0, (1.0 - features.wind_stability) * 1.2)

        # Combined Weighted Risk Score
        total_risk = (
            (0.45 * r_trust)
            + (0.35 * r_threat)
            + (0.12 * r_hw)
            + (0.08 * r_env)
        )
        total_risk = round(max(0.0, min(1.0, total_risk)), 3)

        category = self.categorize_risk(total_risk)

        return NodeRiskScore(
            node_id=features.node_id,
            risk_score=total_risk,
            category=category,
            trust_risk_component=round(r_trust, 3),
            threat_severity_component=round(r_threat, 3),
            hardware_risk_component=round(r_hw, 3),
            environmental_risk_component=round(r_env, 3),
        )
