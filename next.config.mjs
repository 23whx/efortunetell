/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://26.26.26.1:5000/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://26.26.26.1:5000/images/:path*',
      },
    ];
  },
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    domains: ['localhost', '26.26.26.1'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '26.26.26.1',
        port: '5000',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: '26.26.26.1',
        port: '5000',
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