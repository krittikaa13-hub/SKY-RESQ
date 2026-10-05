/**
 * @file src/store/useSimulationStore.ts
 * Zustand store for Real-Time Telemetry Simulation Controls
 */

import { create } from 'zustand';

interface SimulationState {
  isRunning: boolean;
  speed: number; // 1x, 2x, 5x
  currentStep: number;
  totalPacketsProcessed: number;
  quantumSpeedupRatio: number;
  lastSimulatedAt: string | null;

  // Actions
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: number) => void;
  incrementStep: () => void;
  addProcessedPackets: (count: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isRunning: true,
  speed: 1,
  currentStep: 42,
  totalPacketsProcessed: 148200,
  quantumSpeedupRatio: 18.4,
  lastSimulatedAt: new Date().toISOString(),

  startSimulation: () => set({ isRunning: true, lastSimulatedAt: new Date().toISOString() }),
  pauseSimulation: () => set({ isRunning: false }),
  resetSimulation: () => set({ currentStep: 0, totalPacketsProcessed: 0, isRunning: false }),
  setSpeed: (speed) => set({ speed }),
  incrementStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  addProcessedPackets: (count) =>
    set((state) => ({ totalPacketsProcessed: state.totalPacketsProcessed + count })),
}));
