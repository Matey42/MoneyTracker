import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Wallet } from '../../types';

interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    fetchWalletsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchWalletsSuccess: (state, action: PayloadAction<Wallet[]>) => {
      state.isLoading = false;
      state.wallets = action.payload;
    },
    fetchWalletsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectWallet: (state, action: PayloadAction<Wallet | null>) => {
      state.selectedWallet = action.payload;
    },
    addWallet: (state, action: PayloadAction<Wallet>) => {
      state.wallets.push(action.payload);
    },
    updateWallet: (state, action: PayloadAction<Wallet>) => {
      const index = state.wallets.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.wallets[index] = action.payload;
      }
      if (state.selectedWallet?.id === action.payload.id) {
        state.selectedWallet = action.payload;
      }
    },
    removeWallet: (state, action: PayloadAction<string>) => {
      state.wallets = state.wallets.filter((w) => w.id !== action.payload);
      if (state.selectedWallet?.id === action.payload) {
        state.selectedWallet = null;
      }
    },
    clearWalletError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchWalletsStart,
  fetchWalletsSuccess,
  fetchWalletsFailure,
  selectWallet,
  addWallet,
  updateWallet,
  removeWallet,
  clearWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;
