import type { Metadata } from 'next';
import { LENDER, MARKET_RANGES } from './config.ts';
import { DICT, LANGS, LANG_META, type Lang } from './i18n.ts';
import { FAQ } from './faq.ts';
import type { Benchmark } from './rates.ts';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://www.lendingdesk.app').replace(/\/$/, '');

export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', es: 'es_US', fa: 'fa_IR', de: 'de_DE', zh: 'zh_CN' };

export function pathFor(lang: Lang) {
  return lang === 'en' ? '/' : `/${lang}`;
}

const SEO: Record<Lang, { title: string; description: string; keywords: string[] }> = {
  en: {
    title: 'Hard Money, Fix-and-Flip, Bridge & DSCR Loans',
    description: 'Private real estate loans through 50+ licensed brokers: hard money, fix-and-flip, bridge, construction and DSCR. Live prime and SOFR rates, typical 2026 ranges, and a 24/7 lending desk in 5 languages.',
    keywords: ['hard money loans', 'fix and flip loans', 'bridge loans', 'DSCR loans', 'private money lender', 'construction loans', 'real estate investor loans', 'hard money rates 2026', 'private lending network'],
  },
  es: {
    title: 'Préstamos Hard Money, Fix-and-Flip, Puente y DSCR',
    description: 'Préstamos inmobiliarios privados con más de 50 brókers con licencia: hard money, fix-and-flip, puente, construcción y DSCR. Tasas prime y SOFR en vivo, rangos típicos de 2026 y atención 24/7 en español.',
    keywords: ['préstamos hard money', 'préstamos fix and flip', 'préstamo puente', 'préstamos DSCR', 'prestamista privado', 'préstamos para inversionistas inmobiliarios'],
  },
  fa: {
    title: 'وام هارد مانی، خرید و بازسازی، پل و DSCR',
    description: 'وام خصوصی املاک از طریق بیش از ۵۰ کارگزار دارای مجوز: هارد مانی، خرید و بازسازی، پل، ساخت و DSCR. نرخ پرایم و SOFR زنده، بازه‌های رایج ۲۰۲۶ و میز وام شبانه‌روزی به فارسی.',
    keywords: ['وام هارد مانی', 'وام خرید و بازسازی', 'وام پل', 'وام DSCR', 'وام‌دهنده خصوصی', 'وام سرمایه‌گذاری املاک'],
  },
  de: {
    title: 'Hard-Money-, Fix-and-Flip-, Überbrückungs- & DSCR-Kredite',
    description: 'Private Immobilienkredite über mehr als 50 lizenzierte Makler: Hard Money, Fix-and-Flip, Überbrückung, Neubau und DSCR. Live-Prime- und SOFR-Zinsen, typische Spannen 2026 und ein Kreditdesk rund um die Uhr auf Deutsch.',
    keywords: ['Hard-Money-Kredit', 'Fix-and-Flip-Finanzierung', 'Überbrückungskredit', 'DSCR-Kredit', 'privater Kreditgeber', 'Immobilieninvestor Kredit USA'],
  },
  zh: {
    title: '硬钱贷款、翻新转售、过桥及DSCR贷款',
    description: '通过50多位持牌经纪人提供私人房地产贷款：硬钱、翻新转售、过桥、建筑及DSCR。实时最优惠利率和SOFR、2026年常见利率区间，以及全天候中文贷款服务台。',
    keywords: ['硬钱贷款', '翻新转售贷款', '过桥贷款', 'DSCR贷款', '私人贷款', '美国房地产投资贷款'],
  },
};

export function buildMetadata(lang: Lang): Metadata {
  const s = SEO[lang];
  const title = `${s.title} | ${LENDER.name}`;
  const url = `${SITE_URL}${pathFor(lang)}`;
  const languages = Object.fromEntries(LANGS.map((l) => [l === 'zh' ? 'zh-Hans' : l, `${SITE_URL}${pathFor(l)}`]));
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: s.description,
    keywords: s.keywords,
    applicationName: LENDER.name,
    category: 'finance',
    alternates: { canonical: url, languages: { ...languages, 'x-default': `${SITE_URL}/` } },
    openGraph: {
      type: 'website',
      url,
      siteName: LENDER.name,
      title,
      description: s.description,
      locale: OG_LOCALE[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: 'summary_large_image', title, description: s.description },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' } },
    formatDetection: { telephone: false },
  };
}

const PROGRAM_KEYS = ['fix_flip', 'bridge', 'construction', 'dscr', 'commercial'] as const;

