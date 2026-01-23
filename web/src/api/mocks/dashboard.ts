import type { DashboardData } from '../../types';

export const mockDashboardData: DashboardData = {
  totalBalance: 15420.50,
  monthlyIncome: 8500.00,
  monthlyExpense: 4230.75,
  monthlyChange: 4269.25,
  wallets: [
    { id: '1', name: 'Personal Account', type: 'BANK_CASH', currency: 'PLN', balance: 8500.50, isOwner: true, isShared: false, createdAt: '2024-01-01' },
    { id: '2', name: 'Family Budget', type: 'BANK_CASH', currency: 'PLN', balance: 4200.00, isOwner: true, isShared: true, memberCount: 3, createdAt: '2024-01-15' },
    { id: '3', name: 'Savings', type: 'BANK_CASH', currency: 'PLN', balance: 2720.00, isOwner: true, isShared: false, createdAt: '2024-02-01' },
  ],
  recentTransactions: [
    { id: '1', walletId: '1', userId: '1', type: 'EXPENSE', amount: 125.50, currency: 'PLN', description: 'Groceries', categoryId: 'groceries', transactionDate: '2024-12-13' },
    { id: '2', walletId: '1', userId: '1', type: 'INCOME', amount: 5000.00, currency: 'PLN', description: 'Salary', categoryId: 'salary', transactionDate: '2024-12-10' },
    { id: '3', walletId: '2', userId: '1', type: 'EXPENSE', amount: 89.99, currency: 'PLN', description: 'Netflix subscription', categoryId: 'entertainment', transactionDate: '2024-12-09' },
    { id: '4', walletId: '1', userId: '1', type: 'EXPENSE', amount: 450.00, currency: 'PLN', description: 'Electric bill', categoryId: 'bills', transactionDate: '2024-12-08' },
    { id: '5', walletId: '3', userId: '1', type: 'INCOME', amount: 500.00, currency: 'PLN', description: 'Transfer to savings', categoryId: 'transfer', transactionDate: '2024-12-05' },
  ],
  categoryBreakdown: [
    { categoryId: '1', categoryName: 'Groceries', categoryColor: '#FF9800', amount: 850.00, percentage: 35 },
    { categoryId: '2', categoryName: 'Bills & Utilities', categoryColor: '#607D8B', amount: 650.00, percentage: 27 },
    { categoryId: '3', categoryName: 'Entertainment', categoryColor: '#9C27B0', amount: 450.00, percentage: 18 },
    { categoryId: '4', categoryName: 'Transport', categoryColor: '#2196F3', amount: 300.00, percentage: 12 },
    { categoryId: '5', categoryName: 'Other', categoryColor: '#9E9E9E', amount: 200.00, percentage: 8 },
  ],
};
