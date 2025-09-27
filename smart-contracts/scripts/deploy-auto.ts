import { ethers } from "hardhat";
import { updateContractAddress } from "./update-contract-address";

async function main() {
  try {
    console.log("\n🚀 Deploying NFT Marketplace...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy the NFTMarketplace contract with 2.5% platform fee (250 basis points)
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace", deployer);
    const marketplace = await NFTMarketplace.deploy(250); // 2.5% platform fee
    await marketplace.waitForDeployment();

    const contractAddress = await marketplace.getAddress();
    console.log("✓ NFTMarketplace deployed to:", contractAddress);

    // Update contract addresses in .env files
    await updateContractAddress(contractAddress);

    console.log("\n🎉 Deployment completed successfully!");
    console.log("You can now start the frontend with:");
    console.log("cd frontend && npm run dev");
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});