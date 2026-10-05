import React from 'react';
import {
  LayoutDashboard,
  Network,
  Cpu,
  ShieldAlert,
  ShieldCheck,
  Binary,
  CircuitBoard,
  Server,
  BarChart3,
  FlaskConical,
  BookOpen,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  attackCount: number;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  attackCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network', label: 'Network Simulation', icon: Network, badge: '12 Nodes' },
    { id: 'quantum', label: 'Quantum Optimization', icon: Cpu, badge: 'p=3' },
    {
      id: 'attacks',
      label: 'Attack Detection',
      icon: ShieldAlert,
      badge: attackCount > 0 ? attackCount : undefined,
      badgeColor: 'bg-red-950 text-red-400 border-red-800/50',
    },
    { id: 'trust', label: 'Trust Engine', icon: ShieldCheck, badge: '94.2' },
    { id: 'qaoa', label: 'QAOA', icon: Binary },
    { id: 'circuits', label: 'Quantum Circuits', icon: CircuitBoard },
    { id: 'ibm', label: 'IBM Quantum', icon: Server, badge: '127Q' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'research', label: 'Research', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#050816] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px] select-none">
      {/* Navigation Links */}
      <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Core Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${
                      item.badgeColor ||
                      (isActive
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-800/60'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/60')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Widget */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0F172A]/40 m-2 rounded-xl border">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-200 mb-1">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>SKY-RESQ Optimizer</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal mb-2">
          Drone + Robot + Ambulance QUBO / QAOA Solver.
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="text-cyan-400 font-semibold">SKY-RESQ Q v2.4</span>
          <span className="text-emerald-400 font-semibold">● Verified</span>
        </div>
      </div>
    </aside>
  );
};
