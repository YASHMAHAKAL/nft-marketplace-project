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
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- PASTE YOUR NEW ADDRESS HERE
      const network = { name: "hardhat", chainId: 31337 };
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545/", network);
      const contract = new ethers.Contract(contractAddress, NFTMarketplaceAbi.abi, provider);

      try {
        const totalSupply = await contract.totalSupply();
        const fetchedNfts: NftData[] = [];

        for (let i = 0; i < totalSupply; i++) {
          // Get the listing details for each token ID
          const listing = await contract.listings(i);
          // Only show NFTs that are actually listed for sale (price > 0)
          if (listing.price > 0) {
            fetchedNfts.push({
              id: i,
              name: `Digital Art #${i + 1}`,
              image: `https://picsum.photos/seed/${i}/400/400`,
              price: ethers.formatEther(listing.price), // Convert the price to an ETH string
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
  }, []);

  if (loading) {
    return <Typography>Loading NFTs...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={4}>
        {nfts.map((nft) => (
          <Grid item xs={12} sm={6} md={4} key={nft.id}>
            {/* Pass the new price prop to the NFTCard */}
            <NFTCard tokenId={nft.id} name={nft.name} image={nft.image} price={nft.price} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};