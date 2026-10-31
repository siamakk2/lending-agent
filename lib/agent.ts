import Anthropic from '@anthropic-ai/sdk';
import { systemPrompt } from './prompt.ts';
import { getBenchmarks } from './rates.ts';
import { MARKET_RANGES } from './config.ts';
import { checkFit, scoreLead, type DealInput } from './scoring.ts';
import { saveLead, saveTranscript, type SaveLeadInput } from './leads.ts';
import type { Lang } from './i18n.ts';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

const dealSchema = {
  type: 'object',
  properties: {
    goal: { type: 'string', enum: ['purchase', 'refinance', 'cash_out', 'construction', 'bridge'] },
    loan_type: { type: 'string', enum: ['fix_flip', 'bridge', 'construction', 'dscr', 'bank_statement', 'commercial_perm', 'commercial', 'other'] },
    property_type: { type: 'string', enum: ['sfr', '2_4_unit', 'multifamily_5plus', 'mixed_use', 'retail', 'industrial', 'office', 'land', 'other'] },
    property_address: { type: 'string' },
    city: { type: 'string' },
    state: { type: 'string', description: 'Two-letter US state code' },
    condition: { type: 'string' },
    purchase_price: { type: 'number' },
    as_is_value: { type: 'number' },
    loan_amount: { type: 'number' },
    rehab_budget: { type: 'number' },
    arv: { type: 'number', description: 'After-repair value' },
    existing_liens: { type: 'number' },
    monthly_rent: { type: 'number' },
    exit_strategy: { type: 'string', enum: ['sell', 'refi_dscr', 'refi_bank', 'hold', 'other'] },
    close_by: { type: 'string', description: 'YYYY-MM-DD' },
    experience_deals_24mo: { type: 'integer' },
    credit_band: { type: 'string', description: 'Self-reported range, e.g. 680-719' },
    entity: { type: 'boolean' },
    owner_occupied: { type: 'boolean' },
    broker_comp_requested: { type: 'string' },
    notes: { type: 'string' },
  },
} as const;

export const TOOLS: Anthropic.Messages.ToolUnion[] = [
  {
    name: 'get_market_rates',
    description: 'Current benchmark rates (Fed funds, prime, SOFR, Treasuries, Freddie Mac 30/15-yr) with dates and sources, plus typical private-lending ranges by loan type. Call before stating any rate.',
    input_schema: { type: 'object', properties: {} },
  },
  {
    name: 'check_deal_fit',
    description: "Check a deal against the lender's box and score it. Use once you know loan type, state, loan amount and value.",
    input_schema: dealSchema as unknown as Anthropic.Messages.Tool.InputSchema,
  },
  {
    name: 'save_lead',
    description: 'Save the lead and deal file and route it to a licensed broker. Call once you have a name and a phone or email.',
    input_schema: {
      type: 'object',
      properties: {
        lead_type: { type: 'string', enum: ['borrower', 'broker_deal', 'broker_signup'] },
        full_name: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        company: { type: 'string' },
        nmls_id: { type: 'string' },
        summary: { type: 'string', description: 'In ENGLISH. Two or three sentences a broker reads first: who, what, how much, where, when, exit.' },
        preferred_language: { type: 'string', enum: ['en', 'es', 'fa', 'de', 'zh', 'other'] },
        best_callback_time: { type: 'string', description: 'e.g. "weekdays after 4pm Pacific"' },
        urgent: { type: 'boolean', description: 'True for default/foreclosure/auction, maturity, closing in 10 days or less, lender fell through, contract expiring.' },
        flags: { type: 'array', items: { type: 'string' }, description: 'In ENGLISH. Short urgency or risk notes for the broker, e.g. "Trustee sale scheduled Nov 18 (per borrower)".' },
        deal: dealSchema,
      },
      required: ['lead_type', 'full_name', 'summary'],
    } as unknown as Anthropic.Messages.Tool.InputSchema,
  },
  {
    name: 'request_human',
    description: 'Hand off to a person: asked for a human, term sheet or application; loan over $5M; legal issue or complaint.',
    input_schema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] },
  },
  { type: 'web_search_20250305', name: 'web_search', max_uses: 3 },
];

export type ChatContext = { sessionId: string; consent: boolean; lang: Lang; voice?: boolean; channel?: string; source?: string; ip?: string; userAgent?: string };

async function runTool(name: string, input: Record<string, unknown>, ctx: ChatContext): Promise<unknown> {
  switch (name) {
    case 'get_market_rates': {
      const { benchmarks, from } = await getBenchmarks();
      return { benchmarks, data_from: from, typical_ranges: MARKET_RANGES };
    }
    case 'check_deal_fit': {
      const d = input as DealInput;
      return { ...checkFit(d), ...scoreLead(d) };
    }
    case 'save_lead': {
      // Consent comes only from the checkbox the person ticked in the UI, never from the model.
      const lead = { ...(input as unknown as SaveLeadInput), contact_consent: ctx.consent };
      const res = await saveLead(lead, ctx);
      return { ...res, consent_to_call_or_text: ctx.consent };
    }
    case 'request_human':
      return { ok: true, note: 'A team member has been flagged. Offer to take their best phone number and time if not already saved.' };
    default:
      return { error: `unknown tool ${name}` };
  }
}

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

/** One agent turn: run the tool loop until the model answers in text. */
export type Tone = 'calm' | 'warm' | 'reassuring' | 'upbeat';

/** Pull the leading [tone:x] delivery tag off a reply (also removes any stray tags). */
export function splitTone(text: string): { reply: string; tone: Tone } {
  const m = text.match(/^\s*\[tone:(calm|warm|reassuring|upbeat)\]\s*/i);
  const tone = (m?.[1]?.toLowerCase() as Tone) || 'warm';
  return { reply: text.replace(/\[tone:[a-z]+\]\s*/gi, '').trim(), tone };
}

export async function chat(history: ChatTurn[], ctx: ChatContext): Promise<{ reply: string; events: string[]; tone: Tone }> {
  const client = new Anthropic();
  const messages: Anthropic.Messages.MessageParam[] = history.slice(-30).map((t) => ({ role: t.role, content: t.content }));
  const events: string[] = [];

  for (let i = 0; i < 6; i++) {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system:
        systemPrompt(ctx.lang) +
        `\n\nConsent box under the chat is currently ${ctx.consent ? 'CHECKED' : 'NOT checked'}.` +
        (ctx.voice ? '\nThis turn is VOICE: the reply will be spoken aloud. Plain sentences only, no markdown, under 60 words.' : ''),
      tools: TOOLS,
      messages,
    });
    messages.push({ role: 'assistant', content: res.content });

    const toolUses = res.content.filter((b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use');
    if (res.stop_reason !== 'tool_use' || toolUses.length === 0) {
      const raw = res.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('\n')
        .trim();
      const { reply, tone } = splitTone(raw);
      await saveTranscript(ctx.sessionId, [...history, { role: 'assistant', content: reply }], ctx.voice ? 'voice' : ctx.channel, ctx.lang);
      return { reply, events, tone };
    }

    const results: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      events.push(tu.name);
      const out = await runTool(tu.name, tu.input as Record<string, unknown>, ctx).catch((e) => ({ error: String(e) }));
      results.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(out) });
    }
    messages.push({ role: 'user', content: results });
  }
  return { reply: 'Sorry — I hit a snag. Could you say that once more?', events, tone: 'calm' };
}
