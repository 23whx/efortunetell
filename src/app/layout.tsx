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
  title: "Rolley的玄学命理小站",
  description: "专业的易学预测与命理分析平台，提供八字、大六壬、奇门遁甲、梅花易数等传统预测服务",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
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
