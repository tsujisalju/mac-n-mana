# Mac n' Mana

_(Makan mana?)_

Mac n’ Mana is a decentralized restaurant review platform that blends the magic of blockchain with the practicality of real-world discovery. Designed to empower diners and foodies, it enables users to search for restaurants, submit reviews, and vote on others’ feedback — all while earning reputation on-chain.

Unlike traditional review apps, Mac n’ Mana ensures transparency, censorship resistance, and verifiable contributions. Each review is stored on IPFS via Storacha, and every vote is recorded immutably on the Sepolia testnet. The platform rewards thoughtful reviewers and curates trustworthy feedback through a reputation system that’s visible, auditable, and community-driven.

Whether you’re hunting for the best laksa in KL or rating a cozy ramen spot in Tokyo, Mac n’ Mana gives users the tools to share their taste and build their credibility — one review at a time.

## How it's made

The project repository uses a monorepo structure with two project folders for frontend and backend respectively.

The backend is a Hardhat 3 project containing the ReviewRegistry.sol smart contract. The contract contains functions for handling review submission, voting and reputation tracking. Every review submission emits an event containing reviewId, reviewer address, placeId and ipfsHash for off-chain retrieval. The backend has been deployed to Sepolia testnet using Hardhat ignition modules.

The frontend is a Next.js 15 project using TailwindCSS + DaisyUI. The wallet integration uses RainbowKit and Wagmi hooks. We use existing restaurant data using Google Places Autocomplete API that identifies each restaurant with a unique placeId. When the user submits a review, the review contents are uploaded to IPFS using a Storacha client, and the IPFS hash is then stored on-chain. Review feed is populated by querying review event logs using Blockscout. The frontend has been deployed to Vercel.

## Features

Mac n' Mana offers a comprehensive set of features that combine the power of blockchain with intuitive restaurant discovery and reviewing:

### 🔍 Restaurant Discovery & Search
- **Interactive Map Interface**: Google Maps integration for visual restaurant exploration
- **Smart Search**: Google Places Autocomplete API for finding restaurants with accurate location data
- **Place Information**: Detailed restaurant information including photos, ratings, and location
- **Route Planning**: Built-in directions and distance calculation to help you get there

### 📝 Decentralized Reviews
- **Rich Review Creation**: Submit detailed reviews with text content, 1-5 star ratings, and photo uploads
- **IPFS Storage**: All review content stored on IPFS via Storacha for decentralized, censorship-resistant data
- **Blockchain Verification**: Review metadata immutably recorded on Sepolia testnet
- **Image Support**: Upload up to 10 photos per review to showcase your dining experience
- **Unique Restaurant Identification**: Each review linked to Google Places placeId for accurate restaurant matching

### 🗳️ Community-Driven Voting
- **Review Voting**: Upvote (+1) or downvote (-1) reviews to highlight quality content
- **Transparent Scoring**: All votes recorded on-chain for complete transparency
- **Anti-Gaming**: Wallet-based voting prevents manipulation while maintaining user privacy

### 🏆 Reputation System
- **User Reputation Tracking**: Earn reputation points when your reviews receive upvotes
- **Reviewer Credibility**: View other users' reputation scores to assess review trustworthiness  
- **Merit-Based Recognition**: Higher reputation reviewers gain more credibility in the community
- **Cross-Review Impact**: Your reputation follows you across all restaurant reviews

### 💬 Interactive Discussions
- **Review Replies**: Comment on reviews to add context, ask questions, or share experiences
- **Nested Conversations**: Support for threaded replies to create meaningful discussions
- **IPFS-Stored Replies**: All reply content stored decentralized on IPFS
- **Community Engagement**: Foster dialogue between diners and reviewers

### 🔗 Blockchain Integration
- **Sepolia Testnet**: All transactions recorded on Ethereum's Sepolia testnet
- **Event Logging**: Comprehensive event system for review submissions, votes, and replies
- **Wallet Connection**: Seamless integration with popular Ethereum wallets via RainbowKit
- **Gas Optimization**: Efficient smart contract design to minimize transaction costs
- **Blockscout Integration**: Real-time data querying from blockchain explorer

### 🔒 Decentralization & Security
- **Censorship Resistance**: No central authority can remove or modify reviews
- **Data Integrity**: IPFS ensures review content cannot be tampered with
- **Wallet-Based Identity**: No email signup required - your wallet is your identity
- **Transparent Operations**: All platform operations visible on-chain
- **Community Governance**: Voting system allows community to curate content quality

### 📱 User Experience
- **Responsive Design**: Optimized for desktop and mobile devices using TailwindCSS + DaisyUI
- **Real-time Updates**: Dynamic loading of reviews and voting results
- **Intuitive Interface**: Clean, modern design focused on usability
- **Toast Notifications**: Clear feedback for all user actions
- **Loading States**: Proper loading indicators for blockchain transactions
- **Error Handling**: Graceful error messages and recovery options

### 🎯 Platform Benefits
- **For Diners**: Discover authentic reviews from verified community members
- **For Reviewers**: Build reputation and contribute to a trustworthy review ecosystem  
- **For Restaurants**: Receive genuine feedback in a transparent, manipulation-resistant system
- **For the Community**: Participate in a decentralized platform owned by its users

## Local Development Setup

Follow these steps to run Mac n' Mana locally for development:

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Ethereum Wallet** (MetaMask recommended) for testing blockchain features

### Required API Keys

You'll need to obtain the following API keys:

1. **Google Maps API Key**
   - Visit the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the following APIs:
     - Maps JavaScript API
     - Places API
   - Create credentials (API Key) and restrict it to your domain for security

2. **Storacha (IPFS) Credentials**
   - Sign up at [Storacha](https://storacha.network/)
   - Generate your IPFS storage key and proof for decentralized file storage

### Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```bash
# Google Maps Integration
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Storacha IPFS Storage
STORACHA_KEY=your_storacha_key_here
STORACHA_PROOF=your_storacha_proof_here
```

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mac-n-mana
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies** (optional, for local blockchain development)
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**
   - Copy your API keys to the `.env.local` file as described above
   - Ensure the file is in the `frontend` directory

### Running the Application

1. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```
   
   The application will be available at `http://localhost:3000`

2. **Connect your wallet**
   - Install MetaMask or another Ethereum wallet browser extension
   - Switch to Sepolia testnet in your wallet
   - Get Sepolia ETH from a [faucet](https://sepoliafaucet.com/) for testing

### Development Features

- **Hot Reload**: Changes to code automatically refresh the browser
- **TypeScript Support**: Full type checking and IntelliSense
- **Linting**: ESLint configuration for code quality
- **Turbopack**: Fast bundling with Next.js 15's Turbopack

### Testing the Platform

1. **Search for restaurants** using the map interface
2. **Connect your wallet** to enable blockchain features
3. **Submit test reviews** (requires Sepolia ETH for gas fees)
4. **Vote on reviews** to test the reputation system
5. **Add replies** to test the discussion features

### Troubleshooting

- **Google Maps not loading**: Verify your Google Maps API key and ensure the Maps JavaScript API is enabled
- **Wallet connection issues**: Make sure you're on Sepolia testnet and have sufficient ETH for gas fees
- **IPFS upload failures**: Check your Storacha credentials and network connection
- **Build errors**: Ensure you're using Node.js v18+ and all dependencies are installed

### Network Configuration

The frontend is configured to work with:
- **Sepolia Testnet** for blockchain transactions
- **IPFS via Storacha** for decentralized file storage
- **Google Places API** for restaurant data
- **Blockscout** for reading blockchain events
