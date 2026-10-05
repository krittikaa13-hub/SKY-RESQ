/**
 * @file src/store/useQuantumStore.ts
 * Zustand store for Quantum Hardware Backends, QAOA State & Gate Circuits
 */

import { create } from 'zustand';
import {
  QuantumBackend,
  QaoaState,
  QuantumCircuitSpec,
  BlochSphereState,
} from '../types';
import {
  QUANTUM_BACKENDS,
  MOCK_QAOA_STATE,
  MOCK_CIRCUIT_SPEC,
} from '../data/mockData';

interface QuantumState {
  backends: QuantumBackend[];
  activeBackend: QuantumBackend;
  qaoaState: QaoaState;
  circuitSpec: QuantumCircuitSpec;
  blochState: BlochSphereState;
  isTranspiling: boolean;
  isExecuting: boolean;

  // Actions
  setActiveBackend: (backendId: string) => void;
  updateQaoaLayers: (p: number) => void;
  setCircuitSpec: (spec: QuantumCircuitSpec) => void;
  setBlochState: (bloch: BlochSphereState) => void;
  setTranspiling: (val: boolean) => void;
  setExecuting: (val: boolean) => void;
  updateAnsatzParams: (gamma: number[], beta: number[]) => void;
}

export const useQuantumStore = create<QuantumState>((set) => ({
  backends: QUANTUM_BACKENDS,
  activeBackend: QUANTUM_BACKENDS[0],
  qaoaState: MOCK_QAOA_STATE,
  circuitSpec: MOCK_CIRCUIT_SPEC,
  blochState: {
    theta: 0.95,
    phi: 1.4,
    stateVector: {
      realAlpha: 0.891,
      imagAlpha: 0.0,
      realBeta: 0.076,
      imagBeta: 0.447,
    },
  },
  isTranspiling: false,
  isExecuting: false,

  setActiveBackend: (backendId) =>
    set((state) => {
      const found = state.backends.find((b) => b.id === backendId);
      return found ? { activeBackend: found } : {};
    }),

  updateQaoaLayers: (p) =>
    set((state) => ({
      qaoaState: {
        ...state.qaoaState,
        pLayers: p,
        approximationRatio: Math.min(0.998, 0.95 + p * 0.012),
      },
    })),

  setCircuitSpec: (circuitSpec) => set({ circuitSpec }),
  setBlochState: (blochState) => set({ blochState }),
  setTranspiling: (isTranspiling) => set({ isTranspiling }),
  setExecuting: (isExecuting) => set({ isExecuting }),

  updateAnsatzParams: (gamma, beta) =>
    set((state) => ({
      qaoaState: {
        ...state.qaoaState,
        gamma,
        beta,
      },
    })),
}));
