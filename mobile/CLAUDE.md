# Resonara Mobile — Lead Developer Context

## Stack
- **Expo SDK 56** (React Native 0.85, React 19)
- **expo-router v56** for file-based navigation
- **TypeScript 6** — strict mode
- **Supabase** (`@supabase/supabase-js`) for auth, database, storage, realtime, and Edge Functions
- **expo-av** for audio playback from Supabase Storage URLs
- **expo-image-picker** for avatar and artwork uploads
- **React Native Reanimated 4 / Gesture Handler** for animations

## Architecture — Supabase-only, no separate backend

Everything runs through Supabase. There is no separate HTTP server.

| Layer | Tool |
|---|---|
| Auth (email, Google, Facebook OAuth) | Supabase Auth |
| Database + row-level security | Supabase Postgres |
| File storage (audio, artwork, avatars) | Supabase Storage |
| Realtime sync (sessions, comments) | Supabase Realtime (broadcast + postgres-changes) |
| Push notifications | Supabase Edge Function `send-push-notification` |
| Client SDK | `@supabase/supabase-js` via `src/lib/supabase.ts` |

Edge Functions live in `resonara/supabase/functions/`.
The `resonara/backend/` (.NET) folder is deprecated — delete it.

## Project layout
```
src/
  app/
    _layout.tsx           # root layout — AuthProvider + PlayerProvider + splash
    index.tsx             # main shell (5 tabs + NowPlaying modal)
    sign-in.tsx           # auth route
    sign-up.tsx           # auth route
    forgot-password.tsx   # auth route
  components/             # screen-level UI (timeline, library, profile, etc.)
  constants/
    theme.ts              # ResonaraTheme color tokens + spacing
    oauth.ts              # Google / Facebook client IDs
  context/
    auth.tsx              # Supabase session → AuthUser; signIn, signUp, updateProfile, signOut
    player.tsx            # expo-av audio engine; play, togglePlay, seekTo, stop
  hooks/
    use-google-auth.ts          # Supabase OAuth → Google
    use-facebook-auth.ts        # Supabase OAuth → Facebook
    use-session-realtime.ts     # Realtime session row + broadcast control events
    use-comments-realtime.ts    # Realtime live comment inserts
  lib/
    supabase.ts           # typed createClient — the only place the client is created
  services/
    albums.service.ts           # albums CRUD + artwork upload (album-art bucket)
    comments.service.ts         # post / fetch / delete comments
    follows.service.ts          # follow / unfollow / list
    notifications.service.ts    # push via Edge Function (supabase.functions.invoke)
    profiles.service.ts         # get / update / search profiles
    sessions.service.ts         # upsert / update / feed / broadcast
    tracks.service.ts           # search / recent / by-user
  types/
    database.ts           # Database interface + convenience row types (Album, Track, etc.)
```

## Key rules
- **Always check https://docs.expo.dev/versions/v56.0.0/** before writing Expo-specific code.
- File-based routing: every file under `src/app/` is a route. Layouts use `_layout.tsx`.
- Use `expo-router` `router.push` / `<Redirect>` — never `react-navigation` directly.
- Supabase client lives in `src/lib/supabase.ts`. Never instantiate it elsewhere.
- Styles: `StyleSheet.create` only — no CSS-in-JS libraries.
- No `any` types. Model unknowns explicitly.
- Reanimated 4: use `useAnimatedStyle` / `useSharedValue` — not the legacy `Animated` API.

## Auth flow
- Unauthenticated → `<Redirect href="/sign-in" />` from `app/index.tsx`.
- OAuth (Google, Facebook) via `expo-auth-session` + `supabase.auth.signInWithOAuth`.
- `loadUser()` in auth context fetches the `profiles` row and upserts it if missing (handles OAuth race conditions and returning users).
- `updateProfile()` writes to `profiles` table and syncs `auth.user_metadata`.

## Storage buckets (Supabase Storage)
| Bucket | Purpose | Access |
|---|---|---|
| `songs` | Audio files (.mp3, .m4a) | Public read; owner write under `{userId}/` |
| `album-art` | Album cover images | Public read; owner write under `{userId}/` |
| `avatars` | Profile photos | Public read; owner write under `{userId}/` |

## Edge Functions
Deploy: `supabase functions deploy send-push-notification`
Call: `supabase.functions.invoke('send-push-notification', { body: { ... } })`

## Database (resonara/database/)
- `reset.sql` — full drop + recreate + seed (run once in Supabase SQL Editor)
- `schema.sql` — canonical schema reference

## Do not
- Add new navigation libraries — expo-router handles everything.
- Use `fetch` directly for Supabase queries — use the client.
- Commit `node_modules`, `.env`, or audio files.
- Create or call a separate HTTP server — use Supabase Edge Functions instead.
