"""
backend/security/delay_calculator.py
Deterministic Delay Calculator Module for UAV Telemetry Streams

Computes exact expected hop latency breakdown (Transmission, Propagation, Queue, Processing,
and Wind Compensation) and compares against observed timestamps to determine delay deviation.
"""

from backend.models.detection_models import TelemetryPacket, DelayBreakdown
from backend.security.wind_compensation import WindCompensationModule

SPEED_OF_LIGHT_M_S = 299_792_458.0  # Speed of EM propagation in vacuum / air

class DelayCalculatorModule:
    """
    Deterministic Expected Delay Calculator for UAV multi-hop wireless communications.
    """

    def __init__(
        self,
        base_processing_delay_ms: float = 1.2,
        cpu_scale_factor_ms: float = 3.5,
        wind_module: WindCompensationModule = None,
    ):
        self.base_processing_delay_ms = base_processing_delay_ms
        self.cpu_scale_factor_ms = cpu_scale_factor_ms
        self.wind_module = wind_module or WindCompensationModule()

    def compute_delay_breakdown(self, packet: TelemetryPacket) -> DelayBreakdown:
        """
        Calculates deterministic expected delays for each component and compares
        with observed actual delay.
        """
        # 1. Transmission Delay T_tx = (packet_bits / bandwidth_bps) * 1000 ms
        packet_bits = packet.packet_size_bytes * 8.0
        transmission_delay_ms = (packet_bits / packet.bandwidth_bps) * 1000.0

        # 2. Propagation Delay T_prop = (distance_m / speed_of_light) * 1000 ms
        propagation_delay_ms = (packet.distance_m / SPEED_OF_LIGHT_M_S) * 1000.0

        # 3. Processing Delay T_proc = BaseProc + (CPU_usage / 100) * CPU_scale
        cpu_load = max(0.0, min(100.0, packet.cpu_usage_pct)) / 100.0
        processing_delay_ms = self.base_processing_delay_ms + (cpu_load * self.cpu_scale_factor_ms)

        # 4. Queue Delay T_queue = queue_length * transmission_delay_ms
        # In a FIFO queue, each queued packet takes approximately 1 packet service time
        queue_delay_ms = packet.queue_length * transmission_delay_ms

        # 5. Wind Compensation Delay
        wind_compensation_ms = self.wind_module.compute_wind_compensation_delay(
            wind_speed_m_s=packet.wind_speed_m_s,
            wind_direction_deg=packet.wind_direction_deg,
            signal_strength_dbm=packet.signal_strength_dbm,
        )

        # Total Expected Hop Delay
        expected_delay_ms = (
            transmission_delay_ms
            + propagation_delay_ms
            + queue_delay_ms
            + processing_delay_ms
            + wind_compensation_ms
        )

        # Observed Actual Delay
        # Support both epoch seconds (e.g. 1700000000.05) and epoch milliseconds (e.g. 1700000000050)
        time_diff = packet.timestamp_received - packet.timestamp_sent
        if time_diff < 0:
            time_diff = 0.0
        
        # If timestamp diff > 10,000, assume timestamps are in milliseconds already; otherwise convert s -> ms
        actual_delay_ms = time_diff if time_diff > 1000.0 else time_diff * 1000.0

        delay_difference_ms = actual_delay_ms - expected_delay_ms

        return DelayBreakdown(
            transmission_delay_ms=round(transmission_delay_ms, 4),
            propagation_delay_ms=round(propagation_delay_ms, 6),
            queue_delay_ms=round(queue_delay_ms, 4),
            processing_delay_ms=round(processing_delay_ms, 4),
            wind_compensation_ms=round(wind_compensation_ms, 4),
            expected_delay_ms=round(expected_delay_ms, 4),
            actual_delay_ms=round(actual_delay_ms, 4),
            delay_difference_ms=round(delay_difference_ms, 4),
        )