/** One schema.org @graph per page: the organization, its loan programs, the page, the FAQ and today's benchmark data. */
export function buildJsonLd(lang: Lang, benchmarks: Benchmark[]) {
  const d = DICT[lang];
  const url = `${SITE_URL}${pathFor(lang)}`;
  const orgId = `${SITE_URL}/#organization`;
  const inLanguage = lang === 'zh' ? 'zh-Hans' : lang;
  const termText = (k: (typeof PROGRAM_KEYS)[number]) => {
    const t = MARKET_RANGES.ranges[k].term;
    return t ? `${t.from}${t.from === t.to ? '' : `–${t.to}`} ${t.unit === 'mo' ? 'months' : 'years'}` : 'varies';
  };

  const today = benchmarks
    .filter((b) => ['DPRIME', 'SOFR', 'DFEDTARU', 'DGS10', 'MORTGAGE30US'].includes(b.series))
    .map((b) => `${b.label}: ${b.value.toFixed(2)}% as of ${b.as_of} (FRED ${b.series})`)
    .join('; ');

  const faq = [
    ...FAQ[lang],
    ...(today
      ? [{ q: lang === 'en' ? 'What are today’s benchmark interest rates?' : `${d.rates.title}?`, a: `${today}. Private-lending rates are priced from these benchmarks plus the risk of each deal.` }]
      : []),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['FinancialService', 'Organization'],
        '@id': orgId,
        name: LENDER.name,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
        image: `${SITE_URL}/opengraph-image`,
        description: SEO.en.description,
        slogan: DICT.en.hero.title,
        ...(LENDER.phone ? { telephone: LENDER.phone } : {}),
        ...(LENDER.nmls ? { identifier: { '@type': 'PropertyValue', propertyID: 'NMLS', value: LENDER.nmls } } : {}),
        areaServed: LENDER.box.states.map((s) => ({ '@type': 'State', name: s, containedInPlace: { '@type': 'Country', name: 'United States' } })),
        availableLanguage: LANGS.map((l) => ({ '@type': 'Language', name: LANG_META[l].label, alternateName: l })),
        knowsAbout: ['Hard money loans', 'Fix-and-flip financing', 'Bridge loans', 'Ground-up construction loans', 'DSCR rental loans', 'Commercial bridge loans', 'Private real estate lending', 'Prime rate', 'SOFR'],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: LANGS.map((l) => LANG_META[l].label),
          hoursAvailable: 'Mo-Su 00:00-23:59',
          url: `${SITE_URL}/#desk`,
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Private real estate loan programs',
          itemListElement: PROGRAM_KEYS.map((k) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'LoanOrCredit',
              name: DICT.en.programs.rows[k].name,
              loanType: DICT.en.programs.rows[k].name,
              description: `${DICT.en.programs.rows[k].use}. Typical market range ${MARKET_RANGES.ranges[k].rate}${MARKET_RANGES.ranges[k].points ? `, ${MARKET_RANGES.ranges[k].points} points` : ''}, term ${termText(k)}, leverage ${MARKET_RANGES.ranges[k].leverage}. Not an offer to lend; terms set by a licensed broker.`,
              loanTerm: termText(k),
              provider: { '@id': orgId },
            },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: LENDER.name,
        publisher: { '@id': orgId },
        inLanguage: LANGS.map((l) => (l === 'zh' ? 'zh-Hans' : l)),
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: SEO[lang].title,
        description: SEO[lang].description,
        inLanguage,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': orgId },
        dateModified: new Date().toISOString().slice(0, 10),
        speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.hero h1', '.hero-lead', '.faq-a'] },
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage,
        isPartOf: { '@id': `${url}#webpage` },
        mainEntity: faq.map((x) => ({ '@type': 'Question', name: x.q, acceptedAnswer: { '@type': 'Answer', text: x.a } })),
      },
      ...(today
        ? [
            {
              '@type': 'Dataset',
              '@id': `${SITE_URL}/#benchmarks`,
              name: 'Daily U.S. lending benchmark rates',
              description: `Prime rate, SOFR, Fed funds target, Treasury yields and Freddie Mac mortgage averages used to price private real estate loans. ${today}.`,
              creator: { '@id': orgId },
              isBasedOn: 'https://fred.stlouisfed.org/',
              license: 'https://fred.stlouisfed.org/legal/',
              dateModified: benchmarks.map((b) => b.as_of).sort().at(-1),
              variableMeasured: benchmarks.map((b) => ({ '@type': 'PropertyValue', name: b.label, value: b.value, unitText: 'percent', propertyID: b.series })),
            },
          ]
        : []),
    ],
  };
}

/** Serialize JSON-LD safely for a <script> tag: nothing in the data can close the tag or inject markup. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
