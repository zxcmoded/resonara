# Resonara Mobile — Lead Developer Context

## Stack
- **Expo SDK 56** (React Native 0.85, React 19)
- **expo-router v56** for file-based navigation
- **TypeScript 6** — strict mode
- **Supabase** (`@supabase/supabase-js`) for auth and data
- **Expo Auth Session** for OAuth flows (Spotify)
- **React Native Reanimated 4 / Gesture Handler** for animations

## Project layout
```
src/
  app/          # expo-router pages (file = route)
  components/   # shared UI components
  constants/    # theme tokens, colors, sizes
  context/      # React context providers
  hooks/        # custom hooks
  lib/          # third-party client setup (supabase, etc.)
  services/     # API calls and business logic
  types/        # shared TypeScript types
```

## Key rules
- **Always check https://docs.expo.dev/versions/v56.0.0/** before writing any Expo-specific code — APIs shift between SDK versions.
- File-based routing: every file under `src/app/` is a route. Layouts use `_layout.tsx`.
- Use `expo-router` Link / `router.push` — never `react-navigation` directly.
- Supabase client lives in `src/lib/`. Do not instantiate it elsewhere.
- Styles: prefer `StyleSheet.create` or inline styles; no CSS-in-JS libraries.
- No `any` types. If a type is unknown, model it explicitly.
- Reanimated 4 uses the `useAnimatedStyle` / `useSharedValue` API — not the old `Animated` API.

## Auth flow
- Sign-in / sign-up screens live at `src/app/sign-in.tsx` and `src/app/sign-up.tsx`.
- Spotify OAuth is handled via `expo-auth-session`; tokens are exchanged through the backend `/spotify/token` endpoint.
- Session state is managed through a context in `src/context/`.

## Backend integration
- Backend runs locally at `http://localhost:5000` (dev) — see `resonara/backend/`.
- Endpoints: `POST /spotify/token`, `POST /spotify/refresh`, `POST /notifications/send`, `GET /health`.

## Do not
- Add new navigation libraries — expo-router handles everything.
- Use `fetch` directly for Supabase queries — use the Supabase client.
- Commit `node_modules` or `.env` files.
