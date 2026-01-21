import type { Wallet } from '../types';
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
};
