create table public.script_versions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  body text not null,
  version integer not null default 1,
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.script_versions enable row level security;

create policy "Campaign owners can manage scripts" on public.script_versions
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = script_versions.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

create index idx_scripts_campaign on public.script_versions(campaign_id);
create unique index idx_scripts_campaign_version on public.script_versions(campaign_id, version);
