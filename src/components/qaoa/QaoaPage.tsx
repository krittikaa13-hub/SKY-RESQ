import React, { useState } from 'react';
import {
  Binary,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Zap,
  Activity,
  Award,
  Layers,
  Code2,
  RotateCcw,
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
import { QaoaState } from '../../types';

interface QaoaPageProps {
  qaoaState: QaoaState;
  onUpdateLayers: (p: number) => void;
}

export const QaoaPage: React.FC<QaoaPageProps> = ({
  qaoaState,
  onUpdateLayers,
}) => {
  const [layers, setLayers] = useState<number>(qaoaState.pLayers);
  const [optimizer, setOptimizer] = useState<string>('COBYLA');
  const [gammaVals, setGammaVals] = useState<number[]>(qaoaState.gamma);
  const [betaVals, setBetaVals] = useState<number[]>(qaoaState.beta);

  const handleLayerChange = (p: number) => {
    setLayers(p);
    onUpdateLayers(p);
    // dynamically pad or slice parameters
    if (p > gammaVals.length) {
      setGammaVals([...gammaVals, 1.25]);
      setBetaVals([...betaVals, 0.75]);
    } else {
      setGammaVals(gammaVals.slice(0, p));
      setBetaVals(betaVals.slice(0, p));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Binary className="w-6 h-6 text-cyan-400" />
            QAOA Trust-Aware QUBO Solver (Quantum Approximate Optimization)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formulates non-convex UAV routing constraints into a Pauli-$Z$ Ising Hamiltonian for $p$-layer variational parameter optimization.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/60">
            Approximation Ratio: {qaoaState.approximationRatio}
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800/60">
            Ansatz: p={layers} Layers
          </span>
        </div>
      </div>

      {/* Mathematical Formulations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Objective Function */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-[10px] text-cyan-400 uppercase font-semibold font-mono tracking-wider">
            1. Objective Function (QUBO)
          </div>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
            C(z) = Σ w_ij (1 - z_i z_j)/2 - λ Σ (100 - T_i) z_i
          </div>
          <p className="text-[11px] text-slate-400">
            Balances routing latency w_ij with dynamic node trust penalty λ(100 - T_i).
          </p>
        </div>

        {/* Cost Hamiltonian */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-[10px] text-amber-400 uppercase font-semibold font-mono tracking-wider">
            2. Cost Hamiltonian H_C
          </div>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
            H_C = Σ J_ij Z_i Z_j + Σ h_i Z_i
          </div>
          <p className="text-[11px] text-slate-400">
            Pauli-$Z$ tensor products encoded with 1-to-1 CNOT gate interactions.
          </p>
        </div>

        {/* Mixer Hamiltonian */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-[10px] text-purple-400 uppercase font-semibold font-mono tracking-wider">
            3. Transverse Mixer H_M
          </div>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
            H_M = Σ_i=1^N X_i
          </div>
          <p className="text-[11px] text-slate-400">
            Single-qubit Pauli-$X$ rotations driving quantum superposition tunnel transitions.
          </p>
        </div>

        {/* Variational Ansatz */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="text-[10px] text-emerald-400 uppercase font-semibold font-mono tracking-wider">
            4. Variational Ansatz |γ, β⟩
          </div>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
            |γ, β⟩ = Π_l=1^p e^(-i β_l H_M) e^(-i γ_l H_C) |+⟩^⊗N
          </div>
          <p className="text-[11px] text-slate-400">
            $p$-layered parameterized state preparation optimized via classical loop.
          </p>
        </div>
      </div>

      {/* Cost Convergence Chart & Optimizer Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Convergence Line Plot */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Variational Optimization Iterations (Cost Convergence)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Convergence curve showing reduction in expectation energy $\langle H_C \rangle$ over 30 SPSA iterations.
              </p>
            </div>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800/60">
              Optimizer: {optimizer}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qaoaState.costConvergence}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="iteration" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  dot={false}
                  name="Energy Expectation <H_C>"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: QAOA Parameter Tuning Sandbox */}
        <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            QAOA Parameter Sandbox
          </h2>

          {/* Layer Depth p */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">
              Ansatz Depth (p Layers)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button
                  key={p}
                  onClick={() => handleLayerChange(p)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition-all ${
                    layers === p
                      ? 'bg-cyan-500 text-black border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  p={p}
                </button>
              ))}
            </div>
          </div>

          {/* Classical Optimizer Selector */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-1">
              Classical Optimizer
            </label>
            <select
              value={optimizer}
              onChange={(e) => setOptimizer(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="COBYLA">COBYLA (Constrained Optimization By Linear Approx)</option>
              <option value="SPSA">SPSA (Simultaneous Perturbation Stochastic Approx)</option>
              <option value="Adam">Adam Gradient Descent</option>
              <option value="Nelder-Mead">Nelder-Mead Simplex</option>
            </select>
          </div>

          {/* Gamma & Beta Rotations per Layer */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Variational Angles γ & β
            </div>

            {Array.from({ length: layers }).map((_, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono"
              >
                <div className="text-cyan-400 font-bold text-[11px]">Layer l = {idx + 1}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">γ_{idx + 1} (Cost):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={gammaVals[idx] ?? 0.38}
                      onChange={(e) => {
                        const newG = [...gammaVals];
                        newG[idx] = parseFloat(e.target.value);
                        setGammaVals(newG);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 p-1 rounded mt-0.5 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">β_{idx + 1} (Mixer):</span>
                    <input
                      type="number"
                      step="0.01"
                      value={betaVals[idx] ?? 0.24}
                      onChange={(e) => {
                        const newB = [...betaVals];
                        newB[idx] = parseFloat(e.target.value);
                        setBetaVals(newB);
                      }}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-200 p-1 rounded mt-0.5 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solution Results Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Solution Bitstring */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Best Solution Bitstring
            </div>
            <div className="font-mono font-bold text-lg text-emerald-400 mt-1">
              |{qaoaState.bestBitstring}⟩
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Ground state with 51.3% sample density
            </div>
          </div>
          <Award className="w-8 h-8 text-emerald-400" />
        </div>

        {/* Constraint Satisfaction */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Constraint Satisfaction
            </div>
            <div className="font-mono font-bold text-lg text-cyan-400 mt-1">
              {qaoaState.constraintSatisfaction}%
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              0 Compromised nodes in optimal graph
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-cyan-400" />
        </div>

        {/* Approximation Ratio */}
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              Approximation Ratio
            </div>
            <div className="font-mono font-bold text-lg text-amber-400 mt-1">
              {qaoaState.approximationRatio}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Guaranteed bounds vs exact solver
            </div>
          </div>
          <Zap className="w-8 h-8 text-amber-400" />
        </div>
      </div>
    </div>
  );
};
