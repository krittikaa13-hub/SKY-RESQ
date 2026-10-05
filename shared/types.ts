/**
 * @file shared/types.ts
 * Enterprise Data Models for Q-OPTIMA Framework
 */

export type NodeStatus = 'healthy' | 'compromised' | 'warning' | 'quarantined';

export interface UAVNode {
  id: string;
  name: string;
  status: NodeStatus;
  trustScore: number; // 0 - 100
  riskScore: number; // 0 - 100
  x: number; // relative coordinate 0-100
  y: number;
  battery: number; // percentage
  latency: number; // ms
  packetCount: number;
  maliciousPackets: number;
  windEffect: {
    speed: number; // km/h
    direction: string; // e.g., 'NW'
  };
  cluster: string;
}

export interface NetworkPacket {
  id: string;
  sourceId: string;
  targetId: string;
  status: 'in-transit' | 'delivered' | 'dropped' | 'intercepted';
  timestamp: string;
  payloadSize: string;
  threatScore: number;
  delayMs: number;
}

export type AttackType =
  | 'Blackhole'
  | 'Sybil'
  | 'Jamming'
  | 'MitM'
  | 'GPS Spoofing'
  | 'False Data Injection';

export interface AttackIncident {
  id: string;
  type: AttackType;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  evidence: string;
  rootCause: string;
  confidence: number; // percentage
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  mitigated: boolean;
}

export interface QuantumBackend {
  id: string;
  name: string;
  provider: 'IBM Quantum' | 'Aer Simulator';
  qubits: number;
  status: 'online' | 'busy' | 'maintenance' | 'offline';
  queueLength: number;
  avgT1: number; // microseconds
  avgT2: number; // microseconds
  readoutError: number; // percentage
  cnotError: number; // percentage
  basisGates: string[];
}

export interface QaoaIteration {
  iteration: number;
  cost: number;
  gamma: number;
  beta: number;
  expectation: number;
  fidelity: number;
}

export interface QaoaState {
  pLayers: number;
  gamma: number[];
  beta: number[];
  objectiveFunction: string;
  hamiltonian: string;
  mixer: string;
  ansatz: string;
  costConvergence: QaoaIteration[];
  bestBitstring: string;
  approximationRatio: number;
  constraintSatisfaction: number; // percentage
  shots: number;
}

export interface QuantumCircuitGate {
  id: string;
  type: 'H' | 'X' | 'Y' | 'Z' | 'CX' | 'RZ' | 'RX' | 'RY' | 'S' | 'T' | 'M';
  qubit: number;
  targetQubit?: number;
  position: number;
  params?: string;
}

export interface QuantumCircuitSpec {
  depth: number;
  gateCount: number;
  qubits: number;
  shots: number;
  noiseLevel: number; // 0 - 1
  fidelity: number;
  cxCount: number;
  singleQubitCount: number;
  gates: QuantumCircuitGate[];
}

export interface BlochSphereState {
  theta: number; // radians 0 - PI
  phi: number; // radians 0 - 2PI
  stateVector: {
    realAlpha: number;
    imagAlpha: number;
    realBeta: number;
    imagBeta: number;
  };
}

export interface TrustEvolutionData {
  timeStep: string;
  node0: number;
  node1: number;
  node2: number;
  node3: number;
  avgTrust: number;
}

export interface SystemArchitectureBlock {
  id: string;
  name: string;
  title: string;
  description: string;
  status: 'active' | 'warning' | 'optimal';
  metrics: string;
  subItems: string[];
  color: string;
}

export interface Experiment {
  id: string;
  name: string;
  timestamp: string;
  backend: string;
  qubits: number;
  shots: number;
  layers: number;
  cost: number;
  fidelity: number;
  timeSeconds: number;
  status: 'Completed' | 'Running' | 'Queued';
}

export interface NotificationItem {
  id: string;
  type: 'alert' | 'quantum' | 'network' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Quantum Cyber Analyst' | 'Swarm Commander' | 'Security Auditor';
  avatar: string;
  clearanceLevel: 'LEVEL-5 TOP SECRET' | 'LEVEL-4 SECRET' | 'CONFIDENTIAL';
  lastLogin: string;
}

