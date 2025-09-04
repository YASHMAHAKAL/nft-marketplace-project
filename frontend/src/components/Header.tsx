// frontend/src/components/Header.tsx

import { Search, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ethers } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { setAccount, RootState } from '../store';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMintClick: () => void;
}

export function Header({ onSearch, onMintClick }: HeaderProps) {
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.wallet.account);

  const connectWallet = async () => {
    // ... (connect wallet logic remains the same)
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-zinc-900 border border-white/10">
              <span className="gold-accent text-xl font-light">Α</span>
            </div>
            <div className="flex flex-col">
              <h1 className="gold-accent text-2xl font-light tracking-wide">
                ΑΘΗΝΑΙΟΝ
              </h1>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <a href="#gallery" className="group relative text-zinc-300 hover:text-white transition-colors duration-300">
              Collection
              <span className="absolute left-0 -bottom-1 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#periods" className="group relative text-zinc-300 hover:text-white transition-colors duration-300">
              Periods
              <span className="absolute left-0 -bottom-1 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
            </a>
          </nav>
        </div>
        
        {/* Right side */}
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
              <Button onClick={onMintClick} variant="outline" className="rounded-full bg-white/10 border-white/20 hover:bg-white/20">
                Create
              </Button>
              <span className="text-sm font-mono text-zinc-300">{formatAddress(account)}</span>
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