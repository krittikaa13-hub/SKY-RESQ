import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Sliders,
  RefreshCw,
  AlertTriangle,
  Lock,
  Search,
  Filter,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { UAVNode, TrustEvolutionData } from '../../types';
import { TRUST_EVOLUTION_TIMELINE } from '../../data/mockData';

interface TrustEnginePageProps {
  nodes: UAVNode[];
  onToggleQuarantine: (nodeId: string) => void;
  onResetTrust: (nodeId: string) => void;
}

export const TrustEnginePage: React.FC<TrustEnginePageProps> = ({
  nodes,
  onToggleQuarantine,
  onResetTrust,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredNodes = nodes.filter((n) =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgTrust = (
    nodes.reduce((acc, n) => acc + n.trustScore, 0) / nodes.length
  ).toFixed(1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            Dynamic Beta-Reputation & EigenTrust Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Computes multi-agent trust ratings ($T_i \in [0, 100]$) using direct packet interaction history and peer consensus discounting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800/60 font-semibold">
            Mean Swarm Trust: {avgTrust}%
          </span>
        </div>
      </div>

      {/* Historical Trust Evolution Chart */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Trust Evolution Timeline across Swarm Time Steps
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Note the sharp trust decay on compromised node UAV-Echo (node3) and recovery upon QAOA re-routing.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800/60">
            EigenTrust V2 Algorithm
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={TRUST_EVOLUTION_TIMELINE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timeStep" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                }}
              />
              <Line type="monotone" dataKey="avgTrust" stroke="#06B6D4" strokeWidth={3} name="Average Swarm Trust" />
              <Line type="monotone" dataKey="node0" stroke="#10B981" strokeWidth={1.5} name="UAV-Alfa" />
              <Line type="monotone" dataKey="node2" stroke="#F59E0B" strokeWidth={1.5} name="UAV-Delta" />
              <Line type="monotone" dataKey="node3" stroke="#EF4444" strokeWidth={2} name="UAV-Echo (Compromised)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trust Heatmap Matrix & Node Ranking Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Swarm Trust Heatmap Grid */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            Interactive Node Trust Matrix Heatmap
          </h2>

          <div className="grid grid-cols-4 gap-2.5">
            {nodes.map((node) => {
              const bg =
                node.trustScore >= 85
                  ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
                  : node.trustScore >= 60
                  ? 'bg-amber-950/80 border-amber-800 text-amber-300'
                  : 'bg-red-950/80 border-red-800 text-red-300';

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between h-20 font-mono transition-all hover:scale-105 cursor-pointer ${bg}`}
                >
                  <div className="text-[10px] font-bold truncate">{node.name.split(' ')[0]}</div>
                  <div className="text-base font-extrabold">{node.trustScore}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Node Ranking & Trust Control Table */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white">Node Beta-Reputation Ranking</h2>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search UAV node..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="p-2">Node Name</th>
                  <th className="p-2">Cluster</th>
                  <th className="p-2 text-right">Trust Score</th>
                  <th className="p-2 text-right">Risk Score</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredNodes.map((node) => (
                  <tr key={node.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-2 font-bold text-slate-200">{node.name}</td>
                    <td className="p-2 text-slate-400 text-[11px]">{node.cluster}</td>
                    <td className="p-2 text-right font-bold text-cyan-400">
                      {node.trustScore}%
                    </td>
                    <td className="p-2 text-right font-bold text-red-400">
                      {node.riskScore}%
                    </td>
                    <td className="p-2 text-center space-x-2">
                      <button
                        onClick={() => onToggleQuarantine(node.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                          node.status === 'quarantined'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800 hover:bg-red-900'
                        }`}
                      >
                        {node.status === 'quarantined' ? 'Lift' : 'Quarantine'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
