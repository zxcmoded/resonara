# Resonara Backend — Engineer Context

## Stack
- **.NET 10** / **ASP.NET Core minimal API** (`Program.cs` — no controllers by default)
- **C# 13** with nullable reference types and implicit usings enabled
- No ORM — lightweight by design; add only what the feature needs

## Project layout
```
backend/
  Program.cs          # all routes defined here (minimal API style)
  appsettings.json    # non-secret config
  appsettings.Development.json
  backend.csproj
```

## Existing endpoints
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/spotify/token` | Exchange Spotify auth code → access + refresh tokens |
| POST | `/spotify/refresh` | Refresh an expired Spotify access token |
| POST | `/notifications/send` | Send Expo push notification |
| GET | `/health` | Health check |

## Key rules
- **Minimal API style**: add new routes with `app.MapGet/Post/Put/Delete(...)` directly in `Program.cs`. Only introduce controllers if the file grows unwieldy (20+ endpoints).
- Secrets (`Spotify:ClientId`, `Spotify:ClientSecret`) come from `appsettings.json` or environment variables — never hardcode them.
- Use `IHttpClientFactory` for all outbound HTTP — never instantiate `HttpClient` directly.
- Request/response shapes are `record` types defined at the bottom of `Program.cs`.
- CORS is open (`AllowAnyOrigin`) for dev — tighten before production.
- `Nullable enable` is on — handle nulls explicitly; don't use `!` suppression unless you're certain.

## Running the backend
```bash
cd resonara/backend
dotnet run
# listens on http://localhost:5000 (dev profile)
```

## Mobile integration
- The mobile app (`resonara/mobile`) calls this backend for Spotify token exchange and push notifications.
- Keep request/response contracts stable — breaking changes require mobile-side updates too.

## Do not
- Add a database layer unless explicitly requested — current design is stateless.
- Install packages without checking if .NET BCL already covers the need.
- Expose credentials in any response body or log.
