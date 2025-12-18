"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { EventsProvider } from "@/lib/blockscout";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#292526",
            accentColorForeground: "#e7e3e4",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          <EventsProvider>{children}</EventsProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
