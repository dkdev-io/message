create type public.message_direction as enum ('outbound', 'inbound');
create type public.message_status as enum ('queued', 'sent', 'delivered', 'failed', 'received');

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  voter_id uuid not null references public.voters(id) on delete cascade,
  volunteer_id uuid references auth.users(id),
  direction public.message_direction not null,
  status public.message_status not null default 'queued',
  body text not null,
  twilio_sid text,
  error_code text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Campaign owners can view messages" on public.messages
  for all using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = messages.campaign_id
      and campaigns.owner_id = auth.uid()
    )
  );

create index idx_messages_campaign on public.messages(campaign_id);
create index idx_messages_voter on public.messages(voter_id);
create index idx_messages_twilio_sid on public.messages(twilio_sid);
create index idx_messages_created on public.messages(created_at desc);
