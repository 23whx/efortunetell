export function GET() {
  const content = `User-agent: *\nAllow: /\nSitemap: https://efortunetell.blog/sitemap.xml`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 