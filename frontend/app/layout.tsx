import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import NavBar from "@/components/NavBar";
import { Providers } from "./providers";
import Welcome from "@/components/Welcome";
import { EventsProvider } from "@/lib/blockscout";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mac n' Mana",
  description: "Legit food reviews without the FUD!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="cupcake">
      <body className={`${onest.className} antialiased`}>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />
        <Providers>
          <EventsProvider>
            <Welcome />
            <NavBar />
            {children}
            <div id="toast-container" className="toast"></div>
          </EventsProvider>
        </Providers>
      </body>
    </html>
  );
}
