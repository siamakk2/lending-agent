import type { MetadataRoute } from 'next';
import { LANGS } from '@/lib/i18n.ts';
import { SITE_URL, pathFor } from '@/lib/seo.ts';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LANGS.map((l) => [l === 'zh' ? 'zh-Hans' : l, `${SITE_URL}${pathFor(l)}`]));
  return [
    ...LANGS.map((l) => ({
      url: `${SITE_URL}${pathFor(l)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: l === 'en' ? 1 : 0.9,
      alternates: { languages },
    })),
    { url: `${SITE_URL}/llms.txt`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
  ];
}
