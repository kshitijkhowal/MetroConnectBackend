-- MetroConnect community contributors (run in Supabase SQL editor)

create table if not exists public.community_contributors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists community_contributors_sort_order_idx
  on public.community_contributors (sort_order asc);

alter table public.community_contributors enable row level security;

drop policy if exists "Anyone can read community contributors" on public.community_contributors;
create policy "Anyone can read community contributors"
  on public.community_contributors
  for select
  using (true);

create or replace function public.handle_community_contributors_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists community_contributors_set_updated_at on public.community_contributors;
create trigger community_contributors_set_updated_at
  before update on public.community_contributors
  for each row
  execute function public.handle_community_contributors_updated_at();

-- Seed initial contributors (idempotent by name + sort_order)
insert into public.community_contributors (name, avatar, sort_order)
select * from (values
  ('Yashika', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781519567/WhatsApp_Image_2026-06-15_at_1.44.55_PM_uc7dz1.jpg', 0),
  ('Abdullah', null::text, 1),
  ('Sarthak', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781692859/Screenshot_2026-06-17_at_4.10.19_PM_ex8wvb.png', 2),
  ('Abbad', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781692962/lego_pfp_-_-_n4jfwz.jpg', 3),
  ('Stavya Pathak', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781693031/39332c566986ff61ff5d873e2b9d8e96_-_Stapat_wv5rnj.png', 4),
  ('Pratyush', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781696495/avatar_-_Pratyush_Singh_pid8yl.jpg', 5),
  ('Prashant', null::text, 6),
  ('Shashwat Karna', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781719088/about_-_Shashwat_Karna_ugkc6b.jpg', 7),
  ('jendermine', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1781893265/92355621_-_Jendermine_yzf6pr.png', 8),
  ('Lakshya Sharma', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1782152716/038aec634e3f6ccea56901b6defc3530_-_Lakshya_Sharma_wwloqz.jpg', 9),
  ('Karanbir Singh', 'https://res.cloudinary.com/dd0hln8f2/image/upload/v1782304444/Cxz0kFSq_400x400_-_KARANBIR_SINGH_dnn60c.jpg', 10)
) as seed(name, avatar, sort_order)
where not exists (
  select 1 from public.community_contributors existing
  where existing.name = seed.name and existing.sort_order = seed.sort_order
);
