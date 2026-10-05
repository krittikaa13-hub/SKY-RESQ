"""
backend/tests/test_datamut_detection.py
Unit Tests for DATAMUt Time-Delay Attack Detection Engine
Tests deterministic delay calculation, wind compensation, threshold evaluation,
attack classification, and evidence generation.
"""

import pytest
import time
from backend.models.detection_models import TelemetryPacket, ThresholdConfig
from backend.security.delay_calculator import DelayCalculatorModule
from backend.security.wind_compensation import WindCompensationModule
from backend.security.threshold_evaluator import ThresholdEvaluatorEngine
from backend.security.attack_classifier import AttackClassifierEngine
from backend.security.evidence_generator import EvidenceGeneratorModule
from backend.security.attack_detector import TimeDelayAttackDetectionEngine

def test_wind_compensation_zero_wind():
    wind_mod = WindCompensationModule()
    delay = wind_mod.compute_wind_compensation_delay(wind_speed_m_s=0.0)
    assert delay == 0.0

def test_wind_compensation_positive_wind():
    wind_mod = WindCompensationModule()
    delay = wind_mod.compute_wind_compensation_delay(wind_speed_m_s=15.0, wind_direction_deg=180.0)
    assert delay > 0.0

def test_delay_calculator_normal():
    calc = DelayCalculatorModule()
    now = time.time()
    packet = TelemetryPacket(
        packet_id="pkt-001",
        source_node="node0",
        destination_node="node3",
        current_node="node1",
        next_hop="node2",
        timestamp_sent=now,
        timestamp_received=now + 0.005,  # 5 ms actual delay
        queue_length=1,
        cpu_usage_pct=20.0,
        packet_size_bytes=1024,
        bandwidth_bps=54_000_000.0,
        distance_m=100.0,
        wind_speed_m_s=2.0,
    )
    breakdown = calc.compute_delay_breakdown(packet)
    assert breakdown.actual_delay_ms == 5.0
    assert breakdown.expected_delay_ms > 0.0

def test_threshold_evaluator_static():
    evaluator = ThresholdEvaluatorEngine(ThresholdConfig(threshold_type="Static", static_threshold_ms=10.0))
    now = time.time()
    packet = TelemetryPacket(
        packet_id="pkt-002",
        source_node="node0",
        destination_node="node3",
        current_node="node1",
        next_hop="node2",
        timestamp_sent=now,
        timestamp_received=now + 0.025,  # 25 ms actual delay
    )
    calc = DelayCalculatorModule()
    breakdown = calc.compute_delay_breakdown(packet)
    res = evaluator.evaluate(packet, breakdown)
    assert res.threshold_applied_ms == 10.0

def test_attack_classifier_time_delay_attack():
    classifier = AttackClassifierEngine()
    now = time.time()
    packet = TelemetryPacket(
        packet_id="pkt-atk-1",
        source_node="node0",
        destination_node="node5",
        current_node="node2",
        next_hop="node3",
        timestamp_sent=now,
        timestamp_received=now + 0.080,  # 80 ms excessive delay
        queue_length=1,  # Low queue -> proves malicious hold, not congestion!
        cpu_usage_pct=25.0,  # Low CPU
    )
    calc = DelayCalculatorModule()
    breakdown = calc.compute_delay_breakdown(packet)
    evaluator = ThresholdEvaluatorEngine(ThresholdConfig(threshold_type="Static", static_threshold_ms=15.0))
    eval_res = evaluator.evaluate(packet, breakdown)

    result = classifier.classify(packet, breakdown, eval_res)
    assert result.attack_type in ["Time Delay Attack", "Relay Delay"]
    assert result.classification in ["High Risk", "Malicious", "Critical"]
    assert result.confidence >= 80.0

def test_full_detection_engine_pipeline():
    engine = TimeDelayAttackDetectionEngine()
    engine.start()

    now = time.time()
    normal_pkt = TelemetryPacket(
        packet_id="pkt-norm-1",
        source_node="node0",
        destination_node="node4",
        current_node="node1",
        next_hop="node2",
        timestamp_sent=now,
        timestamp_received=now + 0.003,
        queue_length=1,
        cpu_usage_pct=15.0,
    )
    res_norm = engine.process_packet(normal_pkt)
    assert res_norm["classification"]["classification"] == "Normal"

    malicious_pkt = TelemetryPacket(
        packet_id="pkt-mal-1",
        source_node="node0",
        destination_node="node4",
        current_node="node2",
        next_hop="node3",
        timestamp_sent=now,
        timestamp_received=now + 0.095,  # 95 ms excessive delay
        queue_length=2,
        cpu_usage_pct=30.0,
    )
    res_mal = engine.process_packet(malicious_pkt)
    assert res_mal["threshold_eval"]["is_violation"] is True
    assert res_mal["trust_metrics"]["trust_score"] < 100.0
    assert res_mal["evidence"] is not None
