import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/shared/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { defaultLocale } from "@/lib/i18n/config";

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
    default: "Rollkey Divination Blog | Chinese Metaphysics & Fortune",
    template: "%s | Rollkey Divination Blog",
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
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon.png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "Rollkey Divination Blog | Chinese Metaphysics & Fortune",
    description:
      "Professional Chinese metaphysics prediction and destiny analysis platform offering Bazi, Da Liu Ren, Qimen Dunjia, Plum Blossom Numerology and more traditional divination services.",
    url: "https://efortunetell.blog",
    siteName: "Rollkey Divination Blog",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Rollkey Divination Blog Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rollkey Divination Blog | Chinese Metaphysics & Fortune",
    description:
      "Professional Chinese metaphysics prediction and destiny analysis platform offering Bazi, Da Liu Ren, Qimen Dunjia, Plum Blossom Numerology and more traditional divination services.",
    images: ["/icon.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SEO default language is English; [locale] pages sync UI language from the URL.
  const htmlLang = 'en';
  const htmlDir = 'ltr';

  const siteUrl = "https://efortunetell.blog";
  const siteName = "Rollkey Divination Blog";

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/${defaultLocale}/search?q={search_term_string}`,
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
      <body className="antialiased min-h-screen overflow-auto font-sans bg-[#FFFACD] text-gray-900">
        {/* JSON-LD for WebSite */}
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        
        {/* JSON-LD for Organization */}
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }}
        />
        
        <LanguageProvider initialLanguage={defaultLocale}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="pt-16 md:pt-20 flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
