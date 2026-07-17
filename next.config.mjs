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