/**
 * @file src/components/dashboard/PhoneMockup.tsx
 * Ultra-realistic Smartphone Mockup displaying SKY-RESQ Mobile Responder Terminal
 */

import React, { useState } from 'react';
import {
  EmergencyIncident,
  DroneResponder,
  GroundResponder,
  OptimizationDecision,
} from '../../types';
import {
  ShieldAlert,
  Navigation,
  Battery,
  Wind,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
  Radio,
  MapPin,
  ChevronRight,
  PhoneCall,
  Volume2,
  Sparkles,
  Zap,
} from 'lucide-react';

interface PhoneMockupProps {
  incident: EmergencyIncident;
  drone: DroneResponder;
  ground: GroundResponder;
  decision: OptimizationDecision;
  onSimulateAcknowledge?: () => void;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  incident,
  drone,
  ground,
  decision,
  onSimulateAcknowledge,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [activeTab, setActiveTab] = useState<'mission' | 'telemetry' | 'route'>('mission');

  const handleAcknowledge = () => {
    setAcknowledged(true);
    if (onSimulateAcknowledge) onSimulateAcknowledge();
    setTimeout(() => {
      // Auto reset after 3 seconds for continuous testing
      setAcknowledged(false);
    }, 4000);
  };

  const isDroneChosen = decision.responderType === 'Drone';
  const isRobotChosen = decision.responderType === 'Ground Robot';
  const isTandem = decision.responderType === 'Hybrid Tandem';

  return (
    <div className="relative mx-auto w-[310px] sm:w-[330px] rounded-[44px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-2xl shadow-cyan-950/60 border-4 border-slate-700 select-none">
      {/* Outer Phone Bezel Gloss */}
      <div className="absolute inset-0 rounded-[40px] pointer-events-none border border-white/10" />

      {/* Side Buttons simulation */}
      <div className="absolute -left-[7px] top-24 w-[3px] h-8 bg-slate-600 rounded-l" />
      <div className="absolute -left-[7px] top-36 w-[3px] h-12 bg-slate-600 rounded-l" />
      <div className="absolute -left-[7px] top-52 w-[3px] h-12 bg-slate-600 rounded-l" />
      <div className="absolute -right-[7px] top-32 w-[3px] h-16 bg-slate-600 rounded-r" />

      {/* Screen Frame */}
      <div className="relative overflow-hidden rounded-[36px] bg-[#070C1E] border border-slate-800 text-slate-100 flex flex-col h-[610px]">
        {/* Dynamic Island / Top Camera Pill */}
        <div className="pt-2 pb-1 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/70 border-b border-slate-800/60 z-20">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center space-x-1.5 px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[10px] text-cyan-400 font-bold">5G</span>
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* In-App Header */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/80 border-b border-cyan-800/40 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide text-white">SKY-RESQ Q</div>
              <div className="text-[9px] text-cyan-400 font-mono">Mobile Responder Unit</div>
            </div>
          </div>
          <div className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/70 text-emerald-300 font-mono font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE LINK
          </div>
        </div>

        {/* Scrollable Mobile Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5 text-xs">
          {/* Active Emergency Alert Banner */}
          <div className="rounded-xl bg-gradient-to-br from-red-950/90 via-slate-900 to-red-900/40 border border-red-700/60 p-2.5 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-[9px] tracking-wider uppercase flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                {incident.severity}
              </span>
              <span className="text-[10px] font-mono text-red-300 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-400" />
                {incident.deadline}
              </span>
            </div>

            <h4 className="font-bold text-white text-[12px] leading-tight">
              {incident.type}
            </h4>
            <div className="text-[10px] text-slate-300 flex items-center gap-1 mt-1 font-mono">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span className="truncate">{incident.location.name}</span>
            </div>
          </div>

          {/* Core Philosophy Banner */}
          <div className="rounded-lg bg-cyan-950/50 border border-cyan-800/50 p-2 text-[10px] text-cyan-200 leading-snug">
            <span className="font-semibold text-cyan-400">SKY-RESQ Policy:</span> Does not simply dispatch a drone — evaluates all assets to select the best feasible responder.
          </div>

          {/* Optimized Feasible Responder Card */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-700/80 p-2.5 space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400 uppercase tracking-wider font-semibold">
                QUBO Recommended
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-[9px] font-bold">
                QAOA Optimal
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="font-extrabold text-sm text-white">
                {decision.selectedResponderName}
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-black text-emerald-400">
                  ETA{' '}
                  {isDroneChosen
                    ? `${drone.etaMinutes}m`
                    : isRobotChosen
                    ? '7.2m'
                    : isTandem
                    ? '3.1m / 9.2m'
                    : `${ground.arrivalTimeMin}m`}
                </div>
                <div className="text-[9px] text-slate-400">Feasibility: 98.6%</div>
              </div>
            </div>

            {/* Quick Metrics Chips */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[9px]">Battery</span>
                <span className="font-bold text-emerald-400">{drone.battery}%</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[9px]">Wind</span>
                <span className="font-bold text-cyan-400">{drone.currentWindKmh} km/h</span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <span className="text-slate-400 block text-[9px]">Airspace</span>
                <span className="font-bold text-emerald-400">CLEAR</span>
              </div>
            </div>
          </div>

          {/* Payload Verification */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-2.5">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Required Payload Loadout
            </div>
            <div className="text-[11px] text-slate-200 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{incident.requiredPayload}</span>
            </div>
          </div>

          {/* Interactive Responder Action */}
          <div className="pt-1">
            <button
              onClick={handleAcknowledge}
              disabled={acknowledged}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                acknowledged
                  ? 'bg-emerald-600 text-white shadow-emerald-700/50'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/50'
              }`}
            >
              {acknowledged ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
                  <span>DISPATCH CONFIRMED • EN ROUTE</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>CONFIRM SKY-RESQ DISPATCH</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Voice Link with Dispatcher */}
          <div className="flex items-center justify-between pt-1 px-1 text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Cadence Comm #04</span>
            </div>
            <span className="text-emerald-400 font-mono">Channel Encrypted</span>
          </div>
        </div>

        {/* Phone Bottom Home Bar */}
        <div className="p-2 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-center">
          <div className="w-28 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
