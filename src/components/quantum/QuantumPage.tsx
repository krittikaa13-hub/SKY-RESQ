import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  Activity,
  Layers,
  Zap,
  RotateCcw,
  Sliders,
  Maximize2,
  BarChart2,
  TrendingUp,
  CircleDot,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { QuantumCircuitSpec, BlochSphereState } from '../../types';
import { BENCHMARK_ANALYTICS } from '../../data/mockData';

interface QuantumPageProps {
  circuitSpec: QuantumCircuitSpec;
}

export const QuantumPage: React.FC<QuantumPageProps> = ({ circuitSpec }) => {
  // Bloch Sphere interactive statevector state
  const [theta, setTheta] = useState<number>(0.785); // PI/4
  const [phi, setPhi] = useState<number>(1.047); // PI/3
  const [selectedQubit, setSelectedQubit] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute Bloch coordinates
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);

  // Probability amplitudes
  const alphaProb = Math.pow(Math.cos(theta / 2), 2);
  const betaProb = Math.pow(Math.sin(theta / 2), 2);

  // Render 3D Bloch Sphere using HTML5 Canvas WebGL-like 3D orthographic projection
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = 100;

      // Draw Sphere Wireframe
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;

      // Main Outer Circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Equator Ellipse
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Vertical Meridian
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 0.35, radius, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Axes lines (Z = vertical, X = forward-left, Y = right)
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;

      // Z Axis (|0> at top, |1> at bottom)
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius - 15);
      ctx.lineTo(cx, cy + radius + 15);
      ctx.stroke();

      // Axis Labels
      ctx.fillStyle = '#06B6D4';
      ctx.font = '11px monospace';
      ctx.fillText('|0⟩ (+Z)', cx - 18, cy - radius - 20);
      ctx.fillText('|1⟩ (-Z)', cx - 18, cy + radius + 25);

      // Compute statevector endpoint
      const vecX = cx + x * radius;
      const vecY = cy - z * radius - y * radius * 0.25; // tilted Y component

      // Draw Statevector Arrow Line
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(vecX, vecY);
      ctx.stroke();

      // Vector Tip Dot
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(vecX, vecY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Vector Glow Outer Ring
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(vecX, vecY, 10, 0, Math.PI * 2);
      ctx.stroke();

      rotationAngle += 0.01;
    };

    render();
  }, [theta, phi, x, y, z]);

  // Apply single-qubit gates
  const applyGate = (gate: 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T') => {
    switch (gate) {
      case 'H':
        setTheta(Math.PI / 2);
        setPhi(0);
        break;
      case 'X':
        setTheta(Math.PI - theta);
        setPhi((phi + Math.PI) % (2 * Math.PI));
        break;
      case 'Y':
        setTheta(Math.PI - theta);
        break;
      case 'Z':
        setPhi((phi + Math.PI) % (2 * Math.PI));
        break;
      case 'S':
        setPhi((phi + Math.PI / 2) % (2 * Math.PI));
        break;
      case 'T':
        setPhi((phi + Math.PI / 4) % (2 * Math.PI));
        break;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            IBM Quantum Circuit Viewer & Bloch Sphere Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time quantum gate transpile depth, hardware error model analysis, and interactive statevector Bloch sphere.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800/60">
            Fidelity F = {circuitSpec.fidelity * 100}%
          </span>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800/60">
            Shots = {circuitSpec.shots}
          </span>
        </div>
      </div>

      {/* Circuit Metrics Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Circuit Depth</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">{circuitSpec.depth}</div>
          <div className="text-[10px] text-slate-500 font-mono">Transpiled</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Gate Count</div>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {circuitSpec.gateCount}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">106 1Q • 42 2Q</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Qubits</div>
          <div className="text-2xl font-mono font-bold text-cyan-400 mt-1">
            {circuitSpec.qubits}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Eagle r3 layout</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Shots</div>
          <div className="text-2xl font-mono font-bold text-slate-200 mt-1">
            {circuitSpec.shots}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">Sampler V2</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Noise Level</div>
          <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
            {(circuitSpec.noiseLevel * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono">FakeSherbrooke</div>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-4 rounded-xl">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Optimization</div>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">Level 3</div>
          <div className="text-[10px] text-slate-500 font-mono">Qiskit PassMgr</div>
        </div>
      </div>

      {/* Interactive 3D Bloch Sphere & Gate Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bloch Sphere Canvas */}
        <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between items-center relative">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-cyan-400" />
              Interactive 3D Bloch Sphere Statevector |Ψ⟩
            </h2>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
              Qubit q[{selectedQubit}]
            </div>
          </div>

          {/* Canvas Rendering Box */}
          <div className="relative my-2 bg-[#050816] rounded-xl p-4 border border-slate-800/80 flex items-center justify-center w-full max-w-sm">
            <canvas ref={canvasRef} width={280} height={280} className="rounded-lg" />
          </div>

          {/* Probability Amplitude Breakdown */}
          <div className="w-full grid grid-cols-2 gap-3 mt-4 text-xs font-mono">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">|0⟩ Ground Probability</div>
              <div className="text-emerald-400 font-bold text-lg mt-0.5">
                {(alphaProb * 100).toFixed(1)}%
              </div>
              <div className="text-slate-500 text-[10px]">α = cos(θ/2) = {Math.cos(theta/2).toFixed(3)}</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">|1⟩ Excited Probability</div>
              <div className="text-cyan-400 font-bold text-lg mt-0.5">
                {(betaProb * 100).toFixed(1)}%
              </div>
              <div className="text-slate-500 text-[10px]">β = e^(iφ) sin(θ/2)</div>
            </div>
          </div>
        </div>

        {/* Right: Quantum Gate Sandbox & Angle Sliders */}
        <div className="lg:col-span-6 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Single-Qubit Gate Controls & Angle Sliders
          </h2>

          {/* Gate Trigger Buttons */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-2 uppercase tracking-wider">
              Apply Quantum Gate
            </label>
            <div className="grid grid-cols-6 gap-2">
              {(['H', 'X', 'Y', 'Z', 'S', 'T'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => applyGate(g)}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600/30 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 font-mono font-bold text-xs transition-all shadow"
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Theta Slider (Polar Angle) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Polar Angle θ (Theta):</span>
              <span className="text-cyan-400 font-bold">{theta.toFixed(3)} rad ({((theta * 180) / Math.PI).toFixed(0)}°)</span>
            </div>
            <input
              type="range"
              min="0"
              max={Math.PI}
              step="0.01"
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Phi Slider (Azimuthal Angle) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Azimuthal Angle φ (Phi):</span>
              <span className="text-cyan-400 font-bold">{phi.toFixed(3)} rad ({((phi * 180) / Math.PI).toFixed(0)}°)</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.01"
              value={phi}
              onChange={(e) => setPhi(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Qubit Selector */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-2 uppercase tracking-wider">
              Select Target Qubit (0 - 11)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 12 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedQubit(i)}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
                    selectedQubit === i
                      ? 'bg-cyan-500 text-black border border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  q[{i}]
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Measurement Probability Distribution Histogram */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Measurement Probability Distribution (Sampler V2 Histogram)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Distribution of measured bitstrings over 4096 shots on ibm_sherbrooke hardware.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800/60">
            Ground State |101101001101⟩ (51.3%)
          </span>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={BENCHMARK_ANALYTICS.bitstringDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="state" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
