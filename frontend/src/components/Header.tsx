// frontend/src/components/Header.tsx

import { Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWallet } from '../contexts/WalletContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  onMintClick: () => void;
}

export function Header({ onSearch, onMintClick }: HeaderProps) {
  const { account, isConnected, isLoading, connectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors">
              Ancient Treasures
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-zinc-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link to="/favorites" className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2">
              <span>❤️</span>
              Favorites
            </Link>
            <button 
              onClick={onMintClick}
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Mint NFT
            </button>
          </nav>
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

          {isConnected && account ? (
            <div className="flex items-center gap-2">
              <Button 
                onClick={onMintClick} 
                variant="outline" 
                className="rounded-full bg-white/10 border-white/20 hover:bg-white/20"
              >
                Create
              </Button>
              <span className="text-sm font-mono text-zinc-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                {formatAddress(account)}
              </span>
            </div>
          ) : (
            <Button 
              onClick={connectWallet} 
              disabled={isLoading}
              className="rounded-full bg-primary/90 text-background font-semibold hover:bg-primary disabled:opacity-50"
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
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