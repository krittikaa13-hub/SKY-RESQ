"""
backend/config/settings.py
Q-OPTIMA System Environment Settings
"""

import os

class Settings:
    PROJECT_NAME: str = "Q-OPTIMA Quantum Framework"
    VERSION: str = "2.4.0"
    API_PREFIX: str = "/api"
    QISKIT_IBM_TOKEN: str = os.getenv("QISKIT_IBM_TOKEN", "mock_ibm_runtime_token")
    DEFAULT_BACKEND: str = "ibm_sherbrooke"
    NUM_QUBITS: int = 12

settings = Settings()
