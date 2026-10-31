-- Intake fields modeled on the legal intake: language, callback time, urgency flags.
alter table public.la_leads
  add column if not exists preferred_language text,
  add column if not exists best_callback_time text,
  add column if not exists urgent boolean not null default false,
  add column if not exists flags text[] not null default '{}';

alter table public.la_conversations
  add column if not exists language text;

create index if not exists la_leads_urgent_idx on public.la_leads (urgent desc, created_at desc);
