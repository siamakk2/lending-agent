-- Admin: pipeline outcomes, partner attribution, response time, status history and notes.
alter table public.la_leads
  add column if not exists partner_ref text,
  add column if not exists assigned_to text,
  add column if not exists first_contacted_at timestamptz,
  add column if not exists funded_amount numeric,
  add column if not exists funded_at timestamptz,
  add column if not exists lost_reason text,
  add column if not exists next_action_at timestamptz;

alter table public.la_leads drop constraint if exists la_leads_status_check;
alter table public.la_leads add constraint la_leads_status_check
  check (status in ('new','routed','claimed','contacted','application','term_sheet','funded','lost'));

create index if not exists la_leads_created_idx on public.la_leads (created_at desc);
create index if not exists la_leads_partner_idx on public.la_leads (partner_ref);

create table if not exists public.la_lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.la_leads(id) on delete cascade,
  kind text not null check (kind in ('status','note','assign','funded','contact')),
  from_status text,
  to_status text,
  body text,
  actor text,
  created_at timestamptz not null default now()
);
create index if not exists la_lead_events_lead_idx on public.la_lead_events (lead_id, created_at desc);
alter table public.la_lead_events enable row level security;
