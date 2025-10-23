"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Logo from "./Logo";

export default function NavBar() {
  return (
    <div className="p-4 flex flex-row justify-between items-center">
      <div className="flex flex-row space-x-2 items-center">
        <span>🍔</span>
        <Logo className="h-8" />
      </div>
      <div>
        <ConnectButton
          accountStatus={"address"}
          chainStatus={"icon"}
          showBalance={false}
        />
      </div>
    </div>
  );
}
