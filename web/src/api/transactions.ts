import type { Transaction } from '../types';
import { isTransactionsApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockTransactions } from './mocks/transactions';

export const transactionsService = {
  getTransactions: async (walletId?: string): Promise<Transaction[]> => {
    if (!isTransactionsApiEnabled) {
      if (walletId) {
        return mockTransactions.filter((transaction) => transaction.walletId === walletId);
      }
      return mockTransactions;
    }

    const path = walletId ? `/wallets/${walletId}/transactions` : '/transactions';

    return request<Transaction[]>(path, {
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
