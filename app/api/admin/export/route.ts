import { isAdmin } from '@/lib/admin-auth.ts';
import { loadLeads } from '@/lib/admin-data.ts';
import { filterLeads } from '@/lib/admin-filter.ts';
import { leverage, leadFee, STATUS_LABEL } from '@/lib/metrics.ts';

export const dynamic = 'force-dynamic';

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Quote, and neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response('Sign in first', { status: 401 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const { leads } = await loadLeads(null, sp.sample === '1');
  const rows = filterLeads(leads, sp);
  const head = ['received', 'name', 'email', 'phone', 'lead_type', 'program', 'state', 'city', 'loan_amount', 'as_is_value', 'arv', 'rehab', 'ltv', 'ltarv', 'score', 'tier', 'urgent', 'status', 'owner', 'partner', 'language', 'channel', 'consent', 'first_contacted', 'funded_amount', 'funded_at', 'fee_0_25pct', 'lost_reason', 'summary'];
  const lines = rows.map((l) => {
    const lev = leverage(l.deal);
    return [
      l.created_at, l.contact?.full_name, l.contact?.email, l.contact?.phone, l.lead_type, l.deal?.loan_type, l.deal?.state, l.deal?.city,
      l.deal?.loan_amount, l.deal?.as_is_value, l.deal?.arv, l.deal?.rehab_budget, lev.ltv?.toFixed(4), lev.ltarv?.toFixed(4), l.score, l.tier, l.urgent,
      STATUS_LABEL[l.status], l.assigned_to || l.broker, l.partner_ref, l.preferred_language, l.channel, l.consent, l.first_contacted_at,
      l.funded_amount, l.funded_at, leadFee(l).toFixed(2), l.lost_reason, l.summary,
    ].map(cell).join(',');
  });
  const csv = [head.join(','), ...lines].join('\n');
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lending-desk-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
