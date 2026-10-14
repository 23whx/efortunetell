import { pageMetadata } from '@/lib/seo/pages';

export const generateMetadata = pageMetadata('ai-chat');

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
