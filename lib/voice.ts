// Phone line for Lending Desk: an ElevenLabs voice agent answers calls forwarded from the
// lender's office line, and each finished call becomes a lead through the same saveLead() path as chat.
import { db } from './db.ts';
import type { SaveLeadInput } from './leads.ts';

export const VOICE_AGENT_ID = process.env.LENDING_VOICE_AGENT_ID || 'agent_2001m6rzb3yeebe8b58d6p0b10z9';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lendingdesk.app').replace(/\/$/, '');

// The exact question the agent asks before saving a callback consent (kept in sync with the agent prompt).
export const CALLBACK_QUESTION =
  'Is it okay for a Lending Desk account executive or partner broker to call you back at this number about your loan request?';

export const voiceConfigured = () => ({
  elevenlabs: !!process.env.ELEVENLABS_API_KEY,
  twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
  database: !!db(),
});

/* ---------------------------------------------------------------- settings */
export async function getSetting(key: string): Promise<string | null> {
  const supa = db();
  if (!supa) return null;
  const { data } = await supa.from('la_settings').select('value').eq('key', key).maybeSingle();
  return data?.value || null;
}

export async function setSetting(key: string, value: string | null) {
  const supa = db();
  if (!supa) throw new Error('Database is not configured');
  if (value === null) await supa.from('la_settings').delete().eq('key', key);
  else await supa.from('la_settings').upsert({ key, value, updated_at: new Date().toISOString() });
}

export type PhoneLine = { number: string; twilio_sid: string; xi_id: string; since: string };
export async function getLine(): Promise<PhoneLine | null> {
  const v = await getSetting('phone_line');
  try { return v ? (JSON.parse(v) as PhoneLine) : null; } catch { return null; }
}

/* ---------------------------------------------------------------- APIs */
export async function xi<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
  const r = await fetch(`https://api.elevenlabs.io${path}`, {
    method: opts.method || 'GET',
    headers: { 'xi-api-key': key, ...(opts.body ? { 'content-type': 'application/json' } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`voice ${r.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}

export async function tw<T = any>(path: string, opts: { method?: string; form?: Record<string, string> } = {}): Promise<T> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) throw new Error('Twilio keys are not set');
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}${path}`, {
    method: opts.method || 'GET',
    headers: {
      authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      ...(opts.form ? { 'content-type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: opts.form ? new URLSearchParams(opts.form).toString() : undefined,
    cache: 'no-store',
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`phone company ${r.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}

/** Plain-English versions of the phone company's most common refusals. */
export function friendlyPhoneError(msg = ''): string {
  const code = (/"code":\s*(\d+)/.exec(msg) || [])[1];
  if (code === '20003' && /compliance|KYC|Trust Hub/i.test(msg)) return 'The Twilio account’s business verification isn’t approved yet. Finish the Primary Business Profile in Twilio Trust Hub, then try again. No number was purchased.';
  if (code === '20003') return 'Twilio rejected the login. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Vercel. No number was purchased.';
  if (code === '21452' || code === '21422') return 'That number was just taken. Search again and pick another. No number was purchased.';
  if (code === '21631' || /address/i.test(msg)) return 'Twilio needs a business address on file (Address Management) before buying numbers. No number was purchased.';
  if (/balance|funds|payment/i.test(msg)) return 'The Twilio account needs funds or a payment method. No number was purchased.';
  return msg.replace(/^phone company \d+:\s*/, '').slice(0, 240);
}

/* ---------------------------------------------------------------- webhook signature */
export async function verifySignature(raw: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(',').map((p) => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1)]; }));
  if (!parts.t || !parts.v0) return false;
  if (Number(parts.t) * 1000 < Date.now() - 30 * 60 * 1000) return false;
  const { createHmac, timingSafeEqual } = await import('node:crypto');
  const want = Buffer.from(createHmac('sha256', secret).update(`${parts.t}.${raw}`).digest('hex'));
  const got = Buffer.from(parts.v0);
  return want.length === got.length && timingSafeEqual(want, got);
}

/* ---------------------------------------------------------------- call → lead */
type DC = Record<string, { value?: unknown } | undefined>;
const str = (dc: DC, k: string) => {
  const v = dc[k]?.value;
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s && !/^(none|null|n\/a|unknown|not (given|provided|mentioned))$/i.test(s) ? s : undefined;
};
const num = (dc: DC, k: string) => {
  const n = Number(String(dc[k]?.value ?? '').replace(/[$,\s]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
const bool = (dc: DC, k: string) => {
  const v = dc[k]?.value;
  return v === true || /^(true|yes)$/i.test(String(v ?? ''));
};

export type VoiceCall = {
  conversation_id: string;
  agent_id: string;
  metadata?: { phone_call?: { external_number?: string } | null; call_duration_secs?: number };
  analysis?: { transcript_summary?: string; data_collection_results?: DC };
  transcript?: { role: string; message?: string | null; time_in_call_secs?: number }[];
};

export function leadFromCall(c: VoiceCall): { input: SaveLeadInput; callerNumber?: string; empty: boolean } {
  const dc = c.analysis?.data_collection_results || {};
  const callerNumber = c.metadata?.phone_call?.external_number || undefined;
  const full_name = str(dc, 'full_name') || 'Phone caller';
  const lt = str(dc, 'lead_type');
  const lead_type = (['borrower', 'broker_deal', 'broker_signup'].includes(lt || '') ? lt : 'borrower') as SaveLeadInput['lead_type'];
  const loanType = str(dc, 'loan_type');
  const closeBy = str(dc, 'close_by');
  const input: SaveLeadInput = {
    lead_type,
    full_name,
    phone: str(dc, 'phone') || callerNumber,
    email: str(dc, 'email'),
    company: str(dc, 'company'),
    nmls_id: str(dc, 'nmls_id'),
    contact_consent: bool(dc, 'callback_ok'),
    summary: str(dc, 'summary') || c.analysis?.transcript_summary || 'Phone call; no summary captured.',
    preferred_language: str(dc, 'preferred_language') || 'en',
    best_callback_time: str(dc, 'best_callback_time'),
    urgent: bool(dc, 'urgent'),
    flags: (str(dc, 'flags') || '').split(';').map((s) => s.trim()).filter(Boolean),
    deal: {
      loan_type: loanType && loanType !== 'unknown' ? loanType : undefined,
      property_type: str(dc, 'property_type'),
      city: str(dc, 'city'),
      state: str(dc, 'state')?.slice(0, 2).toUpperCase(),
      loan_amount: num(dc, 'loan_amount'),
      purchase_price: num(dc, 'purchase_price'),
      as_is_value: num(dc, 'as_is_value'),
      arv: num(dc, 'arv'),
      rehab_budget: num(dc, 'rehab_budget'),
      exit_strategy: str(dc, 'exit_strategy'),
      close_by: closeBy && /^\d{4}-\d{2}-\d{2}$/.test(closeBy) ? closeBy : undefined,
    },
  };
  const userTurns = (c.transcript || []).filter((t) => t.role === 'user' && (t.message || '').trim()).length;
  const empty = userTurns === 0 && !str(dc, 'full_name') && !str(dc, 'phone');
  return { input, callerNumber, empty };
}

export const voiceConsentText = (conversationId: string) =>
  `Verbal "yes" on a recorded inbound phone call (conversation ${conversationId}) to the question: "${CALLBACK_QUESTION}" Covers return phone calls only, not texts.`;
