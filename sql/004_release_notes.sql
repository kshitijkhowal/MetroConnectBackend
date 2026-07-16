-- MetroConnect release notes (run in Supabase SQL editor)

create table if not exists public.release_notes (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  version_code integer not null,
  release_date date,
  icons jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint release_notes_version_unique unique (version),
  constraint release_notes_version_code_unique unique (version_code),
  constraint release_notes_icons_is_array check (jsonb_typeof(icons) = 'array'),
  constraint release_notes_features_is_array check (jsonb_typeof(features) = 'array')
);

-- If the table already exists from an older migration, add icons and strip per-feature icon keys
alter table public.release_notes
  add column if not exists icons jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'release_notes_icons_is_array'
  ) then
    alter table public.release_notes
      add constraint release_notes_icons_is_array check (jsonb_typeof(icons) = 'array');
  end if;
end $$;

update public.release_notes
set features = (
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', (feature->>'id')::int,
      'title', feature->>'title'
    )
    order by (feature->>'id')::int nulls last
  ), '[]'::jsonb)
  from jsonb_array_elements(features) as feature
)
where features <> '[]'::jsonb
  and exists (
    select 1
    from jsonb_array_elements(features) as feature
    where feature ? 'icon'
  );

create index if not exists release_notes_version_code_desc_idx
  on public.release_notes (version_code desc);

alter table public.release_notes enable row level security;

drop policy if exists "Anyone can read release notes" on public.release_notes;
create policy "Anyone can read release notes"
  on public.release_notes
  for select
  using (true);

create or replace function public.handle_release_notes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists release_notes_set_updated_at on public.release_notes;
create trigger release_notes_set_updated_at
  before update on public.release_notes
  for each row
  execute function public.handle_release_notes_updated_at();

