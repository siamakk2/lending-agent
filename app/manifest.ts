import type { MetadataRoute } from 'next';
import { LENDER } from '@/lib/config.ts';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${LENDER.name} — AI lending desk`,
    short_name: LENDER.name,
    description: 'Hard money, fix-and-flip, bridge, DSCR, construction and commercial real estate loans. Live rates and a 24/7 lending desk in 5 languages.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1f38',
    theme_color: '#0f1f38',
    categories: ['finance', 'business'],
    lang: 'en',
    icons: [
      { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
