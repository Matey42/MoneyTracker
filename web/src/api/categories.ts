import type { Category } from '../types';
import { isTransactionsApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockCategories } from './mocks/transactions';

export const categoriesService = {
  getCategories: async (): Promise<Category[]> => {
    if (!isTransactionsApiEnabled) {
      return mockCategories;
    }

    return request<Category[]>('/categories', {
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
