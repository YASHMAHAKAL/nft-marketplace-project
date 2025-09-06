// frontend/src/components/Header.tsx

import { Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { setAccount, RootState } from '../store';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMintClick: () => void; // --- NEW: Prop to open the mint modal ---
}

export function Header({ onSearch, onMintClick }: HeaderProps) {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.wallet.account);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        dispatch(setAccount(address));
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left side remains unchanged */}
        <div className="flex items-center gap-12">
            {/* ... (logo and nav links) ... */}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search..."
              className="pl-10 w-64 h-10 bg-white/5 border-white/10 rounded-full text-white placeholder:text-zinc-400"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {account ? (
            <div className="flex items-center gap-2">
              {/* --- NEW: "Create" Button --- */}
              <Button onClick={onMintClick} variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                Create
              </Button>
              <span className="text-sm font-mono text-zinc-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                {formatAddress(account)}
              </span>
            </div>
          ) : (
            <Button onClick={connectWallet} className="rounded-full bg-primary/90 text-background font-semibold hover:bg-primary">
              Connect Wallet
            </Button>
          )}

          <Button variant="ghost" size="icon" className="md:hidden text-zinc-300 hover:text-white">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}