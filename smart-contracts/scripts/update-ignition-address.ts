import { updateContractAddress } from "../scripts/update-contract-address";

async function main() {
  // The address from your Ignition deployment
  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  
  try {
    await updateContractAddress(contractAddress);
    console.log("\n✅ Contract address from Ignition deployment has been updated in both .env files");
    console.log("You can now run the minting script:");
    console.log("npx hardhat run scripts/mint-samples.ts --network localhost");
  } catch (error) {
    console.error("Failed to update contract addresses:", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});