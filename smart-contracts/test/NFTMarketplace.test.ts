import {
  loadFixture,
} from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTMarketplace", function () {
  async function deployMarketplaceFixture() {
    const platformFee = 250; 
    const [owner, seller, buyer] = await ethers.getSigners();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = await NFTMarketplace.deploy(platformFee);

    return { marketplace, owner, seller, buyer, platformFee };
  }

  it("Should facilitate the full lifecycle of an NFT: mint, list, buy", async function () {
    const { marketplace, owner, seller, buyer, platformFee } = await loadFixture(deployMarketplaceFixture);
    const listingPrice = ethers.parseEther("1.0");
    const tokenURI = "https://example.com/token/1.json";
    const tokenId = 0;

    // 1. Mint
    await marketplace.connect(seller).mintNFT(tokenURI);
    expect(await marketplace.ownerOf(tokenId)).to.equal(seller.address);

    // 2. List
    await marketplace.connect(seller).listNFTForSale(tokenId, listingPrice);
    
    // 3. Buy
    await expect(marketplace.connect(buyer).purchaseNFT(tokenId, { value: listingPrice }))
      .to.changeEtherBalances(
        [owner, seller],
        [(listingPrice * BigInt(platformFee)) / 10000n, (listingPrice * BigInt(10000 - platformFee)) / 10000n]
      );

    // Final ownership check
    expect(await marketplace.ownerOf(tokenId)).to.equal(buyer.address);
  });
});