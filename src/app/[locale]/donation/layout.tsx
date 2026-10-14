import { noindexMetadata, pageMetadata } from '@/lib/seo/pages';

const base = pageMetadata('donation');

// Chinese-only hard-coded page duplicated across 5 locales — keep out of the index (thin content hurts AdSense review)
export async function generateMetadata(props: Parameters<typeof base>[0]) {
  return { ...(await base(props)), ...noindexMetadata };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
