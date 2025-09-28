# 🏛️ Ancient Greek NFT Marketplace

![Ancient Greek NFT Marketplace](https://images.unsplash.com/photo-1636392589616-ec1ad83358ea?auto=format&fit=crop&w=1200&h=300&q=80)

A decentralized marketplace for collecting and trading ancient Greek art and artifacts as NFTs. Built with Hardhat, React, and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FEDC00?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white)](https://ethereum.org/)

## ✨ Features

- 🖼️ Mint and list NFTs representing ancient Greek artifacts
- 💰 Buy and sell NFTs using ETH
- 🏷️ Categorize artifacts by period and type
- 🔍 Search and filter functionality
- 🎨 Beautiful, responsive UI with dark mode
- ⚡ Built on Ethereum using ERC-721 standard
- 🔒 Secure smart contract with ownership and access controls

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- npm or yarn
- MetaMask wallet
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/YASHMAHAKAL/nft-marketplace-project.git
cd nft-marketplace-project
```

2. Install dependencies for all packages
```bash
# Install smart contract dependencies
cd smart-contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# In smart-contracts/.env
SEPOLIA_RPC_URL="your_sepolia_rpc_url"
PRIVATE_KEY="your_private_key"
CONTRACT_ADDRESS="contract_address_after_deployment"

# In frontend/.env
VITE_CONTRACT_ADDRESS="contract_address_after_deployment"
```

### Local Development

1. Start local Hardhat node
```bash
cd smart-contracts
npx hardhat node
```

2. Deploy contracts and mint sample NFTs (in a new terminal)
```bash
cd smart-contracts
npx hardhat run scripts/deploy-and-mint.ts
```

3. Start frontend development server
```bash
cd frontend
npm run dev
```

4. Connect MetaMask to localhost:8545 and import a test account

## 🏗️ Project Structure

\`\`\`
nft-marketplace/
├── smart-contracts/          # Solidity smart contracts
│   ├── contracts/           # Contract source files
│   ├── scripts/             # Deployment and interaction scripts
│   ├── test/               # Contract test files
│   └── ignition/           # Hardhat Ignition deployment modules
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── config/        # Configuration files
│   │   └── styles/        # CSS and styling files
│   └── public/            # Static assets
├── k8s/                    # Kubernetes deployment files
└── infrastructure/         # Terraform infrastructure code
\`\`\`

## 🔧 Smart Contracts

The project uses the following main contracts:

- \`NFTMarketplace.sol\`: Main marketplace contract
  - Minting NFTs
  - Listing for sale
  - Purchasing NFTs
  - Platform fee management

### Contract Addresses

- Mainnet: \`Not deployed\`
- Sepolia: \`Not deployed\`
- Local: \`0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512\`

## 🎨 Frontend Features

- **Gallery View**: Browse all listed NFTs
- **Search & Filters**: Find artifacts by period, type, or name
- **NFT Details**: View detailed information about each artifact
- **Buy/Sell Interface**: Easy-to-use trading interface
- **Wallet Integration**: Seamless MetaMask integration
- **Transaction History**: View your buying and selling history

## 🛠️ Development Commands

### Smart Contracts

```bash
# Run tests
npx hardhat test

# Deploy contracts
npx hardhat run scripts/deploy-and-mint.ts

# Verify contracts (on Sepolia)
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## 🚢 Deployment

### Smart Contracts

1. Update \`.env\` with network details
2. Deploy to desired network:
```bash
npx hardhat run scripts/deploy-and-mint.ts --network sepolia
```

### Frontend

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to your hosting service of choice (Vercel, Netlify, etc.)

## 🧪 Testing

```bash
# Run smart contract tests
cd smart-contracts
npx hardhat test

# Run frontend tests
cd frontend
npm run test
```

## 🔐 Security

- Smart contracts inherit from OpenZeppelin's secure contract implementations
- Access control mechanisms for admin functions
- Re-entrancy protection for all payment functions
- Comprehensive test coverage

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract implementations
- Hardhat team for the development environment
- shadcn/ui for beautiful UI components
- Unsplash for artifact images

## 📞 Contact

Yash Mahakal - [@YASHMAHAKAL](https://github.com/YASHMAHAKAL)

Project Link: [https://github.com/YASHMAHAKAL/nft-marketplace-project](https://github.com/YASHMAHAKAL/nft-marketplace-project)