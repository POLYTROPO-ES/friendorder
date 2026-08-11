# FriendOrder

FriendOrder is a fresh project placeholder. It ships with a minimal landing page scaffolded with Vite, plus a ready-to-use Cloudflare deployment setup (Pages and Worker).

## Getting Started

1. Install dependencies:
   `npm install`
2. Run the local dev server:
   `npm run dev`
3. Build the production bundle:
   `npm run build`
4. Preview the production build:
   `npm run preview`

## Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: production build to `dist/`
- `npm run preview`: preview the built app
- `npm run dev:cf`: full-stack local dev (Pages + Functions + local D1) on port 8788
- `npm run db:migrate`: apply DB migrations to the remote D1 database
- `npm run db:migrate:local`: apply DB migrations to the local D1 database
- `npm run deploy:cf`: build and deploy to Cloudflare Pages (project `friendorder`)
- `npm run deploy:worker`: build and deploy as a Cloudflare Worker with static assets
- `npm run docker:build`: build the Docker image (nginx)
- `npm run docker:run`: run the container on port 8080

## Deployment (Cloudflare)

- Production URL: [https://friendorder.tinkertask.com/](https://friendorder.tinkertask.com/)
- Cloudflare Pages: `npm run deploy:cf`
- Cloudflare Worker with static assets: `npm run deploy:worker`
- Wrangler config lives in [wrangler.toml](wrangler.toml) and the Worker entry in [cloudflare/worker-static-proxy.js](cloudflare/worker-static-proxy.js)
- Local container testing: `npm run docker:build && npm run docker:run` (nginx on port 8080)

## Authentication

FriendOrder authenticates with **Cloudflare Access** (any Google account) and stores users in **Cloudflare D1** with `admin`/`user` roles. New users get `user` by default; admins manage roles from the in-app **Members** panel.

- Full setup guide (Zero Trust, Google IdP, Access app, D1, env vars, first admin): [docs/AuthCloudflareAccess.md](docs/AuthCloudflareAccess.md)
- API: `GET /api/me` (current user), `GET /api/users` + `PATCH /api/users/:id` (admin only)
