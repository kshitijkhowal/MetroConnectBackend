-- MetroConnect community developers (run in Supabase SQL editor)

create table if not exists public.community_developers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  positions jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_developers_positions_is_array check (jsonb_typeof(positions) = 'array')
);

create index if not exists community_developers_sort_order_idx
  on public.community_developers (sort_order asc);

alter table public.community_developers enable row level security;

drop policy if exists "Anyone can read community developers" on public.community_developers;
create policy "Anyone can read community developers"
  on public.community_developers
  for select
  using (true);

create or replace function public.handle_community_developers_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists community_developers_set_updated_at on public.community_developers;
create trigger community_developers_set_updated_at
  before update on public.community_developers
  for each row
  execute function public.handle_community_developers_updated_at();

-- Seed initial developers (idempotent by name + sort_order)
insert into public.community_developers (name, avatar, positions, sort_order)
select * from (values
  (
    'Kshitij Khowal',
    null::text,
    '["Creator", "React Native Developer"]'::jsonb,
    0
  ),
  (
    'Swaraj Choudhary',
    null::text,
    '["Backend", "Node.js Developer"]'::jsonb,
    1
  )
) as seed(name, avatar, positions, sort_order)
where not exists (
  select 1 from public.community_developers existing
  where existing.name = seed.name and existing.sort_order = seed.sort_order
);
