-- Add read_at column for tracking unread messages in inbox
alter table public.messages add column read_at timestamptz;
