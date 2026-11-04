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

const SEO: Record<Lang, { title: string; shareTitle: string; shareDescription: string; description: string; keywords: string[] }> = {
  en: {
    title: 'Residential & Commercial Real Estate Loans — Hard Money, DSCR, Bridge',
    shareTitle: 'Lending Desk | Hard Money, DSCR & Commercial Real Estate Loans',
    shareDescription: 'Hard money, fix-and-flip, bridge, DSCR, construction and commercial loans. Live rates and a 24/7 lending desk in 5 languages. Non-bank lender.',
    description: 'Lending Desk is a non-bank lender: account executives and 50+ partner brokers arrange residential and commercial real estate loans across multiple states — hard money, fix-and-flip, bridge, construction, DSCR, bank-statement and commercial. Live rates and a 24/7 desk in 5 languages.',
    keywords: ['non-bank lender', 'residential real estate loans', 'commercial real estate loans', 'hard money loans', 'fix and flip loans', 'bridge loans', 'DSCR loans', 'bank statement loans', 'commercial mortgage', 'construction loans', 'private money lender', 'hard money rates 2026'],
  },
  es: {
    title: 'Préstamos Inmobiliarios Residenciales y Comerciales — Hard Money, DSCR, Puente',
    shareTitle: 'Lending Desk | Préstamos Hard Money, DSCR y Comerciales',
    shareDescription: 'Préstamos hard money, fix-and-flip, puente, DSCR, construcción y comerciales. Tasas en vivo y atención 24/7 en español. Prestamista no bancario.',
    description: 'Lending Desk es un prestamista no bancario: ejecutivos de cuenta y más de 50 brókers asociados gestionan préstamos inmobiliarios residenciales y comerciales en varios estados: hard money, fix-and-flip, puente, construcción, DSCR, estados de cuenta y comerciales. Tasas en vivo y atención 24/7 en español.',
    keywords: ['prestamista no bancario', 'préstamos residenciales', 'préstamos comerciales', 'préstamos hard money', 'préstamos fix and flip', 'préstamo puente', 'préstamos DSCR', 'préstamos con estados de cuenta bancarios'],
  },
  fa: {
    title: 'وام املاک مسکونی و تجاری — هارد مانی، DSCR، پل',
    shareTitle: 'Lending Desk | وام هارد مانی، DSCR و املاک تجاری',
    shareDescription: 'وام هارد مانی، خرید و بازسازی، پل، DSCR، ساخت و تجاری. نرخ‌های زنده و میز وام شبانه‌روزی به فارسی. وام‌دهنده غیربانکی.',
    description: 'Lending Desk یک وام‌دهنده غیربانکی است: مدیران حساب و بیش از ۵۰ کارگزار همکار، وام‌های املاک مسکونی و تجاری را در چند ایالت ترتیب می‌دهند: هارد مانی، خرید و بازسازی، پل، ساخت، DSCR، صورت‌حساب بانکی و تجاری. نرخ زنده و میز وام شبانه‌روزی به فارسی.',
    keywords: ['وام‌دهنده غیربانکی', 'وام مسکونی', 'وام تجاری', 'وام هارد مانی', 'وام خرید و بازسازی', 'وام پل', 'وام DSCR', 'وام با صورت‌حساب بانکی'],
  },
  de: {
    title: 'Wohn- & Gewerbeimmobilienkredite — Hard Money, DSCR, Überbrückung',
    shareTitle: 'Lending Desk | Hard-Money-, DSCR- & Gewerbekredite',
    shareDescription: 'Hard-Money-, Fix-and-Flip-, Überbrückungs-, DSCR-, Bau- und Gewerbekredite. Live-Zinsen und ein Kreditdesk rund um die Uhr auf Deutsch. Nichtbank-Kreditgeber.',
    description: 'Lending Desk ist ein Nichtbank-Kreditgeber: Account Executives und mehr als 50 Partnermakler vermitteln Wohn- und Gewerbeimmobilienkredite in mehreren Bundesstaaten — Hard Money, Fix-and-Flip, Überbrückung, Neubau, DSCR, Kontoauszugs- und Gewerbekredite. Live-Zinsen und ein Kreditdesk rund um die Uhr auf Deutsch.',
    keywords: ['Nichtbank-Kreditgeber', 'Wohnimmobilienkredit', 'Gewerbeimmobilienkredit', 'Hard-Money-Kredit', 'Fix-and-Flip-Finanzierung', 'Überbrückungskredit', 'DSCR-Kredit', 'Immobilieninvestor Kredit USA'],
  },
  zh: {
    title: '住宅及商业房地产贷款 — 硬钱、DSCR、过桥',
    shareTitle: 'Lending Desk | 硬钱、DSCR及商业房地产贷款',
    shareDescription: '硬钱、翻新转售、过桥、DSCR、建筑及商业贷款。实时利率与全天候中文贷款服务台。非银行贷款机构。',
    description: 'Lending Desk 是一家非银行贷款机构：客户经理与50多位合作经纪人在多个州安排住宅和商业房地产贷款，包括硬钱、翻新转售、过桥、建筑、DSCR、银行流水及商业贷款。实时利率与全天候中文贷款服务台。',
    keywords: ['非银行贷款机构', '住宅贷款', '商业房地产贷款', '硬钱贷款', '翻新转售贷款', '过桥贷款', 'DSCR贷款', '银行流水贷款'],
  },
};

