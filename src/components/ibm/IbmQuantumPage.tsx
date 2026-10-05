import React from 'react';
import {
  Server,
  Cpu,
  Activity,
  CheckCircle2,
  Zap,
  Clock,
  Layers,
  Key,
  Database,
  BarChart2,
} from 'lucide-react';
import { QuantumBackend } from '../../types';
import { QUANTUM_BACKENDS, BENCHMARK_ANALYTICS } from '../../data/mockData';

interface IbmQuantumPageProps {
  activeBackend: QuantumBackend;
  onSelectBackend: (backendId: string) => void;
}

export const IbmQuantumPage: React.FC<IbmQuantumPageProps> = ({
  activeBackend,
  onSelectBackend,
}) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" />
            IBM Quantum Runtime Service & Hardware Calibration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of 127-qubit IBM Eagle processor backends, execution queues, and hardware coherence relaxation times.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800/60 font-semibold">
            IBM Qiskit Runtime V2
          </span>
        </div>
      </div>

      {/* Backend Hardware Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {QUANTUM_BACKENDS.map((b) => {
          const isSelected = activeBackend.id === b.id;

          return (
            <div
              key={b.id}
              onClick={() => onSelectBackend(b.id)}
              className={`bg-[#0F172A] border rounded-2xl p-5 cursor-pointer transition-all space-y-3 ${
                isSelected
                  ? 'border-cyan-500 shadow-xl shadow-cyan-950/40 bg-slate-900/90'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sm text-white">{b.name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    b.status === 'online'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Qubit Count:</span>
                  <span className="text-cyan-400 font-bold">{b.qubits} Qubits</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Queue Length:</span>
                  <span className="text-slate-200">{b.queueLength} Jobs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Avg T1 Relaxation:</span>
                  <span className="text-slate-200">{b.avgT1} μs</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Readout Error:</span>
                  <span className="text-emerald-400">{(b.readoutError * 100).toFixed(2)}%</span>
                </div>
              </div>

              {isSelected && (
                <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-mono flex items-center justify-between">
                  <span>Selected Active Target</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Qubit Coherence Metrics (T1 / T2 Relaxation Heatmap Table) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Hardware Calibration Matrix (27 Qubit T1 / T2 Coherence Breakdown)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              IBM Eagle processor calibration parameters used by Qiskit layout mapping passes.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Last Calibrated: 15 mins ago</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-2">
          {BENCHMARK_ANALYTICS.qubitCoherence.map((q) => (
            <div
              key={q.qubit}
              className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl text-center font-mono space-y-0.5"
            >
              <div className="text-[11px] font-bold text-cyan-400">{q.qubit}</div>
              <div className="text-[10px] text-slate-300">T1: {q.t1}μs</div>
              <div className="text-[10px] text-slate-400">T2: {q.t2}μs</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
