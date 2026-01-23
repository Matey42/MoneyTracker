import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { isCategoriesApiEnabled } from '../config/appConfig';
import { request } from './httpClient';
import { tokenStorage } from './tokenStorage';
import { mockCategories } from './mocks/transactions';

export const categoriesService = {
  getCategories: async (): Promise<Category[]> => {
    if (!isCategoriesApiEnabled) {
      return mockCategories;
    }

    return request<Category[]>('/categories', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getCategory: async (id: string): Promise<Category | null> => {
    if (!isCategoriesApiEnabled) {
      return mockCategories.find((cat) => cat.id === id) ?? null;
    }

    return request<Category>(`/categories/${id}`, {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getIncomeCategories: async (): Promise<Category[]> => {
    if (!isCategoriesApiEnabled) {
      return mockCategories.filter((cat) => cat.type === 'INCOME');
    }

    return request<Category[]>('/categories/income', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getExpenseCategories: async (): Promise<Category[]> => {
    if (!isCategoriesApiEnabled) {
      return mockCategories.filter((cat) => cat.type === 'EXPENSE');
    }

    return request<Category[]>('/categories/expense', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  getSystemCategories: async (): Promise<Category[]> => {
    if (!isCategoriesApiEnabled) {
      return mockCategories.filter((cat) => cat.isSystem);
    }

    return request<Category[]>('/categories/system', {
      authToken: tokenStorage.getAccessToken(),
    });
  },

  createCategory: async (payload: CreateCategoryRequest): Promise<Category> => {
    if (!isCategoriesApiEnabled) {
      return {
        id: String(Date.now()),
        name: payload.name,
        type: payload.type,
        icon: payload.icon,
        color: payload.color,
        isSystem: false,
      };
    }

    return request<Category>('/categories', {
      method: 'POST',
      body: payload,
      authToken: tokenStorage.getAccessToken(),
    });
  },

  updateCategory: async (categoryId: string, payload: UpdateCategoryRequest): Promise<Category> => {
    if (!isCategoriesApiEnabled) {
      const current = mockCategories.find((cat) => cat.id === categoryId);
      return { ...(current ?? { id: categoryId, name: '', type: 'EXPENSE' }), ...payload } as Category;
    }

    return request<Category>(`/categories/${categoryId}`, {
      method: 'PUT',
      body: payload,
      authToken: tokenStorage.getAccessToken(),
    });
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    if (!isCategoriesApiEnabled) {
      return;
    }

    await request<void>(`/categories/${categoryId}`, {
      method: 'DELETE',
      authToken: tokenStorage.getAccessToken(),
    });
  },
};
