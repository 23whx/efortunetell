import { noindexMetadata, pageMetadata } from '@/lib/seo/pages';

const base = pageMetadata('ai-chat');

// Login-gated chat UI: no crawlable content — keep out of the index (thin content hurts AdSense review)
export async function generateMetadata(props: Parameters<typeof base>[0]) {
  return { ...(await base(props)), ...noindexMetadata };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
