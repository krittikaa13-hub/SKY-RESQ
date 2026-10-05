/**
 * @file src/pages/QuantumCircuitPage.tsx
 * Qiskit Transpiler & Gate Assembly Pipeline Page
 */

import React from 'react';
import { QuantumCircuitsPage as CircuitComponent } from '../components/circuits/QuantumCircuitsPage';
import { useQuantumStore } from '../store/useQuantumStore';

export const QuantumCircuitPage: React.FC = () => {
  const { circuitSpec } = useQuantumStore();
  return <CircuitComponent circuitSpec={circuitSpec} />;
};
