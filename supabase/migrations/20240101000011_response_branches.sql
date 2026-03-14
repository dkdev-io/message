create table public.response_branches (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  label text not null,
  keywords text[] not null default '{}',
  response_body text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.response_branches enable row level security;

create policy "Campaign owners can manage branches" on public.response_branches
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = response_branches.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

create policy "Volunteers can view branches" on public.response_branches
  for select using (
    exists (
      select 1 from public.volunteer_assignments
      where volunteer_assignments.campaign_id = response_branches.campaign_id
      and volunteer_assignments.volunteer_id = auth.uid()
      and volunteer_assignments.is_active = true
    )
  );

create index idx_branches_campaign on public.response_branches(campaign_id);
