# Lending Agent — Phase 1

AI lead-capture agent for a private-money lending network (50+ brokers). Website chat that answers with live market data, qualifies borrower and broker deals, scores them 0–100, and routes them to a licensed broker.

## What's in it
- `lib/prompt.ts` — the agent's rules (ranges only, no quotes, AI disclosure, no SSNs, handoff triggers)
- `lib/agent.ts` — Claude tool loop: `get_market_rates`, `check_deal_fit`, `save_lead`, `request_human`, `web_search`
- `lib/rates.ts` — benchmarks from FRED (prime, SOFR, Fed funds, Treasuries, Freddie Mac 30/15-yr), 12h cache, verified fallback
- `lib/scoring.ts` — lending-box fit check + lead score (hot 70+, warm 40–69, nurture)
- `lib/leads.ts` — saves contact, TCPA consent proof, lead, deal; routes to a broker; emails them via Resend
- `supabase/migrations/001_init.sql` — applied to the **scale** Supabase project; tables prefixed `la_`: contacts, brokers, consents, leads, deals, assignments, conversations, rates_cache (RLS on)
- `/` landing page with live rates + chat · `/widget` embeddable chat · `/api/cron/rates` daily refresh

Consent to calls/texts comes only from the checkbox the person ticks — never from the model.

## Run
```
cp .env.example .env.local   # add ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install && npm run dev
npm test
```
Without Supabase keys it runs in demo mode (leads scored but not stored).

## Embed on any site
```html
<iframe src="https://YOUR-DOMAIN/widget" style="width:400px;height:640px;border:0"></iframe>
```

## Placeholders to confirm with the lender
Name, states, min/max loan, LTV/LTC limits (`lib/config.ts` or env vars), and the broker list (insert into `brokers`).
