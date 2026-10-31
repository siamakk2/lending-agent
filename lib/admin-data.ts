import { db } from './db.ts';
import type { LeadRow, Status } from './metrics.ts';
import { sampleLeads } from './sample-leads.ts';

const SELECT = `id,created_at,status,tier,score,urgent,channel,lead_type,source,preferred_language,best_callback_time,partner_ref,assigned_to,
first_contacted_at,funded_amount,funded_at,lost_reason,summary,flags,consent_id,
contact:la_contacts(full_name,email,phone,company),
deals:la_deals(loan_type,property_type,state,city,loan_amount,purchase_price,as_is_value,arv,rehab_budget,monthly_rent,close_by,experience_deals_24mo,exit_strategy,credit_band,property_address,condition,existing_liens,notes),
assignments:la_assignments(offered_at,claimed_at,outcome,broker:la_brokers(name))`;

type Raw = Record<string, unknown> & { deals?: unknown[]; assignments?: { broker?: { name?: string } | null }[]; contact?: unknown; consent_id?: string | null };

function shape(r: Raw): LeadRow & { dealExtra: Record<string, unknown> } {
  const deal = (Array.isArray(r.deals) ? r.deals[0] : r.deals) as Record<string, unknown> | undefined;
  const asg = Array.isArray(r.assignments) ? r.assignments[0] : undefined;
  const n = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));
  return {
    ...(r as unknown as LeadRow),
    score: Number(r.score) || 0,
    funded_amount: n(r.funded_amount),
    flags: (r.flags as string[]) || [],
    contact: (r.contact as LeadRow['contact']) || null,
    deal: deal
      ? { ...deal, loan_amount: n(deal.loan_amount), purchase_price: n(deal.purchase_price), as_is_value: n(deal.as_is_value), arv: n(deal.arv), rehab_budget: n(deal.rehab_budget), monthly_rent: n(deal.monthly_rent) }
      : null,
    dealExtra: deal || {},
    broker: asg?.broker?.name || null,
    consent: !!r.consent_id,
  };
}

export type LoadResult = { leads: LeadRow[]; sample: boolean; configured: boolean; realCount: number; error?: string };

/** Leads created since `days` ago (or all). Sample data only when asked for. */
export async function loadLeads(days: number | null, wantSample: boolean): Promise<LoadResult> {
  const supa = db();
  let real: LeadRow[] = [];
  let error: string | undefined;
  if (supa) {
    let q = supa.from('la_leads').select(SELECT).order('created_at', { ascending: false }).limit(5000);
    if (days) q = q.gte('created_at', new Date(Date.now() - days * 864e5).toISOString());
    const { data, error: e } = await q;
    if (e) error = e.message;
    real = ((data || []) as Raw[]).map(shape);
  }
  if (wantSample) {
    const s = sampleLeads();
    const cut = days ? Date.now() - days * 864e5 : 0;
    return { leads: s.filter((l) => Date.parse(l.created_at) >= cut), sample: true, configured: !!supa, realCount: real.length, error };
  }
  return { leads: real, sample: false, configured: !!supa, realCount: real.length, error };
}

export async function loadLead(id: string) {
  if (id.startsWith('sample-')) {
    const l = sampleLeads().find((x) => x.id === id);
    return l ? { lead: { ...l, dealExtra: {} }, events: [], transcript: [] as { role: string; content: string }[], sample: true } : null;
  }
  const supa = db();
  if (!supa) return null;
  const { data } = await supa.from('la_leads').select(SELECT).eq('id', id).maybeSingle();
  if (!data) return null;
  const [{ data: events }, { data: convo }] = await Promise.all([
    supa.from('la_lead_events').select('id,kind,from_status,to_status,body,actor,created_at').eq('lead_id', id).order('created_at', { ascending: false }),
    supa.from('la_conversations').select('transcript,channel,language,created_at').eq('lead_id', id).order('created_at', { ascending: false }).limit(1),
  ]);
  const transcript = ((convo?.[0]?.transcript as { role: string; content: unknown }[]) || []).map((t) => ({
    role: t.role,
    content: typeof t.content === 'string' ? t.content : Array.isArray(t.content) ? t.content.map((c: { text?: string }) => c.text || '').join(' ') : '',
  })).filter((t) => t.content.trim());
  return { lead: shape(data as Raw), events: (events || []) as LeadEvent[], transcript, sample: false };
}

export type LeadEvent = { id: string; kind: string; from_status: Status | null; to_status: Status | null; body: string | null; actor: string | null; created_at: string };
