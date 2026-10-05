/**
 * @file src/api/optimizationApi.ts
 * API Service for Quantum QAOA Optimization & QUBO Hamiltonians
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { mockService } from '../services/mockService';
import { QaoaState } from '../types';

export const optimizationApi = {
  getOptimization: async (): Promise<ApiResponse<{ qaoaState: QaoaState }>> => {
    try {
      const res = await apiClient.get('/optimization');
      return res.data;
    } catch {
      const data = await mockService.getOptimizationData();
      return { success: true, data: { qaoaState: data.qaoaState }, timestamp: new Date().toISOString() };
    }
  },

  runOptimization: async (layers: number): Promise<ApiResponse<unknown>> => {
    try {
      const res = await apiClient.post('/runOptimization', { layers });
      return res.data;
    } catch {
      const data = await mockService.runOptimization(layers);
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  runQAOA: async (p: number, gamma: number[], beta: number[]): Promise<ApiResponse<unknown>> => {
    try {
      const res = await apiClient.post('/runQAOA', { p, gamma, beta });
      return res.data;
    } catch {
      const data = await mockService.runQAOA(p, gamma, beta);
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },
};
