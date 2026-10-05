import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, Award, FileText, Download } from 'lucide-react';
import { RESEARCH_INFO } from '../../data/mockData';

export const ResearchPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono">
          <Award className="w-3.5 h-3.5" />
          <span>IBM Quantum & Cybersecurity Hackathon Project Submission</span>
        </div>

        <h1 className="text-2xl font-extrabold text-white leading-tight">
          {RESEARCH_INFO.title}
        </h1>

        <p className="text-xs text-slate-400 font-mono">
          Authors: <span className="text-cyan-300 font-semibold">{RESEARCH_INFO.authors}</span>
        </p>
      </div>

      {/* Abstract & QUBO Mathematical Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Paper Abstract */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Executive Research Abstract
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
            {RESEARCH_INFO.abstract}
          </p>

          <div className="pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Key Contributions & Breakthroughs
            </h3>
            <div className="space-y-2">
              {RESEARCH_INFO.keyContributions.map((c, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: LaTeX Formulations Box */}
        <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            Trust-Aware Ising Penalty Equation
          </h2>

          <div className="bg-[#050816] p-4 rounded-xl border border-slate-800/80 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
            {RESEARCH_INFO.quboEquation}
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <p>
              <strong className="text-slate-200">α Factor:</strong> Normalizes spatial edge distances d_ij and channel capacities C_ij.
            </p>
            <p>
              <strong className="text-slate-200">β Penalty:</strong> Quadratic penalty scaling proportionally with $100 - T_i$ trust decay.
            </p>
            <p>
              <strong className="text-slate-200">γ Constraint:</strong> Hard isolation penalty for flagged attack vectors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