-- Seed release notes (idempotent by version_code)
insert into public.release_notes (version, version_code, release_date, icons, features)
values
  ('1.0.0', 4, null, '[]'::jsonb, '[{"id":1,"title":"Welcome to MetroConnect — plan your Delhi NCR metro journeys with ease"}]'::jsonb),
  ('1.0.2', 8, null, '[]'::jsonb, '[{"id":1,"title":"Bugfixes, Stability and Optimisations"}]'::jsonb),
  ('1.0.3', 9, null, '[]'::jsonb, '[{"id":1,"title":"Smarter station search that understands typos"},{"id":2,"title":"Find stations even if you type only part of the name"},{"id":3,"title":"Search using popular short names and alternate spellings"},{"id":4,"title":"More relevant results so you find your station faster"},{"id":5,"title":"App runs smoother with general fixes"}]'::jsonb),
  ('1.0.4', 10, null, '[]'::jsonb, '[{"id":1,"title":"Save your go-to stations as Quick Stations for one-tap access"}]'::jsonb),
  ('1.0.5', 11, null, '[]'::jsonb, '[{"id":1,"title":"Share feedback with us directly from the app"}]'::jsonb),
  ('1.0.6', 12, null, '[]'::jsonb, '[{"id":1,"title":"Get notified when a new app update is available"}]'::jsonb),
  ('1.0.7', 13, null, '[]'::jsonb, '[{"id":1,"title":"Meet the people behind MetroConnect on our Contributors page"}]'::jsonb),
  ('1.0.8', 14, null, '[]'::jsonb, '[{"id":1,"title":"See how much your metro journey will cost"}]'::jsonb),
  ('1.0.9', 15, null, '[]'::jsonb, '[{"id":1,"title":"Bugfixes, Stability and Optimisations"}]'::jsonb),
  ('1.0.10', 16, null, '[]'::jsonb, '[{"id":1,"title":"Browse the full fare table for different journeys"},{"id":2,"title":"Clearer layouts for an easier reading experience"}]'::jsonb),
  ('1.0.11', 17, null, '[]'::jsonb, '[{"id":1,"title":"Clearer and more helpful service alerts"}]'::jsonb),
  ('1.0.12', 18, null, '[]'::jsonb, '[{"id":1,"title":"Explore the full metro network on an interactive map"}]'::jsonb),
  ('1.0.13', 19, null, '[]'::jsonb, '[{"id":1,"title":"Find the fastest route to your destination"}]'::jsonb),
  ('1.1.0', 20, null, '[]'::jsonb, '[{"id":1,"title":"Metro map loads and responds faster"}]'::jsonb),
  ('1.1.1', 21, null, '[]'::jsonb, '[{"id":1,"title":"Fixed incorrect neighboring stations on some lines"}]'::jsonb),
  ('1.1.2', 22, null, '[]'::jsonb, '[{"id":1,"title":"Plan trips on the Noida Metro (Aqua Line)"},{"id":2,"title":"Routes now include the travelator link between Noida Sector 52 and Sector 51"},{"id":3,"title":"Pick your start and end stations right on the metro map"},{"id":4,"title":"View Noida Metro fares in the fare table"},{"id":5,"title":"See a clear fare split when your trip uses more than one metro network"},{"id":6,"title":"Pink Line looks more accurate on the map"},{"id":7,"title":"More accurate route suggestions"},{"id":8,"title":"App runs smoother with general fixes"}]'::jsonb),
  ('1.1.3', 23, null, '[]'::jsonb, '[{"id":1,"title":"Fixed issues on the home screen for a smoother start"}]'::jsonb),
  ('1.1.4', 24, null, '[]'::jsonb, '[{"id":1,"title":"Metro map is smoother and more reliable"}]'::jsonb),
  ('1.1.5', 25, null, '[]'::jsonb, '[{"id":1,"title":"Map opens faster by loading in steps"}]'::jsonb),
  ('1.1.6', 26, null, '[]'::jsonb, '[{"id":1,"title":"Bugfixes, Stability and Optimisations"}]'::jsonb),
  ('1.1.7', 27, null, '[]'::jsonb, '[{"id":1,"title":"Bugfixes, Stability and Optimisations"}]'::jsonb),
  ('1.1.8', 28, null, '[]'::jsonb, '[{"id":1,"title":"Easier way to reset app permissions when needed"}]'::jsonb),
  ('1.1.9', 29, null, '[]'::jsonb, '[{"id":1,"title":"Small fixes and polish for a better experience"}]'::jsonb),
  ('1.2.0', 30, null, '[]'::jsonb, '[{"id":1,"title":"Big speed improvements for the metro map"},{"id":2,"title":"Fixed station connections around Central Secretariat"}]'::jsonb),
  ('1.2.1', 31, null, '[]'::jsonb, '[{"id":1,"title":"More accurate station locations"},{"id":2,"title":"Open Google Maps or navigate from inside the app"},{"id":3,"title":"Clearer platform details for your trip"},{"id":4,"title":"See recommended exit gates on your route"}]'::jsonb),
  ('1.2.2', 32, null, '[]'::jsonb, '[{"id":1,"title":"Rate MetroConnect and share how we’re doing"},{"id":2,"title":"Preview the area around a station with a map header"},{"id":3,"title":"App feels snappier with under-the-hood improvements"},{"id":4,"title":"Bug fixes for a more reliable experience"}]'::jsonb),
  ('1.2.3', 33, null, '[]'::jsonb, '[{"id":1,"title":"Plan journeys on the Namo Bharat Line"},{"id":2,"title":"Updated fare information for new routes"},{"id":3,"title":"New corridor options for better trip planning"}]'::jsonb),
  ('1.2.4', 34, null, '[]'::jsonb, '[{"id":1,"title":"Magenta Line extension stations are now available"},{"id":2,"title":"Namo Bharat Line location improvement"}]'::jsonb)
on conflict (version_code) do update
set
  version = excluded.version,
  release_date = excluded.release_date,
  icons = excluded.icons,
  features = excluded.features,
  updated_at = now();
