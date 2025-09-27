// frontend/src/components/ArtworkCard.tsx

import { useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from "../config/contract";
import { mlService } from "../services/ml-service";
import { useAccount } from "../hooks/useAccount";
import { Heart as HeartIcon } from 'lucide-react';

// --- NEW: Import contract ABI ---
import NFTMarketplace from '../abi/NFTMarketplace.json';



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
  isRecommended?: boolean;
  isFavorite?: boolean;
}

export function ArtworkCard({ artwork, isRecommended = false, isFavorite = false }: ArtworkCardProps) {
  const { account } = useAccount();

  useEffect(() => {
    // Log view interaction when the artwork is rendered and user is connected
    const logView = async () => {
      if (account) {
        try {
          await mlService.updateUserPreferences(account, artwork.id);
          console.log('Logged view for artwork:', artwork.id);
        } catch (error) {
          console.error('Failed to log view:', error);
        }
      }
    };
    logView();
  }, [artwork.id, account]);

  // --- NEW: Buy NFT Function ---
  const handleBuy = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("Please install MetaMask to transact.");
      return;
    }

    // Ask for confirmation before proceeding
    const confirmPurchase = window.confirm(
      `Are you sure you want to purchase "${artwork.title}" for ${artwork.price} ETH?`
    );
    
    if (!confirmPurchase) return;

    try {
      // Check for fraud before proceeding
      const fraudCheck = await mlService.checkFraud(artwork.id);
      if (fraudCheck.isFraudulent) {
        const proceed = window.confirm(
          `Warning: This transaction has been flagged as potentially fraudulent (${fraudCheck.confidence}% confidence).\n\nReason: ${fraudCheck.reason}\n\nDo you still want to proceed?`
        );
        if (!proceed) return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      // Request account access
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      console.log("Connected with address:", address);
      
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        NFTMarketplace.abi,
        signer // Connect with signer for transactions
      );

      console.log(`Attempting to purchase NFT #${artwork.id} for ${artwork.price} ETH`);
      
      const transaction = await contract.purchaseNFT(artwork.id, {
        value: ethers.parseEther(artwork.price), // Convert price from ETH to Wei
      });

      console.log("Transaction sent:", transaction.hash);
      
      const receipt = await transaction.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Update user preferences after successful purchase
      await mlService.updateUserPreferences(address, artwork.id);
      
      alert("Purchase successful! The NFT is now yours.");
      window.location.reload(); // Refresh the page to update ownership

    } catch (error: any) {
      console.error("Purchase failed:", error);
      alert(`Purchase failed: ${error.reason || error.message}`);
    }
  };

      return (
    <Card className={`group relative w-full bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20 ${isRecommended ? 'ring-2 ring-amber-400/50' : ''} ${isFavorite ? 'ring-2 ring-red-400/50' : ''}`}>
      {isRecommended && (
        <div className="absolute right-2 top-2 z-10">
          <span className="bg-amber-400/90 text-black text-xs px-2 py-1 rounded-full font-medium">
            Recommended
          </span>
        </div>
      )}
      {isFavorite && (
        <div className="absolute left-2 top-2 z-10">
          <span className="bg-red-400/90 text-white text-xs px-2 py-1 rounded-full font-medium">
            ❤️ Favorite
          </span>
        </div>
      )}
      <div className="absolute inset-0 transition-all duration-500 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="font-light text-xl tracking-wide text-white truncate flex-1">
            {artwork.title}
          </h3>
          {account && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-zinc-400 hover:text-amber-400 transition-colors"
              onClick={async () => {
                if (!account) {
                  alert('Please connect your wallet first!');
                  return;
                }
                
                console.log('Adding to favorites - Account:', account, 'TokenID:', artwork.id);
                try {
                  await mlService.updateUserPreferences(account, artwork.id);
                  alert(`Added "${artwork.title}" to favorites! Visit the Favorites page to see all your liked items.`);
                } catch (error) {
                  console.error('Error adding to favorites:', error);
                  alert('Failed to add to favorites. Please try again.');
                }
              }}
            >
              <HeartIcon className="h-5 w-5" />
            </Button>
          )}
        </div>
        
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