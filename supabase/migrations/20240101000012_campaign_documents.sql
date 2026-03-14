create table public.campaign_documents (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  content text not null,
  doc_type text not null check (doc_type in ('pdf', 'docx', 'txt', 'paste')),
  created_at timestamptz not null default now()
);

alter table public.campaign_documents enable row level security;

create policy "Campaign owners can manage documents" on public.campaign_documents
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = campaign_documents.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

create index idx_documents_campaign on public.campaign_documents(campaign_id);
