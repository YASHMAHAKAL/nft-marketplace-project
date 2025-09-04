import { create } from 'zustand';

interface WalletState {
  account: string | null;
  jwt: string | null;
  setAccount: (account: string | null) => void;
  setJwt: (jwt: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  jwt: null,
  setAccount: (account) => set({ account }),
  setJwt: (jwt) => set({ jwt }),
}));