// frontend/src/components/ArtworkCard.tsx

import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ethers } from 'ethers';

// --- NEW: Import contract ABI ---
import NFTMarketplace from '../abi/NFTMarketplace.json';

// --- IMPORTANT: UPDATE THIS ADDRESS ---
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export interface Artwork {
  id: string; // Token ID
  title: string;
  description: string;
  imageUrl: string;
  price: string; // Price in ETH
  period: string;
  type: string;
  date: string;
  location: string;
}

interface ArtworkCardProps {
  artwork: Artwork;
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  // --- NEW: Buy NFT Function ---
  const handleBuy = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask to transact.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);

      const transaction = await contract.purchaseNFT(artwork.id, {
        value: ethers.parseEther(artwork.price), // Convert price from ETH to Wei
      });

      await transaction.wait();
      alert("Purchase successful! The NFT is now yours.");
      window.location.reload(); // Refresh the page to update ownership

    } catch (error: any) {
      console.error("Purchase failed:", error);
      alert(`Purchase failed: ${error.reason || error.message}`);
    }
  };

  return (
    <Card className="group relative w-full bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20">
      <div className="absolute inset-0 transition-all duration-500 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-zinc-900/50 to-transparent" />

      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-5 space-y-4">
        <h3 className="font-light text-xl tracking-wide text-white truncate">
          {artwork.title}
        </h3>
        
        <div className="flex justify-between items-center text-sm text-zinc-400 border-t border-white/10 pt-4">
          <div>
            <span className="uppercase tracking-widest text-xs">Period</span>
            <p className="text-white">{artwork.period}</p>
          </div>
          <div className="text-right">
            <span className="uppercase tracking-widest text-xs">Date</span>
            <p className="text-white">{artwork.date}</p>
          </div>
        </div>
        
        {/* --- NEW: Price Display --- */}
        <div className="flex justify-between items-center pt-2">
            <p className="text-2xl font-light gold-accent tracking-wide font-serif">
                {artwork.price} ETH
            </p>
        </div>
        
        {/* --- NEW: Acquire Button --- */}
        <Button 
            onClick={handleBuy}
            className="w-full rounded-lg bg-primary/90 text-background h-12 text-md font-semibold tracking-wider uppercase transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/30"
        >
            Acquire
        </Button>
      </div>
    </Card>
  );
}