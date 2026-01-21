import { isAuthApiEnabled } from '../config/appConfig';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { request, ApiError } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockLogin, mockRegister } from './mocks/auth';

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    if (!isAuthApiEnabled) {
      return mockLogin(payload.email, payload.password);
    }

    const response = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });

    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    if (!isAuthApiEnabled) {
      return mockRegister(payload);
    }

    const response = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    });

    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    return response;
  },

  logout: async (): Promise<void> => {
    if (!isAuthApiEnabled) {
      tokenStorage.clear();
      return;
    }

    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      await request<void>('/auth/logout', {
        method: 'POST',
        authToken: accessToken,
      });
    }

    tokenStorage.clear();
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (!isAuthApiEnabled) {
      return null;
    }

    const accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
      return null;
    }

    try {
      return await request<User>('/auth/me', { authToken: accessToken });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const refreshed = await authService.refreshTokens();
        if (refreshed) {
          return refreshed.user;
        }
      }

      throw error;
    }
  },

  refreshTokens: async (): Promise<AuthResponse | null> => {
    if (!isAuthApiEnabled) {
      return null;
    }

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    const response = await request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });

    tokenStorage.setTokens(response.accessToken, response.refreshToken);
    return response;
  },
};
