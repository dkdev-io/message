create type public.campaign_status as enum ('draft', 'active', 'paused', 'completed');

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  status public.campaign_status not null default 'draft',
  phone_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Owners can manage own campaigns" on public.campaigns
  for all using (auth.uid() = owner_id);

create index idx_campaigns_owner on public.campaigns(owner_id);
