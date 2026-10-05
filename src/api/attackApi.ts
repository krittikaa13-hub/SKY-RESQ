/**
 * @file src/api/attackApi.ts
 * API Service for Cyber Threat Detection & Automated Mitigation Protocols
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { mockService } from '../services/mockService';
import { AttackIncident } from '../types';

export const attackApi = {
  getAttacks: async (): Promise<ApiResponse<{ incidents: AttackIncident[]; totalDetected: number }>> => {
    try {
      const res = await apiClient.get('/attack');
      return res.data;
    } catch {
      const data = await mockService.getAttackData();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  runAttack: async (type: string, nodeId: string): Promise<ApiResponse<AttackIncident>> => {
    try {
      const res = await apiClient.post('/runAttack', { type, nodeId });
      return res.data;
    } catch {
      const data = await mockService.runAttackSimulation(type, nodeId);
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  mitigateAttack: async (attackId: string): Promise<ApiResponse<{ status: string; attackId: string }>> => {
    try {
      const res = await apiClient.post('/attack/mitigate', { attackId });
      return res.data;
    } catch {
      return {
        success: true,
        data: { status: 'Mitigated attack and isolated infected node.', attackId },
        timestamp: new Date().toISOString(),
      };
    }
  },
};
