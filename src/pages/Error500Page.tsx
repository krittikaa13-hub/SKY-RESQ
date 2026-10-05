/**
 * @file src/pages/Error500Page.tsx
 * 500 Server Quantum Exception Page
 */

import React from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export const Error500Page: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400">
        <ShieldAlert className="w-12 h-12" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold text-white">500 - Quantum Execution Crash</h1>
        <p className="text-slate-400 text-xs font-mono">
          An unexpected hardware noise overflow or transpile pass failure occurred on IBM Qiskit backend.
        </p>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Reload Hardware Pipeline</span>
      </button>
    </div>
  );
};
