-- ============================================================
-- Resonara Seed Data
-- Run this in Supabase SQL Editor AFTER running schema.sql
-- This inserts sample albums and tracks with real metadata.
-- uploaded_by is NULL so no user ownership is required.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- ALBUMS
-- artwork_url uses picsum.photos for deterministic placeholders
-- (replace with your own Supabase Storage URLs after uploading)
-- ────────────────────────────────────────────────────────────

insert into albums (id, title, artist, artwork_url, release_year, uploaded_by) values
  (
    'a1000000-0000-0000-0000-000000000001',
    'Neon Horizons',
    'The Resonara Collective',
    'https://picsum.photos/seed/resonara1/400/400',
    2024,
    null
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'Midnight Frequencies',
    'Echo & the Pulse',
    'https://picsum.photos/seed/resonara2/400/400',
    2023,
    null
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'Golden Static',
    'Wavefront',
    'https://picsum.photos/seed/resonara3/400/400',
    2024,
    null
  ),
  (
    'a1000000-0000-0000-0000-000000000004',
    'Solaris',
    'Deep Blue',
    'https://picsum.photos/seed/resonara4/400/400',
    2022,
    null
  )
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- TRACKS — Neon Horizons (album 1)
-- ────────────────────────────────────────────────────────────

insert into tracks (id, title, artist, album_id, audio_url, artwork_url, duration_ms, track_number, uploaded_by) values
  (
    't1000000-0000-0000-0000-000000000101',
    'City of Light',
    'The Resonara Collective',
    'a1000000-0000-0000-0000-000000000001',
    null,   -- upload your audio file to Supabase Storage and paste the URL here
    null,
    214000, -- 3:34
    1,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000102',
    'Neon Drive',
    'The Resonara Collective',
    'a1000000-0000-0000-0000-000000000001',
    null,
    null,
    198000, -- 3:18
    2,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000103',
    'Skyline Protocol',
    'The Resonara Collective',
    'a1000000-0000-0000-0000-000000000001',
    null,
    null,
    267000, -- 4:27
    3,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000104',
    'Last Frequency',
    'The Resonara Collective',
    'a1000000-0000-0000-0000-000000000001',
    null,
    null,
    183000, -- 3:03
    4,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000105',
    'Neon Horizons (Title Track)',
    'The Resonara Collective',
    'a1000000-0000-0000-0000-000000000001',
    null,
    null,
    312000, -- 5:12
    5,
    null
  )
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- TRACKS — Midnight Frequencies (album 2)
-- ────────────────────────────────────────────────────────────

insert into tracks (id, title, artist, album_id, audio_url, artwork_url, duration_ms, track_number, uploaded_by) values
  (
    't1000000-0000-0000-0000-000000000201',
    'Phase One',
    'Echo & the Pulse',
    'a1000000-0000-0000-0000-000000000002',
    null,
    null,
    241000, -- 4:01
    1,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000202',
    'Midnight Run',
    'Echo & the Pulse',
    'a1000000-0000-0000-0000-000000000002',
    null,
    null,
    196000, -- 3:16
    2,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000203',
    'Signal Lost',
    'Echo & the Pulse',
    'a1000000-0000-0000-0000-000000000002',
    null,
    null,
    228000, -- 3:48
    3,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000204',
    'Carrier Wave',
    'Echo & the Pulse',
    'a1000000-0000-0000-0000-000000000002',
    null,
    null,
    305000, -- 5:05
    4,
    null
  )
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- TRACKS — Golden Static (album 3)
-- ────────────────────────────────────────────────────────────

insert into tracks (id, title, artist, album_id, audio_url, artwork_url, duration_ms, track_number, uploaded_by) values
  (
    't1000000-0000-0000-0000-000000000301',
    'Interference',
    'Wavefront',
    'a1000000-0000-0000-0000-000000000003',
    null,
    null,
    218000, -- 3:38
    1,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000302',
    'Golden Age',
    'Wavefront',
    'a1000000-0000-0000-0000-000000000003',
    null,
    null,
    274000, -- 4:34
    2,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000303',
    'Static Dreams',
    'Wavefront',
    'a1000000-0000-0000-0000-000000000003',
    null,
    null,
    191000, -- 3:11
    3,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000304',
    'Resonance Field',
    'Wavefront',
    'a1000000-0000-0000-0000-000000000003',
    null,
    null,
    247000, -- 4:07
    4,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000305',
    'The Fade',
    'Wavefront',
    'a1000000-0000-0000-0000-000000000003',
    null,
    null,
    338000, -- 5:38
    5,
    null
  )
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- TRACKS — Solaris (album 4)
-- ────────────────────────────────────────────────────────────

insert into tracks (id, title, artist, album_id, audio_url, artwork_url, duration_ms, track_number, uploaded_by) values
  (
    't1000000-0000-0000-0000-000000000401',
    'Orbit',
    'Deep Blue',
    'a1000000-0000-0000-0000-000000000004',
    null,
    null,
    259000, -- 4:19
    1,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000402',
    'Event Horizon',
    'Deep Blue',
    'a1000000-0000-0000-0000-000000000004',
    null,
    null,
    321000, -- 5:21
    2,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000403',
    'Gravity Well',
    'Deep Blue',
    'a1000000-0000-0000-0000-000000000004',
    null,
    null,
    202000, -- 3:22
    3,
    null
  ),
  (
    't1000000-0000-0000-0000-000000000404',
    'Perihelion',
    'Deep Blue',
    'a1000000-0000-0000-0000-000000000004',
    null,
    null,
    284000, -- 4:44
    4,
    null
  )
on conflict (id) do nothing;
