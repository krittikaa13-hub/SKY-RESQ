import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Zap,
  PieChart,
  Radar as RadarIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from 'recharts';
import { BENCHMARK_ANALYTICS } from '../../data/mockData';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Performance Analytics & Benchmark Suite
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparative performance analytics validating SKY-RESQ Q quantum scalability against classical optimization baselines.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/60 font-semibold">
            Exponential Quantum Speedup Confirmed
          </span>
        </div>
      </div>

      {/* Grid Charts Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Line Chart: Classical Simulated Annealing vs QAOA Execution Time */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Routing Execution Time vs Swarm Scale (Classical vs QAOA)
            </h2>
            <span className="text-xs font-mono text-cyan-400">Log Scale Comparison</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BENCHMARK_ANALYTICS.classicalVsQuantum}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="size" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                />
                <Line type="monotone" dataKey="classicalMs" stroke="#EF4444" strokeWidth={2} name="Classical SA (ms)" />
                <Line type="monotone" dataKey="qaoaMs" stroke="#06B6D4" strokeWidth={2.5} name="SKY-RESQ QAOA (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Radar Chart: Multi-objective Performance Matrix */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <RadarIcon className="w-4 h-4 text-cyan-400" />
            Multi-Objective System Efficiency Matrix
          </h2>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={BENCHMARK_ANALYTICS.radarMetrics}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#cbd5e1' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar dataKey="score" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Scatter Plot: Qubit Coherence Times T1 vs T2 */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Hardware Qubit T1 vs T2 Coherence Scatter Plot (27 Qubits)
        </h2>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="t1" name="T1 Relaxation (μs)" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis dataKey="t2" name="T2 Dephasing (μs)" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                }}
              />
              <Scatter name="Qubits" data={BENCHMARK_ANALYTICS.qubitCoherence} fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
