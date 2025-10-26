# Mac n' Mana

_(Makan mana?)_

Mac n’ Mana is a decentralized restaurant review platform that blends the magic of blockchain with the practicality of real-world discovery. Designed to empower diners and foodies, it enables users to search for restaurants, submit reviews, and vote on others’ feedback — all while earning reputation on-chain.

Unlike traditional review apps, Mac n’ Mana ensures transparency, censorship resistance, and verifiable contributions. Each review is stored on IPFS via Storacha, and every vote is recorded immutably on the Sepolia testnet. The platform rewards thoughtful reviewers and curates trustworthy feedback through a reputation system that’s visible, auditable, and community-driven.

Whether you’re hunting for the best laksa in KL or rating a cozy ramen spot in Tokyo, Mac n’ Mana gives users the tools to share their taste and build their credibility — one review at a time.

## How it's made

The project repository uses a monorepo structure with two project folders for frontend and backend respectively.

The backend is a Hardhat 3 project containing the ReviewRegistry.sol smart contract. The contract contains functions for handling review submission, voting and reputation tracking. Every review submission emits an event containing reviewId, reviewer address, placeId and ipfsHash for off-chain retrieval. The backend has been deployed to Sepolia testnet using Hardhat ignition modules.

The frontend is a Next.js 15 project using TailwindCSS + DaisyUI. The wallet integration uses RainbowKit and Wagmi hooks. We use existing restaurant data using Google Places Autocomplete API that identifies each restaurant with a unique placeId. When the user submits a review, the review contents are uploaded to IPFS using a Storacha client, and the IPFS hash is then stored on-chain. Review feed is populated by querying review event logs using Blockscout. The frontend has been deployed to Vercel.
