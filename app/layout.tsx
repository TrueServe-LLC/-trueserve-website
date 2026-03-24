import type { Metadata } from "next";
import { Kalam, Playfair_Display } from "next/font/google";
import "./globals.css";
import MobileNavWrapper from "@/components/MobileNavWrapper";
import LaunchDarklyClientProvider from "@/components/LaunchDarklyClientProvider";

const kalam = Kalam({
  variable: "--font-kalam",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrueServe | Next-Gen Delivery Infrastructure",
  description: "Empowering independent restaurants through fair logistics, elite driver fleets, and seamless Toast POS integrations.",
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${kalam.variable} ${playfair.variable} bg-black text-slate-200 antialiased pb-24 md:pb-0 font-sans overflow-x-hidden`}
        suppressHydrationWarning
      >
        <LaunchDarklyClientProvider>
          {children}
          <MobileNavWrapper />
        </LaunchDarklyClientProvider>
      </body>
    </html>
  );
}
