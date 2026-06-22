-- ============================================================
-- Resonara — Full Reset + Recreate + Seed
-- Run the ENTIRE file in Supabase SQL Editor at once.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. DROP auth trigger first (it lives outside our tables)
-- ────────────────────────────────────────────────────────────

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user()   cascade;
drop function if exists touch_updated_at()  cascade;

-- ────────────────────────────────────────────────────────────
-- 2. DROP storage policies (storage.objects is not our table
--    so CASCADE on our tables won't remove these)
-- ────────────────────────────────────────────────────────────

do $$ begin
  drop policy if exists "songs_public_read"   on storage.objects;
  drop policy if exists "songs_auth_insert"   on storage.objects;
  drop policy if exists "songs_auth_update"   on storage.objects;
  drop policy if exists "songs_auth_delete"   on storage.objects;
  drop policy if exists "art_public_read"     on storage.objects;
  drop policy if exists "art_auth_insert"     on storage.objects;
  drop policy if exists "art_auth_update"     on storage.objects;
  drop policy if exists "art_auth_delete"     on storage.objects;
  drop policy if exists "avatars_public_read" on storage.objects;
  drop policy if exists "avatars_auth_insert" on storage.objects;
  drop policy if exists "avatars_auth_update" on storage.objects;
  drop policy if exists "avatars_auth_delete" on storage.objects;
exception when others then null; -- ignore if storage isn't set up yet
end $$;

-- ────────────────────────────────────────────────────────────
-- 3. DROP all app tables (CASCADE removes policies, indexes,
--    FK constraints, and triggers automatically)
-- ────────────────────────────────────────────────────────────

drop table if exists comments  cascade;
drop table if exists sessions  cascade;
drop table if exists tracks    cascade;
drop table if exists albums    cascade;
drop table if exists follows   cascade;
drop table if exists profiles  cascade;

-- ────────────────────────────────────────────────────────────
-- 4. EXTENSIONS
-- ────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 5. TABLES
-- ────────────────────────────────────────────────────────────

create table profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

create table follows (
  follower_id   uuid references profiles(id) on delete cascade not null,
  following_id  uuid references profiles(id) on delete cascade not null,
  created_at    timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table albums (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null,
  artist        text not null,
  artwork_url   text,
  release_year  integer,
  uploaded_by   uuid references profiles(id) on delete set null,
  created_at    timestamptz default now() not null
);

create table tracks (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null,
  artist        text not null,
  album_id      uuid references albums(id) on delete set null,
  audio_url     text,
  artwork_url   text,
  duration_ms   integer,
  track_number  integer,
  uploaded_by   uuid references profiles(id) on delete set null,
  created_at    timestamptz default now() not null
);

create table sessions (
  id          uuid default uuid_generate_v4() primary key,
  host_id     uuid references profiles(id) on delete cascade not null,
  track_id    uuid references tracks(id),
  position_ms integer default 0 not null,
  is_playing  boolean default false not null,
  updated_at  timestamptz default now() not null
);

create table comments (
  id                    uuid default uuid_generate_v4() primary key,
  session_id            uuid references sessions(id) on delete cascade not null,
  user_id               uuid references profiles(id) on delete cascade not null,
  body                  text not null,
  song_position_seconds float not null,
  created_at            timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- 6. INDEXES
-- ────────────────────────────────────────────────────────────

create index idx_comments_session_position on comments (session_id, song_position_seconds);
create index idx_sessions_host             on sessions (host_id);
create index idx_follows_following         on follows  (following_id);
create index idx_tracks_album              on tracks   (album_id);
create index idx_tracks_uploaded_by        on tracks   (uploaded_by);
create index idx_albums_uploaded_by        on albums   (uploaded_by);

-- ────────────────────────────────────────────────────────────
-- 7. TRIGGER — auto-create profile on sign-up
-- ────────────────────────────────────────────────────────────

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_username   text;
  v_full_name  text;
  v_avatar_url text;
begin
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_.]', '', 'g')
  );
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || left(new.id::text, 8);
  end if;
  v_full_name  := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), nullif(trim(new.raw_user_meta_data->>'name'), ''));
  v_avatar_url := coalesce(nullif(new.raw_user_meta_data->>'avatar_url', ''), nullif(new.raw_user_meta_data->>'picture', ''));
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, v_username, v_full_name, v_avatar_url)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 8. TRIGGER — keep sessions.updated_at current
-- ────────────────────────────────────────────────────────────

