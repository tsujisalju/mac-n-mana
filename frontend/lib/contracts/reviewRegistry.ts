import { createPublicClient, createWalletClient, http } from "viem";
import abi from "./ReviewRegistry.json";
import { sepolia } from "viem/chains";
import { getAccount } from "wagmi/actions";
import { config } from "../wagmi";

export const reviewRegistryConfig = {
  address: "0x62EA83F0cDE8d2deDCd16f06a86549b19a53809C",
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
