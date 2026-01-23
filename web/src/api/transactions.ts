import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../types';
import { isTransactionsApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockTransactions } from './mocks/transactions';

type PageResponse<T> = {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
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

  getTransaction: async (transactionId: string): Promise<Transaction | null> => {
    if (!isTransactionsApiEnabled) {
      return mockTransactions.find((t) => t.id === transactionId) ?? null;
    }

    return request<Transaction>(`/transactions/${transactionId}`, {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getTransactionsByDateRange: async (
    walletId: string,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> => {
    if (!isTransactionsApiEnabled) {
      return mockTransactions.filter((t) => {
        const date = t.transactionDate;
        return t.walletId === walletId && date >= startDate && date <= endDate;
      });
    }

    const data = await request<Transaction[] | PageResponse<Transaction>>(
      `/wallets/${walletId}/transactions/range?startDate=${startDate}&endDate=${endDate}`,
      { authToken: tokenStorage.getAccessToken() }
    );
    return normalizeTransactions(data);
  },

  getWalletBalance: async (walletId: string): Promise<number> => {
    if (!isTransactionsApiEnabled) {
      return mockTransactions
        .filter((t) => t.walletId === walletId)
        .reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -t.amount), 0);
    }

    return request<number>(`/wallets/${walletId}/transactions/balance`, {
      authToken: tokenStorage.getAccessToken(),
    });
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

  updateTransaction: async (
    transactionId: string,
    payload: UpdateTransactionRequest
  ): Promise<Transaction> => {
    if (!isTransactionsApiEnabled) {
      const current = mockTransactions.find((t) => t.id === transactionId);
      return {
        ...current,
        ...payload,
        id: transactionId,
      } as Transaction;
    }

    return request<Transaction>(`/transactions/${transactionId}`, {
      method: 'PUT',
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
