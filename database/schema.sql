-- ============================================================
-- Resonara Database Schema
-- Run this in Supabase SQL Editor (Settings → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

-- User profiles (extends auth.users)
create table if not exists profiles (
  id          uuid references auth.users on delete cascade primary key,
  username    text unique not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now() not null
);

-- Social follows
create table if not exists follows (
  follower_id   uuid references profiles(id) on delete cascade not null,
  following_id  uuid references profiles(id) on delete cascade not null,
  created_at    timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- Albums (self-hosted in Supabase Storage)
create table if not exists albums (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null,
  artist        text not null,
  artwork_url   text,           -- Supabase Storage public URL (album-art bucket)
  release_year  integer,
  uploaded_by   uuid references profiles(id) on delete set null,
  created_at    timestamptz default now() not null
);

-- Tracks (self-hosted audio files in Supabase Storage)
create table if not exists tracks (
  id            uuid default uuid_generate_v4() primary key,
  title         text not null,
  artist        text not null,
  album_id      uuid references albums(id) on delete set null,
  audio_url     text,           -- Supabase Storage public URL (songs bucket)
  artwork_url   text,           -- Optional per-track override; falls back to album artwork
  duration_ms   integer,
  track_number  integer,
  uploaded_by   uuid references profiles(id) on delete set null,
  created_at    timestamptz default now() not null
);

-- Listen Together sessions
create table if not exists sessions (
  id          uuid default uuid_generate_v4() primary key,
  host_id     uuid references profiles(id) on delete cascade not null,
  track_id    uuid references tracks(id),
  position_ms integer default 0 not null,
  is_playing  boolean default false not null,
  updated_at  timestamptz default now() not null
);

-- Live + replay comments
create table if not exists comments (
  id                    uuid default uuid_generate_v4() primary key,
  session_id            uuid references sessions(id) on delete cascade not null,
  user_id               uuid references profiles(id) on delete cascade not null,
  body                  text not null,
  song_position_seconds float not null,
  created_at            timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- INDEXES
-- ────────────────────────────────────────────────────────────

create index if not exists idx_comments_session_position on comments (session_id, song_position_seconds);
create index if not exists idx_sessions_host              on sessions (host_id);
create index if not exists idx_follows_following          on follows (following_id);
create index if not exists idx_tracks_album               on tracks (album_id);
create index if not exists idx_tracks_uploaded_by         on tracks (uploaded_by);
create index if not exists idx_albums_uploaded_by         on albums (uploaded_by);

-- ────────────────────────────────────────────────────────────
-- TRIGGER: auto-create profile on sign-up
-- ────────────────────────────────────────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_username   text;
  v_full_name  text;
  v_avatar_url text;
begin
  -- Sanitize username: prefer explicit value, fall back to email local-part
  v_username := coalesce(
    nullif(trim(new.raw_user_meta_data->>'username'), ''),
    regexp_replace(lower(split_part(new.email, '@', 1)), '[^a-z0-9_.]', '', 'g')
  );
  -- Guarantee uniqueness: append first 8 chars of user id if taken
  if exists (select 1 from public.profiles where username = v_username) then
    v_username := v_username || '_' || left(new.id::text, 8);
  end if;

  v_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), '')
  );

  v_avatar_url := coalesce(
    nullif(new.raw_user_meta_data->>'avatar_url', ''),
    nullif(new.raw_user_meta_data->>'picture', '')
  );

  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, v_username, v_full_name, v_avatar_url)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ────────────────────────────────────────────────────────────
-- TRIGGER: keep sessions.updated_at current
-- ────────────────────────────────────────────────────────────

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists sessions_updated_at on sessions;
create trigger sessions_updated_at
  before update on sessions
  for each row execute procedure touch_updated_at();

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- profiles
alter table profiles enable row level security;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id);

-- follows
alter table follows enable row level security;
create policy "follows_select" on follows for select using (true);
create policy "follows_insert" on follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete" on follows for delete using (auth.uid() = follower_id);

-- albums
alter table albums enable row level security;
create policy "albums_select" on albums for select using (true);
create policy "albums_insert" on albums for insert with check (uploaded_by is null or auth.uid() = uploaded_by);
create policy "albums_update" on albums for update using (auth.uid() = uploaded_by);
create policy "albums_delete" on albums for delete using (auth.uid() = uploaded_by);

-- tracks
alter table tracks enable row level security;
create policy "tracks_select" on tracks for select using (true);
create policy "tracks_insert" on tracks for insert with check (uploaded_by is null or auth.uid() = uploaded_by);
create policy "tracks_update" on tracks for update using (auth.uid() = uploaded_by);
create policy "tracks_delete" on tracks for delete using (auth.uid() = uploaded_by);

-- sessions
alter table sessions enable row level security;
create policy "sessions_select" on sessions for select using (true);
create policy "sessions_insert" on sessions for insert with check (auth.uid() = host_id);
create policy "sessions_update" on sessions for update using (auth.uid() = host_id);
create policy "sessions_delete" on sessions for delete using (auth.uid() = host_id);

-- comments
alter table comments enable row level security;
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (auth.uid() = user_id);
create policy "comments_delete" on comments for delete using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- REALTIME
-- ────────────────────────────────────────────────────────────

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table comments;

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- Run after enabling Storage in the Supabase dashboard.
-- ────────────────────────────────────────────────────────────

-- Audio files (songs)
insert into storage.buckets (id, name, public)
values ('songs', 'songs', true)
on conflict (id) do nothing;

-- Album cover art
insert into storage.buckets (id, name, public)
values ('album-art', 'album-art', true)
on conflict (id) do nothing;

-- Avatar images
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- songs: public read; uploader writes under their own folder
create policy "songs_public_read"  on storage.objects for select using (bucket_id = 'songs');
create policy "songs_auth_insert"  on storage.objects for insert with check (bucket_id = 'songs' and auth.uid()::text = split_part(name, '/', 1));
create policy "songs_auth_update"  on storage.objects for update using  (bucket_id = 'songs' and auth.uid()::text = split_part(name, '/', 1));
create policy "songs_auth_delete"  on storage.objects for delete using  (bucket_id = 'songs' and auth.uid()::text = split_part(name, '/', 1));

-- album-art: public read; uploader writes under their own folder
create policy "art_public_read"   on storage.objects for select using (bucket_id = 'album-art');
create policy "art_auth_insert"   on storage.objects for insert with check (bucket_id = 'album-art' and auth.uid()::text = split_part(name, '/', 1));
create policy "art_auth_update"   on storage.objects for update using  (bucket_id = 'album-art' and auth.uid()::text = split_part(name, '/', 1));
create policy "art_auth_delete"   on storage.objects for delete using  (bucket_id = 'album-art' and auth.uid()::text = split_part(name, '/', 1));

-- avatars: public read; owner writes
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_auth_insert" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '/', 1));
create policy "avatars_auth_update" on storage.objects for update using  (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '/', 1));
create policy "avatars_auth_delete" on storage.objects for delete using  (bucket_id = 'avatars' and auth.uid()::text = split_part(name, '/', 1));
