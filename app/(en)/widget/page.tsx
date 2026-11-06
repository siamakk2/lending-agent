import Chat from '@/components/Chat.tsx';
import { brandFor } from '@/lib/config.ts';
import { LANG_META, isLang } from '@/lib/i18n.ts';

export const metadata = { title: 'Lending desk', robots: { index: false, follow: false } };

// Embeddable: <iframe src="https://<domain>/widget?lang=es" style="width:420px;height:680px;border:0"></iframe>
export default async function Widget({ searchParams }: { searchParams: Promise<{ lang?: string; ref?: string }> }) {
  const sp = await searchParams;
  const q = sp.lang;
  const partner = sp.ref && /^[a-z0-9-]{1,64}$/.test(sp.ref) ? sp.ref : undefined;
  const lang = isLang(q) ? q : 'en';
  return (
    <main className={`widget lang-${lang}`} dir={LANG_META[lang].dir}>
      <Chat lang={lang} lenderName={brandFor(partner).name} partner={partner} compact />
    </main>
  );
}
