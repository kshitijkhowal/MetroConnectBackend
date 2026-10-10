# MetroConnect Backend

Node.js + Express + TypeScript API for MetroConnect. Auth and data live on Supabase.

## Setup

1. Copy env file and fill in Supabase / Google keys:

```bash
cp .env.example .env
```

2. Install and run:

```bash
npm install
npm run dev
```

3. In Supabase SQL editor, run in order:
   - [`sql/001_profiles.sql`](sql/001_profiles.sql)
   - [`sql/002_quick_stations.sql`](sql/002_quick_stations.sql)
   - [`sql/003_community_contributors.sql`](sql/003_community_contributors.sql)
   - [`sql/004_release_notes.sql`](sql/004_release_notes.sql)
   - [`sql/006_community_developers.sql`](sql/006_community_developers.sql)
   - [`sql/007_app_config.sql`](sql/007_app_config.sql)

4. Enable **Google** under Authentication → Providers in the Supabase Dashboard, using the same Web client ID as the app.

## Endpoints

Public host paths use a `/metroconnect` prefix (`https://api.kshitijkhowal.in/metroconnect/api/...`). The same routes are also mounted without that prefix so existing clients keep working.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Liveness |
| `POST` | `/api/auth/google` | — | `{ idToken }` → session + profile |
| `POST` | `/api/auth/refresh` | — | `{ refreshToken }` → new session |
| `POST` | `/api/auth/logout` | Bearer | Invalidate session |
| `GET` | `/api/auth/me` | Bearer | Current user + profile |
| `GET` | `/api/users/me` | Bearer | Profile row |
| `GET` | `/api/users/:id` | Bearer | Own profile only |
| `GET` | `/api/community/contributors` | — | Community contributors |
| `GET` | `/api/community/developers` | — | Community developers (with positions) |
| `GET` | `/api/app-config` | — | App version and update config (replaces Firebase Remote Config) |
| `GET` | `/api/release-notes?page=&limit=` | — | Paginated release notes (newest first) |
| `GET` | `/api/release-notes/:versionCode` | — | Single release note by version code |
| `GET` | `/api/quick-stations` | Bearer | List quick stations |
| `GET` | `/api/admin/people` | `X-Admin-Secret` | List contributors + developers |
| `POST` | `/api/admin/contributors` | `X-Admin-Secret` | Add contributor |
| `POST` | `/api/admin/developers` | `X-Admin-Secret` | Add developer |
| `GET` | `/api/admin/release-notes` | `X-Admin-Secret` | List release notes |
| `POST` | `/api/admin/release-notes` | `X-Admin-Secret` | Add release note |
| `GET` | `/api/admin/app-config` | `X-Admin-Secret` | Read app version and update config |
| `PUT` | `/api/admin/app-config` | `X-Admin-Secret` | Save app version and update config |

## Local admin dashboard

A small Vite app in [`admin/`](admin/) for editing app config, release notes, and people. **Local use only.** The app config screen writes the same Supabase row that production reads, so a local admin session updates the live update gate.

1. Set `ADMIN_SECRET` in `.env` (see `.env.example`). Do **not** set this on production hosts.
2. Start the API: `npm run dev`
3. In another terminal:

```bash
npm run admin:install   # first time only
npm run admin
```

4. Open http://localhost:5173 and enter the same `ADMIN_SECRET`.

The admin UI proxies `/api` to `http://localhost:3000`.

## Postman

Import the files from [`postman/`](postman/):

1. `MetroConnectBackend.postman_collection.json`
2. `MetroConnectBackend.postman_environment.json` — local, `http://localhost:3000`
3. `MetroConnectAPI.postman_environment.json` — `https://api.kshitijkhowal.in`

Requests use the `/metroconnect` prefix, for example `{{baseUrl}}/metroconnect/health`.

Then select **MetroConnect Local** or **MetroConnect API**, set `googleIdToken`, and run **Auth → Sign in with Google** (tokens are saved automatically).
