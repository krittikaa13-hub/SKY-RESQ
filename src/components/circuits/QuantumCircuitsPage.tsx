import React, { useState } from 'react';
import {
  CircuitBoard,
  FileCode,
  Zap,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Play,
  RotateCcw,
} from 'lucide-react';
import { QuantumCircuitSpec } from '../../types';

interface QuantumCircuitsPageProps {
  circuitSpec: QuantumCircuitSpec;
}

export const QuantumCircuitsPage: React.FC<QuantumCircuitsPageProps> = ({
  circuitSpec,
}) => {
  const [optLevel, setOptLevel] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  const qiskitCode = `from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime import QiskitRuntimeService, SamplerV2

# Initialize 12-qubit Trust-Aware QAOA Circuit
qc = QuantumCircuit(12, 12)

# Apply Superposition Hadamard Layer
qc.h(range(12))

# Layer 1 Cost Unitary Exp(-i gamma H_C)
for (u, v, w) in edges:
    qc.rz(2 * gamma * w, v)
    qc.cx(u, v)
    qc.rz(gamma * J_uv, v)
    qc.cx(u, v)

# Layer 1 Transverse Mixer Exp(-i beta H_M)
for i in range(12):
    qc.rx(2 * beta, i)

qc.measure_all()

# Transpile for ibm_sherbrooke (127Q Eagle r3)
backend = service.backend("ibm_sherbrooke")
transpiled_qc = transpile(qc, backend=backend, optimization_level=${optLevel})
sampler = SamplerV2(backend)
job = sampler.run([transpiled_qc], shots=4096)
result = job.result()`;

  const copyCode = () => {
    navigator.clipboard.writeText(qiskitCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CircuitBoard className="w-6 h-6 text-cyan-400" />
            Qiskit Transpiler & Quantum Circuit Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Visualizes gate decomposition, CNOT swap mapping, and optimization pass metrics for IBM Quantum backends.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800/60 font-semibold">
            Qiskit SDK v1.2
          </span>
        </div>
      </div>

      {/* Visual Circuit Diagram Canvas */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Transpiled Gate Pipeline (12 Qubits)
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {circuitSpec.cxCount} CNOT Gates • {circuitSpec.singleQubitCount} 1Q Gates
          </span>
        </div>

        {/* Interactive Gate Line Stream */}
        <div className="bg-[#050816] p-4 rounded-xl border border-slate-800/80 overflow-x-auto custom-scrollbar font-mono text-xs">
          <div className="space-y-3 min-w-[700px]">
            {Array.from({ length: 6 }).map((_, qIdx) => (
              <div key={qIdx} className="flex items-center space-x-3">
                <span className="w-12 text-slate-400 font-bold">q[{qIdx}]:</span>
                <div className="flex-1 flex items-center space-x-2 border-b border-slate-800 relative py-2">
                  <div className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    H
                  </div>
                  <div className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    RZ(2γ₁)
                  </div>
                  {qIdx % 2 === 0 ? (
                    <div className="px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                      CX ●
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                      CX ⊕
                    </div>
                  )}
                  <div className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    RX(2β₁)
                  </div>
                  <div className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    M 🎛️
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Qiskit Python Code Generation & Transpiler Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Box */}
        <div className="lg:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Generated Qiskit Transpiled Code
            </h2>

            <button
              onClick={copyCode}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-[#050816] p-4 rounded-xl border border-slate-800 text-xs text-cyan-300 font-mono overflow-x-auto leading-relaxed max-h-80 custom-scrollbar">
            {qiskitCode}
          </pre>
        </div>

        {/* Right: Optimization Level Sandbox */}
        <div className="lg:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Qiskit PassManager Controls
          </h2>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-semibold block">
              Transpiler Optimization Level
            </label>

            {[0, 1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setOptLevel(lvl)}
                className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all ${
                  optLevel === lvl
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between">
                  <span>Level {lvl}</span>
                  {optLevel === lvl && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-sans">
                  {lvl === 3
                    ? 'Heavy SWAP mapping + 2Q gate cancellation passes (Production)'
                    : lvl === 2
                    ? 'Medium routing optimization & basis translation'
                    : 'Basic mapping without heavy cancellation'}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
