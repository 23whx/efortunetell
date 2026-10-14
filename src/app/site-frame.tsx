import type { Viewport } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/shared/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";
import type { Locale } from "@/lib/i18n/config";
import { ADSENSE_SRC } from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#faf9f6',
};

/**
 * Shared <html> document for the two root layouts ([locale] and admin).
 * Rendering <html> per locale lets `lang`/`dir` and the UI language be correct in the server HTML.
 */
export default function SiteFrame({
  lang,
  dir,
  locale,
  head,
  children,
}: {
  lang: string;
  dir: 'ltr' | 'rtl';
  locale: Locale;
  head?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* Google AdSense — plain tag so it is present in the server-rendered <head> of every page */}
        <script async src={ADSENSE_SRC} crossOrigin="anonymous" />
        {head}
      </head>
      <body className="antialiased min-h-screen overflow-auto font-sans bg-[#faf9f6] text-gray-900">
        <LanguageProvider initialLanguage={locale}>
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
