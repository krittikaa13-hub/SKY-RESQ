/**
 * @file src/components/dashboard/HomeDashboard.tsx
 * SKY-RESQ Q — Drone and Robot Emergency Response Platform
 * Multi-Modal Optimization Dashboard: Drone + Robot + Ambulance
 */

import React, { useState } from 'react';
import {
  Cpu,
  Network,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Clock,
  Gauge,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MapPin,
  Wind,
  Battery,
  Plane,
  Truck,
  Bot,
  Layers,
  ChevronRight,
  Smartphone,
  Share2,
  FileCheck,
  Sliders,
  Send,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  QuantumBackend,
  SystemArchitectureBlock,
  NavigationTab,
  EmergencyIncident,
  DroneResponder,
  GroundResponder,
  OptimizationDecision,
  UAVNode,
  AttackIncident,
} from '../../types';
import {
  EMERGENCY_INCIDENTS,
  DRONE_RESPONDERS,
  GROUND_RESPONDERS,
  INITIAL_DECISIONS_BY_INCIDENT,
  READINESS_METRICS,
} from '../../data/emergencyMockData';
import { ArchitectureModal } from './ArchitectureModal';
import { PhoneMockup } from './PhoneMockup';

interface HomeDashboardProps {
  backend: QuantumBackend;
  archBlocks: SystemArchitectureBlock[];
  nodes?: UAVNode[];
  attacks?: AttackIncident[];
  onSelectTab: (tab: NavigationTab) => void;
  onRunSimulation: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  backend,
  archBlocks,
  onSelectTab,
  onRunSimulation,
}) => {
  // Active Incident State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('inc-9042');
  const [selectedGroundType, setSelectedGroundType] = useState<'ambulance' | 'robot'>('ambulance');
  const [selectedBlock, setSelectedBlock] = useState<SystemArchitectureBlock | null>(null);
  const [showPhoneMockup, setShowPhoneMockup] = useState<boolean>(false);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [dispatchConfirmed, setDispatchConfirmed] = useState<boolean>(false);
  const [manualOverrideTarget, setManualOverrideTarget] = useState<string | null>(null);

  const activeIncident: EmergencyIncident =
    EMERGENCY_INCIDENTS.find((inc) => inc.id === selectedIncidentId) || EMERGENCY_INCIDENTS[0];

  const activeDrone: DroneResponder = DRONE_RESPONDERS[0];
  const activeGround: GroundResponder =
    selectedGroundType === 'ambulance' ? GROUND_RESPONDERS[0] : GROUND_RESPONDERS[1];

  const activeDecision: OptimizationDecision =
    INITIAL_DECISIONS_BY_INCIDENT[selectedIncidentId] ||
    INITIAL_DECISIONS_BY_INCIDENT['inc-9042'];

  const handleTriggerOptimization = () => {
    setIsSolving(true);
    onRunSimulation();
    setTimeout(() => {
      setIsSolving(false);
      setDispatchConfirmed(true);
      setTimeout(() => setDispatchConfirmed(false), 5000);
    }, 1200);
  };

  const handleIncidentChange = (id: string) => {
    setSelectedIncidentId(id);
    setManualOverrideTarget(null);
    setDispatchConfirmed(false);
    // If chemical incident, default ground view to robot to highlight why robot is best!
    if (id === 'inc-9043') {
      setSelectedGroundType('robot');
    } else {
      setSelectedGroundType('ambulance');
    }
  };

  const handleBlockNavigation = (blockName: string) => {
    switch (blockName.toLowerCase()) {
      case 'network':
        onSelectTab('network');
        break;
      case 'attack detection':
        onSelectTab('attacks');
        break;
      case 'trust engine':
        onSelectTab('trust');
        break;
      case 'quantum optimization':
        onSelectTab('qaoa');
        break;
      case 'secure decision':
        onSelectTab('circuits');
        break;
      case 'dashboard':
        onSelectTab('analytics');
        break;
      default:
        onSelectTab('dashboard');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. HERO & SYSTEM PHILOSOPHY BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#050816] border border-cyan-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top Tag & Phone Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Modal Emergency Response • Drone + Robot + Ambulance</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPhoneMockup(!showPhoneMockup)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  showPhoneMockup
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-900/90 text-cyan-400 border-cyan-700/60 hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>{showPhoneMockup ? 'Hide Responder Phone' : 'View Field Phone Mockup'}</span>
              </button>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight flex items-center gap-3">
              SKY-RESQ Q
              <span className="text-cyan-400 font-light text-xl sm:text-3xl">Optimizer</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-medium mt-1">
              Drone and Robot Emergency Response Platform
            </p>
          </div>

          {/* CORE MANDATORY PHILOSOPHY CALLOUT */}
          <div className="rounded-xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 border border-cyan-600/50 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  System Operating Principle
                </div>
                <div className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                  “SKY-RESQ does not simply dispatch a drone. It determines the best feasible responder for the emergency.”
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerOptimization}
              disabled={isSolving}
              className="shrink-0 flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 via-blue-600 to-cyan-500 hover:from-red-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              <Zap className={`w-4 h-4 ${isSolving ? 'animate-spin' : 'fill-current text-amber-300'}`} />
              <span>{isSolving ? 'Solving QUBO on QAOA...' : 'Run Quantum Dispatch Optimization'}</span>
            </button>
          </div>

          {/* Emergency Scenario Selector Tabs */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select Active SOS Emergency Incident:</span>
              <span className="text-cyan-400 font-mono text-[11px]">4 Simulated Real Scenarios</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {EMERGENCY_INCIDENTS.map((inc) => {
                const isSelected = inc.id === selectedIncidentId;
                return (
                  <button
                    key={inc.id}
                    onClick={() => handleIncidentChange(inc.id)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                        {inc.id.toUpperCase()}
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/40 text-[9px] font-semibold">
                        {inc.severity.split(' ')[0]}
                      </span>
                    </div>
                    <div className="font-bold text-xs truncate text-white">{inc.type}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{inc.location.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DISPATCH CONFIRMATION TOAST */}
      {dispatchConfirmed && (
        <div className="rounded-xl bg-emerald-950/90 border border-emerald-500/80 p-4 text-emerald-200 text-xs font-mono shadow-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>
              <strong>DISPATCH AUTHORIZED:</strong> {activeDecision.selectedResponderName} deployed to {activeIncident.location.name}. Telemetry channel locked.
            </span>
          </div>
          <span className="text-[10px] bg-emerald-900 px-2 py-0.5 rounded text-emerald-300">
            QAOA Optimal State Verified
          </span>
        </div>
      )}

      {/* OPTIONAL EXPANDED PHONE MOCKUP VIEW */}
      {showPhoneMockup && (
        <div className="rounded-2xl bg-[#0B132B]/90 border border-cyan-700/60 p-6 shadow-2xl relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                SKY-RESQ Field Responder Mobile Interface
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time synchronized field smartphone app used by EMS paramedics, drone pilots, and robot operators.
              </p>
            </div>
            <button
              onClick={() => setShowPhoneMockup(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Close Mockup
            </button>
          </div>
          <div className="py-2 flex justify-center">
            <PhoneMockup
              incident={activeIncident}
              drone={activeDrone}
              ground={activeGround}
              decision={activeDecision}
              onSimulateAcknowledge={() => {
                setDispatchConfirmed(true);
                setTimeout(() => setDispatchConfirmed(false), 4000);
              }}
            />
          </div>
        </div>
      )}

      {/* 2. THE THREE MAIN OPERATIONAL SECTIONS: INCIDENT STATE | DRONE RESPONSE | ROBOT / AMBULANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ======================================================== */}
        {/* SECTION 1: INCIDENT STATE */}
        {/* ======================================================== */}
        <div className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  1. Incident State
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60 font-mono text-[10px] font-bold">
                {activeIncident.severity}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* SOS Source */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                  SOS Source
                </span>
                <span className="font-semibold text-slate-100">{activeIncident.source}</span>
              </div>

              {/* Location */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                  Location & Terrain
                </span>
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{activeIncident.location.name}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Coords: {activeIncident.location.coords} • {activeIncident.location.distanceKm} km away
                </div>
                <div className="text-[11px] text-cyan-300 font-medium mt-0.5">
                  Terrain: {activeIncident.location.terrain}
                </div>
              </div>

              {/* Type and Severity */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                  Emergency Type & Payload Requirement
                </span>
                <div className="font-bold text-white text-sm">{activeIncident.type}</div>
                <div className="text-[11px] text-amber-300 font-mono mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Payload: {activeIncident.requiredPayload}</span>
                </div>
              </div>

              {/* Deadline & Status */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/40">
                  <span className="text-[10px] uppercase font-mono text-red-300 block mb-0.5">
                    Critical Deadline
                  </span>
                  <div className="text-base font-extrabold font-mono text-red-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{activeIncident.deadline.split(' ')[0]}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">Golden Hour Limit</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                    Current Status
                  </span>
                  <div className="text-xs font-bold text-emerald-400 font-mono mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Triage Active</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">CAD #9042 Sync</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
            Note: {activeIncident.notes}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: DRONE RESPONSE */}
        {/* ======================================================== */}
        <div className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  2. Drone Response
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-[10px] font-bold">
                {activeDrone.status}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* Drone Asset Header */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-white text-sm">{activeDrone.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeDrone.model}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-400">
                    ETA {activeDrone.etaMinutes} mins
                  </div>
                  <div className="text-[10px] text-slate-400">{activeDrone.flightSpeedKmh} km/h Cruise</div>
                </div>
              </div>

              {/* Battery & Range */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400 mb-1">
                    <span>Battery</span>
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {activeDrone.battery}%
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeDrone.battery}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                    68% reserve after sortie
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Operational Range
                  </span>
                  <div className="text-lg font-black font-mono text-white">
                    {activeDrone.rangeKm} <span className="text-xs font-normal text-slate-400">km</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono block mt-2">
                    ✓ Mission: {activeIncident.location.distanceKm} km
                  </span>
                </div>
              </div>

              {/* Payload */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                  Payload Loadout
                </span>
                <div className="font-semibold text-white">{activeDrone.payloadLoaded}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Capacity: {activeDrone.payloadCapacityKg} kg max • Auto-winch tether equipped
                </div>
              </div>

              {/* Wind Limit & No-Fly Check */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-2.5 rounded-xl border ${
                    activeDrone.currentWindKmh > activeDrone.windLimitKmh
                      ? 'bg-red-950/40 border-red-800/60'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] uppercase font-mono text-slate-400 mb-1">
                    <span>Wind Limit</span>
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="font-mono font-bold text-white text-sm">
                    {activeDrone.currentWindKmh} <span className="text-xs text-slate-400 font-normal">/ {activeDrone.windLimitKmh} km/h</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono block mt-1 ${
                      activeDrone.currentWindKmh > activeDrone.windLimitKmh
                        ? 'text-red-400 font-bold'
                        : 'text-emerald-400'
                    }`}
                  >
                    {activeDrone.currentWindKmh > activeDrone.windLimitKmh ? '✖ EXCEEDS LIMIT' : '✓ Safe Flight Envelope'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    No-Fly Check
                  </span>
                  <div className="font-mono font-bold text-emerald-400 text-xs truncate">
                    {activeDrone.noFlyZoneCheck.split(' ')[0]}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">
                    FAA Class G Clear
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Ready to Launch Status */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ready to Launch: ARMED</span>
            </div>
            <button
              onClick={handleTriggerOptimization}
              className="px-2.5 py-1 text-[11px] rounded bg-cyan-950 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900 font-mono transition-colors"
            >
              Test Pre-flight
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: ROBOT / AMBULANCE */}
        {/* ======================================================== */}
        <div className="bg-[#0F172A] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  3. Robot / Ambulance
                </h2>
              </div>

              {/* Selector between Ambulance and Robot */}
              <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setSelectedGroundType('ambulance')}
                  className={`px-2 py-0.5 rounded ${
                    selectedGroundType === 'ambulance'
                      ? 'bg-amber-500/20 text-amber-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Ambulance
                </button>
                <button
                  onClick={() => setSelectedGroundType('robot')}
                  className={`px-2 py-0.5 rounded ${
                    selectedGroundType === 'robot'
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Robot
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {/* Asset Name & Type */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-white text-sm">{activeGround.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{activeGround.type}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-amber-400">
                    ETA {activeGround.arrivalTimeMin} mins
                  </div>
                  <div className="text-[10px] text-slate-400">Road/Trail Travel</div>
                </div>
              </div>

              {/* Route */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                  Assigned Route
                </span>
                <span className="font-semibold text-slate-200 leading-tight block">
                  {activeGround.route}
                </span>
              </div>

              {/* Terrain & Traffic */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Terrain Accessibility
                  </span>
                  <div className="font-semibold text-white text-xs truncate">
                    {activeGround.terrain}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">
                    Grade check OK
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                    Live Traffic Sensor
                  </span>
                  <div className="font-mono font-bold text-amber-400 text-xs">
                    {activeGround.trafficLevel}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1">
                    Dynamic detour active
                  </span>
                </div>
              </div>

              {/* Crew Ready */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    Crew Ready Status
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">100% READY</span>
                </div>
                <div className="font-medium text-slate-200 text-[11px]">
                  {activeGround.crewDetails}
                </div>
              </div>

              {/* Handover Point */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
                  Designated Handover Point
                </span>
                <span className="font-mono text-cyan-300 text-[11px] block truncate">
                  {activeGround.handoverPoint}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-mono">Feasibility: {activeGround.feasibilityScore}%</span>
            <span className="text-emerald-400 font-mono">Tandem Handoff Capable</span>
          </div>
        </div>
      </div>

      {/* 3. SECTION 4: OPTIMIZATION ENGINE (QUBO + QAOA + Quantum/Classical Solver + Rule Checks + Plan Validation) */}
      <div className="bg-[#0F172A] border border-cyan-800/40 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              4. Optimization Engine: QUBO & QAOA Solver
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hybrid quantum-classical optimization transpiling multi-objective emergency constraints into Ising Hamiltonians.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
              Ansatz Depth p=3 • 12 Qubits
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold">
              {activeDecision.planValidation}
            </span>
          </div>
        </div>

        {/* Engine Sub-Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Box A: QUBO Model */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                QUBO Model
              </span>
              <span className="text-[10px] font-mono text-slate-400">Binary Form</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/60 font-mono text-[11px] text-cyan-200 border border-slate-800 overflow-x-auto">
              H(x) = ∑ w_i T_i x_i + ∑ w_r R_i x_i + P_w·[wind] + P_p·[payload] + λ(∑x_i - 1)²
            </div>
            <div className="text-[11px] text-slate-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Objective Val:</span>
                <span className="font-bold text-emerald-400">{activeDecision.quboObjectiveValue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Constraint Penalty λ:</span>
                <span className="text-slate-200">100.0 (Hard Mutual Exclusion)</span>
              </div>
            </div>
          </div>

          {/* Box B: QAOA Execution */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">
                QAOA Circuit
              </span>
              <span className="text-[10px] font-mono text-slate-400">IBM Sherbrooke</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Ground State Energy:</span>
                <span className="text-emerald-400 font-bold">{activeDecision.qaoaEnergy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shots / Samples:</span>
                <span className="text-white">4096</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Approx Ratio α:</span>
                <span className="text-emerald-400 font-bold">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantum Speedup:</span>
                <span className="text-cyan-300">38.4x vs MIP</span>
              </div>
            </div>
          </div>

          {/* Box C: Quantum + Classical Solver */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                Hybrid Dual-Solver
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Synchronized</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Quantum Core:</span>
                <span className="text-purple-300">QAOA Statevector</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Classical Core:</span>
                <span className="text-slate-200">Branch & Bound MIP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Execution Time:</span>
                <span className="text-amber-300 font-bold">1.24s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Fidelity Overlap:</span>
                <span className="text-emerald-400 font-bold">99.4%</span>
              </div>
            </div>
          </div>

          {/* Box D: Plan Validation */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Plan Validation
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 font-mono">
              ✓ Satisfies all airspace, weather, battery & deadline safety bounds with zero violation.
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Digital Proof Hash: <span className="text-cyan-400">0x9f8c...3a12</span>
            </div>
          </div>
        </div>

        {/* Rule Checks Detail Bar */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 font-mono flex items-center justify-between">
            <span>Deterministic Rule Checks & Hard Constraint Evaluations:</span>
            <span className="text-emerald-400 text-[11px] font-mono">100% Passed</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {activeDecision.ruleChecks.map((check, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{check.rule}</span>
                  <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    PASS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{check.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. SECTION 5: SMART DECISIONS (Compare Options, Pick Best, Assign Responder, Schedule, Share Resources, Update Route) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              5. Smart Decisions & Multi-Modal Responder Matching
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive decision matrix evaluating drones, ground robots, and ambulances against environmental and medical constraints.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-xs font-mono text-cyan-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Optimal Match: <strong>{activeDecision.selectedResponderName}</strong></span>
          </div>
        </div>

        {/* 5A. COMPARE OPTIONS TABLE */}
        <div>
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
            Compare Candidate Options:
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Asset Candidate</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Arrival ETA</th>
                  <th className="p-3">Energy Cost</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Success Prob</th>
                  <th className="p-3">Verdict & Rationale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {activeDecision.comparisonOptions.map((opt, idx) => {
                  const isSelected = opt.verdict === 'Selected Best';
                  return (
                    <tr
                      key={idx}
                      className={
                        isSelected
                          ? 'bg-cyan-950/40 text-white font-semibold'
                          : 'bg-slate-900/30 text-slate-300 hover:bg-slate-900/60'
                      }
                    >
                      <td className="p-3 flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                        <span className={isSelected ? 'text-cyan-300 font-bold' : ''}>{opt.name}</span>
                      </td>
                      <td className="p-3 text-slate-400">{opt.type}</td>
                      <td className="p-3 font-bold text-white">{opt.eta}</td>
                      <td className="p-3 text-slate-400">{opt.costEnergy} kWh</td>
                      <td className="p-3">
                        <span className={opt.riskScore < 20 ? 'text-emerald-400' : 'text-amber-400'}>
                          {opt.riskScore}
                        </span>
                      </td>
                      <td className="p-3 text-emerald-400">{opt.successProb}%</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            opt.verdict === 'Selected Best'
                              ? 'bg-cyan-500 text-black'
                              : opt.verdict === 'Feasible Backup'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800'
                              : 'bg-red-950 text-red-300 border border-red-800/60'
                          }`}
                        >
                          {opt.verdict}
                        </span>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                          {opt.reason}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5B. PICK BEST & ASSIGN RESPONDER & SCHEDULE & SHARE RESOURCES & UPDATE ROUTE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Pick Best & Rationale */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/50 via-slate-900 to-slate-900 border border-cyan-800/60 space-y-3">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Pick Best Decision</span>
              <span className="text-[10px] bg-cyan-900 px-2 py-0.5 rounded text-cyan-200">
                QUBO Min Cost
              </span>
            </div>
            <div className="font-extrabold text-white text-base">
              {activeDecision.selectedResponderName}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              <strong>Algorithm Rationale:</strong> {activeDecision.rationale}
            </p>
            <div className="pt-2">
              <button
                onClick={handleTriggerOptimization}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-900/40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Assign Responder</span>
              </button>
            </div>
          </div>

          {/* Card 2: Schedule & Milestones */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Schedule Timeline</span>
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="space-y-2 text-xs font-mono max-h-48 overflow-y-auto custom-scrollbar">
              {activeDecision.scheduleTimeline.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[11px]">
                  <span className="text-cyan-400 font-bold shrink-0">{step.time}</span>
                  <div>
                    <span className="text-slate-200 block leading-tight">{step.event}</span>
                    <span className="text-[9px] text-slate-500">{step.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Share Resources & Update Route */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Resource Sharing & Route Update</span>
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-0.5">
                  Multi-Agent Resource Sharing
                </span>
                <span className="text-slate-200 leading-snug block text-[11px]">
                  {activeDecision.resourceSharing}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase block mb-0.5">
                  Dynamic Route Recommendation
                </span>
                <span className="text-slate-200 leading-snug block text-[11px]">
                  {activeDecision.updateRouteRecommendation}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. SECTION 6: RESPONSE READINESS (Time ↓, Success ↑, Usage ↑, Risk ↓, Coverage ↑) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            6. Response Readiness & Impact Metrics
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Optimized vs Baseline Emergency Systems
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Metric 1: Time Reduction (Time ↓) */}
          <div className="bg-[#0F172A] border border-cyan-800/40 p-4 rounded-xl shadow-lg transition-transform hover:translate-y-[-2px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold font-mono text-cyan-300">Time ↓</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
              -{READINESS_METRICS.timeReductionPct}%
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Response Time Reduction
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              3.2m aerial vs 18.5m road
            </div>
          </div>

          {/* Metric 2: Mission Success (Success ↑) */}
          <div className="bg-[#0F172A] border border-emerald-800/40 p-4 rounded-xl shadow-lg transition-transform hover:translate-y-[-2px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold font-mono text-emerald-300">Success ↑</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {READINESS_METRICS.successRatePct}%
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Mission & Survival Rate
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Golden-hour compliant
            </div>
          </div>

          {/* Metric 3: Resource Usage (Usage ↑) */}
          <div className="bg-[#0F172A] border border-blue-800/40 p-4 rounded-xl shadow-lg transition-transform hover:translate-y-[-2px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold font-mono text-blue-300">Usage ↑</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-400">
              {READINESS_METRICS.resourceUsagePct}%
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Multi-Asset Fleet Usage
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Zero idle responders
            </div>
          </div>

          {/* Metric 4: Risk Score (Risk ↓) */}
          <div className="bg-[#0F172A] border border-purple-800/40 p-4 rounded-xl shadow-lg transition-transform hover:translate-y-[-2px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold font-mono text-purple-300">Risk ↓</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300">
              -{READINESS_METRICS.riskReductionPct}%
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Operational Risk Index
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Hazard zone bypass
            </div>
          </div>

          {/* Metric 5: Coverage Radius (Coverage ↑) */}
          <div className="bg-[#0F172A] border border-amber-800/40 p-4 rounded-xl shadow-lg transition-transform hover:translate-y-[-2px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-bold font-mono text-amber-300">Coverage ↑</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              {READINESS_METRICS.coverageRadiusKm} <span className="text-xs font-normal">km</span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-1">
              Service Emergency Radius
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Full multi-modal mesh
            </div>
          </div>
        </div>
      </div>

      {/* 6. INTERACTIVE SYSTEM ARCHITECTURE DIAGRAM (Preserved & Enhanced) */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-cyan-400" />
              SKY-RESQ End-to-End Emergency Response Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Click any block to inspect deep sub-system operations, quantum transpilation steps, or trigger module navigation.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950 border border-cyan-800/60 px-3 py-1 rounded-full">
            ● Interactive Architecture Pipeline
          </span>
        </div>

        {/* Pipeline Diagram Flow */}
        <div className="relative py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {archBlocks.map((block, index) => {
              return (
                <div key={block.id} className="relative group">
                  <div
                    onClick={() => setSelectedBlock(block)}
                    className="h-full bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500 rounded-xl p-4 cursor-pointer transition-all hover:shadow-xl hover:shadow-cyan-950/50 hover:scale-[1.03] flex flex-col justify-between"
                  >
                    <div>
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">
                          Block 0{index + 1}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full animate-ping"
                          style={{ backgroundColor: block.color }}
                        />
                      </div>

                      {/* Name & Title */}
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {block.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {block.description}
                      </p>
                    </div>

                    {/* Metrics Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <div className="text-[10px] font-mono text-cyan-400 truncate">
                        {block.metrics}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 group-hover:text-slate-300 transition-colors">
                        <span>Inspect operation</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Connecting Arrow for Desktop */}
                  {index < archBlocks.length - 1 && (
                    <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 items-center justify-center text-slate-600 pointer-events-none">
                      <ArrowRight className="w-5 h-5 text-cyan-500/80 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Architecture Deep-Dive Modal */}
      <ArchitectureModal
        block={selectedBlock}
        onClose={() => setSelectedBlock(null)}
        onNavigateToModule={handleBlockNavigation}
      />
    </div>
  );
};
