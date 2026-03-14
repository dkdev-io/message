-- State-specific quiet hours for compliance
create table public.quiet_hours (
  id uuid primary key default gen_random_uuid(),
  state_code text not null,
  state_name text not null,
  start_hour integer not null, -- 24h format local time
  end_hour integer not null,   -- 24h format local time
  timezone text not null,
  source text
);

alter table public.quiet_hours enable row level security;

create policy "Anyone can read quiet hours" on public.quiet_hours
  for select using (true);

create unique index idx_quiet_hours_state on public.quiet_hours(state_code);

-- Seed federal defaults (9pm-8am)
insert into public.quiet_hours (state_code, state_name, start_hour, end_hour, timezone, source) values
  ('DEFAULT', 'Federal Default', 21, 8, 'America/New_York', 'TCPA'),
  ('FL', 'Florida', 20, 8, 'America/New_York', 'FL Statute 501.059'),
  ('OK', 'Oklahoma', 20, 8, 'America/Chicago', 'OK Statute 15-775B'),
  ('WA', 'Washington', 20, 8, 'America/Los_Angeles', 'WA RCW 80.36.400'),
  ('TX', 'Texas', 21, 8, 'America/Chicago', 'TX Bus & Com Code 305.053');
