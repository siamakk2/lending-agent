// Lender settings. Placeholders until the lender confirms their box.
export const LENDER = {
  name: process.env.LENDER_NAME || 'Lending Desk',
  phone: process.env.LENDER_PHONE || '',
  nmls: process.env.LENDER_NMLS || '',
  hours: process.env.LENDER_HOURS || 'Mon–Fri 8am–6pm Pacific',
  box: {
    states: (process.env.LENDER_STATES || 'CA,NV,AZ,TX,FL,WA,OR,CO').split(',').map((s) => s.trim().toUpperCase()),
    loanTypes: ['fix_flip', 'bridge', 'construction', 'dscr', 'bank_statement', 'commercial_perm', 'commercial'] as const,
    minLoan: Number(process.env.LENDER_MIN_LOAN || 100_000),
    maxLoan: Number(process.env.LENDER_MAX_LOAN || 10_000_000),
    maxLtvAsIs: 0.75,
    maxLtArv: 0.75,
    maxLtc: 0.85,
    minDscr: 1.0,
  },
};

export type LoanType = (typeof LENDER.box.loanTypes)[number];

type Range = { rate: string; points: string | null; leverage: string; term: { from: number; to: number; unit: 'mo' | 'yr' } | null };

// Typical market ranges the agent may cite (ranges only, never quotes). Language-neutral values.
export const MARKET_RANGES: { as_of: string; note: string; ranges: Record<LoanType, Range>; sources: string[] } = {
  as_of: '2026-10-31',
  note: 'Typical private-lending ranges from published 2026 market surveys. Actual terms depend on the deal and are set only by a licensed broker or lender.',
  ranges: {
    fix_flip: { rate: '9–12%', points: '1–3', leverage: 'up to ~70–75% of ARV', term: { from: 6, to: 18, unit: 'mo' } },
    bridge: { rate: '8–12%', points: '1–3', leverage: '60–70% of as-is value', term: { from: 12, to: 36, unit: 'mo' } },
    construction: { rate: '12–15%', points: '1–3+', leverage: 'by loan-to-cost', term: { from: 12, to: 24, unit: 'mo' } },
    dscr: { rate: '7.1%+', points: null, leverage: '75–85% LTV', term: { from: 30, to: 30, unit: 'yr' } },
    bank_statement: { rate: '7.6–10.4%', points: null, leverage: 'up to ~90% LTV (primary), 75–85% (investment)', term: { from: 30, to: 30, unit: 'yr' } },
    commercial_perm: { rate: '5.75–8.75%', points: null, leverage: '60–80% LTV', term: { from: 5, to: 10, unit: 'yr' } },
    commercial: { rate: '7.5–12%', points: null, leverage: 'varies by property', term: null },
  },
  sources: [
    'https://www.coradvisors.net/2026/08/hard-money-loans-vs-bridge-loans-2026.html',
    'https://www.herringbank.com/learn/hard-money-loans/',
    'https://griffinfunding.com/dscr-loan-calculator/',
    'https://www.freefincalc.net/blog/bank-statement-loan-requirements-2026',
    'https://rentalrealestate.com/loans/commercial/',
  ],
};

// Who the lender is, in one line (used by the agent, schema and llms.txt).
export const LENDER_ABOUT =
  'a non-bank lender whose account executives and 50+ partner brokers arrange residential and commercial real estate loans of all types across multiple states';

// The English consent text is the version of record stored with each consent.
export const CONSENT_TEXT = (lender: string) =>
  `I agree that ${lender} and its partner brokers may contact me at the number and email I provide, including by calls and texts using an AI-generated voice or automated technology, about my financing inquiry. Consent is not a condition of any loan. Message and data rates may apply. Reply STOP to opt out.`;
