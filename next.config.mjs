/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const rewrites = [
      // 只重定向需要转发到后端的特定API路径
      // 排除前端自己的API路由：temp-upload, temp-cleanup, ping, proxy
      {
        source: '/api/auth/:path*',
        destination: 'https://api.efortunetell.blog/api/auth/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'https://api.efortunetell.blog/api/users/:path*',
      },
      {
        source: '/api/blogs/:path*',
        destination: 'https://api.efortunetell.blog/api/blogs/:path*',
      },
      {
        source: '/api/articles/:path*',
        destination: 'https://api.efortunetell.blog/api/articles/:path*',
      },
      {
        source: '/api/comments/:path*',
        destination: 'https://api.efortunetell.blog/api/comments/:path*',
      },
      {
        source: '/api/bookings/:path*',
        destination: 'https://api.efortunetell.blog/api/bookings/:path*',
      },
      {
        source: '/api/appointments/:path*',
        destination: 'https://api.efortunetell.blog/api/appointments/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'https://api.efortunetell.blog/api/payments/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'https://api.efortunetell.blog/api/admin/:path*',
      },
      {
        source: '/api/images/:path*',
        destination: 'https://api.efortunetell.blog/api/images/:path*',
      },
      {
        source: '/api/upload/:path*',
        destination: 'https://api.efortunetell.blog/api/upload/:path*',
      },
      // 静态图片资源重定向
      {
        source: '/images/:path*',
        destination: 'https://api.efortunetell.blog/images/:path*',
      },
      // 临时图片重定向到本地API路由
      {
        source: '/temp-images/:filename',
        destination: '/api/temp-images/:filename',
      },
      // 将根路径重写到博客页面，用户看到的URL保持为 /
      // 注释掉用于本地测试
      // {
      //   source: '/',
      //   destination: '/blog',
      // },
    ];

    // 本地开发时不重写根路径，生产环境才重写
    if (process.env.NODE_ENV !== 'development') {
      rewrites.push({
        source: '/',
        destination: '/blog',
      });
    }

    return rewrites;
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