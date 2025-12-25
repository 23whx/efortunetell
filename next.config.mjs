/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig; 