/**
 * @file src/pages/NetworkPage.tsx
 * Swarm Network Topology Page
 */

import React from 'react';
import { NetworkPage as NetworkComponent } from '../components/network/NetworkPage';
import { useNetworkStore } from '../store/useNetworkStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const NetworkPage: React.FC = () => {
  const { nodes, packets, toggleQuarantine, resetTrust } = useNetworkStore();
  const { addNotification } = useNotificationStore();

  const handleToggleQuarantine = (id: string) => {
    toggleQuarantine(id);
    const node = nodes.find((n) => n.id === id);
    const isQuarantined = node?.status === 'quarantined';
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'alert',
      title: isQuarantined ? 'Node Isolation Lifted' : 'Quarantine Protocol Initiated',
      message: `${node?.name || id} ${isQuarantined ? 'restored to active mesh.' : 'isolated from routing.'}`,
      time: 'Just now',
      read: false,
    });
  };

  const handleResetTrust = (id: string) => {
    resetTrust(id);
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'system',
      title: 'Trust Score Reset',
      message: `Reset Beta-Reputation score to 95.0% for selected UAV node.`,
      time: 'Just now',
      read: false,
    });
  };

  return (
    <NetworkComponent
      nodes={nodes}
      packets={packets}
      onToggleQuarantine={handleToggleQuarantine}
      onResetTrust={handleResetTrust}
    />
  );
};
