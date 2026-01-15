'use client';

import { useEffect } from 'react';

// Load Google AdSense without Next.js Script to avoid data-nscript warning.
const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4880646654838411';

export default function AdSenseLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // Avoid duplicating the script if already appended
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${ADSENSE_SRC}"]`
    );
    if (existing) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = ADSENSE_SRC;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      // Keep script for subsequent navigations; no cleanup to prevent reloading.
    };
  }, []);

  return null;
}


