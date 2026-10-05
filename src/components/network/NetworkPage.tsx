import React, { useState, useEffect } from 'react';
import {
  Network,
  ShieldAlert,
  ShieldCheck,
  Wind,
  Radio,
  Zap,
  Activity,
  AlertTriangle,
  RefreshCw,
  Info,
  CheckCircle2,
  XCircle,
  Sliders,
  Filter,
} from 'lucide-react';
import { UAVNode, NetworkPacket } from '../../types';

interface NetworkPageProps {
  nodes: UAVNode[];
  packets: NetworkPacket[];
  onToggleQuarantine: (nodeId: string) => void;
  onResetTrust: (nodeId: string) => void;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({
  nodes,
  packets,
  onToggleQuarantine,
  onResetTrust,
}) => {
  const [selectedNode, setSelectedNode] = useState<UAVNode | null>(nodes[0]);
  const [filterCluster, setFilterCluster] = useState<string>('All');
  const [windSpeed, setWindSpeed] = useState<number>(14);
  const [windDirection, setWindDirection] = useState<string>('NW');
  const [animatedPacketPos, setAnimatedPacketPos] = useState<number>(0);

  // Animate packets along links
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPacketPos((prev) => (prev + 5) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const filteredNodes =
    filterCluster === 'All' ? nodes : nodes.filter((n) => n.cluster === filterCluster);

  const getStatusBadge = (status: UAVNode['status']) => {
    switch (status) {
      case 'healthy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">Healthy</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-950 text-amber-400 border border-amber-800/60 font-semibold">Warning</span>;
      case 'compromised':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-950 text-red-400 border border-red-800/60 font-bold animate-pulse">Compromised</span>;
      case 'quarantined':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-950 text-purple-400 border border-purple-800/60 font-semibold">Quarantined</span>;
    }
  };

  const getNodeColor = (status: UAVNode['status']) => {
    switch (status) {
      case 'healthy':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'compromised':
        return '#EF4444';
      case 'quarantined':
        return '#A855F7';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="w-6 h-6 text-cyan-400" />
            Interactive UAV Swarm Topology & Packet Routing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time spatial visualization of 12 UAV swarm nodes, active A2A packet streams, wind vector perturbations, and trust ratings.
          </p>
        </div>

        {/* Environmental Controls */}
        <div className="flex items-center space-x-4 bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-cyan-400 animate-spin" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Wind Vector</div>
              <div className="font-mono text-slate-200">
                {windSpeed} km/h {windDirection}
              </div>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800" />

          <button
            onClick={() => setWindSpeed((w) => (w >= 30 ? 10 : w + 5))}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors"
          >
            Adjust Wind
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Interactive Swarm Map Canvas */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-2xl relative min-h-[480px] flex flex-col justify-between overflow-hidden">
          {/* Map Controls */}
          <div className="flex items-center justify-between z-10 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300">Swarm Area (2.5 km²)</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                A2A Mesh Protocol
              </span>
            </div>

            {/* Filter by Cluster */}
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterCluster}
                onChange={(e) => setFilterCluster(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="All">All Clusters</option>
                <option value="Primary Relay">Primary Relay</option>
                <option value="Alpha Squadron">Alpha Squadron</option>
                <option value="Beta Squadron">Beta Squadron</option>
                <option value="Gamma Squadron">Gamma Squadron</option>
              </select>
            </div>
          </div>

          {/* Map Visual Stage */}
          <div className="relative w-full h-[400px] bg-[#050816] rounded-xl border border-slate-800/80 bg-grid-pattern overflow-hidden my-2">
            {/* Wind Drift Overlay Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-radial-glow" />

            {/* SVG Connecting Links and Animated Packets */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* Mesh Links between nodes */}
              {filteredNodes.map((node, i) =>
                filteredNodes.slice(i + 1).map((other) => {
                  const dist = Math.hypot(node.x - other.x, node.y - other.y);
                  if (dist > 35) return null; // limit mesh link range

                  const isCompromisedLink =
                    node.status === 'compromised' || other.status === 'compromised';

                  return (
                    <g key={`link-${node.id}-${other.id}`}>
                      <line
                        x1={`${node.x}%`}
                        y1={`${node.y}%`}
                        x2={`${other.x}%`}
                        y2={`${other.y}%`}
                        stroke={isCompromisedLink ? '#EF4444' : '#2563EB'}
                        strokeWidth={isCompromisedLink ? '1.5' : '1'}
                        strokeDasharray={isCompromisedLink ? '4 4' : 'none'}
                        opacity={isCompromisedLink ? 0.8 : 0.35}
                      />

                      {/* Animated Packet along active link */}
                      {!isCompromisedLink && (
                        <circle
                          cx={`${node.x + ((other.x - node.x) * animatedPacketPos) / 100}%`}
                          cy={`${node.y + ((other.y - node.y) * animatedPacketPos) / 100}%`}
                          r="3"
                          fill="#06B6D4"
                        >
                          <animate
                            attributeName="opacity"
                            values="0.4;1;0.4"
                            dur="1.5s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })
              )}
            </svg>

            {/* Interactive UAV Node Markers */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.status);

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 transition-all hover:scale-125"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  {/* Ping Ring for compromised/selected */}
                  <div
                    className="absolute -inset-2 rounded-full opacity-60 animate-ping"
                    style={{ backgroundColor: color }}
                  />

                  {/* Marker Circle */}
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-[10px] font-bold shadow-lg transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-900 text-cyan-300 ring-2 ring-cyan-400 scale-110'
                        : 'border-slate-700 bg-slate-900 text-slate-200'
                    }`}
                    style={{ borderColor: isSelected ? '#06B6D4' : color }}
                  >
                    <Radio className="w-3.5 h-3.5" style={{ color }} />
                  </div>

                  {/* Hover Label */}
                  <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-mono text-slate-200 shadow-lg pointer-events-none group-hover:opacity-100 opacity-80 transition-opacity">
                    {node.name.split(' ')[0]} • T:{node.trustScore}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Healthy
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Compromised (Attack)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Quarantined
              </span>
            </div>
            <div className="text-[11px] font-mono text-cyan-400">
              Active Packets Stream: {packets.length}
            </div>
          </div>
        </div>

        {/* Right: Selected Node Details & Inspection Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedNode.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Cluster: {selectedNode.cluster}
                  </span>
                </div>
                {getStatusBadge(selectedNode.status)}
              </div>

              {/* Trust vs Risk Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Trust Score:</span>
                    <span className="font-mono font-bold text-cyan-400">
                      {selectedNode.trustScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all"
                      style={{ width: `${selectedNode.trustScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Risk Score:</span>
                    <span className="font-mono font-bold text-red-400">
                      {selectedNode.riskScore}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all"
                      style={{ width: `${selectedNode.riskScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Node Telemetry Details */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Battery Level</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">
                    {selectedNode.battery}%
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Latency</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">
                    {selectedNode.latency} ms
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Total Packets</div>
                  <div className="font-mono font-bold text-slate-200 mt-0.5">
                    {selectedNode.packetCount.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Malicious Packets</div>
                  <div className="font-mono font-bold text-red-400 mt-0.5">
                    {selectedNode.maliciousPackets}
                  </div>
                </div>
              </div>

              {/* Node Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => onToggleQuarantine(selectedNode.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors ${
                    selectedNode.status === 'quarantined'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                      : 'bg-red-950/80 text-red-400 border border-red-800 hover:bg-red-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    {selectedNode.status === 'quarantined'
                      ? 'Lift Quarantine Protocol'
                      : 'Isolate & Quarantine Node'}
                  </span>
                </button>

                <button
                  onClick={() => onResetTrust(selectedNode.id)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Reset Beta-Reputation Score</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 text-center text-slate-500 text-xs">
              Click any node on the map to inspect telemetry & trigger quarantine.
            </div>
          )}

          {/* Live Packet Logs Widget */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Packet Telemetry Stream
            </h4>

            <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto custom-scrollbar pr-1">
              {packets.map((pkt) => (
                <div
                  key={pkt.id}
                  className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="text-cyan-400 font-bold">{pkt.id}</span>
                    <span className="text-slate-400 ml-2">
                      {pkt.sourceId} → {pkt.targetId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-500">{pkt.delayMs}ms</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] ${
                        pkt.status === 'delivered'
                          ? 'bg-emerald-950 text-emerald-400'
                          : pkt.status === 'intercepted'
                          ? 'bg-red-950 text-red-400'
                          : 'bg-purple-950 text-purple-400'
                      }`}
                    >
                      {pkt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
