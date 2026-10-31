// Lending Desk admin math. Pure functions over lead rows: no database, so every number is testable.

export const FEE_RATE = 0.0025; // 0.25% of the funded loan amount

export const STATUSES = ['new', 'routed', 'claimed', 'contacted', 'application', 'term_sheet', 'funded', 'lost'] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<Status, string> = {
  new: 'New',
  routed: 'Routed',
  claimed: 'Claimed',
  contacted: 'Contacted',
  application: 'Application',
  term_sheet: 'Term sheet',
  funded: 'Funded',
  lost: 'Lost',
};

// How far along each open status is, and the chance an open lead at that status funds.
// Assumed industry-style probabilities until there is enough closed history to measure them.
const RANK: Record<Status, number> = { new: 0, routed: 1, claimed: 2, contacted: 3, application: 4, term_sheet: 5, funded: 6, lost: -1 };
export const STAGE_PROB: Record<Status, number> = { new: 0.05, routed: 0.08, claimed: 0.12, contacted: 0.2, application: 0.4, term_sheet: 0.7, funded: 1, lost: 0 };

export type Deal = {
  loan_type?: string | null;
  property_type?: string | null;
  state?: string | null;
  city?: string | null;
  loan_amount?: number | null;
  purchase_price?: number | null;
  as_is_value?: number | null;
  arv?: number | null;
  rehab_budget?: number | null;
  monthly_rent?: number | null;
  close_by?: string | null;
  experience_deals_24mo?: number | null;
  exit_strategy?: string | null;
  credit_band?: string | null;
};

export type LeadRow = {
  id: string;
  created_at: string;
  status: Status;
  tier: 'hot' | 'warm' | 'nurture';
  score: number;
  urgent: boolean;
  channel: string;
  lead_type: string;
  preferred_language: string | null;
  partner_ref: string | null;
  assigned_to: string | null;
  first_contacted_at: string | null;
  funded_amount: number | null;
  funded_at: string | null;
  lost_reason: string | null;
  summary: string | null;
  flags: string[];
  best_callback_time?: string | null;
  source?: string | null;
  contact: { full_name: string | null; email: string | null; phone: string | null; company: string | null } | null;
  deal: Deal | null;
  broker: string | null;
  consent: boolean;
};

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : null);

/** Loan-to-value, loan-to-cost and loan-to-after-repair-value, as fractions. */
export function leverage(d: Deal | null) {
  if (!d) return { ltv: null, ltc: null, ltarv: null };
  const loan = num(d.loan_amount);
  const value = num(d.as_is_value) ?? num(d.purchase_price);
  const cost = (num(d.purchase_price) ?? num(d.as_is_value) ?? 0) + (num(d.rehab_budget) ?? 0);
  const arv = num(d.arv);
  return {
    ltv: loan && value ? loan / value : null,
    ltc: loan && cost && num(d.rehab_budget) ? loan / cost : null,
    ltarv: loan && arv ? loan / arv : null,
  };
}

/** Gross rental yield: annual rent over value. */
export function grossYield(d: Deal | null): number | null {
  const rent = num(d?.monthly_rent);
  const value = num(d?.as_is_value) ?? num(d?.purchase_price);
  return rent && value ? (rent * 12) / value : null;
}

/** Fee earned (funded) or at stake (open) on one lead. */
export function leadFee(l: Pick<LeadRow, 'funded_amount' | 'deal' | 'status'>): number {
  const amount = l.status === 'funded' ? num(l.funded_amount) ?? num(l.deal?.loan_amount) ?? 0 : num(l.deal?.loan_amount) ?? 0;
  return amount * FEE_RATE;
}

export type Summary = { n: number; sum: number; mean: number; median: number; p25: number; p75: number; p90: number; stdev: number; min: number; max: number };

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function summarize(values: number[]): Summary {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  const n = v.length;
  if (!n) return { n: 0, sum: 0, mean: 0, median: 0, p25: 0, p75: 0, p90: 0, stdev: 0, min: 0, max: 0 };
  const sum = v.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const variance = n > 1 ? v.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1) : 0;
  return { n, sum, mean, median: quantile(v, 0.5), p25: quantile(v, 0.25), p75: quantile(v, 0.75), p90: quantile(v, 0.9), stdev: Math.sqrt(variance), min: v[0], max: v[n - 1] };
}

