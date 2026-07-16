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

3. In Supabase SQL editor, run [`sql/001_profiles.sql`](sql/001_profiles.sql).

4. Enable **Google** under Authentication → Providers. Use the same Web client ID as the app (`GOOGLE_WEB_CLIENT_ID`).

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | — | Liveness |
| `POST` | `/api/auth/google` | — | `{ idToken }` → session + profile |
| `POST` | `/api/auth/refresh` | — | `{ refreshToken }` → new session |
| `POST` | `/api/auth/logout` | Bearer | Invalidate session |
| `GET` | `/api/auth/me` | Bearer | Current user + profile |
| `GET` | `/api/users/me` | Bearer | Profile row |
| `GET` | `/api/users/:id` | Bearer | Own profile only |

## Postman

Import both files from [`postman/`](postman/):

1. `MetroConnectBackend.postman_collection.json`
2. `MetroConnectBackend.postman_environment.json`

Then select **MetroConnect Local**, set `googleIdToken`, and run **Auth → Sign in with Google** (tokens are saved automatically).
