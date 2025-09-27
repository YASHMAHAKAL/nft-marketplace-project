import { useWallet } from '../contexts/WalletContext';

/**
 * @deprecated Use useWallet from WalletContext instead
 * This hook is kept for backward compatibility
 */
export function useAccount() {
  const { account, isConnected, isLoading, connectWallet } = useWallet();
  
  return {
    account,
    isConnected,
    isLoading,
    connectWallet
  };
}