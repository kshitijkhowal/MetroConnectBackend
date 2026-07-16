-- MetroConnect quick stations table (run in Supabase SQL editor)

create table if not exists public.quick_stations (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  station_id integer not null,
  station_name text not null,
  nickname text not null,
  icon text not null,
  icon_color text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quick_stations_user_id_updated_at_idx
  on public.quick_stations (user_id, updated_at desc);

alter table public.quick_stations enable row level security;

drop policy if exists "Users can read own quick stations" on public.quick_stations;
create policy "Users can read own quick stations"
  on public.quick_stations
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own quick stations" on public.quick_stations;
create policy "Users can insert own quick stations"
  on public.quick_stations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own quick stations" on public.quick_stations;
create policy "Users can update own quick stations"
  on public.quick_stations
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own quick stations" on public.quick_stations;
create policy "Users can delete own quick stations"
  on public.quick_stations
  for delete
  using (auth.uid() = user_id);

create or replace function public.handle_quick_stations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists quick_stations_set_updated_at on public.quick_stations;
create trigger quick_stations_set_updated_at
  before update on public.quick_stations
  for each row
  execute function public.handle_quick_stations_updated_at();
