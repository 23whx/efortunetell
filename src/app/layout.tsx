import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { headers } from "next/headers";
import { detectLanguageFromHeaders } from "@/lib/i18n/detect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

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
      "ja-JP": "/",
      "ko-KR": "/",
      "ar": "/",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const country =
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country") ||
    null;
  const acceptLanguage = h.get("accept-language");
  const detected = detectLanguageFromHeaders({ country, acceptLanguage });
  const htmlLang = detected.language === 'zh' ? 'zh-CN' : detected.language;
  const htmlDir = detected.language === 'ar' ? 'rtl' : 'ltr';

  const siteUrl = "https://efortunetell.blog";
  const siteName = "Rolley Divination Blog";

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
  };

  return (
    <html
      lang={htmlLang}
      dir={htmlDir}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4880646654838411"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
      </head>
      <body className="antialiased min-h-screen overflow-auto font-sans bg-[#FFFACD] text-gray-900">
        <LanguageProvider initialLanguage={detected.language}>
          <Navbar />
          <div className="pt-16 md:pt-20">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
