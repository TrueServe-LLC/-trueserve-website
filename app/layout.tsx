// Deployment Trigger: 2026-04-04 04:10
import type { Metadata } from "next";
import { Barlow_Condensed, DM_Sans, DM_Mono, Bebas_Neue } from "next/font/google";
import "./globals.css";
import PostHogAuthSync from "@/components/PostHogAuthSync";
import MobileTabBar from "@/components/MobileTabBar";

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: ["400"],
  subsets: ["latin"],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: 'swap',
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: 'swap',
});

const barlowCond = Barlow_Condensed({
  variable: "--font-barlow-cond",
  weight: ["700", "800"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TrueServe | Order Food Delivery Near You",
  description: "Order from your favorite local restaurants. Fast delivery, real-time driver tracking, and menus you'll love — all in one place.",
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    title: "TrueServe | Order Food Delivery Near You",
    description: "Local restaurants. Real drivers. No hidden fees. Order food delivery from your neighborhood favorites.",
    url: "https://trueserve.delivery",
    siteName: "TrueServe",
    images: [
      {
        url: "https://trueserve.delivery/logo.png",
        width: 512,
        height: 512,
        alt: "TrueServe — Local Food Delivery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TrueServe | Order Food Delivery Near You",
    description: "Local restaurants. Real drivers. No hidden fees.",
    images: ["https://trueserve.delivery/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${dmSans.variable} ${dmMono.variable} ${barlowCond.variable}`}>
      <body className="antialiased">
        <PostHogAuthSync />
        {children}
        <MobileTabBar />
      </body>
    </html>
  );
}
