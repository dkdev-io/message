-- Global opt-out list using SHA-256 hashed phone numbers for privacy
create table public.global_opt_outs (
  phone_hash text primary key,
  created_at timestamptz not null default now()
);

alter table public.global_opt_outs enable row level security;

-- All authenticated users can check opt-outs
create policy "Authenticated users can check opt-outs" on public.global_opt_outs
  for select using (auth.role() = 'authenticated');

-- Only service role can insert (via webhook)
create policy "Service role can insert opt-outs" on public.global_opt_outs
  for insert with check (true);
