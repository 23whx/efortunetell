/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.efortunetell.blog/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'https://api.efortunetell.blog/images/:path*',
      },
      // 将根路径重写到博客页面，用户看到的URL保持为 /
      {
        source: '/',
        destination: '/blog',
      },
    ];
  },
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    domains: ['localhost', 'api.efortunetell.blog'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.efortunetell.blog',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'api.efortunetell.blog',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig; 