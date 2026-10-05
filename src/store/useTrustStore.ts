/**
 * @file src/store/useTrustStore.ts
 * Zustand store for Beta-Reputation & EigenTrust Calculation Metrics
 */

import { create } from 'zustand';
import { TrustEvolutionData } from '../types';
import { TRUST_EVOLUTION_TIMELINE } from '../data/mockData';

interface TrustState {
  timeline: TrustEvolutionData[];
  decayAlpha: number; // 0.85
  discountFactorBeta: number; // 0.92
  consensusWeightGamma: number; // 0.15

  // Actions
  setTimeline: (timeline: TrustEvolutionData[]) => void;
  updateParameters: (alpha: number, beta: number, gamma: number) => void;
  appendTimelineStep: (data: TrustEvolutionData) => void;
}

export const useTrustStore = create<TrustState>((set) => ({
  timeline: TRUST_EVOLUTION_TIMELINE,
  decayAlpha: 0.85,
  discountFactorBeta: 0.92,
  consensusWeightGamma: 0.15,

  setTimeline: (timeline) => set({ timeline }),
  updateParameters: (decayAlpha, discountFactorBeta, consensusWeightGamma) =>
    set({ decayAlpha, discountFactorBeta, consensusWeightGamma }),
  appendTimelineStep: (data) =>
    set((state) => ({ timeline: [...state.timeline, data] })),
}));
