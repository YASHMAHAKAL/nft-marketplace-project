import { Card, CardContent, CardMedia, Typography, Button, Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { useWalletStore } from '../store';
import NFTMarketplaceAbi from '../abi/NFTMarketplace.json';
import { useState } from 'react';

interface NFTCardProps {
  tokenId: number;
  name: string;
  image: string;
  price: string;
}

export const NFTCard = ({ tokenId, name, image, price }: NFTCardProps) => {
  const { account } = useWalletStore();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (!account || !window.ethereum) {
      alert("Please connect your wallet first.");
      return;
    }
    setLoading(true);
    try {
      // Remember to use the address from your local Hardhat node
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTMarketplaceAbi.abi, signer);
      
      const priceInWei = ethers.parseEther(price);
      const tx = await contract.purchaseNFT(tokenId, { value: priceInWei });
      
      console.log("Transaction sent:", tx.hash);
      await tx.wait(); // Wait for the transaction to be mined
      
      alert("Purchase successful!");
      // Here you would typically refresh the list of NFTs
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card sx={{ 
        backgroundColor: 'background.paper',
        border: '1px solid',
        borderColor: 'rgba(255, 193, 7, 0.2)', // Subtle gold border
        transition: 'border-color 0.3s, box-shadow 0.3s',
        '&:hover': {
          borderColor: 'secondary.main', // Bright gold border on hover
          boxShadow: '0px 0px 15px rgba(255, 193, 7, 0.5)', // Gold glow on hover
        }
      }}>
        <CardMedia component="img" height="240" image={image} alt={name} />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div">{name}</Typography>
          <Typography variant="body2" color="text.secondary">{price} ETH</Typography>
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="secondary" // Use gold for the button
              fullWidth 
              onClick={handlePurchase} 
              disabled={loading || !account}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Buy Now"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};