/**
 * @file src/api/trustApi.ts
 * API Service for Beta-Reputation & EigenTrust Calculation Endpoints
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { mockService } from '../services/mockService';
import { TrustEvolutionData, UAVNode } from '../types';

export const trustApi = {
  getTrust: async (): Promise<ApiResponse<{ timeline: TrustEvolutionData[]; nodes: UAVNode[] }>> => {
    try {
      const res = await apiClient.get('/trust');
      return res.data;
    } catch {
      const data = await mockService.getTrustData();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  resetTrust: async (nodeId: string): Promise<ApiResponse<{ status: string; nodeId: string }>> => {
    try {
      const res = await apiClient.post('/trust/reset', { nodeId });
      return res.data;
    } catch {
      return {
        success: true,
        data: { status: 'Reset trust score to 95%', nodeId },
        timestamp: new Date().toISOString(),
      };
    }
  },
};
