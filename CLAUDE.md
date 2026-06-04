# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # dev server at http://localhost:3000 (runs with TMPDIR=/tmp)
pnpm build      # SSR production build (node-server preset); good full-compile check
pnpm preview    # preview the production build
pnpm lint       # eslint
pnpm lint --fix # auto-fix (use for stylistic errors, e.g. comma-dangle / key order)
pnpm typecheck  # vue-tsc type check

# Apply DB schema changes to the linked Supabase project (requires SUPABASE_DB_URL):
supabase db push --db-url "$SUPABASE_DB_URL"
```

There is no test suite. After changes, verify with `pnpm lint` and `pnpm build` (the SSR build compiles every route + server handler, surfacing errors lint misses).

## Stack

Nuxt 4 (source in `app/`), Nuxt UI v4, Tailwind CSS v4, TypeScript, pnpm. **SSR** (Nitro server routes, no prerender). Backend is **Supabase** (Postgres + Auth, via `@nuxtjs/supabase`); football data comes from **API-Football** (api-sports.io). The UI still reads mock-data composables today — those are being migrated to Supabase-backed `/api` routes phase by phase (see `~/Documents/Notes/WC2026 Game - Supabase and Data Plan.md`, the living plan).

## Architecture

This is a **mobile-only** web game (fantasy-soccer style: each matchday has a challenge, you pick up to three players, you earn points and climb a leaderboard).

**Mobile frame via layouts.** `app.vue` is just `UApp > NuxtLayout > NuxtPage`. The phone-shaped frame lives in the layouts, both constraining content to `max-w-[28rem]` at `h-[100dvh]` centered on a muted backdrop:
- `layouts/default.vue` — frame + top title bar + `BottomNav`. The title bar reads `route.meta.title`, set per page via `definePageMeta({ title: '...' })`.
- `layouts/auth.vue` — bare centered frame (no nav/title), used by login/register via `definePageMeta({ layout: 'auth' })`.
- `BetaBanner.vue` is rendered at the top of both layouts and is marked `TODO: remove for production`.

**Navigation morph.** `BottomNav.vue` is a glassmorphism tab bar. On the `/players` route it morphs into a search bar; the query is shared app-wide via `useState('playerSearch')` and consumed by the players page.

**State = composables.** Shared state and (still-mock) data are auto-imported composables/`useState` (no Pinia):
- `useAuth` — wraps **Supabase Auth** (email + password) via `useSupabaseClient`/`useSupabaseUser`. Register keeps the `deez-nuts` invite gate and stores `username` in user metadata (a SQL trigger creates the `profiles` row). `middleware/auth.global.ts` redirects via `useSupabaseUser` (auth pages allow-listed).
- `useAppMode` — reads `NUXT_PUBLIC_APP_MODE` (`testing` default | `production`). `isTesting` gates the beta banner, the leaderboard results-animation test panel, and `/api/_sandbox/*` + `/api/admin/*` routes. Production flip = set the env var; those affordances vanish.
- `useProfile` — username + chosen avatar URL. The avatar flows into the leaderboard "You" row and selection slots.
- `usePlayers` / `useSelection` — player pool and the up-to-three selection slots (shared between the home selection UI and the player detail drawer).
- `useLeaderboard` — `standingsAt(matchday)` computes cumulative standings; also exports `rankBadgeClass`/`rankRowClass` (top-3 medal colors) used by both the table and the home preview.
- `useMatchdays` — per-matchday challenge + your picks/points. Per-player points sum to each matchday total and stay consistent with `useLeaderboard`.
- `useCoaches` — 20 coach profile-picture options; **generated from the Wikipedia API** (Wikimedia Commons image URLs), not hand-written.

**Half-sheets.** Drawers (`UDrawer`, e.g. `PlayerDetailDrawer`, `MatchdayResultsModal`) are the bottom-sheet pattern. The results animation uses `TransitionGroup` FLIP reordering plus CSS keyframes defined in `app/assets/css/main.css`.

**Backend / data (`server/`).** Secrets stay server-side; the client only hits our own `/api` (+ Supabase Auth).
- `server/utils/apifootball.ts` — API-Football client (`x-apisports-key`). `WC_LEAGUE_ID = 1`. `wcSeason()` returns **2022 in testing, 2026 in production** (Free plan only covers 2022–2024, so WC2022 is the real testing dataset). `mapRound()` maps `league.round` strings → matchday slots.
- `server/api/admin/*` (testing-only) — ingestion, e.g. `ingest-structure` pulls teams/matchdays/matches in one call. Writes via `serverSupabaseServiceRole` (the secret key). DB types aren't generated yet, so the service client is cast to a loose `SupabaseClient`.
- `supabase/migrations/*.sql` — schema (apply with `supabase db push`). Tables, the challenge pool, `manual_awards`, RLS, the `leaderboard` view, and the profile-on-signup trigger.

## Conventions

- **Always use Nuxt UI components** where one exists (`UButton`, `UInput`, `UFormField`, `USelect`, `UTable`, `UDrawer`, `UModal`, `UCollapsible`, `UAvatar`, `UBadge`, etc.) rather than hand-rolling.
- **Theme is black primary, monochrome.** Primary is a custom `black` color scale defined in `app/assets/css/main.css` and wired in `app.config.ts`. Use Nuxt UI semantic tokens (`text-muted`, `text-dimmed`, `bg-elevated`, `bg-muted`, `border-default`, `text-inverted`) — not raw grays.
- **Secrets**: `NUXT_API_FOOTBALL_KEY` and Supabase keys live in `.env` (gitignored; see `.env.example`). The secret/service key is server-only. Never reference secrets in client code.
- **Rounded flags** use the `circle-flags` iconify set: `i-circle-flags-<iso2>` (England is `gb-eng`). Icons run in **local bundle mode** — adding a new `@iconify-json/*` collection requires `pnpm exec nuxt prepare` (or any postinstall) to be discovered.
- **ESLint stylistic rules are enforced and will fail the build's lint step:** no trailing commas (`comma-dangle: never`), 1tbs brace style, one statement per line, and `nuxt.config.ts` key ordering. Prefer `pnpm lint --fix` for these.
- Mock images: player avatars use pravatar; coach pictures hotlink Wikimedia Commons (with `UAvatar` initials fallback).
