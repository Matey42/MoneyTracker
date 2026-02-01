import type { DashboardData, NetWorthHistoryResponse } from '../../types';

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

export const mockNetWorthHistory: Record<string, NetWorthHistoryResponse> = {
  '7D': {
    history: [
      { date: '2026-01-17', value: 180500, label: 'Fri' },
      { date: '2026-01-18', value: 181200, label: 'Sat' },
      { date: '2026-01-19', value: 179800, label: 'Sun' },
      { date: '2026-01-20', value: 182400, label: 'Mon' },
      { date: '2026-01-21', value: 184100, label: 'Tue' },
      { date: '2026-01-22', value: 185800, label: 'Wed' },
      { date: '2026-01-23', value: 188820.5, label: 'Today' },
    ],
    currentNetWorth: 188820.5,
    periodChange: 8320.5,
    periodChangePercent: 4.61,
  },
  '30D': {
    history: [
      { date: '2025-12-24', value: 172000, label: 'Dec 24' },
      { date: '2025-12-27', value: 173500, label: 'Dec 27' },
      { date: '2025-12-30', value: 175500, label: 'Dec 30' },
      { date: '2026-01-02', value: 176800, label: 'Jan 2' },
      { date: '2026-01-05', value: 178200, label: 'Jan 5' },
      { date: '2026-01-08', value: 180000, label: 'Jan 8' },
      { date: '2026-01-11', value: 182500, label: 'Jan 11' },
      { date: '2026-01-14', value: 184000, label: 'Jan 14' },
      { date: '2026-01-17', value: 185500, label: 'Jan 17' },
      { date: '2026-01-23', value: 188820.5, label: 'Today' },
    ],
    currentNetWorth: 188820.5,
    periodChange: 16820.5,
    periodChangePercent: 9.78,
  },
  'YTD': {
    history: [
      { date: '2026-01-01', value: 175000, label: 'Jan 1' },
      { date: '2026-01-05', value: 177500, label: 'Jan 5' },
      { date: '2026-01-09', value: 180000, label: 'Jan 9' },
      { date: '2026-01-13', value: 182500, label: 'Jan 13' },
      { date: '2026-01-17', value: 185000, label: 'Jan 17' },
      { date: '2026-01-23', value: 188820.5, label: 'Today' },
    ],
    currentNetWorth: 188820.5,
    periodChange: 13820.5,
    periodChangePercent: 7.90,
  },
  '1Y': {
    history: [
      { date: '2025-01-23', value: 145000, label: 'Jan 25' },
      { date: '2025-02-23', value: 148000, label: 'Feb' },
      { date: '2025-03-23', value: 152000, label: 'Mar' },
      { date: '2025-04-23', value: 155500, label: 'Apr' },
      { date: '2025-05-23', value: 158000, label: 'May' },
      { date: '2025-06-23', value: 162000, label: 'Jun' },
      { date: '2025-07-23', value: 165500, label: 'Jul' },
      { date: '2025-08-23', value: 168000, label: 'Aug' },
      { date: '2025-09-23', value: 172000, label: 'Sep' },
      { date: '2025-10-23', value: 175000, label: 'Oct' },
      { date: '2025-11-23', value: 180000, label: 'Nov' },
      { date: '2026-01-23', value: 188820.5, label: 'Today' },
    ],
    currentNetWorth: 188820.5,
    periodChange: 43820.5,
    periodChangePercent: 30.22,
  },
};
