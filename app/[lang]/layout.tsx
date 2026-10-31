import type { ReactNode } from 'react';
import Html from '@/components/Html.tsx';
import { LANG_META, isLang } from '@/lib/i18n.ts';

export const viewport = { themeColor: '#0F1F38', width: 'device-width', initialScale: 1 };

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const l = isLang(lang) ? lang : 'en';
  return (
    <Html lang={l === 'zh' ? 'zh-Hans' : l} dir={LANG_META[l].dir}>
      {children}
    </Html>
  );
}
