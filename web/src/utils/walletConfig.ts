// utils/walletConfig.ts
import type { WalletCategory } from '../types';

// Define the config structure
interface WalletConfig {
  label: string;
  color: string;
  comingSoon?: boolean;
}

// Wallet category configuration
export const WALLET_META: Record<WalletCategory, WalletConfig> = {
  BANK_CASH: { 
    label: 'Bank & Cash', 
    color: '#2563eb' 
  },
  INVESTMENTS: { 
    label: 'Investments', 
    color: '#b80d0dff',
    comingSoon: false
  },
  CRYPTO: { 
    label: 'Crypto', 
    color: '#9a0fdfff',
    comingSoon: false
  },
  REAL_ESTATE: { 
    label: 'Real Estate', 
    color: '#d97706',
    comingSoon: false
  },
  OTHER: { 
    label: 'Other', 
    color: '#94a3b8',
    comingSoon: false
  }
};

// Helper functions
export const getWalletLabel = (type: WalletCategory): string => {
  return WALLET_META[type]?.label ?? type;
};

export const getWalletColor = (type: WalletCategory): string => {
  return WALLET_META[type]?.color ?? '#64748b';
};

export const isWalletComingSoon = (type: WalletCategory): boolean => {
  return WALLET_META[type]?.comingSoon ?? false;
};