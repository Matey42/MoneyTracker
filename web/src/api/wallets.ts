import type { Wallet, CreateWalletRequest } from '../types';
import { isWalletsApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockWallets } from './mocks/wallets';

export const walletsService = {
  getWallets: async (): Promise<Wallet[]> => {
    if (!isWalletsApiEnabled) {
      return mockWallets;
    }

    return request<Wallet[]>('/wallets', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getWallet: async (id: string): Promise<Wallet | null> => {
    if (!isWalletsApiEnabled) {
      return mockWallets.find((wallet) => wallet.id === id) ?? null;
    }

    return request<Wallet>(`/wallets/${id}`, {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  createWallet: async (payload: CreateWalletRequest): Promise<Wallet> => {
    if (!isWalletsApiEnabled) {
      return {
        id: String(Date.now()),
        name: payload.name,
        type: payload.type,
        currency: payload.currency ?? 'PLN',
        balance: 0,
        isOwner: true,
        isShared: payload.isShared ?? false,
        createdAt: new Date().toISOString(),
        description: payload.description,
        icon: payload.icon,
        isFavorite: false,
      };
    }

    return request<Wallet>('/wallets', {
      method: 'POST',
      body: payload,
      authToken: tokenStorage.getAccessToken(),
    });
  },

  updateWallet: async (walletId: string, payload: Partial<Wallet>): Promise<Wallet> => {
    if (!isWalletsApiEnabled) {
      const current = mockWallets.find((wallet) => wallet.id === walletId);
      return { ...(current ?? payload), ...payload } as Wallet;
    }

    return request<Wallet>(`/wallets/${walletId}`, {
      method: 'PUT',
      body: payload,
      authToken: tokenStorage.getAccessToken(),
    });
  },

  deleteWallet: async (walletId: string): Promise<void> => {
    if (!isWalletsApiEnabled) {
      return;
    }

    await request<void>(`/wallets/${walletId}`, {
      method: 'DELETE',
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
