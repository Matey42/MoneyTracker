import type { User, UpdateUserRequest } from '../types';
import { isUserApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    if (!isUserApiEnabled) {
      // Return mock user data
      return {
        id: '1',
        email: 'demo@example.com',
        firstName: 'Demo',
        lastName: 'User',
      };
    }

    return request<User>('/users/me', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  updateCurrentUser: async (payload: UpdateUserRequest): Promise<User> => {
    if (!isUserApiEnabled) {
      return {
        id: '1',
        email: payload.email ?? 'demo@example.com',
        firstName: payload.firstName ?? 'Demo',
        lastName: payload.lastName ?? 'User',
      };
    }

    return request<User>('/users/me', {
      method: 'PUT',
      body: payload,
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
