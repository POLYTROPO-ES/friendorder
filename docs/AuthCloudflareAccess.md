# FriendOrder — Authentication with Cloudflare Access + D1

FriendOrder uses **Cloudflare Access (Zero Trust)** for login and **Cloudflare D1** as the user database.

> **Status: on hold.** The auth backend is present in this repo but **not active** yet. The app currently runs fully local (no login). To enable authentication later, complete Parts A–I below and wire the frontend to `/api/me`.

- **Login**: any Google account (managed by Cloudflare Access — no auth code to maintain).
- **User id**: the email address.
- **Roles**: `admin` or `user`. New users get `user` by default. Admins manage roles from the in-app **Members** panel.
- **API**: Pages Functions (`/api/me`, `/api/users`) validate the Access JWT and read/write the D1 `users` table.

```
User ──► Cloudflare Access ──► Google login ──► Pages (Functions) ──► D1 users
        (checks CF_Authorization)         (Cf-Access-Jwt-Assertion)   (email, role)
```

## Prerequisites

- A Cloudflare account with the `friendorder.tinkertask.com` domain on it
- The GitHub repo `POLYTROPO-ES/friendorder` connected to Cloudflare Pages (auto-deploy on push to `main`)
- A Google account (any) — no Workspace needed

## Part A — Create the Cloudflare Zero Trust organization

1. Go to <https://dash.cloudflare.com/> → **Zero Trust** → **Get started**.
2. Pick a team name (e.g. `polytropo-friendorder`). Your **team domain** becomes `https://<team-name>.cloudflareaccess.com` (the login page). Note it down — you will need it later (`TEAM_DOMAIN`).

## Part B — Create the Google OAuth client

