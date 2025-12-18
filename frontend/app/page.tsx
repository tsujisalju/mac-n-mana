"use client";
import dynamic from "next/dynamic";

export default function Home() {
  const MapSearch = dynamic(() => import("@/components/MapSearch"), {
    ssr: false,
  });

  return <MapSearch />;
}
