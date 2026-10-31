import { notFound } from 'next/navigation';
import LangPage from '@/components/LangPage.tsx';
import { buildMetadata } from '@/lib/seo.ts';
import { isLang } from '@/lib/i18n.ts';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return ['es', 'fa', 'de', 'zh'].map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return isLang(lang) ? buildMetadata(lang) : {};
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang === 'en') notFound();
  return <LangPage lang={lang} />;
}
