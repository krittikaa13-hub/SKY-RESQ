/**
 * @file src/store/useExperimentStore.ts
 * Zustand store for Benchmark Experiments & Telemetry Log History
 */

import { create } from 'zustand';
import { Experiment } from '../types';
import { MOCK_EXPERIMENTS } from '../data/mockData';

interface ExperimentState {
  experiments: Experiment[];
  isSubmitting: boolean;

  // Actions
  setExperiments: (experiments: Experiment[]) => void;
  addExperiment: (experiment: Experiment) => void;
  setSubmitting: (val: boolean) => void;
}

export const useExperimentStore = create<ExperimentState>((set) => ({
  experiments: MOCK_EXPERIMENTS,
  isSubmitting: false,

  setExperiments: (experiments) => set({ experiments }),
  addExperiment: (exp) =>
    set((state) => ({ experiments: [exp, ...state.experiments] })),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
}));
