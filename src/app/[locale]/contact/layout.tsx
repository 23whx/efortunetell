import { pageMetadata } from '@/lib/seo/pages';

export const generateMetadata = pageMetadata('contact');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