/** Pearson correlation; with a 0/1 outcome this is the point-biserial correlation. */
export function correlation(x: number[], y: number[]): number | null {
  const n = Math.min(x.length, y.length);
  if (n < 3) return null;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

/** 95% Wilson interval for a proportion: honest error bars on small samples. */
export function wilson(successes: number, n: number): [number, number] {
  if (!n) return [0, 0];
  const z = 1.96;
  const p = successes / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const r = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [Math.max(0, (c - r) / d), Math.min(1, (c + r) / d)];
}

const minutesBetween = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 60000;

export type Group = {
  key: string;
  leads: number;
  share: number;
  requested: number;
  avgScore: number;
  hotShare: number;
  funded: number;
  fundedVolume: number;
  closeRate: number | null; // funded / (funded + lost)
  feeEarned: number;
  feeExpected: number;
};

export function groupBy(leads: LeadRow[], keyOf: (l: LeadRow) => string | null | undefined): Group[] {
  const map = new Map<string, LeadRow[]>();
  for (const l of leads) {
    const k = keyOf(l) || 'Unknown';
    map.set(k, [...(map.get(k) || []), l]);
  }
  const total = leads.length || 1;
  return [...map.entries()]
    .map(([key, rows]) => {
      const funded = rows.filter((r) => r.status === 'funded');
      const lost = rows.filter((r) => r.status === 'lost').length;
      const open = rows.filter((r) => r.status !== 'funded' && r.status !== 'lost');
      return {
        key,
        leads: rows.length,
        share: rows.length / total,
        requested: rows.reduce((a, r) => a + (num(r.deal?.loan_amount) ?? 0), 0),
        avgScore: rows.reduce((a, r) => a + r.score, 0) / rows.length,
        hotShare: rows.filter((r) => r.tier === 'hot').length / rows.length,
        funded: funded.length,
        fundedVolume: funded.reduce((a, r) => a + (num(r.funded_amount) ?? num(r.deal?.loan_amount) ?? 0), 0),
        closeRate: funded.length + lost ? funded.length / (funded.length + lost) : null,
        feeEarned: funded.reduce((a, r) => a + leadFee(r), 0),
        feeExpected: open.reduce((a, r) => a + leadFee(r) * STAGE_PROB[r.status], 0),
      };
    })
    .sort((a, b) => b.leads - a.leads);
}

/** Calendar day in a time zone, as YYYY-MM-DD. */
function dayKey(iso: string, tz: string) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
}
function weekdayHour(iso: string, tz: string): [number, number] {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', hourCycle: 'h23' }).formatToParts(new Date(iso));
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(parts.find((p) => p.type === 'weekday')?.value || 'Mon');
  const h = Number(parts.find((p) => p.type === 'hour')?.value || 0) % 24;
  return [wd, h];
}

export type Metrics = ReturnType<typeof computeMetrics>;

