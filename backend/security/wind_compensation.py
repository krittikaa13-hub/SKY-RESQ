"""
backend/security/wind_compensation.py
Deterministic Wind Compensation Module for Multi-Hop UAV Networks

Calculates atmospheric turbulence, headwind/crosswind components, antenna jitter,
and link-layer retransmission overhead to isolate physical environmental latency
from malicious forwarding delays.
"""

import math
from typing import Dict, Any

class WindCompensationModule:
    """
    Deterministic Wind Compensation Model for UAV wireless communications.
    """

    def __init__(
        self,
        cruise_speed_m_s: float = 15.0,
        base_packet_error_rate: float = 0.02,
        slot_backoff_ms: float = 2.5,
        wind_sensitivity_factor: float = 0.0012,
    ):
        self.cruise_speed_m_s = cruise_speed_m_s
        self.base_packet_error_rate = base_packet_error_rate
        self.slot_backoff_ms = slot_backoff_ms
        self.wind_sensitivity_factor = wind_sensitivity_factor

    def calculate_wind_vectors(
        self, wind_speed_m_s: float, wind_direction_deg: float, flight_heading_deg: float = 0.0
    ) -> Dict[str, float]:
        """
        Decomposes wind vector into relative headwind and crosswind components.
        """
        angle_diff_rad = math.radians(wind_direction_deg - flight_heading_deg)
        headwind = wind_speed_m_s * math.cos(angle_diff_rad)
        crosswind = wind_speed_m_s * math.sin(angle_diff_rad)

        return {
            "headwind_m_s": headwind,
            "crosswind_m_s": abs(crosswind),
            "wind_speed_m_s": wind_speed_m_s,
        }

    def compute_wind_compensation_delay(
        self,
        wind_speed_m_s: float,
        wind_direction_deg: float = 0.0,
        flight_heading_deg: float = 0.0,
        signal_strength_dbm: float = -65.0,
    ) -> float:
        """
        Calculates expected additional latency in milliseconds due to wind dynamics.
        
        Formula:
        1. Vector decomposition: Headwind & Crosswind.
        2. Effective Packet Error Rate (PER_eff) = PER_base + sensitivity * (max(0, headwind)^1.8 + 0.8 * crosswind)
        3. Signal penalty: If RSSI < -75 dBm, wind turbulence exacerbates link degradation.
        4. Expected Retransmissions N = 1 / (1 - PER_eff)
        5. Wind Delay Offset = (N - 1) * BackoffSlot
        """
        if wind_speed_m_s <= 0.0:
            return 0.0

        vectors = self.calculate_wind_vectors(wind_speed_m_s, wind_direction_deg, flight_heading_deg)
        headwind = max(0.0, vectors["headwind_m_s"])
        crosswind = vectors["crosswind_m_s"]

        # Aerodynamic turbulence penalty
        aerodynamic_factor = math.pow(headwind, 1.6) + (0.85 * crosswind)
        
        # Signal attenuation exacerbation factor
        rssi_penalty = 1.0
        if signal_strength_dbm < -70.0:
            rssi_penalty = 1.0 + (abs(signal_strength_dbm + 70.0) * 0.05)

        per_effective = self.base_packet_error_rate + (
            self.wind_sensitivity_factor * aerodynamic_factor * rssi_penalty
        )
        # Cap PER at 0.45 to prevent divide by zero in standard physical model
        per_effective = min(0.45, per_effective)

        expected_retransmissions = 1.0 / (1.0 - per_effective)
        wind_delay_ms = (expected_retransmissions - 1.0) * self.slot_backoff_ms

        return round(max(0.0, wind_delay_ms), 4)
