"""
backend/tests/test_trust_engine.py
Unit Tests for Q-OPTIMA Trust & Risk Intelligence Engine
"""

import pytest
import time
from backend.models.trust_models import NodeTelemetryFeatures
from backend.trust.trust_score_engine import TrustScoreEngine
from backend.trust.risk_score_engine import RiskScoreEngine
from backend.trust.historical_memory import HistoricalMemoryModule
from backend.trust.ranking_engine import NodeRankingEngine
from backend.trust.quantum_interface import QuantumOptimizationInterface
from backend.trust.trust_engine import TimeDelayAttackDetectionEngine, TrustAndRiskEngine

def test_trust_score_engine_normal():
    engine = TrustScoreEngine()
    features = NodeTelemetryFeatures(
        node_id="node0",
        average_delay_ms=3.0,
        packet_success_rate=0.99,
        communication_stability=0.98,
        relay_reliability=0.97,
        attack_count=0,
        repeated_violations=0,
        battery_health_pct=95.0,
        total_packets_processed=100,
    )
    score = engine.compute_trust_score(features, previous_trust=90.0)
    assert score.trust_score >= 85.0
    assert score.category in ["Excellent", "Good"]

def test_trust_score_engine_attack_penalty():
    engine = TrustScoreEngine()
    features = NodeTelemetryFeatures(
        node_id="node-bad",
        average_delay_ms=45.0,
        attack_count=3,
        repeated_violations=4,
        delay_variance=8.5,
        total_packets_processed=100,
    )
    score = engine.compute_trust_score(features, previous_trust=85.0)
    assert score.trust_score < 50.0
    assert score.security_penalty > 50.0
    assert score.category in ["Warning", "Poor", "Critical"]

def test_risk_score_engine():
    trust_eng = TrustScoreEngine()
    risk_eng = RiskScoreEngine()

    good_features = NodeTelemetryFeatures(node_id="node1", average_delay_ms=2.5)
    good_trust = trust_eng.compute_trust_score(good_features)
    good_risk = risk_eng.compute_risk_score(good_features, good_trust)
    assert good_risk.risk_score < 0.25
    assert good_risk.category in ["Very Low", "Low"]

    bad_features = NodeTelemetryFeatures(node_id="node2", attack_count=4, repeated_violations=5)
    bad_trust = trust_eng.compute_trust_score(bad_features)
    bad_risk = risk_eng.compute_risk_score(bad_features, bad_trust)
    assert bad_risk.risk_score > 0.60
    assert bad_risk.category in ["High", "Critical"]

def test_historical_memory_recovery():
    mem = HistoricalMemoryModule()
    snapshot1, rec1 = mem.update_node_memory("node-x", trust_score=40.0)
    assert snapshot1.current_trust == 40.0
    assert rec1 is None

    snapshot2, rec2 = mem.update_node_memory("node-x", trust_score=70.0)
    assert snapshot2.current_trust == 70.0
    assert rec2 is not None
    assert rec2["recovered_trust"] == 70.0

def test_node_ranking_engine():
    rank_eng = NodeRankingEngine()
    trust_eng = TrustScoreEngine()
    risk_eng = RiskScoreEngine()

    f1 = NodeTelemetryFeatures(node_id="nodeA", average_delay_ms=2.0)
    f2 = NodeTelemetryFeatures(node_id="nodeB", average_delay_ms=15.0, attack_count=2, repeated_violations=3)

    t1 = trust_eng.compute_trust_score(f1)
    t2 = trust_eng.compute_trust_score(f2)

    r1 = risk_eng.compute_risk_score(f1, t1)
    r2 = risk_eng.compute_risk_score(f2, t2)

    rankings = rank_eng.compute_rankings(
        {"nodeA": f1, "nodeB": f2},
        {"nodeA": t1, "nodeB": t2},
        {"nodeA": r1, "nodeB": r2},
    )

    assert rankings.most_trusted[0] == "nodeA"
    assert rankings.highest_risk[0] == "nodeB"
    assert rankings.fastest_relay[0] == "nodeA"

def test_quantum_interface_coefficients():
    q_iface = QuantumOptimizationInterface()
    trust_eng = TrustScoreEngine()
    risk_eng = RiskScoreEngine()

    f1 = NodeTelemetryFeatures(node_id="node1", average_delay_ms=5.0)
    t1 = trust_eng.compute_trust_score(f1)
    r1 = risk_eng.compute_risk_score(f1, t1)

    coeffs = q_iface.generate_quantum_coefficients(
        {"node1": f1},
        {"node1": t1},
        {"node1": r1},
    )

    assert len(coeffs) == 1
    assert coeffs[0].node_id == "node1"
    assert coeffs[0].priority_weight > 0.0
    assert coeffs[0].optimization_cost >= 0.0

def test_full_trust_and_risk_orchestrator():
    orchestrator = TrustAndRiskEngine()
    overview = orchestrator.get_overview()
    assert overview.active_nodes_count >= 12
    assert overview.network_mean_trust > 0.0

    rankings = orchestrator.get_node_rankings()
    assert len(rankings.most_trusted) >= 12

    coeffs = orchestrator.get_quantum_coefficients()
    assert len(coeffs) >= 12
