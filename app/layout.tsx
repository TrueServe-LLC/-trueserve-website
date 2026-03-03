import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueServe | Premium Food Delivery",
  description: "Experience the true standard of food delivery.",
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
  },
};

import MobileNavWrapper from "@/components/MobileNavWrapper";
// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${playfair.variable} bg-background text-foreground antialiased pb-24 md:pb-0`}
        suppressHydrationWarning
      >
        {children}
        <MobileNavWrapper />
      </body>
    </html>
  );
}
