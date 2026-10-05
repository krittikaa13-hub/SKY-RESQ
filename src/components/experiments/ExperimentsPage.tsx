import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  Download,
  Database,
} from 'lucide-react';
import { Experiment } from '../../types';
import { MOCK_EXPERIMENTS } from '../../data/mockData';

export const ExperimentsPage: React.FC = () => {
  const [experiments, setExperiments] = useState<Experiment[]>(MOCK_EXPERIMENTS);
  const [isRunningNew, setIsRunningNew] = useState<boolean>(false);

  const handleRunNewExperiment = () => {
    setIsRunningNew(true);
    setTimeout(() => {
      const newExp: Experiment = {
        id: `exp-${Date.now().toString().slice(-3)}`,
        name: `QAOA Swarm Test (Custom Run)`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
        backend: 'ibm_sherbrooke',
        qubits: 12,
        shots: 4096,
        layers: 3,
        cost: -19.12,
        fidelity: 0.995,
        timeSeconds: 1.18,
        status: 'Completed',
      };
      setExperiments([newExp, ...experiments]);
      setIsRunningNew(false);
    }, 1500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-400" />
            Experiment Benchmarks & Execution Log Registry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical QAOA ansatz run records, depolarizing noise test results, and fidelity comparisons.
          </p>
        </div>

        <button
          onClick={handleRunNewExperiment}
          disabled={isRunningNew}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
        >
          {isRunningNew ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Transpiling & Running...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Run New Experiment Benchmark</span>
            </>
          )}
        </button>
      </div>

      {/* Experiments Table */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white">Execution History ({experiments.length} Runs)</h2>
          <span className="text-xs font-mono text-cyan-400">JSON Export Available</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="p-2.5">Experiment Name</th>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Backend</th>
                <th className="p-2.5 text-right">Qubits</th>
                <th className="p-2.5 text-right">Shots</th>
                <th className="p-2.5 text-right">Layers</th>
                <th className="p-2.5 text-right">Cost ⟨H_C⟩</th>
                <th className="p-2.5 text-right">Fidelity</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {experiments.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-2.5 font-bold text-slate-200">{exp.name}</td>
                  <td className="p-2.5 text-slate-400 text-[11px]">{exp.timestamp}</td>
                  <td className="p-2.5 text-cyan-400 font-bold">{exp.backend}</td>
                  <td className="p-2.5 text-right text-slate-300">{exp.qubits}</td>
                  <td className="p-2.5 text-right text-slate-300">{exp.shots}</td>
                  <td className="p-2.5 text-right text-slate-300">p={exp.layers}</td>
                  <td className="p-2.5 text-right font-bold text-amber-400">{exp.cost}</td>
                  <td className="p-2.5 text-right font-bold text-emerald-400">
                    {(exp.fidelity * 100).toFixed(1)}%
                  </td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
