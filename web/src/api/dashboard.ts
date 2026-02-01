import type { DashboardData, NetWorthHistoryResponse } from '../types';
import { isDashboardApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockDashboardData, mockNetWorthHistory } from './mocks/dashboard';

export type NetWorthPeriod = '7D' | '30D' | 'YTD' | '1Y';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    if (!isDashboardApiEnabled) {
      return mockDashboardData;
    }

    return request<DashboardData>('/dashboard', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getNetWorthHistory: async (period: NetWorthPeriod = '7D'): Promise<NetWorthHistoryResponse> => {
    if (!isDashboardApiEnabled) {
      return mockNetWorthHistory[period];
    }

    return request<NetWorthHistoryResponse>(`/dashboard/net-worth-history?period=${period}`, {
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
