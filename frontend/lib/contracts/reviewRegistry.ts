import { createPublicClient, createWalletClient, http } from "viem";
import abi from "./ReviewRegistry.json";
import { sepolia } from "viem/chains";
import { getAccount } from "wagmi/actions";
import { config } from "../wagmi";

export const reviewRegistryConfig = {
  address: "0x477A27B05E82364c7D4f0d0b82399f6CB600149b",
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
