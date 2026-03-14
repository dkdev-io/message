-- Allow volunteers to read and insert messages for campaigns they're assigned to
create policy "Volunteers can view campaign messages" on public.messages
  for select using (
    exists (
      select 1 from public.volunteer_assignments
      where volunteer_assignments.campaign_id = messages.campaign_id
      and volunteer_assignments.volunteer_id = auth.uid()
      and volunteer_assignments.is_active = true
    )
  );

create policy "Volunteers can send messages" on public.messages
  for insert with check (
    exists (
      select 1 from public.volunteer_assignments
      where volunteer_assignments.campaign_id = messages.campaign_id
      and volunteer_assignments.volunteer_id = auth.uid()
      and volunteer_assignments.is_active = true
    )
  );

-- Volunteers also need to read voters for their assigned campaigns
create policy "Volunteers can view campaign voters" on public.voters
  for select using (
    exists (
      select 1 from public.volunteer_assignments
      where volunteer_assignments.campaign_id = voters.campaign_id
      and volunteer_assignments.volunteer_id = auth.uid()
      and volunteer_assignments.is_active = true
    )
  );
