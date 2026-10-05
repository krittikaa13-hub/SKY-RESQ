/**
 * @file src/services/mockService.ts
 * Realistic Mock API Services providing fallback responses for Q-OPTIMA endpoints
 */

import {
  INITIAL_UAV_NODES,
  INITIAL_PACKETS,
  ATTACK_INCIDENTS,
  QUANTUM_BACKENDS,
  MOCK_QAOA_STATE,
  MOCK_CIRCUIT_SPEC,
  BENCHMARK_ANALYTICS,
  TRUST_EVOLUTION_TIMELINE,
  MOCK_EXPERIMENTS,
} from '../data/mockData';
import { UAVNode, NetworkPacket, AttackIncident, QaoaState, QuantumCircuitSpec, Experiment } from '../types';

export const mockService = {
  getNetworkData: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      nodes: INITIAL_UAV_NODES,
      packets: INITIAL_PACKETS,
    };
  },

  getTrustData: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      timeline: TRUST_EVOLUTION_TIMELINE,
      nodes: INITIAL_UAV_NODES,
    };
  },

  getAttackData: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      incidents: ATTACK_INCIDENTS,
      totalDetected: ATTACK_INCIDENTS.length,
    };
  },

  getOptimizationData: async () => {
    await new Promise((r) => setTimeout(r, 250));
    return {
      qaoaState: MOCK_QAOA_STATE,
      analytics: BENCHMARK_ANALYTICS,
    };
  },

  getQuantumData: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return {
      backends: QUANTUM_BACKENDS,
      activeCircuit: MOCK_CIRCUIT_SPEC,
    };
  },

  getDashboardData: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return {
      activeNodesCount: INITIAL_UAV_NODES.filter((n) => n.status === 'healthy').length,
      averageTrust: 86.4,
      totalPackets: 148200,
      activeThreats: ATTACK_INCIDENTS.filter((a) => !a.mitigated).length,
      qaoaFidelity: 0.994,
    };
  },

  startSimulation: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return { status: 'Simulation Started', time: new Date().toISOString() };
  },

  runOptimization: async (layers: number) => {
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      approximationRatio: Math.min(0.998, 0.95 + layers * 0.012),
      cost: -19.42,
      shots: 4096,
      optimalBitstring: '101011001101',
    };
  },

  runQAOA: async (p: number, gamma: number[], beta: number[]) => {
    await new Promise((r) => setTimeout(r, 800));
    return {
      pLayers: p,
      optimalGroundState: '101011001101',
      costExpectation: -19.42,
      fidelity: 0.995,
    };
  },

  runAttackSimulation: async (type: string, nodeId: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const newIncident: AttackIncident = {
      id: `atk-${Date.now().toString().slice(-4)}`,
      type: type as AttackIncident['type'],
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      nodeId,
      nodeName: `UAV-${nodeId}`,
      evidence: `Simulated anomaly on packet drop rate (>40%)`,
      rootCause: `Adversarial packet redirection vector`,
      confidence: 94.8,
      severity: 'High',
      mitigated: false,
    };
    return newIncident;
  },

  resetSystem: async () => {
    await new Promise((r) => setTimeout(r, 200));
    return { status: 'System reset to initial healthy mesh baseline.' };
  },
};
