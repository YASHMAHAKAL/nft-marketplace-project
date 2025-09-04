import { useState, ChangeEvent } from 'react';
import { Box, Container, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';
import { ethers } from 'ethers';
import { useWalletStore } from '../store';
import NFTMarketplaceAbi from '../abi/NFTMarketplace.json';

export const MintPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const { account } = useWalletStore();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || !name || !description || !account || !window.ethereum) {
      alert("Please connect your wallet and fill in all fields.");
      return;
    }
    setLoading(true);
    setStatus('1/3: Uploading artwork to IPFS...');

    try {
      // --- Step 1: Upload the image to IPFS via Pinata ---
      const formData = new FormData();
      formData.append("file", file);
      const pinataJwt = import.meta.env.VITE_PINATA_JWT;

      const imageRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          'Authorization': `Bearer ${pinataJwt}`
        }
      });
      const imageUri = `ipfs://${imageRes.data.IpfsHash}`;
      console.log("Image URI: ", imageUri);

      // --- Step 2: Upload the metadata JSON to IPFS ---
      setStatus('2/3: Uploading metadata to IPFS...');
      const metadata = {
        name,
        description,
        image: imageUri,
      };
      const metadataRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: {
          'Authorization': `Bearer ${pinataJwt}`
        }
      });
      const metadataUri = `ipfs://${metadataRes.data.IpfsHash}`;
      console.log("Metadata URI: ", metadataUri);

      // --- Step 3: Mint the NFT on the blockchain ---
      setStatus('3/3: Minting NFT... Please approve in MetaMask.');
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- PASTE YOUR SEPOLIA or LOCAL ADDRESS
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTMarketplaceAbi.abi, signer);
      
      const tx = await contract.mintNFT(metadataUri);
      await tx.wait();

      setStatus('Success! Your NFT has been minted.');
      alert('NFT Minted Successfully!');

    } catch (error) {
      console.error("Error during minting process:", error);
      setStatus('Minting failed. See console for details.');
      alert("Minting failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New NFT
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Button variant="outlined" component="label" fullWidth>
            Upload Artwork
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography sx={{ mt: 1 }}>Selected: {file.name}</Typography>}
          
          <TextField fullWidth label="NFT Name" value={name} onChange={(e) => setName(e.target.value)} required margin="normal" />
          <TextField fullWidth label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required multiline rows={4} margin="normal" />

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Mint NFT"}
          </Button>

          {loading && <Alert severity="info">{status}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};