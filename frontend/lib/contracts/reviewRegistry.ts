import { createPublicClient, createWalletClient, http } from "viem";
import abi from "./ReviewRegistry.json";
import { sepolia } from "viem/chains";
import { getAccount } from "wagmi/actions";
import { config } from "../wagmi";

export const reviewRegistryConfig = {
  address: "0x758C399be74FAD46773ee55D0dF0fC76153f3bED",
  abi: abi.abi,
} as const;

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

export const walletClient = createWalletClient({
  account: getAccount(config).address,
  chain: sepolia,
  transport: http(),
});
