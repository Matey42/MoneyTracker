// utils/walletConfig.ts
import type { WalletCategory } from '../types'; // Import your types!

// 1. Define the config structure
interface WalletConfig {
  label: string;
  color: string;
  // You can even add icons here later!
}

// 2. Create a constant using Record<Key, Value>
// TypeScript will now ERROR if you miss a key like 'CRYPTO'
export const WALLET_META: Record<WalletCategory, WalletConfig> = {
  CASH: { 
    label: 'Cash', 
    color: '#16a44fff' 
  },
  BANK: { 
    label: 'Bank Account', 
    color: '#2563eb' 
  },
  INVESTMENTS: { 
    label: 'Investments', 
    color: '#b80d0dff' 
  },
  CRYPTO: { 
    label: 'Crypto', 
    color: '#9a0fdfff' 
  },
  REAL_ESTATE: { 
    label: 'Real Estate', 
    color: '#d97706' 
  },
  OTHER: { 
    label: 'Other', 
    color: '#94a3b8' 
  }
};

// 3. Your functions become simple lookups (One-liners)
export const getWalletLabel = (type: WalletCategory): string => {
  return WALLET_META[type]?.label ?? type;
};

export const getWalletColor = (type: WalletCategory): string => {
  return WALLET_META[type]?.color ?? '#64748b';
};