/**
 * @file src/pages/IbmQuantumPage.tsx
 * IBM Quantum Hardware Backends Page
 */

import React from 'react';
import { IbmQuantumPage as IbmComponent } from '../components/ibm/IbmQuantumPage';
import { useQuantumStore } from '../store/useQuantumStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const IbmQuantumPage: React.FC = () => {
  const { activeBackend, backends, setActiveBackend } = useQuantumStore();
  const { addNotification } = useNotificationStore();

  const handleSelectBackend = (id: string) => {
    setActiveBackend(id);
    const target = backends.find((b) => b.id === id);
    if (target) {
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'quantum',
        title: 'Target Backend Updated',
        message: `Set default execution hardware to ${target.name} (${target.qubits} Qubits).`,
        time: 'Just now',
        read: false,
      });
    }
  };

  return (
    <IbmComponent
      activeBackend={activeBackend}
      onSelectBackend={handleSelectBackend}
    />
  );
};
