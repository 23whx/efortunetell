import { pageMetadata } from '@/lib/seo/pages';

export const generateMetadata = pageMetadata('services');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
