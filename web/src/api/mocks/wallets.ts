import type { Wallet } from '../../types';

export const mockWallets: Wallet[] = [
  { id: '1', name: 'Personal Account', type: 'BANK_CASH', currency: 'PLN', balance: 8500.5, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-01', description: 'My main checking account', dailyChange: 125.3, icon: 'bank', favoriteOrder: 0 },
  { id: '2', name: 'Family Budget', type: 'BANK_CASH', currency: 'PLN', balance: 4200.0, isOwner: true, isShared: true, isFavorite: true, memberCount: 3, createdAt: '2024-01-15', description: 'Shared family expenses', dailyChange: -45.0, icon: 'wallet', favoriteOrder: 1 },
  { id: '3', name: 'Emergency Savings', type: 'BANK_CASH', currency: 'PLN', balance: 15000.0, isOwner: true, isShared: false, createdAt: '2024-02-01', dailyChange: 0, icon: 'safe' },
  { id: '4', name: 'Vacation Fund', type: 'BANK_CASH', currency: 'PLN', balance: 2720.0, isOwner: true, isShared: false, createdAt: '2024-03-01', dailyChange: 50.0, icon: 'piggy' },
  { id: '5', name: 'Business Account', type: 'BANK_CASH', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, createdAt: '2024-04-01', dailyChange: 320.0, icon: 'briefcase' },
  { id: '6', name: 'Shared Apartment', type: 'BANK_CASH', currency: 'PLN', balance: 800.0, isOwner: false, isShared: true, memberCount: 2, createdAt: '2024-05-01', dailyChange: -20.0, icon: 'house' },
  { id: '7', name: 'Stock Portfolio', type: 'INVESTMENTS', currency: 'PLN', balance: 45000.0, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-01-10', dailyChange: 890.5, icon: 'chart', favoriteOrder: 0 },
  { id: '8', name: 'Retirement Fund', type: 'INVESTMENTS', currency: 'PLN', balance: 82000.0, isOwner: true, isShared: false, createdAt: '2024-02-15', dailyChange: 450.0, icon: 'coins' },
  { id: '9', name: 'Bitcoin Wallet', type: 'CRYPTO', currency: 'PLN', balance: 12500.0, isOwner: true, isShared: false, isFavorite: true, createdAt: '2024-03-01', dailyChange: -320.0, icon: 'bitcoin', favoriteOrder: 0 },
  { id: '10', name: 'Ethereum Wallet', type: 'CRYPTO', currency: 'PLN', balance: 5600.0, isOwner: true, isShared: false, createdAt: '2024-03-15', dailyChange: 180.0, icon: 'coins' },
];
