/**
 * @file src/api/dashboardApi.ts
 * API Service for High-Level System Dashboard Telemetry Summaries
 */

import { apiClient, ApiResponse } from '../services/apiClient';
import { mockService } from '../services/mockService';

export interface DashboardSummary {
  activeNodesCount: number;
  averageTrust: number;
  totalPackets: number;
  activeThreats: number;
  qaoaFidelity: number;
}

export const dashboardApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardSummary>> => {
    try {
      const res = await apiClient.get('/dashboard');
      return res.data;
    } catch {
      const data = await mockService.getDashboardData();
      return { success: true, data, timestamp: new Date().toISOString() };
    }
  },
};
