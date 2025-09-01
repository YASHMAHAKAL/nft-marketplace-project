import { create } from 'zustand';

interface WalletState {
  account: string | null;
  setAccount: (account: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
}));