import type { LeadRow, Status } from './metrics.ts';

// Clearly labeled sample data so the dashboard can be shown before real leads exist. Deterministic (seeded).
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

const FIRST = ['Maria', 'David', 'Leila', 'James', 'Sofia', 'Daniel', 'Nima', 'Laura', 'Kevin', 'Ana', 'Wei', 'Thomas', 'Sara', 'Carlos', 'Hannah', 'Omid', 'Rachel', 'Luis', 'Mei', 'Jonas'];
const LAST = ['Garcia', 'Cohen', 'Rahimi', 'Miller', 'Lopez', 'Nguyen', 'Karimi', 'Schmidt', 'Chen', 'Reyes', 'Patel', 'Becker', 'Ahmadi', 'Rivera', 'Wong', 'Fischer'];
const TYPES: [string, number, [number, number]][] = [
  ['fix_flip', 0.27, [180_000, 900_000]],
  ['bridge', 0.22, [300_000, 3_000_000]],
  ['dscr', 0.18, [200_000, 1_200_000]],
  ['bank_statement', 0.1, [350_000, 1_500_000]],
  ['construction', 0.1, [600_000, 5_000_000]],
  ['commercial', 0.08, [1_000_000, 8_000_000]],
  ['commercial_perm', 0.05, [1_500_000, 10_000_000]],
];
const STATES: [string, number][] = [['FL', 0.32], ['CA', 0.2], ['TX', 0.16], ['AZ', 0.09], ['NV', 0.07], ['CO', 0.06], ['WA', 0.05], ['OR', 0.05]];
const PARTNERS: [string | null, number][] = [[null, 0.46], ['brightpath-mtg', 0.16], ['coastal-capital', 0.13], ['summit-brokers', 0.1], ['realty-one-pbg', 0.08], ['harbor-lending', 0.07]];
const LANGS: [string, number][] = [['en', 0.68], ['es', 0.2], ['fa', 0.05], ['zh', 0.04], ['de', 0.03]];
const OWNERS = ['J. Alvarez', 'M. Chen', 'R. Patel', 'S. Okafor'];
const LOST = ['Rate or terms', 'Went with another lender', 'Outside lending box', 'No response', 'Deal fell through'];

function pick<T>(r: () => number, items: [T, number][]): T {
  let x = r();
  for (const [v, w] of items) {
    if ((x -= w) <= 0) return v;
  }
  return items[items.length - 1][0];
}

export function sampleLeads(now = new Date(), count = 220): LeadRow[] {
  const r = rng(42);
  const out: LeadRow[] = [];
  for (let i = 0; i < count; i++) {
    // More recent days get slightly more leads (growth), office hours weighted.
    const ageDays = Math.floor(Math.pow(r(), 1.25) * 90);
    const hour = r() < 0.62 ? 8 + Math.floor(r() * 10) : Math.floor(r() * 24);
    const created = new Date(now.getTime() - ageDays * 864e5);
    created.setUTCHours((hour + 7) % 24, Math.floor(r() * 60), 0, 0);
    if (created > now) created.setTime(now.getTime() - 3600e3);

    const [type, , [lo, hi]] = pick(r, TYPES.map((t) => [t, t[1]] as [typeof t, number]));
    const loan = Math.round((lo + Math.pow(r(), 1.6) * (hi - lo)) / 5000) * 5000;
    const ltv = 0.55 + r() * 0.3;
    const value = Math.round(loan / ltv / 5000) * 5000;
    const rehab = type === 'fix_flip' || type === 'construction' ? Math.round((loan * (0.15 + r() * 0.35)) / 5000) * 5000 : null;
    const arv = type === 'fix_flip' ? Math.round((value + (rehab || 0)) * (1.15 + r() * 0.25) / 5000) * 5000 : null;
    const rent = type === 'dscr' || type === 'commercial_perm' ? Math.round((value * (0.06 + r() * 0.04)) / 12 / 50) * 50 : null;
    const score = Math.max(8, Math.min(98, Math.round(30 + r() * 55 + (r() < 0.25 ? 15 : 0))));
    const tier = score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'nurture';

    // Outcome depends on age and score.
    const p = r();
    const q = score / 100;
    let status: Status = 'new';
    if (ageDays > 2) {
      if (ageDays > 20 && p < 0.1 + q * 0.18) status = 'funded';
      else if (ageDays > 8 && p < 0.2 + (1 - q) * 0.45) status = 'lost';
      else if (p < 0.55) status = 'term_sheet';
      else if (p < 0.68) status = 'application';
      else if (p < 0.85) status = 'contacted';
      else status = 'claimed';
    } else status = p < 0.4 ? 'new' : p < 0.7 ? 'routed' : 'contacted';

    const respMin = r() < 0.55 ? 1 + r() * 5 : r() < 0.8 ? 6 + r() * 54 : 60 + r() * 900;
    const contacted = status !== 'new' && status !== 'routed' ? new Date(created.getTime() + respMin * 60000).toISOString() : null;
    const fundDays = 12 + r() * 30;
    const first = FIRST[Math.floor(r() * FIRST.length)];
    const last = LAST[Math.floor(r() * LAST.length)];

    out.push({
      id: `sample-${i}`,
      created_at: created.toISOString(),
      status,
      tier,
      score,
      urgent: r() < 0.09,
      channel: r() < 0.72 ? 'chat' : 'voice',
      lead_type: r() < 0.3 ? 'broker_deal' : 'borrower',
      preferred_language: pick(r, LANGS),
      partner_ref: pick(r, PARTNERS),
      assigned_to: status === 'new' ? null : OWNERS[Math.floor(r() * OWNERS.length)],
      first_contacted_at: contacted,
      funded_amount: status === 'funded' ? Math.round((loan * (0.92 + r() * 0.08)) / 5000) * 5000 : null,
      funded_at: status === 'funded' ? new Date(Math.min(now.getTime(), created.getTime() + fundDays * 864e5)).toISOString() : null,
      lost_reason: status === 'lost' ? LOST[Math.floor(r() * LOST.length)] : null,
      summary: `${type.replace('_', ' ')} request for $${loan.toLocaleString('en-US')}.`,
      flags: [],
      contact: { full_name: `${first} ${last}`, email: `${first.toLowerCase()}@example.com`, phone: null, company: null },
      deal: { loan_type: type, state: pick(r, STATES), loan_amount: loan, as_is_value: value, purchase_price: value, rehab_budget: rehab, arv, monthly_rent: rent },
      broker: null,
      consent: r() < 0.85,
    });
  }
  return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
