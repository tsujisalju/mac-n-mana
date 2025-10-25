"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Logo from "./Logo";
import { useEffect, useState } from "react";
import { getUserReputation } from "@/lib/contractActions";
import { useAccount } from "wagmi";

export default function NavBar() {
  const { address, isConnected } = useAccount();
  const [reputation, setReputation] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const getWalletReputation = async () => {
      if (isConnected && address) {
        const walletReputation = await getUserReputation(address.toString());
        setReputation(walletReputation);
        return;
      }
      setReputation(BigInt(0));
    };
    getWalletReputation();
  }, [address, isConnected]);

  return (
    <div className="p-4 flex flex-row justify-between space-x-6 items-center">
      <div className="flex flex-row space-x-2 items-center">
        <span>🍔</span>
        <Logo className="h-8" />
      </div>
      <div className="flex flex-row space-x-2 items-center">
        <div className="flex flex-row space-x-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
            />
          </svg>
          <span>{reputation}</span>
        </div>
        <ConnectButton
          accountStatus={"address"}
          chainStatus={"icon"}
          showBalance={false}
        />
      </div>
    </div>
  );
}
