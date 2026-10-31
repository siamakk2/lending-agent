import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo.ts';

// Search engines and AI assistants are welcome; the chat API and cron are not for crawling.
const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Googlebot', 'Bingbot', 'Applebot', 'Applebot-Extended',
  'CCBot', 'DuckAssistBot', 'meta-externalagent', 'Amazonbot', 'cohere-ai', 'YouBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] },
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: ['/', '/llms.txt'], disallow: ['/api/', '/admin'] })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
