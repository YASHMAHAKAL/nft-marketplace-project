import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <-- PASTE YOUR DEPLOYED CONTRACT ADDRESS HERE
  const marketplace = await ethers.getContractAt("NFTMarketplace", contractAddress);
  const [signer] = await ethers.getSigners();
  
  console.log("Minting and listing NFTs with the account:", signer.address);

  // We'll mint 3 NFTs and list them for 0.1, 0.2, and 0.3 ETH respectively
  for (let i = 0; i < 3; i++) {
    const tokenURI = `ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi/${i + 1}.json`;
    
    console.log(`Minting NFT with token URI: ${tokenURI}`);
    const tx = await marketplace.mintNFT(tokenURI);
    const receipt = await tx.wait();

    const transferEvent = receipt.logs.find((log: any) => log.eventName === 'Transfer');
    if (!transferEvent) {
      throw new Error("Transfer event not found in transaction receipt");
    }
    const tokenId = transferEvent.args[2];
    
    const price = ethers.parseEther(`${(i + 1) * 0.1}`);
    console.log(`Listing NFT ${tokenId.toString()} for ${ethers.formatEther(price)} ETH`);
    let listTx = await marketplace.listNFTForSale(tokenId, price);
    await listTx.wait();
  }

  console.log("\nFinished minting and listing sample NFTs!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});