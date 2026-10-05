/**
 * @file src/api/networkApi.ts
 * API Service for Network Simulation & Topology Telemetry
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { mockService } from '../services/mockService';
import { UAVNode, NetworkPacket } from '../types';

export const networkApi = {
  getNetwork: async (): Promise<ApiResponse<{ nodes: UAVNode[]; packets: NetworkPacket[] }>> => {
    try {
      const res = await apiClient.get('/network');
      return res.data;
    } catch {
      // Fallback to mock service
      const data = await mockService.getNetworkData();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  startSimulation: async (): Promise<ApiResponse<{ status: string; time: string }>> => {
    try {
      const res = await apiClient.post('/startSimulation');
      return res.data;
    } catch {
      const data = await mockService.startSimulation();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },

  resetNetwork: async (): Promise<ApiResponse<{ status: string }>> => {
    try {
      const res = await apiClient.post('/reset');
      return res.data;
    } catch {
      const data = await mockService.resetSystem();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },
};
