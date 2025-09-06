// frontend/src/components/Gallery.tsx

import { useState, useMemo, useEffect } from "react";
import { ArtworkCard, type Artwork } from "./ArtworkCard";
import { ArtworkFilters } from "./ArtworkFilters";
import { ethers } from 'ethers';

// --- NEW: Import contract ABI ---
import NFTMarketplace from '../abi/NFTMarketplace.json';

// --- IMPORTANT: CONFIGURE THESE VALUES ---
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Paste the address from your deployment
const rpcUrl = "http://127.0.0.1:8545/"; // This is the address for your local Hardhat node

interface GalleryProps {
  searchQuery: string;
}

export function Gallery({ searchQuery }: GalleryProps) {
  // --- NEW: State for artworks and loading status ---
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedType, setSelectedType] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');

  // --- NEW: useEffect to fetch data from the smart contract ---
  useEffect(() => {
    const fetchListedNFTs = async () => {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, NFTMarketplace.abi, provider);
      
      try {
        const fetchedArtworks: Artwork[] = [];
        const totalSupply = await contract.totalSupply();

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
        setAllArtworks(fetchedArtworks);
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListedNFTs();
  }, []); // Empty dependency array means this runs once on component mount

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
        
        {/* --- NEW: Conditional rendering for loading state --- */}
        {isLoading ? (
            <div className="text-center py-24">
                <h3 className="text-xl text-zinc-400 font-light tracking-widest">Loading Treasures...</h3>
            </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-24">
            <h3 className="text-2xl text-white mb-2 font-light">No Artifacts Found</h3>
            <p className="text-zinc-400">Your collection will appear here once minted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}