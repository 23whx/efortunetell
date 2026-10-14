/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Supabase migration: remove legacy VPS API rewrites.
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    // Keep permissive settings; Supabase Storage public URLs are on *.supabase.co.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return {
      // Default article covers: the DB stores /cover/*.png (1–2.8 MB each); serve the 30–90 KB WebP versions instead
      beforeFiles: [
        { source: '/cover/:name(bazi|qimen|bagua).png', destination: '/cover/:name.webp' },
      ],
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Auto-upgrade any http:// image/script (e.g. in article HTML or avatars) so pages never show
          // the browser's "connection not secure" mixed-content warning
          { key: 'Content-Security-Policy', value: 'upgrade-insecure-requests' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Legacy tool URLs → locale-prefixed almanac / tools (default en)
      {
        source: '/bazi-calculator',
        destination: '/en/tools/bazi',
        permanent: true,
      },
      {
        source: '/test-bazi',
        destination: '/en/tools/bazi',
        permanent: true,
      },
      {
        source: '/:locale(en|zh|ja|ko|ar)/bazi-calculator',
        destination: '/:locale/tools/bazi',
        permanent: true,
      },
      {
        source: '/:locale(en|zh|ja|ko|ar)/test-bazi',
        destination: '/:locale/tools/bazi',
        permanent: true,
      },
      {
        source: '/:locale(en|zh|ja|ko|ar)/fortune/bazi',
        destination: '/:locale/tools/bazi',
        permanent: true,
      },
    ];
  },
};

export default nextConfig; 