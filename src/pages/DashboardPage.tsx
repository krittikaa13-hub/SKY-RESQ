/**
 * @file src/pages/DashboardPage.tsx
 * Swarm Quantum Command Center Dashboard Page
 */

import React, { useEffect } from 'react';
import { HomeDashboard } from '../components/dashboard/HomeDashboard';
import { useNetworkStore } from '../store/useNetworkStore';
import { useAttackStore } from '../store/useAttackStore';
import { useQuantumStore } from '../store/useQuantumStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { ARCHITECTURE_BLOCKS } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { nodes, setNodes } = useNetworkStore();
  const { attacks } = useAttackStore();
  const { activeBackend } = useQuantumStore();
  const { addNotification } = useNotificationStore();

  const handleRunSimulation = () => {
    setNodes(
      nodes.map((node) => {
        if (node.status === 'compromised') {
          return { ...node, trustScore: Math.min(100, node.trustScore + 15) };
        }
        return node;
      })
    );

    addNotification({
      id: `notif-${Date.now()}`,
      type: 'quantum',
      title: 'QAOA Re-route Complete',
      message: `Executed p=3 ansatz on ${activeBackend.name}. Optimal bitstring ground state verified.`,
      time: 'Just now',
      read: false,
    });
  };

  const handleSelectTab = (tab: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/',
      network: '/network',
      quantum: '/quantum',
      attacks: '/attack',
      trust: '/trust',
      qaoa: '/qaoa',
      circuits: '/quantum',
      ibm: '/ibm',
      analytics: '/analytics',
      experiments: '/experiments',
      research: '/research',
      settings: '/settings',
    };
    if (routeMap[tab]) {
      navigate(routeMap[tab]);
    }
  };

  return (
    <HomeDashboard
      nodes={nodes}
      attacks={attacks}
      backend={activeBackend}
      archBlocks={ARCHITECTURE_BLOCKS}
      onSelectTab={handleSelectTab}
      onRunSimulation={handleRunSimulation}
    />
  );
};
