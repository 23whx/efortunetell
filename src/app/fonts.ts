import { Geist, Geist_Mono, Playfair_Display, Noto_Serif_SC } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display serif for headings (Latin) with CJK serif fallback
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

// One weight only: each CJK weight adds ~100 @font-face slices (~93 KB of render-blocking CSS)
const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["700"],
  preload: false,
});

export const fontVariables = `${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${notoSerifSC.variable}`;
