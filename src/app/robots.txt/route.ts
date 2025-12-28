export function GET() {
  const content =
    [
      'User-agent: *',
      'Allow: /',
      '',
      '# Block private/admin/auth areas',
      'Disallow: /admin/',
      'Disallow: /user/',
      'Disallow: /auth/',
      'Disallow: /api/',
      '',
      '# Sitemaps',
      'Sitemap: https://efortunetell.blog/sitemap.xml',
      'Sitemap: https://efortunetell.blog/rss.xml',
      '',
      'Host: efortunetell.blog',
      '',
    ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
} 