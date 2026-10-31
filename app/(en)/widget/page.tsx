import Chat from '@/components/Chat.tsx';
import { LENDER } from '@/lib/config.ts';
import { LANG_META, isLang } from '@/lib/i18n.ts';

export const metadata = { title: 'Lending desk', robots: { index: false, follow: false } };

// Embeddable: <iframe src="https://<domain>/widget?lang=es" style="width:420px;height:680px;border:0"></iframe>
export default async function Widget({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const q = (await searchParams).lang;
  const lang = isLang(q) ? q : 'en';
  return (
    <main className={`widget lang-${lang}`} dir={LANG_META[lang].dir}>
      <Chat lang={lang} lenderName={LENDER.name} compact />
    </main>
  );
}
