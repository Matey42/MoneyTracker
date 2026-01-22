import type { Transaction, CreateTransactionRequest } from '../types';
import { isTransactionsApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockTransactions } from './mocks/transactions';

type PageResponse<T> = {
  content: T[];
};

const normalizeTransactions = (data: Transaction[] | PageResponse<Transaction>): Transaction[] => {
  if (Array.isArray(data)) {
    return data;
  }
  return data.content ?? [];
};

export const transactionsService = {
  getTransactions: async (walletId?: string): Promise<Transaction[]> => {
    if (!isTransactionsApiEnabled) {
      if (walletId) {
        return mockTransactions.filter((transaction) => transaction.walletId === walletId);
      }
      return mockTransactions;
    }

    const path = walletId ? `/wallets/${walletId}/transactions` : '/transactions';

    const data = await request<Transaction[] | PageResponse<Transaction>>(path, {
      authToken: tokenStorage.getAccessToken(),
    });
    return normalizeTransactions(data);
  },

  createTransaction: async (payload: CreateTransactionRequest): Promise<Transaction> => {
    if (!isTransactionsApiEnabled) {
      return {
        id: String(Date.now()),
        walletId: payload.walletId,
        userId: '1',
        type: payload.type,
        amount: payload.amount,
        currency: 'PLN',
        description: payload.description,
        categoryId: payload.categoryId,
        transactionDate: payload.transactionDate ?? new Date().toISOString().split('T')[0],
      };
    }

    return request<Transaction>('/transactions', {
      method: 'POST',
      body: payload,
      authToken: tokenStorage.getAccessToken(),
    });
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    if (!isTransactionsApiEnabled) {
      return;
    }

    await request<void>(`/transactions/${transactionId}`, {
      method: 'DELETE',
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
