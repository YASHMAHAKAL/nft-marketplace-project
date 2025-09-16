import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const NFTMarketplaceModule = buildModule("NFTMarketplaceModule", (m) => {
  // Set a 2.5% platform fee (250 basis points)
  const platformFee = m.getParameter("platformFee", 250);

  const nftMarketplace = m.contract("NFTMarketplace", [platformFee]);

  return { nftMarketplace };
});

export default NFTMarketplaceModule;