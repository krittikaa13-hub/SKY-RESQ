import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Activity,
  Radio,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AttackIncident } from '../../types';

interface AttackDetectionPageProps {
  attacks: AttackIncident[];
  onMitigateAttack: (attackId: string) => void;
}

const TRAFFIC_ANOMALY_DATA = [
  { time: '10:00', normalKbps: 420, attackKbps: 430, delayMs: 8 },
  { time: '10:10', normalKbps: 440, attackKbps: 450, delayMs: 9 },
  { time: '10:20', normalKbps: 410, attackKbps: 890, delayMs: 140 }, // Spike 1: Blackhole
  { time: '10:30', normalKbps: 430, attackKbps: 440, delayMs: 10 },
  { time: '10:38', normalKbps: 425, attackKbps: 1420, delayMs: 210 }, // Spike 2: Sybil Attack
  { time: '10:45', normalKbps: 435, attackKbps: 440, delayMs: 11 },
];

export const AttackDetectionPage: React.FC<AttackDetectionPageProps> = ({
  attacks,
  onMitigateAttack,
}) => {
  const [selectedAttack, setSelectedAttack] = useState<AttackIncident | null>(
    attacks[0] || null
  );
  const [filterSeverity, setFilterSeverity] = useState<string>('All');

  const filteredAttacks =
    filterSeverity === 'All'
      ? attacks
      : attacks.filter((a) => a.severity === filterSeverity);

  const getSeverityBadge = (severity: AttackIncident['severity']) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800 animate-pulse">Critical</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800">High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-950 text-blue-400 border border-blue-800">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300">Low</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400" />
            Adversarial Cybersecurity Attack Inspector & Detection Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hybrid Quantum-Classical Anomaly Engine detecting Sybil spoofing, Blackhole drops, RF Jamming, and False Data Injection.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-red-400 bg-red-950 px-3 py-1 rounded-full border border-red-800/60 font-semibold">
            {attacks.filter((a) => !a.mitigated).length} Active Threat Vector
          </span>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/60 font-semibold">
            {attacks.filter((a) => a.mitigated).length} Mitigated
          </span>
        </div>
      </div>

      {/* Traffic & Packet Delay Anomaly Chart */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Traffic Anomaly & Packet Delay Telemetry (Normal vs Adversarial)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Spikes indicate Sybil ghost identity flooding and Blackhole routing table corruption.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2.5 py-1 rounded border border-amber-800/60">
            Threshold Trigger: &gt; 100 ms
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TRAFFIC_ANOMALY_DATA}>
              <defs>
                <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="normalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                }}
              />
              <Area
                type="monotone"
                dataKey="attackKbps"
                stroke="#EF4444"
                fillOpacity={1}
                fill="url(#attackGrad)"
                name="Adversarial Traffic (Kbps)"
              />
              <Area
                type="monotone"
                dataKey="normalKbps"
                stroke="#2563EB"
                fillOpacity={1}
                fill="url(#normalGrad)"
                name="Normal Baseline Traffic (Kbps)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline List & Evidence Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Incident Timeline List */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Incidents Timeline
            </h2>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
            {filteredAttacks.map((atk) => {
              const isSelected = selectedAttack?.id === atk.id;

              return (
                <div
                  key={atk.id}
                  onClick={() => setSelectedAttack(atk)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-500 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${
                          atk.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                        }`}
                      />
                      {atk.type} Attack ({atk.nodeName})
                    </span>
                    {getSeverityBadge(atk.severity)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1">
                    <span>{atk.timestamp}</span>
                    <span className="text-cyan-400 font-semibold">{atk.confidence}% Conf.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Evidence & Root Cause Panel */}
        <div className="lg:col-span-7 space-y-4">
          {selectedAttack ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-lg text-white">
                      {selectedAttack.type} Attack Vector
                    </h3>
                    {getSeverityBadge(selectedAttack.severity)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Target Node: <span className="text-cyan-300 font-bold">{selectedAttack.nodeName}</span> ({selectedAttack.nodeId})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Detection Confidence</div>
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {selectedAttack.confidence}%
                  </div>
                </div>
              </div>

              {/* Forensic Evidence Box */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Forensic Forensic Evidence Log
                </label>
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl font-mono text-xs text-slate-200 leading-relaxed">
                  {selectedAttack.evidence}
                </div>
              </div>

              {/* Root Cause Analysis */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
                  Root Cause Analysis
                </label>
                <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300 leading-relaxed">
                  {selectedAttack.rootCause}
                </div>
              </div>

              {/* Mitigation Status & Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-400">Status:</span>
                  {selectedAttack.mitigated ? (
                    <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mitigated & Re-routed
                    </span>
                  ) : (
                    <span className="text-red-400 font-semibold font-mono flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Active Threat Action Required
                    </span>
                  )}
                </div>

                {!selectedAttack.mitigated && (
                  <button
                    onClick={() => onMitigateAttack(selectedAttack.id)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-red-600/20 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Execute QAOA Quarantine Mitigation</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
              Select an incident from the timeline to inspect evidence & trigger quantum mitigation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
