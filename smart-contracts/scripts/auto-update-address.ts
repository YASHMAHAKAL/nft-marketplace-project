import { updateContractAddress } from "./update-contract-address";
import fs from 'fs';
import path from 'path';

async function getLatestIgnitionDeployment() {
  try {
    // Path to Ignition deployments directory
    const ignitionPath = path.join(__dirname, '../ignition/deployments');
    
    // Get all network folders (e.g., chain-31337, chain-11155111)
    const networks = fs.readdirSync(ignitionPath)
      .filter(f => fs.statSync(path.join(ignitionPath, f)).isDirectory());

    if (networks.length === 0) {
      throw new Error("No Ignition deployments found.");
    }

    // Find the latest deployment for each network
    const deployments = networks.map(network => {
      const networkPath = path.join(ignitionPath, network);
      const files = fs.readdirSync(networkPath)
        .filter(f => f.endsWith('.json'))
        .map(f => ({
          name: f,
          time: fs.statSync(path.join(networkPath, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

      return {
        network,
        file: files[0]?.name,
        time: files[0]?.time
      };
    }).filter(d => d.file);

    // Get the most recent deployment across all networks
    const latestDeployment = deployments.sort((a, b) => b.time - a.time)[0];

    if (!latestDeployment) {
      throw new Error("No deployment files found.");
    }

    // Read the deployment file
    const deploymentPath = path.join(
      ignitionPath, 
      latestDeployment.network, 
      latestDeployment.file
    );
    
    const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

    // Handle new Ignition deployment format
    if (!deployment || typeof deployment !== 'object') {
      throw new Error("Invalid deployment file format");
    }

    // Log the deployment structure for debugging
    console.log("Deployment file structure:", JSON.stringify(deployment, null, 2));

    // Find the NFTMarketplace contract address
    const contractAddress = Object.entries(deployment)
      .find(([key]) => key.includes('NFTMarketplace'))?.[1];

    if (!contractAddress || typeof contractAddress !== 'string') {
      throw new Error("NFTMarketplace contract address not found in deployment file");
    }

    return {
      address: contractAddress,
      network: latestDeployment.network,
      deploymentFile: latestDeployment.file
    };
  } catch (error: any) {
    throw new Error(`Failed to get latest deployment: ${error.message}`);
  }
}

async function main() {
  try {
    console.log("🔍 Finding latest Ignition deployment...");
    
    const deployment = await getLatestIgnitionDeployment();
    
    console.log(`\nFound deployment:`);
    console.log(`Network: ${deployment.network}`);
    console.log(`File: ${deployment.deploymentFile}`);
    console.log(`Contract Address: ${deployment.address}`);

    // Update both .env files
    await updateContractAddress(deployment.address);

    console.log("\n📝 Next steps:");
    console.log("1. Start your local network if not running:");
    console.log("   npx hardhat node");
    console.log("\n2. Mint sample NFTs:");
    console.log("   npx hardhat run scripts/mint-samples.ts --network localhost");
    console.log("\n3. Start the frontend:");
    console.log("   cd ../frontend && npm run dev");

  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

// Execute the script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});