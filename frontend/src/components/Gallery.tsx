// frontend/src/components/Gallery.tsx

import { useState, useMemo, useEffect } from "react";
import { ArtworkCard } from "./ArtworkCard";
import type { Artwork } from "../types/artwork";
import React from "react";
import { ArtworkFilters } from "./ArtworkFilters";
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from "../config/contract";
import { mlService } from "../services/ml-service";
import { useAccount } from "../hooks/useAccount";
import { useFavorites } from "../contexts/FavoritesContext";


// --- NEW: Import contract ABI -----
import NFTMarketplace from '../abi/NFTMarketplace.json';

// --- IMPORTANT: CONFIGURE THESE VALUES ---
const rpcUrl = "http://127.0.0.1:8545/"; // This is the address for your local Hardhat node
const provider = new ethers.JsonRpcProvider(rpcUrl);
const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, provider); // Connect the contract with provider

interface GalleryProps {
  searchQuery: string;
}

export function Gallery({ searchQuery }: GalleryProps) {
  const { account, isLoading: isAccountLoading } = useAccount();
  const { favoriteArtworks, isFavorite, refreshFavorites } = useFavorites();
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [recommendedArtworks, setRecommendedArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');

  useEffect(() => {
    const fetchNFTsAndRecommendations = async () => {
      try {
        setIsLoading(true);
        console.log('🎨 [GALLERY] Fetching NFTs and recommendations...');
        
        // Fetch NFTs from smart contract
        const totalSupply = await contract.totalSupply();
        const fetchedArtworks: Artwork[] = [];
        
        // Reset recommendations when account changes
        setRecommendedArtworks([]);
        console.log('📊 [GALLERY] Total supply:', totalSupply.toString());

        for (let i = 0; i < totalSupply; i++) {
          const listing = await contract.listings(i);
          // Check if the NFT is listed for sale (price > 0)
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
              date: "N/A", // You can add this to your metadata if desired
              location: "On-Chain", // You can add this to your metadata if desired
            });
          }
        }
        console.log('✅ [GALLERY] Fetched artworks:', fetchedArtworks);
        setAllArtworks(fetchedArtworks);

        // If user is connected, fetch recommendations and refresh favorites
        if (account) {
          try {
            console.log('🤖 [GALLERY] Fetching recommendations for account:', account);
            const recommendations = await mlService.getRecommendations(account);
            console.log('📋 [GALLERY] Received recommendations:', recommendations);
            const recommendedIds = recommendations.map(rec => rec.tokenId?.toString()).filter(Boolean);
            console.log('🔍 [GALLERY] Recommendation IDs:', recommendedIds);
            const recommendedArtworksList = fetchedArtworks.filter(artwork => 
              recommendedIds.includes(artwork.id)
            );
            console.log('✅ [GALLERY] Matched artworks:', recommendedArtworksList);
            setRecommendedArtworks(recommendedArtworksList);

            // Refresh favorites from context
            await refreshFavorites();
          } catch (error) {
            console.error("❌ [GALLERY] Failed to fetch recommendations:", error);
          }
        }

      } catch (error) {
        console.error("❌ [GALLERY] Failed to fetch NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTsAndRecommendations();
  }, [account, refreshFavorites]); // Re-run when account changes or when favorites context updates

  const filteredArtworks = useMemo(() => {
    return allArtworks.filter((artwork) => {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const matchesSearch = artwork.title.toLowerCase().includes(lowerCaseQuery) ||
                           artwork.description.toLowerCase().includes(lowerCaseQuery);
      
      const matchesType = selectedType === 'All' || artwork.type === selectedType;
      const matchesPeriod = selectedPeriod === 'All' || artwork.period === selectedPeriod;
      
      return matchesSearch && matchesType && matchesPeriod;
    });
  }, [searchQuery, selectedType, selectedPeriod, allArtworks]);

  return (
    <section id="gallery" className="py-24 sm:py-32 bg-zinc-950 relative">
      <div className="container mx-auto px-6 relative">
        
        <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4">
              Explore the Collection
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              Each artifact in our collection is a testament to the unparalleled skill and creativity of ancient artisans.
            </p>
        </div>

        <div className="mb-16">
          <ArtworkFilters
            selectedType={selectedType}
            selectedPeriod={selectedPeriod}
            onTypeChange={setSelectedType}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
        
        {isLoading || isAccountLoading ? (
            <div className="text-center py-24">
                <h3 className="text-xl text-zinc-400 font-light tracking-widest">Loading Treasures...</h3>
            </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-2xl text-white mb-2 font-light">No Artifacts Found</h3>
            <p className="text-zinc-400">Your collection will appear here once minted.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Favorites Section */}
            {account && favoriteArtworks.length > 0 && (
              <div>
                <h3 className="text-3xl text-white mb-8 font-light flex items-center">
                  <span className="mr-3">❤️</span>
                  Your Favorites
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {favoriteArtworks.map((artwork) => (
                    <ArtworkCard 
                      key={artwork.id} 
                      artwork={artwork}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Artworks Section */}
            {account && (
              <div>
                <h3 className="text-3xl text-white mb-8 font-light">Recommended for You</h3>
                {recommendedArtworks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendedArtworks.map((artwork) => (
                      <ArtworkCard 
                        key={artwork.id} 
                        artwork={artwork} 
                        isRecommended
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-400 text-center py-8">
                    No recommendations available yet. Start interacting with artworks to get personalized suggestions!
                  </p>
                )}
              </div>
            )}

            {/* All Artworks Section */}
            <div>
              <h3 className="text-3xl text-white mb-8 font-light">All Artifacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArtworks.map((artwork) => {
                  const isRecommended = recommendedArtworks.some(rec => rec.id === artwork.id);
                  
                  return (
                    <ArtworkCard 
                      key={artwork.id} 
                      artwork={artwork} 
                      isRecommended={isRecommended}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}