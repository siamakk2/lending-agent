import Site from './Site.tsx';
import { LENDER, MARKET_RANGES } from '@/lib/config.ts';
import { getBenchmarks } from '@/lib/rates.ts';
import { buildJsonLd, safeJsonLd } from '@/lib/seo.ts';
import { FAQ, FAQ_TITLE } from '@/lib/faq.ts';
import type { Lang } from '@/lib/i18n.ts';

/** Server-rendered page for one language: full content in the HTML for search engines and AI crawlers. */
export default async function LangPage({ lang }: { lang: Lang }) {
  const { benchmarks } = await getBenchmarks();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(buildJsonLd(lang, benchmarks)) }} />
      <Site
        benchmarks={benchmarks}
        ranges={MARKET_RANGES.ranges}
        rangesAsOf={MARKET_RANGES.as_of}
        lenderName={LENDER.name}
        nmls={LENDER.nmls}
        states={LENDER.box.states}
        initialLang={lang}
        faq={FAQ}
        faqTitle={FAQ_TITLE}
      />
    </>
  );
}
