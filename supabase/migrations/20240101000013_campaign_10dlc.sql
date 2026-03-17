-- 10DLC registration fields on campaigns
alter table public.campaigns
  add column if not exists ten_dlc_status text check (ten_dlc_status in ('pending', 'approved', 'failed')) default null,
  add column if not exists ten_dlc_brand_sid text default null,
  add column if not exists ten_dlc_campaign_sid text default null,
  add column if not exists ten_dlc_data jsonb default null;
