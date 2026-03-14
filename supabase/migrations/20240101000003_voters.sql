create type public.phone_type as enum ('mobile', 'landline', 'voip', 'unknown');

create table public.voters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  first_name text,
  last_name text,
  phone text not null,
  phone_type public.phone_type not null default 'unknown',
  state text,
  county text,
  precinct text,
  party text,
  custom_fields jsonb default '{}',
  opted_out boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.voters enable row level security;

create policy "Campaign owners can manage voters" on public.voters
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = voters.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

create unique index idx_voters_campaign_phone on public.voters(campaign_id, phone);
create index idx_voters_campaign on public.voters(campaign_id);
