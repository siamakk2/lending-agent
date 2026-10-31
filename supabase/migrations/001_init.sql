-- Lending Agent — initial schema
-- Leads from borrowers and brokers, deal files, routing, transcripts, TCPA consent proof, rate cache.

-- gen_random_uuid() is built into Postgres 13+; no extension needed.

-- People: borrowers and brokers who talk to the agent
create table public.la_contacts (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('borrower','broker')),
  full_name text,
  email text,
  phone text,
  company text,
  entity_name text,
  created_at timestamptz not null default now()
);
create index la_contacts_email_idx on public.la_contacts (lower(email));
create index la_contacts_phone_idx on public.la_contacts (phone);

-- The broker network (50+)
create table public.la_brokers (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.la_contacts(id) on delete set null,
  auth_user_id uuid unique,               -- links to auth.users for broker login
  name text not null,
  company text,
  email text not null,
  phone text,
  nmls_id text,
  states text[] not null default '{}',     -- e.g. {CA,NV,AZ}
  loan_types text[] not null default '{}', -- fix_flip, bridge, construction, dscr, commercial
  min_loan numeric,
  max_loan numeric,
  capacity int not null default 10,        -- max open deals
  close_rate numeric not null default 0,   -- 0..1
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- TCPA consent proof
create table public.la_consents (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.la_contacts(id) on delete cascade,
  text_shown text not null,
  channels text[] not null default '{}',   -- sms, voice, email
  ip text,
  user_agent text,
  given_at timestamptz not null default now(),
  revoked_at timestamptz
);

-- One inquiry
create table public.la_leads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.la_contacts(id) on delete set null,
  consent_id uuid references public.la_consents(id) on delete set null,
  lead_type text not null default 'borrower' check (lead_type in ('borrower','broker_deal','broker_signup')),
  channel text not null default 'chat' check (channel in ('chat','voice','sms','email','form')),
  source text,                              -- utm / page
  score int not null default 0,
  tier text not null default 'nurture' check (tier in ('hot','warm','nurture')),
  status text not null default 'new' check (status in ('new','routed','claimed','contacted','application','funded','lost')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index la_leads_status_idx on public.la_leads (status, created_at desc);

-- The deal file
create table public.la_deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.la_leads(id) on delete cascade,
  goal text,                 -- purchase, refinance, cash_out, construction, bridge
  loan_type text,            -- fix_flip, bridge, construction, dscr, commercial, other
  property_type text,        -- sfr, 2_4_unit, multifamily_5plus, mixed_use, retail, industrial, office, land
  property_address text,
  city text,
  state text,
  condition text,
  purchase_price numeric,
  as_is_value numeric,
  loan_amount numeric,
  rehab_budget numeric,
  arv numeric,
  existing_liens numeric,
  monthly_rent numeric,
  exit_strategy text,        -- sell, refi_dscr, refi_bank, hold
  close_by date,
  experience_deals_24mo int,
  credit_band text,          -- self-reported range only, e.g. 680-719
  entity boolean,
  owner_occupied boolean,
  broker_comp_requested text,
  notes text,
  created_at timestamptz not null default now()
);

-- Routing history
create table public.la_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.la_leads(id) on delete cascade,
  broker_id uuid not null references public.la_brokers(id) on delete cascade,
  offered_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '15 minutes',
  claimed_at timestamptz,
  outcome text check (outcome in ('claimed','expired','declined','funded','lost'))
);

-- Transcripts per channel
create table public.la_conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.la_leads(id) on delete set null,
  channel text not null default 'chat',
  session_id text not null,
  transcript jsonb not null default '[]'::jsonb,
  summary text,
  ai_disclosed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index la_conversations_session_idx on public.la_conversations (session_id);

-- Daily market benchmarks (FRED / Freddie Mac)
create table public.la_rates_cache (
  series text primary key,   -- DPRIME, SOFR, MORTGAGE30US, MORTGAGE15US, DGS10, DFEDTARU
  label text not null,
  value numeric not null,
  as_of date not null,
  source_url text not null,
  fetched_at timestamptz not null default now()
);

-- updated_at triggers
create or replace function public.la_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

create trigger la_leads_touch before update on public.la_leads
  for each row execute function public.la_touch_updated_at();
create trigger la_conversations_touch before update on public.la_conversations
  for each row execute function public.la_touch_updated_at();

-- Row-level security: everything locked by default; the server uses the service role.
alter table public.la_contacts      enable row level security;
alter table public.la_brokers       enable row level security;
alter table public.la_consents      enable row level security;
alter table public.la_leads         enable row level security;
alter table public.la_deals         enable row level security;
alter table public.la_assignments   enable row level security;
alter table public.la_conversations enable row level security;
alter table public.la_rates_cache   enable row level security;

-- Public can read benchmarks (non-sensitive)
create policy la_rates_public_read on public.la_rates_cache for select using (true);

-- Brokers (logged in) see only leads assigned to them
create policy la_broker_sees_own_assignments on public.la_assignments for select
  using (broker_id in (select id from public.la_brokers where auth_user_id = auth.uid()));
create policy la_broker_sees_assigned_leads on public.la_leads for select
  using (id in (select a.lead_id from public.la_assignments a
                join public.la_brokers b on b.id = a.broker_id
                where b.auth_user_id = auth.uid()));
create policy la_broker_sees_assigned_deals on public.la_deals for select
  using (lead_id in (select a.lead_id from public.la_assignments a
                     join public.la_brokers b on b.id = a.broker_id
                     where b.auth_user_id = auth.uid()));
create policy la_broker_sees_self on public.la_brokers for select
  using (auth_user_id = auth.uid());
