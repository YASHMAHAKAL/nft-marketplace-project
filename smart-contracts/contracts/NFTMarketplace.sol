// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Corrected the import path from ERC712 back to ERC721
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    uint256 public platformFeePercentage;

    struct Listing {
        uint256 price;
        address payable seller;
    }

    mapping(uint256 => Listing) public listings;

    event NFTListed(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );

    event NFTSold(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    constructor(uint256 _platformFeePercentage) 
        ERC721("NFT Marketplace", "NFTM") 
        Ownable(msg.sender) 
    {
        platformFeePercentage = _platformFeePercentage;
    }

    function mintNFT(string memory tokenURI) public returns (uint256) {
        uint256 newItemId = _nextTokenId;
        _nextTokenId++;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function listNFTForSale(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "You do not own this NFT");
        require(price > 0, "Price must be greater than zero");

        listings[tokenId] = Listing({
            price: price,
            seller: payable(msg.sender)
        });

        emit NFTListed(tokenId, price, msg.sender);
    }

    function purchaseNFT(uint256 tokenId) public payable {
        Listing memory listing = listings[tokenId];
        require(listing.price > 0, "NFT not listed for sale");
        require(msg.value == listing.price, "Please submit the asking price");

        address payable seller = listing.seller;

        delete listings[tokenId];

        uint256 platformFee = (msg.value * platformFeePercentage) / 10000;
        if (platformFee > 0) {
            payable(owner()).transfer(platformFee);
        }
        
        seller.transfer(msg.value - platformFee);

        _transfer(seller, msg.sender, tokenId);

        emit NFTSold(tokenId, msg.value, seller, msg.sender);
    }
}