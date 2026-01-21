import type { Category, Transaction } from '../../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Groceries', type: 'EXPENSE', icon: 'shopping_cart', color: '#FF9800' },
  { id: '2', name: 'Salary', type: 'INCOME', icon: 'work', color: '#4CAF50' },
  { id: '3', name: 'Entertainment', type: 'EXPENSE', icon: 'movie', color: '#9C27B0' },
  { id: '4', name: 'Bills & Utilities', type: 'EXPENSE', icon: 'receipt', color: '#607D8B' },
  { id: '5', name: 'Other Income', type: 'INCOME', icon: 'attach_money', color: '#9C27B0' },
  { id: '6', name: 'Transport', type: 'EXPENSE', icon: 'directions_car', color: '#2196F3' },
  { id: '7', name: 'Food & Dining', type: 'EXPENSE', icon: 'restaurant', color: '#FF5722' },
  { id: '8', name: 'Freelance', type: 'INCOME', icon: 'laptop', color: '#8BC34A' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', walletId: '1', userId: '1', type: 'EXPENSE', amount: 125.5, currency: 'PLN', description: 'Weekly groceries at Biedronka', categoryId: '1', transactionDate: '2024-12-13' },
  { id: '2', walletId: '1', userId: '1', type: 'INCOME', amount: 5000.0, currency: 'PLN', description: 'Monthly salary', categoryId: '2', transactionDate: '2024-12-10' },
  { id: '3', walletId: '2', userId: '1', type: 'EXPENSE', amount: 89.99, currency: 'PLN', description: 'Netflix subscription', categoryId: '3', transactionDate: '2024-12-09' },
  { id: '4', walletId: '1', userId: '1', type: 'EXPENSE', amount: 450.0, currency: 'PLN', description: 'Electric bill December', categoryId: '4', transactionDate: '2024-12-08' },
  { id: '5', walletId: '3', userId: '1', type: 'INCOME', amount: 500.0, currency: 'PLN', description: 'Transfer to savings', categoryId: '5', transactionDate: '2024-12-05' },
  { id: '6', walletId: '1', userId: '1', type: 'EXPENSE', amount: 65.0, currency: 'PLN', description: 'Uber rides', categoryId: '6', transactionDate: '2024-12-04' },
  { id: '7', walletId: '1', userId: '1', type: 'EXPENSE', amount: 180.0, currency: 'PLN', description: 'Restaurant dinner', categoryId: '7', transactionDate: '2024-12-03' },
  { id: '8', walletId: '1', userId: '1', type: 'INCOME', amount: 250.0, currency: 'PLN', description: 'Freelance project', categoryId: '8', transactionDate: '2024-12-02' },
];
