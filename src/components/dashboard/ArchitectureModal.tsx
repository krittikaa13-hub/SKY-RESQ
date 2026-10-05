import React from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Network, Zap, Lock } from 'lucide-react';
import { SystemArchitectureBlock } from '../../types';

interface ArchitectureModalProps {
  block: SystemArchitectureBlock | null;
  onClose: () => void;
  onNavigateToModule: (blockName: string) => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  block,
  onClose,
  onNavigateToModule,
}) => {
  if (!block) return null;

  const getBlockIcon = (name: string) => {
    switch (name) {
      case 'Network':
        return Network;
      case 'Attack Detection':
        return ShieldCheck;
      case 'Trust Engine':
        return Lock;
      case 'Quantum Optimization':
        return Cpu;
      case 'Secure Decision':
        return Zap;
      default:
        return Cpu;
    }
  };

  const Icon = getBlockIcon(block.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Radial Header Glow */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: block.color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10 mb-4">
          <div className="flex items-center space-x-3">
            <div
              className="p-3 rounded-xl border flex items-center justify-center"
              style={{
                backgroundColor: `${block.color}15`,
                borderColor: `${block.color}40`,
                color: block.color,
              }}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{block.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{block.metrics}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
          {block.description}
        </p>

        {/* Key Features List */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Sub-system Operations & Algorithms
          </h4>
          <div className="grid grid-cols-2 gap-2.5">
            {block.subItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 bg-slate-800/40 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToModule(block.name);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded-lg text-xs transition-colors shadow-md shadow-cyan-600/20"
          >
            <span>Open {block.name} Module</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
