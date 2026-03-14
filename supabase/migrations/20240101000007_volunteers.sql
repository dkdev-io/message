-- Enable pgcrypto for gen_random_bytes
create extension if not exists pgcrypto with schema extensions;

create table public.volunteer_assignments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  volunteer_id uuid not null references auth.users(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  is_active boolean not null default true
);

alter table public.volunteer_assignments enable row level security;

create policy "Campaign owners can manage assignments" on public.volunteer_assignments
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = volunteer_assignments.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

create policy "Volunteers can view own assignments" on public.volunteer_assignments
  for select using (auth.uid() = volunteer_id);

create table public.invite_tokens (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  created_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  max_uses integer default null,
  use_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.invite_tokens enable row level security;

create policy "Campaign owners can manage tokens" on public.invite_tokens
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = invite_tokens.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

-- Public can read active tokens for joining
create policy "Anyone can read active tokens" on public.invite_tokens
  for select using (is_active = true and expires_at > now());

create unique index idx_assignments_campaign_volunteer on public.volunteer_assignments(campaign_id, volunteer_id);
