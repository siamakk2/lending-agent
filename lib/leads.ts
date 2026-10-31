import { db } from './db.ts';
import { CONSENT_TEXT, LENDER } from './config.ts';
import { scoreLead, type DealInput } from './scoring.ts';

export type SaveLeadInput = {
  lead_type: 'borrower' | 'broker_deal' | 'broker_signup';
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  nmls_id?: string;
  contact_consent: boolean; // user explicitly agreed to the consent text in chat
  summary: string;
  preferred_language?: string;
  best_callback_time?: string;
  urgent?: boolean;
  flags?: string[];
  deal?: DealInput & { property_address?: string; condition?: string; existing_liens?: number; entity?: boolean; owner_occupied?: boolean; broker_comp_requested?: string; notes?: string };
};

export type SaveLeadResult = { ok: boolean; lead_id?: string; score: number; tier: string; routed_to?: string; demo?: boolean; error?: string };

type Broker = { id: string; name: string; email: string; states: string[]; loan_types: string[]; min_loan: number | null; max_loan: number | null; capacity: number; close_rate: number };

/** Pick a broker: licensed state → loan type + size → capacity → close rate. */
export function pickBroker(brokers: Broker[], openCounts: Record<string, number>, d?: DealInput): Broker | null {
  const ok = brokers.filter((b) => {
    if (d?.state && b.states.length && !b.states.includes(d.state.toUpperCase())) return false;
    if (d?.loan_type && b.loan_types.length && !b.loan_types.includes(d.loan_type)) return false;
    if (d?.loan_amount && b.min_loan && d.loan_amount < b.min_loan) return false;
    if (d?.loan_amount && b.max_loan && d.loan_amount > b.max_loan) return false;
    return (openCounts[b.id] || 0) < b.capacity;
  });
  ok.sort((a, b) => (openCounts[a.id] || 0) - (openCounts[b.id] || 0) || b.close_rate - a.close_rate);
  return ok[0] || null;
}

async function notifyBroker(to: string, brokerName: string, subject: string, body: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.LEAD_FROM_EMAIL || 'leads@resend.dev', to, subject, text: `Hi ${brokerName},\n\n${body}` }),
  }).catch(() => {});
}

export async function saveLead(input: SaveLeadInput, ctx: { sessionId: string; channel?: string; source?: string; ip?: string; userAgent?: string }): Promise<SaveLeadResult> {
  const { score, tier } = scoreLead(input.deal || {}, 5);
  const supa = db();
  if (!supa) return { ok: true, score, tier, demo: true };

  try {
    const role = input.lead_type === 'borrower' ? 'borrower' : 'broker';
    const { data: contact, error: ce } = await supa
      .from('la_contacts')
      .insert({ role, full_name: input.full_name, email: input.email, phone: input.phone, company: input.company })
      .select('id')
      .single();
    if (ce) throw ce;

    let consentId: string | null = null;
    if (input.contact_consent) {
      const { data: consent } = await supa
        .from('la_consents')
        .insert({ contact_id: contact.id, text_shown: CONSENT_TEXT(LENDER.name), channels: ['sms', 'voice', 'email'], ip: ctx.ip, user_agent: ctx.userAgent })
        .select('id')
        .single();
      consentId = consent?.id ?? null;
    }

    if (input.lead_type === 'broker_signup') {
      await supa.from('la_brokers').insert({
        contact_id: contact.id, name: input.full_name, company: input.company, email: input.email || '', phone: input.phone,
        nmls_id: input.nmls_id, states: input.deal?.state ? [input.deal.state.toUpperCase()] : [], active: false, // activated after review
      });
    }

    const { data: lead, error: le } = await supa
      .from('la_leads')
      .insert({ contact_id: contact.id, consent_id: consentId, lead_type: input.lead_type, channel: ctx.channel || 'chat', source: ctx.source, score, tier, summary: input.summary, preferred_language: input.preferred_language, best_callback_time: input.best_callback_time, urgent: !!input.urgent, flags: input.flags || [] })
      .select('id')
      .single();
    if (le) throw le;

    if (input.deal) {
      const { state, ...rest } = input.deal;
      await supa.from('la_deals').insert({ lead_id: lead.id, ...rest, state: state?.toUpperCase() });
    }

    await supa.from('la_conversations').update({ lead_id: lead.id }).eq('session_id', ctx.sessionId);

    // Route deals (not broker signups, not nurture)
    let routedTo: string | undefined;
    if (input.lead_type !== 'broker_signup' && (tier !== 'nurture' || input.urgent)) {
      const { data: brokers } = await supa.from('la_brokers').select('id,name,email,states,loan_types,min_loan,max_loan,capacity,close_rate').eq('active', true);
      const { data: open } = await supa.from('la_assignments').select('broker_id').is('outcome', null);
      const counts: Record<string, number> = {};
      (open || []).forEach((a) => (counts[a.broker_id] = (counts[a.broker_id] || 0) + 1));
      const broker = pickBroker((brokers || []) as Broker[], counts, input.deal);
      if (broker) {
        await supa.from('la_assignments').insert({ lead_id: lead.id, broker_id: broker.id });
        await supa.from('la_leads').update({ status: 'routed' }).eq('id', lead.id);
        routedTo = broker.name;
        const d = input.deal || {};
        await notifyBroker(
          broker.email,
          broker.name,
          `${input.urgent ? 'URGENT · ' : ''}${tier.toUpperCase()} lead (${score}/100): ${d.loan_type || 'loan'} in ${d.city || ''} ${d.state || ''}`.trim(),
          `${input.summary}\n${(input.flags || []).length ? `\nFlags:\n- ${(input.flags || []).join('\n- ')}\n` : ''}\nLanguage: ${input.preferred_language || 'en'} · Best time: ${input.best_callback_time || 'not given'}\nContact: ${input.full_name} · ${input.phone || ''} · ${input.email || ''}\nConsent to call/text: ${input.contact_consent ? 'yes' : 'NO — email only'}\n\nClaim within 15 minutes or it rolls to the next broker.`,
        );
      }
    }
    return { ok: true, lead_id: lead.id, score, tier, routed_to: routedTo };
  } catch (e) {
    return { ok: false, score, tier, error: e instanceof Error ? e.message : 'save failed' };
  }
}

export async function saveTranscript(sessionId: string, transcript: unknown[], channel = 'chat', language = 'en') {
  const supa = db();
  if (!supa) return;
  await supa.from('la_conversations').upsert({ session_id: sessionId, channel, transcript, language }, { onConflict: 'session_id' });
}
