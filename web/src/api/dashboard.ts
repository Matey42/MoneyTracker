import type { DashboardData } from '../types';
import { isDashboardApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockDashboardData } from './mocks/dashboard';

export const dashboardService = {
  getDashboard: async (): Promise<DashboardData> => {
    if (!isDashboardApiEnabled) {
      return mockDashboardData;
    }

    return request<DashboardData>('/dashboard', {
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
