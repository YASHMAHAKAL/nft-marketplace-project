import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletContextType {
  account: string | null;
  provider: BrowserProvider | null;
  isConnected: boolean;
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (!window.ethereum) {
        throw new Error('MetaMask not installed');
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setProvider(provider);
        // Store connection state
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('connectedAccount', accounts[0]);
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setError(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('connectedAccount');
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const autoConnect = async () => {
      try {
        const wasConnected = localStorage.getItem('walletConnected');
        const savedAccount = localStorage.getItem('connectedAccount');

        if (wasConnected && savedAccount && window.ethereum) {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.send('eth_accounts', []); // Don't request, just check

          if (accounts.length > 0 && accounts[0] === savedAccount) {
            setAccount(accounts[0]);
            setProvider(provider);
          } else {
            // Account changed or disconnected, clear storage
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('connectedAccount');
          }
        }
      } catch (error) {
        console.error('Auto-connect failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    autoConnect();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          setAccount(accounts[0]);
          localStorage.setItem('connectedAccount', accounts[0]);
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  const value: WalletContextType = {
    account,
    provider,
    isConnected: !!account,
    isLoading,
    connectWallet,
    disconnectWallet,
    error
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};