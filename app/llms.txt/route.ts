import { LENDER, LENDER_ABOUT, MARKET_RANGES } from '@/lib/config.ts';
import { DICT, LANGS, LANG_META } from '@/lib/i18n.ts';
import { FAQ } from '@/lib/faq.ts';
import { getBenchmarks } from '@/lib/rates.ts';
import { SITE_URL, pathFor } from '@/lib/seo.ts';

export const revalidate = 3600;

/** llms.txt: a plain, citable summary of the site for AI assistants. */
export async function GET() {
  const { benchmarks } = await getBenchmarks();
  const en = DICT.en;
  const rows = (['fix_flip', 'bridge', 'construction', 'dscr', 'bank_statement', 'commercial_perm', 'commercial'] as const).map((k) => {
    const r = MARKET_RANGES.ranges[k];
    const term = r.term ? `${r.term.from}${r.term.from === r.term.to ? '' : `–${r.term.to}`} ${r.term.unit === 'mo' ? 'months' : 'years'}` : 'varies';
    return `- ${en.programs.rows[k].name} (${en.programs.rows[k].use}): typical rate ${r.rate}, points ${r.points ?? 'varies'}, term ${term}, leverage ${r.leverage}`;
  });

  const body = `# ${LENDER.name}

> ${LENDER.name} is ${LENDER_ABOUT}. It is a non-bank lender, not a bank, and takes no deposits. Programs include hard money, fix-and-flip, bridge, ground-up construction, DSCR rental, bank-statement and commercial loans. A 24/7 AI lending desk answers in English, Spanish, Persian, German and Chinese, checks deals against the lending box and routes them to an account executive.

## Key facts
- Lending states: ${LENDER.box.states.join(', ')}
- Loan size: $${LENDER.box.minLoan.toLocaleString('en-US')} to $${LENDER.box.maxLoan.toLocaleString('en-US')}
- Maximum leverage: ${LENDER.box.maxLtArv * 100}% of after-repair value (fix-and-flip), ${LENDER.box.maxLtvAsIs * 100}% of as-is value (bridge), ${LENDER.box.maxLtc * 100}% of total cost (construction)
- Languages: ${LANGS.map((l) => LANG_META[l].label).join(', ')}
- The site gives general information and market ranges only. It is not a loan offer; terms are set after underwriting.

## Today's benchmark rates (source: FRED, St. Louis Fed)
${benchmarks.map((b) => `- ${b.label}: ${b.value.toFixed(2)}% as of ${b.as_of} (${b.source_url})`).join('\n')}

## Typical private-lending ranges (as of ${MARKET_RANGES.as_of})
${rows.join('\n')}
Sources: ${MARKET_RANGES.sources.join(', ')}

## Frequently asked questions
${FAQ.en.map((x) => `### ${x.q}\n${x.a}`).join('\n\n')}

## Pages
${LANGS.map((l) => `- [${LANG_META[l].label}](${SITE_URL}${pathFor(l)})`).join('\n')}
- [Embeddable lending desk](${SITE_URL}/widget)
- Embed on any site: <script src="${SITE_URL}/embed.js" data-partner="YOUR-ID" async></script>

## About this site
- Built by Siamak Kalhor Consulting: https://siamakconsulting.com/lending-desk
- Last updated: ${new Date().toISOString().slice(0, 10)}
`;

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
