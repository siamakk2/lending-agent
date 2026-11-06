-- Phone line: the voice agent's post-call webhook secret and the lender's forwarding number.
-- Server-only key/value settings (service role); RLS on with no policies so the browser can't read them.
create table if not exists public.la_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);
alter table public.la_settings enable row level security;
