/**
 * @file src/store/useSettingsStore.ts
 * Zustand store for Framework Settings, Qiskit Tokens & Aer Noise Parameters
 */

import { create } from 'zustand';

interface SettingsState {
  backendUrl: string;
  ibmToken: string;
  shots: number;
  noiseModel: string;
  theme: string;
  autoRebalance: boolean;
  logLevel: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

  // Actions
  setBackendUrl: (url: string) => void;
  setIbmToken: (token: string) => void;
  setShots: (shots: number) => void;
  setNoiseModel: (model: string) => void;
  setTheme: (theme: string) => void;
  setAutoRebalance: (enabled: boolean) => void;
  setLogLevel: (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  backendUrl: 'https://api.q-optima.quantum.ibm.com/v1',
  ibmToken: 'qiskit_ibm_runtime_live_key_9824f11209a...',
  shots: 4096,
  noiseModel: 'FakeSherbrooke',
  theme: 'Dark IBM Quantum',
  autoRebalance: true,
  logLevel: 'INFO',

  setBackendUrl: (backendUrl) => set({ backendUrl }),
  setIbmToken: (ibmToken) => set({ ibmToken }),
  setShots: (shots) => set({ shots }),
  setNoiseModel: (noiseModel) => set({ noiseModel }),
  setTheme: (theme) => set({ theme }),
  setAutoRebalance: (autoRebalance) => set({ autoRebalance }),
  setLogLevel: (logLevel) => set({ logLevel }),
}));