create or replace function touch_updated_at()
returns trigger language plpgsql
as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger sessions_updated_at
  before update on sessions
  for each row execute procedure touch_updated_at();

-- ────────────────────────────────────────────────────────────
-- 9. ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

alter table follows enable row level security;
create policy "follows_select" on follows for select using (true);
create policy "follows_insert" on follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on follows for delete using (auth.uid() = follower_id);

alter table albums enable row level security;
create policy "albums_select" on albums for select using (true);
create policy "albums_insert" on albums for insert with check (uploaded_by is null or auth.uid() = uploaded_by);
create policy "albums_update" on albums for update using (auth.uid() = uploaded_by);
create policy "albums_delete" on albums for delete using (auth.uid() = uploaded_by);

alter table tracks enable row level security;
create policy "tracks_select" on tracks for select using (true);
create policy "tracks_insert" on tracks for insert with check (uploaded_by is null or auth.uid() = uploaded_by);
create policy "tracks_update" on tracks for update using (auth.uid() = uploaded_by);
create policy "tracks_delete" on tracks for delete using (auth.uid() = uploaded_by);

alter table sessions enable row level security;
create policy "sessions_select" on sessions for select using (true);
create policy "sessions_insert" on sessions for insert with check (auth.uid() = host_id);
create policy "sessions_update" on sessions for update using (auth.uid() = host_id);
create policy "sessions_delete" on sessions for delete using (auth.uid() = host_id);

alter table comments enable row level security;
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 10. REALTIME
-- ────────────────────────────────────────────────────────────

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table comments;

