// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Wallet types
export type WalletType = 'PERSONAL' | 'FAMILY' | 'BUSINESS' | 'SAVINGS' | 'CASH';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  currency: string;
  description?: string;
  icon?: string;
  color?: string;
  balance: number;
  isOwner: boolean;
  createdAt: string;
}

export interface CreateWalletRequest {
  name: string;
  type: WalletType;
  currency?: string;
  description?: string;
  icon?: string;
  color?: string;
}

// Transaction types
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  walletId: string;
  userId: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description?: string;
  transactionDate: string;
  paymentMethod?: string;
  createdAt: string;
}

export interface CreateTransactionRequest {
  walletId: string;
  categoryId?: string;
  type: TransactionType;
  amount: number;
  description?: string;
  transactionDate: string;
  paymentMethod?: string;
}

// Category types
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isSystem: boolean;
}

// Liability types
export type LiabilityType = 'LOAN' | 'CREDIT_CARD' | 'MORTGAGE' | 'PERSONAL_DEBT';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  principalAmount: number;
  currentBalance: number;
  interestRate?: number;
  minimumPayment?: number;
  dueDate?: number;
  currency: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

// Member types
export type MemberRole = 'OWNER' | 'MEMBER';

export interface WalletMember {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: MemberRole;
  grantedAt: string;
}

// Dashboard types
export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  wallets: Wallet[];
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

// API Response types
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}
