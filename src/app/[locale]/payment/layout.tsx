import { noindexMetadata } from '@/lib/seo/pages';

export const metadata = noindexMetadata;

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
