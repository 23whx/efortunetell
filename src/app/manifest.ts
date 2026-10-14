import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '旭通命理小站',
    short_name: '旭通命理',
    description:
      'Chinese metaphysics: BaZi (Four Pillars), Qimen Dunjia, Da Liu Ren, and AI destiny consultation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FF6F61',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}