export const OG_IMAGE = { url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, type: 'image/png' };
export const LOGO_URL = `${SITE_URL}/logo.png`;
export const BUILDER = { name: 'Siamak Kalhor Consulting', url: 'https://siamakconsulting.com', product: 'https://siamakconsulting.com/lending-desk' };

/** Page metadata: short share title and description (fit Google and social cards), preview image on every page. */
export function buildMetadata(lang: Lang): Metadata {
  const s = SEO[lang];
  const title = s.shareTitle;
  const url = `${SITE_URL}${pathFor(lang)}`;
  const languages = Object.fromEntries(LANGS.map((l) => [l === 'zh' ? 'zh-Hans' : l, `${SITE_URL}${pathFor(l)}`]));
  const image = { ...OG_IMAGE, alt: `${LENDER.name} — ${s.title}` };
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: title },
    description: s.shareDescription,
    keywords: s.keywords,
    applicationName: LENDER.name,
    authors: [{ name: BUILDER.name, url: BUILDER.url }],
    creator: BUILDER.name,
    publisher: LENDER.name,
    category: 'finance',
    alternates: { canonical: url, languages: { ...languages, 'x-default': `${SITE_URL}/` } },
    openGraph: {
      type: 'website',
      url,
      siteName: LENDER.name,
      title,
      description: s.shareDescription,
      locale: OG_LOCALE[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description: s.shareDescription, images: [image] },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 } },
    appleWebApp: { title: LENDER.name, capable: true, statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    other: { 'og:logo': LOGO_URL },
  };
}

const PROGRAM_KEYS = ['fix_flip', 'bridge', 'construction', 'dscr', 'bank_statement', 'commercial_perm', 'commercial'] as const;

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
        logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
        image: { '@type': 'ImageObject', url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height },
        sameAs: [BUILDER.product],
        description: SEO.en.description,
        slogan: DICT.en.hero.title,
        ...(LENDER.phone ? { telephone: LENDER.phone } : {}),
        ...(LENDER.nmls ? { identifier: { '@type': 'PropertyValue', propertyID: 'NMLS', value: LENDER.nmls } } : {}),
        areaServed: LENDER.box.states.map((s) => ({ '@type': 'State', name: s, containedInPlace: { '@type': 'Country', name: 'United States' } })),
        availableLanguage: LANGS.map((l) => ({ '@type': 'Language', name: LANG_META[l].label, alternateName: l })),
        knowsAbout: ['Residential real estate loans', 'Commercial real estate loans', 'Bank statement loans', 'Commercial permanent mortgages', 'Hard money loans', 'Fix-and-flip financing', 'Bridge loans', 'Ground-up construction loans', 'DSCR rental loans', 'Commercial bridge loans', 'Private real estate lending', 'Prime rate', 'SOFR'],
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
              description: `${DICT.en.programs.rows[k].use}. Typical market range ${MARKET_RANGES.ranges[k].rate}${MARKET_RANGES.ranges[k].points ? `, ${MARKET_RANGES.ranges[k].points} points` : ''}, term ${termText(k)}, leverage ${MARKET_RANGES.ranges[k].leverage}. Not an offer to lend; terms set after underwriting.`,
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
        description: SEO.en.shareDescription,
        publisher: { '@id': orgId },
        creator: { '@type': 'Organization', name: BUILDER.name, url: BUILDER.url },
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
        primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height },
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
