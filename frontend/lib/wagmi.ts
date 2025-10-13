import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { hardhatLocal } from "./localchain";

export const config = getDefaultConfig({
  appName: "Mac n' Mana",
  projectId: "YOUR_PROJECT_ID",
  chains: [sepolia, hardhatLocal],
  ssr: true,
});
