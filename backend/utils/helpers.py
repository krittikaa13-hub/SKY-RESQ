"""
backend/utils/helpers.py
Helper Utilities for Backend Logging & Math Computations
"""

def normalize_trust_score(raw_val: float) -> float:
    return max(0.0, min(100.0, raw_val))
