import { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { NFTCard } from './NFTCard';
import NFTMarketplaceAbi from '../abi/NFTMarketplace.json';

// Define the data structure for our NFTs
interface NftData {
  id: number;
  name: string;
  image: string;
  price: string;
}

export const NFTGrid = () => {
  const [nfts, setNfts] = useState<NftData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNfts = async () => {
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- PASTE YOUR ADDRESS HERE
      const network = { name: "hardhat", chainId: 31337 };
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/", network);
      const contract = new ethers.Contract(contractAddress, NFTMarketplaceAbi.abi, provider);

      try {
        // 1. Call the totalSupply() function from your smart contract
        const totalSupply = await contract.totalSupply();
        const fetchedNfts: NftData[] = [];

        // 2. Loop through each token ID
        for (let i = 0; i < totalSupply; i++) {
          // Get the listing details for each token
          const listing = await contract.listings(i);
          
          // Only show NFTs that are actually listed for sale
          if (listing.price > 0) {
            fetchedNfts.push({
              id: i,
              name: `Hellenic Artifact #${i + 1}`,
              image: `https://picsum.photos/400/400?random=${i}&grayscale&blur=1`,
              price: ethers.formatEther(listing.price), // Get the real price
            });
          }
        }
        setNfts(fetchedNfts);
      } catch (error) {
        console.error("Could not fetch NFTs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNfts();
  }, []); // The empty array means this effect runs only once

  if (loading) {
    return <Typography>Loading the gallery...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {nfts.map((nft) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={nft.id}>
            {/* Pass the real data to the NFTCard */}
            <NFTCard tokenId={nft.id} name={nft.name} image={nft.image} price={nft.price} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};