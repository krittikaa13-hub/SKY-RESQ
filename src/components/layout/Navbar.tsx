import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Bell,
  User,
  Activity,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { NotificationItem, QuantumBackend } from '../../types';

interface NavbarProps {
  activeBackend: QuantumBackend;
  shots: number;
  notifications: NotificationItem[];
  onSelectBackend: (backendId: string) => void;
  onRunSimulation: () => void;
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeBackend,
  shots,
  notifications,
  onSelectBackend,
  onRunSimulation,
  onMarkNotificationRead,
  onClearAllNotifications,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBackendDropdown, setShowBackendDropdown] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRunClick = () => {
    setIsSimulating(true);
    onRunSimulation();
    setTimeout(() => {
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#050816]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 flex items-center justify-between transition-all">
      {/* Left: Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-cyan-500 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-[#050816] rounded-[11px] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-wider text-lg text-white font-mono">
              SKY-RESQ Q
            </span>
            <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50 font-semibold">
              Emergency Response
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Drone and Robot Emergency Response Platform
          </p>
        </div>
      </div>

      {/* Middle: Backend & Simulation Status */}
      <div className="hidden lg:flex items-center space-x-4 bg-[#0F172A]/80 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-slate-300">
        {/* Backend Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBackendDropdown(!showBackendDropdown)}
            className="flex items-center space-x-2 hover:text-cyan-400 transition-colors focus:outline-none"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-200 font-medium">
              {activeBackend.name}
            </span>
            <span className="text-[10px] text-slate-400">({activeBackend.qubits}Q)</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showBackendDropdown && (
            <div className="absolute left-0 mt-2 w-56 rounded-xl bg-[#0F172A] border border-slate-700 shadow-xl py-2 z-50 text-slate-200">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Select Quantum Backend
              </div>
              <button
                onClick={() => {
                  onSelectBackend('ibm_sherbrooke');
                  setShowBackendDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-cyan-400">ibm_sherbrooke</div>
                  <div className="text-[10px] text-slate-400">127 Qubits • Hardware</div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  Online
                </span>
              </button>
              <button
                onClick={() => {
                  onSelectBackend('ibm_brisbane');
                  setShowBackendDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-slate-300">ibm_brisbane</div>
                  <div className="text-[10px] text-slate-400">127 Qubits • Hardware</div>
                </div>
                <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded">
                  Busy (14 Q)
                </span>
              </button>
              <button
                onClick={() => {
                  onSelectBackend('aer_simulator');
                  setShowBackendDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800/80 flex items-center justify-between border-t border-slate-800/60"
              >
                <div>
                  <div className="font-mono text-slate-300">aer_simulator</div>
                  <div className="text-[10px] text-slate-400">32 Qubits • GPU Simulator</div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="h-3 w-[1px] bg-slate-700" />

        <div className="flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Shots:</span>
          <span className="font-mono font-medium text-slate-200">{shots}</span>
        </div>

        <div className="h-3 w-[1px] bg-slate-700" />

        <div className="flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Fidelity:</span>
          <span className="font-mono font-medium text-emerald-400">99.4%</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Quick Execute QAOA button */}
        <button
          onClick={handleRunClick}
          disabled={isSimulating}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg shadow-md shadow-cyan-600/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSimulating ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              <span>Transpiling...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Run QAOA Matching</span>
              <span className="sm:hidden">Run</span>
            </>
          )}
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-[#0F172A] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-200">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-xs text-white">System Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-cyan-950 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={onClearAllNotifications}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                        !n.read ? 'bg-cyan-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          )}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-medium text-slate-200">Quantum Dev</div>
            <div className="text-[10px] text-cyan-400 font-mono">IBM Qiskit Lead</div>
          </div>
        </div>
      </div>
    </header>
  );
};
