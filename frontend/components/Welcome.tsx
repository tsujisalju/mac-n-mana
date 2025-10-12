"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export default function Welcome() {
  const { isConnected } = useAccount();
  return (
    !isConnected && (
      <div className="absolute w-screen h-screen grid place-content-center bg-base-100 z-10 text-center">
        <div className="flex flex-col space-y-4 items-center">
          <span className="text-3xl">🍔</span>
          <h1 className="text-xl font-bold">Mac n&apos; Mana</h1>
          <p>Legit food reviews without the FUD!</p>
          <ConnectButton />
        </div>
      </div>
    )
  );
}