export function computeMetrics(leads: LeadRow[], opts: { now?: Date; days?: number; tz?: string } = {}) {
  const now = opts.now || new Date();
  const tz = opts.tz || 'America/Los_Angeles';
  const total = leads.length;
  const funded = leads.filter((l) => l.status === 'funded');
  const lost = leads.filter((l) => l.status === 'lost');
  const open = leads.filter((l) => l.status !== 'funded' && l.status !== 'lost');
  const amount = (l: LeadRow) => num(l.deal?.loan_amount) ?? 0;

  // Counts
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, leads.filter((l) => l.status === s).length])) as Record<Status, number>;
  const byTier = { hot: leads.filter((l) => l.tier === 'hot').length, warm: leads.filter((l) => l.tier === 'warm').length, nurture: leads.filter((l) => l.tier === 'nurture').length };
  const urgentOpen = open.filter((l) => l.urgent).length;
  const uncontacted = open.filter((l) => !l.first_contacted_at).length;

  // Funnel: how many leads reached each stage (lost leads count as engaged only if someone reached them).
  const reached = (rank: number) => leads.filter((l) => RANK[l.status] >= rank || (l.status === 'lost' && rank === 3 && !!l.first_contacted_at)).length;
  const funnel = [
    { stage: 'Captured', count: total },
    { stage: 'Contacted', count: reached(3) },
    { stage: 'Application', count: reached(4) },
    { stage: 'Term sheet', count: reached(5) },
    { stage: 'Funded', count: funded.length },
  ].map((s, i, arr) => ({ ...s, ofTotal: total ? s.count / total : 0, fromPrev: i === 0 ? 1 : arr[i - 1].count ? s.count / arr[i - 1].count : 0 }));

  // Money
  const requested = summarize(leads.map(amount).filter((x) => x > 0));
  const openVolume = open.reduce((a, l) => a + amount(l), 0);
  const weightedPipeline = open.reduce((a, l) => a + amount(l) * STAGE_PROB[l.status], 0);
  const fundedVolume = funded.reduce((a, l) => a + (num(l.funded_amount) ?? amount(l)), 0);
  const feeEarned = fundedVolume * FEE_RATE;
  const feeExpected = weightedPipeline * FEE_RATE;
  const pipelineByStatus = STATUSES.filter((s) => s !== 'funded' && s !== 'lost').map((s) => {
    const rows = open.filter((l) => l.status === s);
    const vol = rows.reduce((a, l) => a + amount(l), 0);
    return { status: s, count: rows.length, volume: vol, prob: STAGE_PROB[s], weighted: vol * STAGE_PROB[s] };
  });

  // Rates with honest intervals
  const closed = funded.length + lost.length;
  const closeRate = closed ? funded.length / closed : null;
  const closeCI = wilson(funded.length, closed);
  const leadToFund = total ? funded.length / total : 0;

  // Speed
  const response = summarize(leads.filter((l) => l.first_contacted_at).map((l) => minutesBetween(l.created_at, l.first_contacted_at!)).filter((m) => m >= 0));
  const contactedRows = leads.filter((l) => l.first_contacted_at);
  const within5 = contactedRows.length ? contactedRows.filter((l) => minutesBetween(l.created_at, l.first_contacted_at!) <= 5).length / contactedRows.length : null;
  const within60 = contactedRows.length ? contactedRows.filter((l) => minutesBetween(l.created_at, l.first_contacted_at!) <= 60).length / contactedRows.length : null;
  const daysToFund = summarize(funded.filter((l) => l.funded_at).map((l) => minutesBetween(l.created_at, l.funded_at!) / 1440));

  // Velocity: daily series with a 7-day moving average
  const span = Math.min(opts.days || 90, 90);
  const counts = new Map<string, number>();
  for (const l of leads) counts.set(dayKey(l.created_at, tz), (counts.get(dayKey(l.created_at, tz)) || 0) + 1);
  const daily: { day: string; count: number; ma7: number }[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const day = dayKey(new Date(now.getTime() - i * 864e5).toISOString(), tz);
    daily.push({ day, count: counts.get(day) || 0, ma7: 0 });
  }
  daily.forEach((d, i) => {
    const w = daily.slice(Math.max(0, i - 6), i + 1);
    d.ma7 = w.reduce((a, x) => a + x.count, 0) / w.length;
  });
  const last7 = daily.slice(-7).reduce((a, d) => a + d.count, 0);
  const prev7 = daily.slice(-14, -7).reduce((a, d) => a + d.count, 0);
  const wow = prev7 ? (last7 - prev7) / prev7 : null;
  const perDay = summarize(daily.map((d) => d.count));

  // When inquiries arrive (weekday × hour)
  const heat: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const l of leads) {
    const [w, h] = weekdayHour(l.created_at, tz);
    if (w >= 0) heat[w][h]++;
  }
  const afterHours = total ? leads.filter((l) => { const [w, h] = weekdayHour(l.created_at, tz); return w >= 5 || h < 8 || h >= 18; }).length / total : 0;

  // Quality
  const scores = summarize(leads.map((l) => l.score));
  const histogram = Array.from({ length: 10 }, (_, i) => ({ from: i * 10, to: i * 10 + 9, count: leads.filter((l) => Math.min(9, Math.floor(l.score / 10)) === i).length }));
  const closedRows = [...funded, ...lost];
  const scoreSignal = correlation(closedRows.map((l) => l.score), closedRows.map((l) => (l.status === 'funded' ? 1 : 0)));
  const lev = leads.map((l) => leverage(l.deal));
  const ltv = summarize(lev.map((x) => x.ltv).filter((x): x is number => x !== null));
  const ltc = summarize(lev.map((x) => x.ltc).filter((x): x is number => x !== null));
  const ltarv = summarize(lev.map((x) => x.ltarv).filter((x): x is number => x !== null));

  // Breakdowns
  const breakdowns = {
    loanType: groupBy(leads, (l) => l.deal?.loan_type),
    state: groupBy(leads, (l) => l.deal?.state),
    partner: groupBy(leads, (l) => l.partner_ref || 'Direct (website)'),
    channel: groupBy(leads, (l) => l.channel),
    language: groupBy(leads, (l) => l.preferred_language || 'en'),
    owner: groupBy(open, (l) => l.assigned_to || l.broker || 'Unassigned'),
    lostReason: groupBy(lost, (l) => l.lost_reason),
  };

  return {
    total, byStatus, byTier, urgentOpen, uncontacted, open: open.length,
    funnel, requested, openVolume, weightedPipeline, fundedVolume, feeEarned, feeExpected, pipelineByStatus,
    funded: funded.length, lost: lost.length, closed, closeRate, closeCI, leadToFund,
    response, within5, within60, daysToFund,
    daily, last7, prev7, wow, perDay, heat, afterHours,
    scores, histogram, scoreSignal, ltv, ltc, ltarv,
    breakdowns,
  };
}
