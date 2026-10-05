import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Sliders,
  Download,
  Upload,
  CheckCircle2,
  Save,
  Palette,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [backendUrl, setBackendUrl] = useState<string>(
    'https://api.q-optima.quantum.ibm.com/v1'
  );
  const [ibmToken, setIbmToken] = useState<string>(
    'qiskit_ibm_runtime_live_key_9824f11209a...'
  );
  const [shots, setShots] = useState<number>(4096);
  const [noiseModel, setNoiseModel] = useState<string>('FakeSherbrooke');
  const [theme, setTheme] = useState<string>('Dark IBM Quantum');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportJson = () => {
    const configData = {
      backendUrl,
      ibmToken: '***REDACTED***',
      shots,
      noiseModel,
      theme,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'q-optima-settings.json';
    a.click();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Framework Settings & IBM Runtime Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure IBM Qiskit API tokens, Aer simulator noise parameters, and framework state exports.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-600/20 transition-all"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        {/* Backend API URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Quantum Backend Service Endpoint URL
          </label>
          <input
            type="text"
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* IBM Quantum API Token */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-amber-400" />
            IBM Quantum API Token (qiskit_ibm_runtime)
          </label>
          <input
            type="password"
            value={ibmToken}
            onChange={(e) => setIbmToken(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-xl p-3 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Aer Simulator Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Default Sampler Shots
            </label>
            <select
              value={shots}
              onChange={(e) => setShots(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
            >
              <option value={1024}>1024 Shots</option>
              <option value={2048}>2048 Shots</option>
              <option value={4096}>4096 Shots (Recommended)</option>
              <option value={8192}>8192 Shots</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Aer Noise Model
            </label>
            <select
              value={noiseModel}
              onChange={(e) => setNoiseModel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-xl p-3 focus:outline-none"
            >
              <option value="FakeSherbrooke">FakeSherbrooke (127Q Eagle Noise)</option>
              <option value="FakeBrisbane">FakeBrisbane (127Q Eagle Noise)</option>
              <option value="Ideal">Ideal Noise-Free Simulator</option>
            </select>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            Dashboard Theme Palette
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['Dark IBM Quantum', 'Cyber Cyan', 'Deep Obsidian'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  theme === t
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Export / Import */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200">Export Framework Snapshot</div>
            <div className="text-[11px] text-slate-400">
              Download complete configuration & experiment telemetry logs as JSON.
            </div>
          </div>

          <button
            onClick={handleExportJson}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
