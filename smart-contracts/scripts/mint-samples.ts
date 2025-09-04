// smart-contracts/scripts/mint-samples.ts

import { ethers } from "hardhat";
import { NFTMarketplace } from "../typechain-types";

// --- NEW: Data for the 6 artworks from the Greek theme ---
const artworksToMint = [
  {
    title: "Venus de Milo",
    description: "Ancient Greek marble sculpture believed to depict Aphrodite, the Greek goddess of love and beauty.",
    type: "Sculpture",
    imageUrl: "https://images.unsplash.com/photo-1598564254441-be3be79c2b9a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmNpZW50JTIwZ3JlZWslMjBzY3VscHR1cmUlMjBtYXJibGV8ZW58MXx8fHwxNzU2OTgxODYxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "1.5"
  },
  {
    title: "Black-Figure Amphora",
    description: "Ancient Greek pottery featuring the distinctive black-figure technique, depicting mythological scenes.",
    type: "Pottery",
    imageUrl: "https://images.unsplash.com/photo-1618722060945-b87f7326995b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHBvdHRlcnklMjBhbmNpZW50JTIwdmFzZXxlbnwxfHx8fDE3NTY5ODE4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "0.8"
  },
  {
    title: "The Parthenon",
    description: "Temple dedicated to the goddess Athena, representing the pinnacle of Classical Greek architecture.",
    type: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1622272516735-283ce92fb934?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJ0aGVub24lMjBncmVlayUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTY5ODE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "2.2"
  },
  {
    title: "Hellenistic Goddess",
    description: "Marble sculpture showcasing the refined artistry of the Hellenistic period, with detailed drapery.",
    type: "Sculpture",
    imageUrl: "https://images.unsplash.com/photo-1746270083992-886b48c22ab4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMHN0YXR1ZSUyMHZlbnVzJTIwYW5jaWVudHxlbnwxfHx8fDE3NTY5ODE4NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "1.8"
  },
  {
    title: "Ancient Greek Mosaic",
    description: "Intricate mosaic artwork demonstrating the sophisticated decorative techniques used in Greek homes.",
    type: "Mosaic",
    imageUrl: "https://images.unsplash.com/photo-1631715629294-71d905c66378?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMG1vc2FpYyUyMGFuY2llbnQlMjBhcnR8ZW58MXx8fHwxNzU2OTgxODYyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "0.5"
  },
  {
    title: "Doric Temple Columns",
    description: "Classic example of Doric order architecture, featuring characteristic simplicity and strength.",
    type: "Architecture",
    imageUrl: "https://images.unsplash.com/photo-1636392589616-ec1ad83358ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmVlayUyMGNvbHVtbiUyMHRlbXBsZSUyMGFuY2llbnR8ZW58MXx8fHwxNzU2OTgxODYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    price: "1.2"
  }
];

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- IMPORTANT
  
  const marketplace = await ethers.getContractAt("NFTMarketplace", contractAddress) as NFTMarketplace;

  console.log(`Connected to marketplace at: ${contractAddress}`);
  const [signer] = await ethers.getSigners();
  console.log(`Minting and listing with account: ${signer.address}`);

  // --- MODIFIED: Loop through the new artworks array ---
  for (const artwork of artworksToMint) {
    console.log(`\nMinting "${artwork.title}"...`);

    // 1. Create Metadata and TokenURI
    const metadata = {
      title: artwork.title,
      description: artwork.description,
      image: artwork.imageUrl,
      type: artwork.type,
    };
    const tokenURI = `data:application/json;base64,${Buffer.from(JSON.stringify(metadata)).toString("base64")}`;

    // 2. Mint the NFT
    const mintTx = await marketplace.mintNFT(tokenURI);
    const mintReceipt = await mintTx.wait();
    
    // Find the tokenId from the transaction events
    const mintEvent = mintReceipt?.logs.find(
        (log: any) => log.eventName === 'Transfer' && log.args
    );
    if (!mintEvent || !mintEvent.args) {
        throw new Error("Minting failed, Transfer event not found.");
    }
    const tokenId = mintEvent.args.tokenId;
    console.log(` -> NFT minted successfully! Token ID: ${tokenId}`);

    // 3. List the NFT for Sale
    const priceInWei = ethers.parseEther(artwork.price);
    const listTx = await marketplace.listNFTForSale(tokenId, priceInWei);
    await listTx.wait();
    console.log(` -> Listed "${artwork.title}" for ${artwork.price} ETH.`);
  }

  console.log("\n✅ All sample artworks have been minted and listed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});