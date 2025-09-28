

import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { ArtworkCard } from './ArtworkCard';
import { mlService } from '../services/ml-service';
import type { Artwork } from '../types/artwork';

export default function Favorites() {
  const { account, isConnected, isLoading: walletLoading, connectWallet } = useWallet();
  const [favoriteArtworks, setFavoriteArtworks] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle favorite changes from ArtworkCard
  const handleFavoriteChange = (artworkId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // Remove from favorites
      setFavoriteArtworks(prev => prev.filter(fav => fav.id !== artworkId));
    }
    // Note: We don't add to favorites here since this is the favorites page
    // Items are added through the main gallery
  };

  // Fetch all NFTs and user favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // First fetch all NFTs to match against favorites
        const { ethers } = await import('ethers');
        const { CONTRACT_ADDRESS } = await import('../config/contract');
        const NFTMarketplace = await import('../abi/NFTMarketplace.json');
        
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, provider);

        const fetchedArtworks: Artwork[] = [];
        const totalSupply = await contract.totalSupply();

        for (let i = 0; i < totalSupply; i++) {
          const listing = await contract.listings(i);
          if (listing.price > 0) {
            const tokenURI = await contract.tokenURI(i);
            
            let metadata;
            if (tokenURI.startsWith("data:application/json")) {
              metadata = JSON.parse(atob(tokenURI.substring(29)));
            } else {
              const metadataResponse = await fetch(tokenURI);
              metadata = await metadataResponse.json();
            }

            fetchedArtworks.push({
              id: i.toString(),
              title: metadata.title || "Untitled Artwork",
              description: metadata.description || "No description available.",
              imageUrl: metadata.image || "",
              price: ethers.formatEther(listing.price),
              period: metadata.period || "Classical",
              type: metadata.type || "Artifact",
              date: "N/A",
              location: "On-Chain",
            });
          }
        }

        setAllArtworks(fetchedArtworks);

        // Fetch user favorites
        const favorites = await mlService.getFavorites(account);
        const favoriteIds = favorites.map(fav => fav.tokenId.toString());
        const favoriteArtworksList = fetchedArtworks.filter(artwork => 
          favoriteIds.includes(artwork.id)
        );
        
        setFavoriteArtworks(favoriteArtworksList);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [account]);

  if (walletLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <section className="py-24 sm:py-32 bg-zinc-950">
        <div className="container mx-auto px-6">
          <div className="text-center min-h-[50vh] flex flex-col justify-center items-center">
            <h2 className="text-4xl font-light text-white mb-6">Connect Your Wallet</h2>
            <p className="text-lg text-zinc-400 mb-8 max-w-md">
              Please connect your MetaMask wallet to view your favorite artworks from our ancient collection
            </p>
            <button
              onClick={connectWallet}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 sm:py-32 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4">
            Your Favorites
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Curated collection of your most treasured ancient artifacts
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <h3 className="text-xl text-zinc-400 font-light tracking-widest">Loading your treasures...</h3>
          </div>
        ) : favoriteArtworks.length === 0 ? (
          <div className="text-center py-24">
            <div className="mb-8">
              <svg className="w-24 h-24 text-zinc-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-2xl text-white mb-4 font-light">No Favorites Yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Start building your collection by clicking the heart icon on artworks that capture your imagination
            </p>
            <a 
              href="/"
              className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-black font-semibold rounded-lg transition-colors"
            >
              Explore Gallery
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-zinc-400">
                {favoriteArtworks.length} treasured artifact{favoriteArtworks.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteArtworks.map((artwork) => (
                <ArtworkCard 
                  key={artwork.id} 
                  artwork={artwork} 
                  isFavorite 
                  onFavoriteChange={handleFavoriteChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}