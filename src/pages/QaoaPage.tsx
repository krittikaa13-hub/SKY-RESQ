/**
 * @file src/pages/QaoaPage.tsx
 * QAOA Quantum Variational Optimization Page
 */

import React from 'react';
import { QaoaPage as QaoaComponent } from '../components/qaoa/QaoaPage';
import { useQuantumStore } from '../store/useQuantumStore';

export const QaoaPage: React.FC = () => {
  const { qaoaState, updateQaoaLayers } = useQuantumStore();

  return (
    <QaoaComponent
      qaoaState={qaoaState}
      onUpdateLayers={updateQaoaLayers}
    />
  );
};
