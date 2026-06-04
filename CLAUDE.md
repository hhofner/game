# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # dev server at http://localhost:3000 (runs with TMPDIR=/tmp)
pnpm build      # production build; prerenders all routeRules routes (good full-compile check)
pnpm preview    # preview the production build
pnpm lint       # eslint
pnpm lint --fix # auto-fix (use for stylistic errors, e.g. comma-dangle / key order)
pnpm typecheck  # vue-tsc type check
```

There is no test suite. After changes, verify with `pnpm lint` and `pnpm build` (the build prerenders every route, so it surfaces template/component-API errors that lint misses).

## Stack

Nuxt 4 (source in `app/`), Nuxt UI v4, Tailwind CSS v4, TypeScript, pnpm. The app is **statically prerendered (SSG)** — there is no backend; all "data" is mock data living in composables.

## Architecture

This is a **mobile-only** web game (fantasy-soccer style: each matchday has a challenge, you pick up to three players, you earn points and climb a leaderboard).

**Mobile frame via layouts.** `app.vue` is just `UApp > NuxtLayout > NuxtPage`. The phone-shaped frame lives in the layouts, both constraining content to `max-w-[28rem]` at `h-[100dvh]` centered on a muted backdrop:
- `layouts/default.vue` — frame + top title bar + `BottomNav`. The title bar reads `route.meta.title`, set per page via `definePageMeta({ title: '...' })`.
- `layouts/auth.vue` — bare centered frame (no nav/title), used by login/register via `definePageMeta({ layout: 'auth' })`.
- `BetaBanner.vue` is rendered at the top of both layouts and is marked `TODO: remove for production`.

**Navigation morph.** `BottomNav.vue` is a glassmorphism tab bar. On the `/players` route it morphs into a search bar; the query is shared app-wide via `useState('playerSearch')` and consumed by the players page.

**State = composables.** All shared state and mock data are auto-imported composables/`useState`/`useCookie` (no Pinia):
- `useAuth` — cookie-backed mock auth (`game_user`). Any credentials log in. Register requires invite code `deez-nuts`. `middleware/auth.global.ts` redirects unauthenticated users to `/login` (guarded `import.meta.server` → client-only so prerender stays intact).
- `useProfile` — username + chosen avatar URL. The avatar flows into the leaderboard "You" row and selection slots.
- `usePlayers` / `useSelection` — player pool and the up-to-three selection slots (shared between the home selection UI and the player detail drawer).
- `useLeaderboard` — `standingsAt(matchday)` computes cumulative standings; also exports `rankBadgeClass`/`rankRowClass` (top-3 medal colors) used by both the table and the home preview.
- `useMatchdays` — per-matchday challenge + your picks/points. Per-player points sum to each matchday total and stay consistent with `useLeaderboard`.
- `useCoaches` — 20 coach profile-picture options; **generated from the Wikipedia API** (Wikimedia Commons image URLs), not hand-written.

**Half-sheets.** Drawers (`UDrawer`, e.g. `PlayerDetailDrawer`, `MatchdayResultsModal`) are the bottom-sheet pattern. The results animation uses `TransitionGroup` FLIP reordering plus CSS keyframes defined in `app/assets/css/main.css`.

## Conventions

- **Always use Nuxt UI components** where one exists (`UButton`, `UInput`, `UFormField`, `USelect`, `UTable`, `UDrawer`, `UModal`, `UCollapsible`, `UAvatar`, `UBadge`, etc.) rather than hand-rolling.
- **Theme is black primary, monochrome.** Primary is a custom `black` color scale defined in `app/assets/css/main.css` and wired in `app.config.ts`. Use Nuxt UI semantic tokens (`text-muted`, `text-dimmed`, `bg-elevated`, `bg-muted`, `border-default`, `text-inverted`) — not raw grays.
- **Every new page route must be added to `routeRules` in `nuxt.config.ts`** with `prerender: true`, or it won't be in the static build.
- **Rounded flags** use the `circle-flags` iconify set: `i-circle-flags-<iso2>` (England is `gb-eng`). Icons run in **local bundle mode** — adding a new `@iconify-json/*` collection requires `pnpm exec nuxt prepare` (or any postinstall) to be discovered.
- **ESLint stylistic rules are enforced and will fail the build's lint step:** no trailing commas (`comma-dangle: never`), 1tbs brace style, one statement per line, and `nuxt.config.ts` key ordering. Prefer `pnpm lint --fix` for these.
- Mock images: player avatars use pravatar; coach pictures hotlink Wikimedia Commons (with `UAvatar` initials fallback).
