import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rolley Divination Blog | Chinese Metaphysics & Fortune",
    template: "%s | Rolley Divination Blog",
  },
  description:
    "Professional Chinese metaphysics prediction and destiny analysis platform offering Bazi (Four Pillars of Destiny), Da Liu Ren, Qimen Dunjia, Plum Blossom Numerology and more traditional divination services.",
  keywords: [
    "Bazi",
    "Four Pillars",
    "Chinese astrology",
    "Divination",
    "Qimen Dunjia",
    "Da Liu Ren",
    "Plum Blossom Numerology",
    "Fortune telling",
    "Chinese metaphysics",
  ],
  metadataBase: new URL("https://efortunetell.blog"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
      "zh-CN": "/",
    },
  },
  openGraph: {
    title: "Rolley Divination Blog | Chinese Metaphysics & Fortune",
    description:
      "Professional Chinese metaphysics prediction and destiny analysis platform offering Bazi, Da Liu Ren, Qimen Dunjia, Plum Blossom Numerology and more traditional divination services.",
    url: "https://efortunetell.blog",
    siteName: "Rolley Divination Blog",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Rolley Divination Blog Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen overflow-auto font-sans bg-[#FFFACD] text-gray-900">
        <LanguageProvider>
          <Navbar />
          <div className="pt-20">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
