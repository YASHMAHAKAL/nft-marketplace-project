// frontend/src/components/MintModal.tsx

import { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import NFTMarketplace from '../abi/NFTMarketplace.json';
import { ImageUp } from 'lucide-react';

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface MintModalProps {
  onClose: () => void;
}

export function MintModal({ onClose }: MintModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !price || !file) {
      alert('Please fill out all fields and select a file.');
      return;
    }
    setIsMinting(true);

    try {
      setStatusMessage('Uploading image to IPFS...');
      const formData = new FormData();
      formData.append("file", file);
      const pinataJWT = import.meta.env.VITE_PINATA_JWT;

      const resFile = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: { 'Authorization': `Bearer ${pinataJWT}` },
      });
      const imageUri = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;

      setStatusMessage('Uploading metadata...');
      const metadata = { name: title, description, image: imageUri };
      const resJson = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", metadata, {
        headers: { 'Authorization': `Bearer ${pinataJWT}` },
      });
      const tokenUri = `https://gateway.pinata.cloud/ipfs/${resJson.data.IpfsHash}`;

      setStatusMessage('Confirming transaction...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);

      const mintTx = await contract.mintNFT(tokenUri);
      const mintReceipt = await mintTx.wait();
      
      const mintEvent = mintReceipt?.logs.find((log: any) => log.eventName === 'Transfer' && log.args);
      const tokenId = mintEvent.args.tokenId;

      const listingPrice = ethers.parseEther(price);
      const listTx = await contract.listNFTForSale(tokenId, listingPrice);
      await listTx.wait();
      
      alert('Your artwork has been minted and listed!');
      onClose();
      window.location.reload();

    } catch (error) {
      console.error("Minting failed:", error);
      alert("Minting failed. Please check the console and ensure your Pinata key is correct.");
    } finally {
      setIsMinting(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <Card className="w-full max-w-lg marble-texture border classical-border classical-shadow" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="text-center">
          <CardTitle className="gold-accent text-3xl font-light tracking-wide">Create a New Artifact</CardTitle>
          <CardDescription className="text-muted-foreground tracking-widest uppercase">Add your masterpiece to the collection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMint} className="space-y-6">
            <Input placeholder="Title of the artwork" value={title} onChange={(e) => setTitle(e.target.value)} required className="bg-card/50" />
            <Textarea placeholder="A brief description of the piece" value={description} onChange={(e) => setDescription(e.target.value)} required className="bg-card/50" />
            <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-4 p-4 rounded-md border-2 border-dashed border-border/50 bg-card/50 cursor-pointer hover:border-primary/50 transition-colors">
              <ImageUp className="w-6 h-6 text-muted-foreground" />
              <span className="text-muted-foreground">{file ? file.name : 'Upload Artwork Image'}</span>
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} required className="hidden" />
            <Input placeholder="Listing Price in ETH" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className="bg-card/50" />
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isMinting}>Cancel</Button>
              <Button type="submit" disabled={isMinting} className="bg-primary text-background hover:bg-primary/90 min-w-[120px]">
                {isMinting ? statusMessage : 'Mint & List'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}