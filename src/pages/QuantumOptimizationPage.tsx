/**
 * @file src/pages/QuantumOptimizationPage.tsx
 * Quantum QAOA Optimization & QUBO Solver Page
 */

import React from 'react';
import { QuantumPage } from '../components/quantum/QuantumPage';
import { useQuantumStore } from '../store/useQuantumStore';

export const QuantumOptimizationPage: React.FC = () => {
  const { circuitSpec } = useQuantumStore();
  return <QuantumPage circuitSpec={circuitSpec} />;
};