-- ────────────────────────────────────────────────────────────
-- 11. STORAGE BUCKETS
-- ────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public) values ('songs',     'songs',     true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('album-art', 'album-art', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars',   'avatars',   true) on conflict (id) do nothing;

create policy "songs_public_read"   on storage.objects for select using (bucket_id = 'songs');
create policy "songs_auth_insert"   on storage.objects for insert with check (bucket_id = 'songs'     and auth.uid()::text = split_part(name, '/', 1));
create policy "songs_auth_update"   on storage.objects for update using  (bucket_id = 'songs'         and auth.uid()::text = split_part(name, '/', 1));
create policy "songs_auth_delete"   on storage.objects for delete using  (bucket_id = 'songs'         and auth.uid()::text = split_part(name, '/', 1));

create policy "art_public_read"     on storage.objects for select using (bucket_id = 'album-art');
create policy "art_auth_insert"     on storage.objects for insert with check (bucket_id = 'album-art' and auth.uid()::text = split_part(name, '/', 1));
create policy "art_auth_update"     on storage.objects for update using  (bucket_id = 'album-art'     and auth.uid()::text = split_part(name, '/', 1));
create policy "art_auth_delete"     on storage.objects for delete using  (bucket_id = 'album-art'     and auth.uid()::text = split_part(name, '/', 1));

create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_auth_insert" on storage.objects for insert with check (bucket_id = 'avatars'   and auth.uid()::text = split_part(name, '/', 1));
create policy "avatars_auth_update" on storage.objects for update using  (bucket_id = 'avatars'       and auth.uid()::text = split_part(name, '/', 1));
create policy "avatars_auth_delete" on storage.objects for delete using  (bucket_id = 'avatars'       and auth.uid()::text = split_part(name, '/', 1));

-- ────────────────────────────────────────────────────────────
-- 12. SEED DATA
-- ────────────────────────────────────────────────────────────

insert into albums (id, title, artist, artwork_url, release_year, uploaded_by) values
  ('a1000000-0000-0000-0000-000000000001', 'Neon Horizons',        'The Resonara Collective', 'https://picsum.photos/seed/resonara1/400/400', 2024, null),
  ('a1000000-0000-0000-0000-000000000002', 'Midnight Frequencies', 'Echo & the Pulse',        'https://picsum.photos/seed/resonara2/400/400', 2023, null),
  ('a1000000-0000-0000-0000-000000000003', 'Golden Static',        'Wavefront',               'https://picsum.photos/seed/resonara3/400/400', 2024, null),
  ('a1000000-0000-0000-0000-000000000004', 'Solaris',              'Deep Blue',               'https://picsum.photos/seed/resonara4/400/400', 2022, null);

insert into tracks (id, title, artist, album_id, audio_url, duration_ms, track_number, uploaded_by) values
  -- Neon Horizons
  ('b1000000-0000-0000-0000-000000000101', 'City of Light',               'The Resonara Collective', 'a1000000-0000-0000-0000-000000000001', null, 214000, 1, null),
  ('b1000000-0000-0000-0000-000000000102', 'Neon Drive',                  'The Resonara Collective', 'a1000000-0000-0000-0000-000000000001', null, 198000, 2, null),
  ('b1000000-0000-0000-0000-000000000103', 'Skyline Protocol',            'The Resonara Collective', 'a1000000-0000-0000-0000-000000000001', null, 267000, 3, null),
  ('b1000000-0000-0000-0000-000000000104', 'Last Frequency',              'The Resonara Collective', 'a1000000-0000-0000-0000-000000000001', null, 183000, 4, null),
  ('b1000000-0000-0000-0000-000000000105', 'Neon Horizons (Title Track)', 'The Resonara Collective', 'a1000000-0000-0000-0000-000000000001', null, 312000, 5, null),
  -- Midnight Frequencies
  ('b1000000-0000-0000-0000-000000000201', 'Phase One',    'Echo & the Pulse', 'a1000000-0000-0000-0000-000000000002', null, 241000, 1, null),
  ('b1000000-0000-0000-0000-000000000202', 'Midnight Run', 'Echo & the Pulse', 'a1000000-0000-0000-0000-000000000002', null, 196000, 2, null),
  ('b1000000-0000-0000-0000-000000000203', 'Signal Lost',  'Echo & the Pulse', 'a1000000-0000-0000-0000-000000000002', null, 228000, 3, null),
  ('b1000000-0000-0000-0000-000000000204', 'Carrier Wave', 'Echo & the Pulse', 'a1000000-0000-0000-0000-000000000002', null, 305000, 4, null),
  -- Golden Static
  ('b1000000-0000-0000-0000-000000000301', 'Interference',    'Wavefront', 'a1000000-0000-0000-0000-000000000003', null, 218000, 1, null),
  ('b1000000-0000-0000-0000-000000000302', 'Golden Age',      'Wavefront', 'a1000000-0000-0000-0000-000000000003', null, 274000, 2, null),
  ('b1000000-0000-0000-0000-000000000303', 'Static Dreams',   'Wavefront', 'a1000000-0000-0000-0000-000000000003', null, 191000, 3, null),
  ('b1000000-0000-0000-0000-000000000304', 'Resonance Field', 'Wavefront', 'a1000000-0000-0000-0000-000000000003', null, 247000, 4, null),
  ('b1000000-0000-0000-0000-000000000305', 'The Fade',        'Wavefront', 'a1000000-0000-0000-0000-000000000003', null, 338000, 5, null),
  -- Solaris
  ('b1000000-0000-0000-0000-000000000401', 'Orbit',         'Deep Blue', 'a1000000-0000-0000-0000-000000000004', null, 259000, 1, null),
  ('b1000000-0000-0000-0000-000000000402', 'Event Horizon', 'Deep Blue', 'a1000000-0000-0000-0000-000000000004', null, 321000, 2, null),
  ('b1000000-0000-0000-0000-000000000403', 'Gravity Well',  'Deep Blue', 'a1000000-0000-0000-0000-000000000004', null, 202000, 3, null),
  ('b1000000-0000-0000-0000-000000000404', 'Perihelion',    'Deep Blue', 'a1000000-0000-0000-0000-000000000004', null, 284000, 4, null);
