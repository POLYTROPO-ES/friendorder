# Copilot Instructions — FriendOrder

Specialized agent configuration for the **FriendOrder** project. Follow these rules whenever working in this repository.

## What this app is
FriendOrder is a **smartphone-first, bright-UI burger configurator PWA** (Vanilla JS + Vite) that helps build the menu of a dinner (or any meal). The user picks bread, patties, meat point and toppings; the app renders a **canvas image of the burger** and lets them **share** it (WhatsApp / Telegram / download PNG / copy share link). It is **ES/EN bilingual** and persisted in **localStorage**.

## Tech stack
- **Vite 6** vanilla JS SPA — `index.html` + `src/main.js` → `src/app.js`
- **Canvas renderer** (`src/burger/renderer.js`) draws the burger image
- **Cloudflare Pages** Git integration: pushing to `main` auto-deploys to https://friendorder.tinkertask.com
- Tests: **Vitest** (unit) + **Playwright** (E2E)
- Runtime dep: `jose` (auth — see "Auth is MUTED" below)

## Architecture / file map
| Path | Purpose |
| --- | --- |
| `src/app.js` | All UI logic, state, render functions + event listeners |
| `src/burger/state.js` | `DEFAULT_STATE`, `normalizeState`, `MEAT_POINTS`, `BREAD_OPTIONS`, share encode/decode (`buildShareUrl`) |
| `src/burger/renderer.js` | Canvas burger drawing (plate, buns, grill marks, patties, cheese layers, topping glyphs, icons, aside piles) + `downloadPng` |
| `src/data/toppings.json` | Single source of truth for toppings: `{id, name:{es,en}, category: veggie\|extra\|sauce, emoji, color}` |
| `src/i18n.js` | ES/EN dictionaries, `createI18n(language)` |
| `src/store.js` | localStorage (key `friendorder:burger:v1`), export/import/clear |
| `src/main.js` | Entry point (imports styles + `initApp`) |
| `src/styles.css` | Mobile-first bright orange theme; desktop two-column grid (≥900px), preview sticky on the right |

## State model
```
{ bread: none|normal|glutenFree, grilledBread, patties 1-4, meatPoint,
  toppings[], toppingsAparte, serve:{veggie, extra, sauce: inside|aside},
  name, updatedAt, language: es|en }
```
- `updatedAt` is stamped on every `persist()`.
- Share link `?c=` = base64url-encoded config (language stripped).
- Meat points: `pocoHecho | alPunto | hecho | muyHecho | especialCasa` (no `crudo`).
- Cheese naming is dynamic: Queso / Queso x2 / Queso x3 (rendered as matching melted layers).

## Hard rules / gotchas
1. **Auth is MUTED.** `functions/` (Cloudflare Access JWT verified via `jose`) exists but is **never called from the frontend**. Do NOT wire the frontend to `/api/*`. Keep the **D1 binding OUT of `wrangler.toml`** (removed — it caused deploy error 10181).
2. **Never commit**: `LLM_CHAT_HISTORY.md`, `secrets.txt`, `client_secret_*.json`, `.wrangler/`, `dist/`.
3. **`src/generated/version.js` is generated** by `scripts/generate-version.mjs` (predev/prebuild/pretest hooks). Don't hand-edit.
4. **i18n edits**: always add BOTH `es` and `en` keys. Both dictionaries share identical lines (e.g. `whatsapp`), so edit with unique surrounding context to avoid duplicate matches.
5. **Playwright on sticky/fixed topbar elements is flaky** (lang toggle, help, toppings-aparte checkbox): use `page.evaluate(() => document.getElementById('X').click())`.
6. Keep **KISS** — no overengineering, no speculative abstractions (project preference).
7. `wrangler.toml`: `name = "friendorder"`, worker proxy at `cloudflare/worker-static-proxy.js`.
8. GitHub remote default branch is `master`, but local work happens on `main` — don't get confused by the mismatch.

## Workflow
- Dev server: `npm run dev` (Vite, port 5173)
- Build: `npm run build` — always run before committing UI changes
- Unit tests: `npm run test:run` (Vitest)
- E2E: `npm run test:e2e` (Playwright)
- Deploy: push to `main` → Cloudflare Pages auto-deploy; manual: `npm run deploy:cf`
- Icons: `npm run icons` (regenerates PNG favicons from `public/favicon.svg` via sharp)

## Commit style
Use scoped, verbose conventional commits — one logical change per commit, with a bulleted body, e.g.:
```
feat: add a visible Fresh start button at the end of the configurator

- index.html + styles.css: ...
- app.js: ...
- i18n.js: ...
```
Commit + push per feature (the user expects commit+deploy on every change).
