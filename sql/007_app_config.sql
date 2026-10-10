-- MetroConnect app config (run in Supabase SQL editor)
-- Replaces Firebase Remote Config `app_config`. One row, id = 'default'.

create table if not exists public.app_config (
  id text primary key default 'default',
  android_force_update boolean not null default false,
  android_latest_version text not null,
  android_minimum_version text not null,
  android_update_url text not null default '',
  ios_force_update boolean not null default false,
  ios_latest_version text not null,
  ios_minimum_version text not null,
  ios_update_url text not null default '',
  released_at timestamptz,
  update_message text not null,
  update_title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_config_singleton check (id = 'default'),
  constraint app_config_android_latest_version_format check (android_latest_version ~ '^\d+(\.\d+){1,3}$'),
  constraint app_config_android_minimum_version_format check (android_minimum_version ~ '^\d+(\.\d+){1,3}$'),
  constraint app_config_ios_latest_version_format check (ios_latest_version ~ '^\d+(\.\d+){1,3}$'),
  constraint app_config_ios_minimum_version_format check (ios_minimum_version ~ '^\d+(\.\d+){1,3}$')
);

alter table public.app_config enable row level security;

drop policy if exists "Anyone can read app config" on public.app_config;
create policy "Anyone can read app config"
  on public.app_config
  for select
  using (true);

create or replace function public.handle_app_config_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_config_set_updated_at on public.app_config;
create trigger app_config_set_updated_at
  before update on public.app_config
  for each row
  execute function public.handle_app_config_updated_at();

-- Safe starter values: current store version and a skippable update.
-- Re-running this file does not overwrite a row you already edited.
insert into public.app_config (
  id,
  android_force_update,
  android_latest_version,
  android_minimum_version,
  android_update_url,
  ios_force_update,
  ios_latest_version,
  ios_minimum_version,
  ios_update_url,
  released_at,
  update_message,
  update_title
)
values (
  'default',
  false,
  '1.6.1',
  '1.6.1',
  'https://play.google.com/store/apps/details?id=com.kshitij_khowal.MetroConnect',
  false,
  '1.6.1',
  '1.6.1',
  '',
  null,
  'A new version of MetroConnect is available with improvements and bug fixes.',
  'Update Available'
)
on conflict (id) do nothing;
