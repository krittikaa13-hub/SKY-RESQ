/**
 * @file src/pages/NotFoundPage.tsx
 * 404 Route Not Found Page
 */

import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="p-4 rounded-full bg-red-950/60 border border-red-800 text-red-400">
        <AlertTriangle className="w-12 h-12 animate-pulse" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold text-white">404 - Quantum Decoherence</h1>
        <p className="text-slate-400 text-xs font-mono">
          The quantum routing vector or state coordinate you requested does not exist in Hilbert space.
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <Link
          to="/"
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-600/20"
        >
          <Home className="w-4 h-4" />
          <span>Return to Command Center</span>
        </Link>
      </div>
    </div>
  );
};
