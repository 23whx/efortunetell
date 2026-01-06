import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Chinese metaphysics articles on BaZi, Qi Men Dun Jia, Da Liu Ren, Zi Wei Dou Shu and more.',
  alternates: {
    canonical: 'https://efortunetell.blog/blog',
  },
  openGraph: {
    title: 'Rollkey Divination Blog',
    description: 'Chinese metaphysics articles on BaZi, Qi Men Dun Jia, Da Liu Ren, Zi Wei Dou Shu and more.',
    url: 'https://efortunetell.blog/blog',
    type: 'website',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'Rollkey Divination Blog' }],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}


