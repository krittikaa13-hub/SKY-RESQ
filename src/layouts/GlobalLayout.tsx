/**
 * @file src/layouts/GlobalLayout.tsx
 * Enterprise Global Layout Component featuring Sidebar, Navbar, Notification Panel, Footer & Route Outlet
 */

import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { NavigationTab } from '../types';
import { useQuantumStore } from '../store/useQuantumStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAttackStore } from '../store/useAttackStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { mockWsStreamer } from '../services/websocket/mockWsServer';
import { ShieldCheck, Cpu, Activity, Heart, Sparkles } from 'lucide-react';

export const GlobalLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { activeBackend, setActiveBackend, qaoaState } = useQuantumStore();
  const { notifications, markAsRead, clearAll, addNotification } = useNotificationStore();
  const { attacks } = useAttackStore();
  const { setNodes, nodes } = useNetworkStore();

  // Start real-time telemetry websocket stream on mount
  useEffect(() => {
    mockWsStreamer.start();
    return () => mockWsStreamer.stop();
  }, []);

  // Determine active tab from current URL pathname
  const getActiveTabFromPath = (path: string): NavigationTab => {
    if (path === '/' || path === '') return 'dashboard';
    if (path.startsWith('/network')) return 'network';
    if (path.startsWith('/optimization')) return 'quantum';
    if (path.startsWith('/attack')) return 'attacks';
    if (path.startsWith('/trust')) return 'trust';
    if (path.startsWith('/qaoa')) return 'qaoa';
    if (path.startsWith('/quantum')) return 'circuits';
    if (path.startsWith('/ibm')) return 'ibm';
    if (path.startsWith('/analytics')) return 'analytics';
    if (path.startsWith('/experiments')) return 'experiments';
    if (path.startsWith('/research')) return 'research';
    if (path.startsWith('/settings')) return 'settings';
    return 'dashboard';
  };

  const activeTab = getActiveTabFromPath(location.pathname);

  const handleSelectTab = (tab: NavigationTab) => {
    const routeMap: Record<NavigationTab, string> = {
      dashboard: '/',
      network: '/network',
      quantum: '/optimization',
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
    navigate(routeMap[tab]);
  };

  const handleSelectBackend = (backendId: string) => {
    setActiveBackend(backendId);
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'quantum',
      title: 'Target Backend Updated',
      message: `Set default execution hardware to backend ${backendId}`,
      time: 'Just now',
      read: false,
    });
  };

  const handleRunSimulation = () => {
    setNodes(
      nodes.map((n) =>
        n.status === 'compromised'
          ? { ...n, trustScore: Math.min(100, n.trustScore + 15) }
          : n
      )
    );
    addNotification({
      id: `notif-${Date.now()}`,
      type: 'quantum',
      title: 'QAOA Re-route Triggered',
      message: `Executed variational optimizer pass on ${activeBackend.name}.`,
      time: 'Just now',
      read: false,
    });
  };

  const unmitigatedAttacksCount = attacks.filter((a) => !a.mitigated).length;

  return (
    <div className="bg-[#050816] min-h-screen text-[#F8FAFC] flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <Navbar
        activeBackend={activeBackend}
        shots={qaoaState.shots}
        notifications={notifications}
        onSelectBackend={handleSelectBackend}
        onRunSimulation={handleRunSimulation}
        onMarkNotificationRead={markAsRead}
        onClearAllNotifications={clearAll}
      />

      <div className="flex flex-1 relative">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          attackCount={unmitigatedAttacksCount}
        />

        {/* Main Route Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#050816] bg-radial-glow overflow-y-auto min-h-[calc(100vh-57px)]">
          <main className="flex-1">
            <Outlet />
          </main>

          {/* Sticky Enterprise Footer */}
          <footer className="border-t border-slate-800/80 bg-[#0F172A]/80 backdrop-blur-md px-6 py-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> SKY-RESQ Q Platform
              </span>
              <span>•</span>
              <span className="text-slate-300 italic">“SKY-RESQ does not simply dispatch a drone. It determines the best feasible responder for the emergency.”</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <Activity className="w-3.5 h-3.5" /> Telemetry Active (200ms)
              </span>
              <span>•</span>
              <span className="text-slate-400">Drone + Robot + Ambulance Optimization</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