1. Open the [Google Cloud Console](https://console.cloud.google.com/) → create a project (e.g. `friendorder`).
2. **APIs & Services → OAuth consent screen**:
   - App name: `FriendOrder`
   - User support email: your email
   - Audience: **External**
   - Add your email as a test user (while the app is in "Testing" state, only listed accounts can log in — move it to "In production" when ready).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - **Authorized JavaScript origins**: `https://<your-team-name>.cloudflareaccess.com`
   - **Authorized redirect URIs**: `https://<your-team-name>.cloudflareaccess.com/cdn-cgi/access/callback`
   - Create and copy the **Client ID** and **Client secret**.

> ⚠️ Never commit the client secret. Store it in your password manager or Cloudflare dashboard only.

## Part C — Add Google as an identity provider in Cloudflare

1. Cloudflare dashboard → **Zero Trust → Settings → Authentication → Login methods → Add new**.
2. Choose **Google**.
3. Paste the Client ID (**App ID**) and Client secret from Part B.
4. (Optional) enable **PKCE**, then **Save**.

## Part D — Create the Access application and policy

1. **Zero Trust → Access → Applications → Add an application → Self-hosted**.
2. Application domain: `friendorder.tinkertask.com` (subdomain `friendorder`).
3. Keep the default session duration (24 h).
4. **Policy** (this is what allows *any* Google user):
   - Policy name: `Everyone with Google`
   - **Action**: `Allow`
   - **Include**: `Everyone`, login method **Google**
5. Save. From **Additional settings** copy the **Application Audience (AUD) Tag** — you will need it as `POLICY_AUD`.

> The site is now protected: unauthenticated visitors are redirected to the Google login page.

## Part E — Create the D1 database and apply the migration

1. Install dependencies and log in to Wrangler (one time):
   ```bash
   npm install
   npx wrangler login
   ```
2. Create the database (you must be in the project root with `wrangler.toml`):
   ```bash
   npx wrangler d1 create friendorder
   ```
3. Copy the returned `database_id` into `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "friendorder"
   database_id = "<your-d1-database-id>"
   ```
4. Apply the schema to the remote database:
   ```bash
   npm run db:migrate
   ```

## Part F — Wire the Pages project (dashboard)

1. **Bind D1**: Cloudflare dashboard → **Workers & Pages** → your `friendorder` Pages project → **Settings → Bindings → Add → D1 database** → select `friendorder`, binding name **`DB`**.
2. **Add env vars**: **Settings → Variables and Secrets → Add**:
   - `TEAM_DOMAIN` = `https://<your-team-name>.cloudflareaccess.com`
   - `POLICY_AUD` = the AUD tag from Part D
3. **Disable the `*.pages.dev` URL** (recommended): the Pages-provisioned `*.pages.dev` address is *not* protected by Access, so anyone could hit it (and spoof the Access headers). Settings → **Custom domains / Domains**, remove the `*.pages.dev` URL — keep only `friendorder.tinkertask.com`.

> Until `TEAM_DOMAIN` + `POLICY_AUD` are set, `/api/me` returns `503 auth not configured` (fail-closed).

## Part G — Promote the first admin

Every user signs up with role `user`. To make yourself (or someone else) the first admin, run:

```bash
npx wrangler d1 execute friendorder --remote --command "UPDATE users SET role='admin' WHERE email='you@example.com'"
```

After that, log in and use the **Members** panel to promote/demote other users. Admins cannot change their own role (prevents lockout).

## Part H — Local development

1. Create a `.dev.vars` file in the project root (gitignored):
   ```
   TEAM_DOMAIN=https://<your-team-name>.cloudflareaccess.com
   POLICY_AUD=<your-aud-tag>
   ```
2. Build the site, then run the Pages dev server (serves the app **and** the Functions):
   ```bash
   npm run build
   npm run dev:cf
   ```
   → open <http://localhost:8788>. `/api/me` and the admin endpoints are live against a **local** D1 (miniflare). Apply the schema to the local DB first:
   ```bash
   npm run db:migrate:local
   ```
3. Plain frontend-only dev still works with `npm run dev` (Vite), but `/api/*` returns 404 there — use `dev:cf` for full-stack testing.

> The Access JWT is only issued by Cloudflare for requests that passed Access. For real end-to-end login testing you must use the production URL (Part D) or an Access-protected local tunnel; locally the Functions return `401` without a valid JWT.

## Part I — Deploy and test

1. Commit and push to `main` — Cloudflare Pages auto-deploys (Functions are picked up from `functions/`).
2. Open <https://friendorder.tinkertask.com>:
   - You should be redirected to the Google login page (Cloudflare Access).
   - After login you land on the app with a **user chip** (initial, name, email, role) and **Sign out**.
   - A brand-new account has role **user** and no Members panel.
   - After Part G, your account shows the **Members** panel: list of users, last login, and **Make admin / Make user** buttons.
3. **Sign out** goes through Cloudflare Access (`/cdn-cgi/access/logout`).

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `ERR_TOO_MANY_REDIRECTS` at login | Access cookie `SameSite` set to `Strict` → set to `None` or `Lax` (Access app → Configure → Advanced settings → Cookie settings). |
| `/api/me` returns `503 auth not configured` | `TEAM_DOMAIN` / `POLICY_AUD` env vars missing or still placeholders (Part F). |
| `/api/me` returns `401` | No valid Access JWT (direct `pages.dev` hit, or testing outside Access). |
| `403 forbidden` on `/api/users` | The logged-in user has role `user`. Promote via Part G. |
| Login page doesn't show Google | Google IdP not enabled in Part C, or Google OAuth client still in "Testing" without you as a test user (Part B). |
| `d1` command errors | `database_id` in `wrangler.toml` still the placeholder (Part E.3), or not logged in (`npx wrangler login`). |

## Security notes

- The Functions validate the **JWT signature** (`Cf-Access-Jwt-Assertion`) against your team domain keys and the `POLICY_AUD` audience — they do **not** trust the `Cf-Access-*` headers blindly.
- Keep the `*.pages.dev` URL disabled so the app is only reachable through Access.
- Default role is `user`; only admins can change roles, and no one can change their own role.
- Session duration is configurable in the Access application settings.
