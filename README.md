# FriendOrder 🍔

FriendOrder is a **burger configurator** to help a friend build the menu for a dinner (or any meal). It is smartphone-first, bilingual (Spanish/English) and runs fully in the browser — no server required.

- Pick the **bread** (none / normal / gluten-free) and whether to **toast** it
- Choose **how many patties** (1–4) and the **meat point** (steakhouse-style + *Especial de la casa*)
- Add **toppings** from an editable list (Five Guys-style + extras)
- See a **live illustrated burger** and download it as a **PNG**
- Share a **WhatsApp link** that encodes the whole configuration
- The state is **saved locally** between visits, with **export / import / delete-all**

## Getting Started

1. Install dependencies:
   `npm install`
2. Run the local dev server:
   `npm run dev`
3. Build the production bundle:
   `npm run build`
4. Preview the production build:
   `npm run preview`
5. Run the tests:
   `npm run test:run` (unit) and `npm run test:e2e` (Playwright smoke tests)

## Editing the toppings list

All toppings live in [`src/data/toppings.json`](src/data/toppings.json). Each item has:

```json
{
  "id": "lechuga",
  "name": { "es": "Lechuga", "en": "Lettuce" },
  "category": "veggie",
  "emoji": "🥬",
  "color": "#7cb342"
}
```

- `category` is one of `veggie` | `extra` | `sauce` (used to group the UI)
- `color` is used when drawing the topping in the burger image
- Edit the file by hand, then rebuild/deploy — no code changes needed

## Scripts

- `npm run dev`: start the Vite dev server
- `npm run build`: production build to `dist/`
- `npm run preview`: preview the built app
- `npm run test:run`: run the Vitest unit tests
- `npm run test:e2e`: run the Playwright E2E smoke tests (auto-starts the dev server)
- `npm run deploy:cf`: build and deploy to Cloudflare Pages (project `friendorder`)
- `npm run docker:build`: build the Docker image (nginx)
- `npm run docker:run`: run the container on port 8080
- `npm run dev:cf`: _(on hold)_ full-stack local dev (Pages + Functions + local D1) on port 8788 — auth backend is not active
- `npm run db:migrate`: _(on hold)_ apply DB migrations to the remote D1 database — no D1 binding configured
- `npm run db:migrate:local`: _(on hold)_ apply DB migrations to the local D1 database
- `npm run deploy:worker`: _(on hold)_ build and deploy as a Cloudflare Worker with static assets

## Deployment (Cloudflare)

- Production URL: [https://friendorder.tinkertask.com/](https://friendorder.tinkertask.com/)
- Cloudflare Pages: `npm run deploy:cf`
- Cloudflare Worker with static assets: `npm run deploy:worker`
- Wrangler config lives in [wrangler.toml](wrangler.toml) and the Worker entry in [cloudflare/worker-static-proxy.js](cloudflare/worker-static-proxy.js)
- Local container testing: `npm run docker:build && npm run docker:run` (nginx on port 8080)

## Authentication (on hold)

The repo contains a Cloudflare Access + D1 user-management backend (`functions/`, `migrations/`, [docs/AuthCloudflareAccess.md](docs/AuthCloudflareAccess.md)), but it is **not active** — the burger app is local-only for now. To enable Google login and `admin`/`user` roles later, follow the setup guide and wire the frontend to `/api/me`.

## AI Disclaimer

This project's code was generated with the assistance of different large language model (LLM) tools. It may contain AI-generated code, text, and assets.
