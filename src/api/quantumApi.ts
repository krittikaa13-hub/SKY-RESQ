/**
 * @file src/api/quantumApi.ts
 * API Service for IBM Quantum Hardware Backends, Transpilation & Gate Circuits
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { mockService } from '../services/mockService';
import { QuantumBackend, QuantumCircuitSpec } from '../types';

export const quantumApi = {
  getQuantum: async (): Promise<ApiResponse<{ backends: QuantumBackend[]; activeCircuit: QuantumCircuitSpec }>> => {
    try {
      const res = await apiClient.get('/quantum');
      return res.data;
    } catch {
      const data = await mockService.getQuantumData();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  transpileCircuit: async (circuitSpec: QuantumCircuitSpec, optLevel: number): Promise<ApiResponse<QuantumCircuitSpec>> => {
    try {
      const res = await apiClient.post('/quantum/transpile', { circuitSpec, optLevel });
      return res.data;
    } catch {
      const data = await mockService.getQuantumData();
      return {
        success: true,
        data: {
          ...data.activeCircuit,
          depth: Math.max(12, data.activeCircuit.depth - optLevel * 2),
        },
        timestamp: new Date().toISOString(),
      };
    }
  },

  executeCircuit: async (backendId: string, shots: number): Promise<ApiResponse<{ jobId: string; status: string }>> => {
    try {
      const res = await apiClient.post('/quantum/execute', { backendId, shots });
      return res.data;
    } catch {
      return {
        success: true,
        data: {
          jobId: `job-ibm-${Date.now().toString().slice(-6)}`,
          status: 'COMPLETED',
        },
        timestamp: new Date().toISOString(),
      };
    }
  },
};
