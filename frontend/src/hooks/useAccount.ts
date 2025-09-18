import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export function useAccount() {
  const [account, setAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccount = async () => {
      setIsLoading(true);
      if (typeof window.ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          setAccount(await signer.getAddress());
        } catch (error) {
          console.error('Failed to get account:', error);
          setAccount(null);
        }
      }
      setIsLoading(false);
    };

    checkAccount();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return {
    account,
    isLoading,
    isConnected: !!account
  };
}