export interface WsMessage<T = unknown> {
  type: 'TELEMETRY' | 'PACKET_EVENT' | 'TRUST_UPDATE' | 'OPTIMIZATION_PROGRESS' | 'CIRCUIT_EXECUTION';
  timestamp: string;
  payload: T;
}

// ==========================================
// SKY-RESQ EMERGENCY RESPONSE OPTIMIZATION DOMAIN
// ==========================================

export type IncidentSeverity = 'Critical Tier 1' | 'High Tier 2' | 'Moderate Tier 3';
export type IncidentStatus = 'Pending Triage' | 'Optimizing' | 'Responder Dispatched' | 'On Route' | 'On Scene' | 'Resolved';

export interface EmergencyIncident {
  id: string;
  source: string; // e.g., 'CAD 911 Dispatch - Call #8821'
  location: {
    name: string;
    coords: string;
    terrain: string;
    distanceKm: number;
  };
  type: string; // e.g., 'Cardiac Arrest in Mountain Park'
  severity: IncidentSeverity;
  deadline: string; // e.g., '6.5 mins'
  deadlineSeconds: number;
  status: IncidentStatus;
  victimCount: number;
  requiredPayload: string; // e.g., 'Automated External Defibrillator (AED) + Epinephrine'
  reportedAt: string;
  notes: string;
}

export interface DroneResponder {
  id: string;
  name: string;
  model: string;
  battery: number; // %
  rangeKm: number;
  payloadCapacityKg: number;
  payloadLoaded: string;
  windLimitKmh: number;
  currentWindKmh: number;
  noFlyZoneCheck: 'Clear (Airspace Class G)' | 'Warning (Controlled Border)' | 'Restricted (Ground Hold)';
  readyToLaunch: boolean;
  etaMinutes: number;
  feasibilityScore: number; // 0-100
  flightSpeedKmh: number;
  status: 'Ready' | 'In Flight' | 'Recharging' | 'Standby';
}

export interface GroundResponder {
  id: string;
  name: string;
  type: 'Ground Rescue Robot' | 'Rapid ICU Ambulance' | 'All-Terrain Rover';
  route: string;
  arrivalTimeMin: number;
  terrain: string;
  crewReady: boolean;
  crewDetails: string;
  trafficLevel: string;
  handoverPoint: string;
  feasibilityScore: number; // 0-100
  equipment: string;
  status: 'En Route' | 'Staged at Base' | 'On Scene' | 'Standby';
}

export interface RuleCheckResult {
  rule: string;
  passed: boolean;
  note: string;
  category: 'Safety' | 'Battery' | 'Airspace' | 'Deadline';
}

export interface CandidateComparison {
  type: 'Drone' | 'Robot' | 'Ambulance' | 'Tandem (Drone + Ambulance)';
  name: string;
  eta: string;
  etaMinutes: number;
  costEnergy: number; // kWh or relative cost
  riskScore: number; // 0-100
  successProb: number; // %
  verdict: 'Selected Best' | 'Feasible Backup' | 'Rejected (Wind Exceeded)' | 'Rejected (Traffic Delay)' | 'Rejected (Deadline Missed)';
  reason: string;
}

export interface OptimizationDecision {
  incidentId: string;
  selectedResponderId: string;
  selectedResponderName: string;
  responderType: 'Drone' | 'Ground Robot' | 'Rapid Ambulance' | 'Hybrid Tandem';
  quboObjectiveValue: number;
  qaoaEnergy: number;
  quantumSpeedup: string;
  solverType: 'Hybrid Quantum-Classical (QAOA + Heuristic)';
  ruleChecks: RuleCheckResult[];
  planValidation: 'Feasible & Constraint-Verified' | 'Conditional Approval' | 'Rejected';
  comparisonOptions: CandidateComparison[];
  scheduleTimeline: { time: string; event: string; actor: string }[];
  resourceSharing: string;
  updateRouteRecommendation: string;
  rationale: string;
}

export interface ResponseReadinessMetrics {
  timeReductionPct: number; // e.g. 42.5
  successRatePct: number; // e.g. 97.8
  resourceUsagePct: number; // e.g. 92.4
  riskReductionPct: number; // e.g. 61.2
  coverageRadiusKm: number; // e.g. 48.0
}

