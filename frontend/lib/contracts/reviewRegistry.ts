import { createPublicClient, createWalletClient, http } from "viem";
import abi from "./ReviewRegistry.json";
import { sepolia } from "viem/chains";
import { getAccount } from "wagmi/actions";
import { config } from "../wagmi";

export const reviewRegistryConfig = {
  address: "0xD888020802d9EfcE18F5dC2Df9d6DEfcCd49BDB8",
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
