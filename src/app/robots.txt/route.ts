import { SITE_URL } from '@/lib/site';

export function GET() {
  const content =
    [
      'User-agent: *',
      'Allow: /',
      '',
      '# Block private/admin/auth areas (account & payment pages carry a noindex meta instead)',
      'Disallow: /admin/',
      'Disallow: /user/',
      'Disallow: /auth/',
      'Disallow: /api/',
      '',
      '# Google AdSense crawler: must reach every page to match ads',
      'User-agent: Mediapartners-Google',
      'Allow: /',
      '',
      '# AI search / assistant crawlers are welcome (see /llms.txt)',
      'User-agent: GPTBot',
      'User-agent: OAI-SearchBot',
      'User-agent: ChatGPT-User',
      'User-agent: ClaudeBot',
      'User-agent: Claude-SearchBot',
      'User-agent: PerplexityBot',
      'User-agent: Google-Extended',
      'User-agent: Applebot-Extended',
      'Allow: /',
      'Disallow: /admin/',
      'Disallow: /api/',
      '',
      '# Sitemaps',
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      '',
    ].join('\n');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
