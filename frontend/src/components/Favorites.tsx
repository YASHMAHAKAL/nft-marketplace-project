import { useState, useEffect } from 'react';
import { ArtworkCard } from './ArtworkCard';
import { useAccount } from '../hooks/useAccount';
import { mlService } from '../services/ml-service';
import type { Artwork } from '../types/artwork';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from '../config/contract';
import NFTMarketplace from '../abi/NFTMarketplace.json';

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/");
const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTMarketplace.abi, provider);

export function Favorites() {
  const { account, isLoading: isAccountLoading } = useAccount();
  const [favoriteArtworks, setFavoriteArtworks] = useState<Artwork[]>([]);
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritesData = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // First, fetch all NFTs
        const totalSupply = await contract.totalSupply();
        const fetchedArtworks: Artwork[] = [];

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

        // Now fetch favorites
        const favorites = await mlService.getFavorites(account);
        console.log('Fetched favorites:', favorites);
        
        const favoriteIds = favorites.map(fav => fav.tokenId.toString());
        const favoriteArtworksList = fetchedArtworks.filter(artwork => 
          favoriteIds.includes(artwork.id)
        );
        
        setFavoriteArtworks(favoriteArtworksList);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoritesData();
  }, [account]);

  if (isAccountLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24">
        <div className="container mx-auto px-6">
          <div className="text-center py-24">
            <h3 className="text-xl text-zinc-400 font-light tracking-widest">Loading Favorites...</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24">
        <div className="container mx-auto px-6">
          <div className="text-center py-24">
            <h2 className="text-4xl text-white mb-4 font-light">Connect Your Wallet</h2>
            <p className="text-zinc-400">Please connect your wallet to view your favorite artworks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-tight text-white mb-4 flex items-center justify-center">
            <span className="mr-4">❤️</span>
            Your Favorites
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Your curated collection of favorite artworks
          </p>
        </div>

        {favoriteArtworks.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-6">💔</div>
            <h3 className="text-2xl text-white mb-4 font-light">No Favorites Yet</h3>
            <p className="text-zinc-400 mb-8">
              Start exploring the gallery and click the heart icon on artworks you love!
            </p>
            <a 
              href="/gallery" 
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg transition-colors"
            >
              Explore Gallery
            </a>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-zinc-400 text-center">
                {favoriteArtworks.length} favorite{favoriteArtworks.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favoriteArtworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} isFavorite />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}