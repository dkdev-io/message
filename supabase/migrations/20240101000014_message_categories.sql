-- Add AI categorization columns to messages
alter table public.messages
  add column if not exists category text default null,
  add column if not exists sentiment text default null,
  add column if not exists ai_confidence float default null;
