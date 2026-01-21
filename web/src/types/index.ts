// User types
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

// Wallet types
export type WalletCategory = 'BANK_CASH' | 'INVESTMENTS' | 'CRYPTO' | 'REAL_ESTATE' | 'OTHER';

export interface Wallet {
  id: string;
  name: string;
  type: WalletCategory;
  currency: string;
  
  // For CASH/BANK: sum of transactions
  // For INVESTMENTS/CRYPTO/REAL_ESTATE: total market value of holdings
  balance: number;

  // Daily change in value
  dailyChange?: number;

  // Sharing
  isShared: boolean;
  memberCount?: number;
  isOwner: boolean;

  // Optional fields
  description?: string;
  icon?: string;
  color?: string;
  isFavorite?: boolean;
  favoriteOrder?: number;
  createdAt: string;
}

// TODO in feature: Holding types for INVESTMENTS/CRYPTO wallets

export interface CreateWalletRequest {
  name: string;
  type: WalletCategory;

  currency?: string; // default to user's primary currency
  isShared?: boolean; // default false
  description?: string;
  icon?: string;
  color?: string;
}

// Member types
export type MemberRole = 'OWNER' | 'MEMBER' | 'VIEWER';

export interface WalletMember {
  id: string;
  userId: string;
  email: string;
  
  displayName?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole; // DEFAULT: MEMBER
}

// Category types
export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;

  icon?: string;
  color?: string;
}

// Transaction types
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
// TODO in feature: Add transsaction for holdings (BUY/SELL/DIVIDEND)

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;

  // If type === TRANSFER, where did it go/come from?
  relatedWalletId?: string; 

  userId: string;
  
  // For shared wallets
  displayName?: string;

  // Optional fields
  categoryId?: string; // predefined category
  description?: string;

  transactionDate: string;
}

export interface CreateTransactionRequest {
  walletId: string;
  type: TransactionType;
  amount: number;

  // Optional
  categoryId?: string;
  description?: string;
  
  // Only for Transfers
  targetWalletId?: string;
}

// Liability types
export type LiabilityType = 'LOAN' | 'MORTGAGE' | 'PERSONAL_DEBT';

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
  tokenType?: string;
  expiresIn?: number;
  user: User;
}
