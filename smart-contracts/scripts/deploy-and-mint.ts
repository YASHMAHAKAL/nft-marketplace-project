import { execSync } from 'child_process';
import { updateContractAddress } from './update-contract-address';
import fs from 'fs';
import path from 'path';

async function getLatestIgnitionAddress(): Promise<string> {
  const ignitionPath = path.join(__dirname, '../ignition/deployments');
  const networks = fs.readdirSync(ignitionPath)
    .filter(f => fs.statSync(path.join(ignitionPath, f)).isDirectory());

  if (networks.length === 0) {
    throw new Error("No Ignition deployments found.");
  }

  const latestNetwork = networks
    .map(network => ({
      network,
      time: fs.statSync(path.join(ignitionPath, network)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)[0];

  const deploymentFiles = fs.readdirSync(path.join(ignitionPath, latestNetwork.network))
    .filter(f => f.endsWith('.json'));

  if (deploymentFiles.length === 0) {
    throw new Error("No deployment files found.");
  }

  const latestDeployment = deploymentFiles
    .map(file => ({
      file,
      time: fs.statSync(path.join(ignitionPath, latestNetwork.network, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time)[0];

  const deployment = JSON.parse(
    fs.readFileSync(
      path.join(ignitionPath, latestNetwork.network, latestDeployment.file),
      'utf8'
    )
  );

  const contractAddress = Object.entries(deployment)
    .find(([key]) => key.includes('NFTMarketplace'))?.[1];

  if (!contractAddress || typeof contractAddress !== 'string') {
    throw new Error("NFTMarketplace contract address not found");
  }

  return contractAddress;
}

async function main() {
  try {
    console.log("\n🚀 Starting complete deployment process...");

    // 1. Deploy the contract
    console.log("\n📄 Deploying NFT Marketplace contract...");
    execSync('npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost --reset', { stdio: 'inherit' });

    // 2. Get the new contract address and update .env files
    console.log("\n🔍 Getting deployed contract address...");
    const contractAddress = await getLatestIgnitionAddress();
    console.log(`✓ Contract deployed at: ${contractAddress}`);

    // 3. Update .env files
    console.log("\n📝 Updating contract address in .env files...");
    await updateContractAddress(contractAddress);

    // 4. Mint sample NFTs
    console.log("\n🎨 Minting sample NFTs...");
    execSync('npx hardhat run scripts/mint-samples.ts --network localhost', { stdio: 'inherit' });

    console.log("\n✅ Complete deployment process finished successfully!");
    console.log("\nNext steps:");
    console.log("1. Start the frontend:");
    console.log("   cd ../frontend && npm run dev");
    console.log("\n2. Connect MetaMask to localhost:8545");
    console.log("3. Import a test account using private keys from the hardhat node output");

  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});