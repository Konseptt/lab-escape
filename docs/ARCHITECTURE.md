# Architecture

## System overview

```
Browser ──────────────────────────────────────────────────────┐
│  Next.js App Router (RSC + client islands)                  │
│  ├─ (marketing)  landing, public pages          [static]    │
│  ├─ (auth)       login/signup/forgot/verify     [static]    │
│  ├─ (app)        dashboard…research portal      [dynamic]   │
│  └─ (game)       /play/[slug] chromeless play   [SSG]       │
│                                                              │
│  Zustand: game session state, settings (persisted)          │
│  React Query: server data fetching/caching                  │
│  localStorage: session history (guest-first source of truth)│
└───────────────┬──────────────────────────────────────────────┘
                │ REST + Server Actions
┌───────────────▼──────────────────────────────────────────────┐
│  Next.js server runtime                                      │
│  ├─ NextAuth v5 (JWT sessions; credentials + OAuth + guest)  │
│  ├─ /api/sessions   persist completed sessions + trials      │
│  ├─ /api/experiments  room catalog (db → content fallback)   │
│  ├─ /api/export     CSV/JSON research export, anonymization  │
│  └─ Server Actions  signup/login/guest/password-reset        │
└───────────────┬──────────────────────────────────────────────┘
                │ Prisma 7 (pg driver adapter)
        ┌───────▼────────┐   ┌──────────┐
        │ PostgreSQL 17  │   │ Redis 7  │  (presence, rate limiting,
        └────────────────┘   └──────────┘   ws fan-out, provisioned)
```

## Guiding decisions

1. **Guest-first data layer.** Completed sessions write to `localStorage`
   first, then mirror to `/api/sessions`. If Postgres is down or the player
   is a guest, the app remains fully functional, a hard requirement for
   museum kiosks. Server storage is the authoritative copy for enrolled
   study participants.
2. **Deterministic experiments.** Every session stores a 31-bit seed; all
   randomness flows through `mulberry32(seed)` (`src/lib/game/rng.ts`).
   Same seed + same engine = bit-identical trial sequence, which makes any
   published result replayable.
3. **Engines as components.** Each paradigm is a self-contained client
   component (`src/components/game/engines/*`) receiving `config` (JSON from
   the room record) and talking to the session store through one hook
   (`useEngine`). Adding a paradigm = one component + one content entry.
4. **Content as code, mirrored to DB.** `src/lib/content/rooms.ts` is the
   canonical room/achievement content. The seed script pushes it into
   Postgres; read APIs fall back to it. No CMS round-trips during play.
5. **Timing discipline.** Reaction times use `performance.now()` deltas from
   a session-start anchor. Pause freezes all engine timers
   (`usePausableTimeout`), so paused time never contaminates RT data.

## Folder structure

```
src/
  app/
    (marketing)/        landing
    (auth)/             login, signup, forgot-password, verify
    (app)/              dashboard, labs, experiments, results,
                        science, analytics, achievements, profile,
                        settings, admin, research
    (game)/play/[slug]  chromeless play surface
    api/                sessions, experiments, export, auth
    actions/            server actions (auth)
  components/
    ui/                 primitives (Radix/shadcn, restyled)
    charts/             line, bar, radar, sparkline (hand-rolled SVG)
    game/               HUD, engine plumbing, 9 paradigm engines
    shell/              app sidebar/nav
    marketing/          header, footer, hero canvas
  lib/
    content/            room/wing/achievement content + types
    game/               rng, scoring, history (localStorage layer)
    auth.ts  db.ts  session.ts  motion.ts  utils.ts
  stores/               zustand: game-store, settings-store
prisma/                 schema + seed
docs/                   this file, design system, accessibility
```

## Data model (Prisma)

Identity: `User` (role: PLAYER/EDUCATOR/RESEARCHER/ADMIN) → `Institution`.
NextAuth tables: `Account`, `AuthSession`, `VerificationToken`.

Content: `Wing` ⇒ `Room` (difficulty, engine id, JSON config, unlock chain
via self-relation). `Achievement` optionally scoped to a room.

Play: `GameSession` (seed, status, summary stats) ⇒ `Trial` (stimulus JSON,
expected/response/correct/rtMs, unique per session+index).
`CognitiveScore` stores longitudinal per-dimension snapshots.

Research: `Study` (join code, room list, config) ⇒ `Consent` (versioned,
revocable) and `DataExport` audit rows. `UserSettings` and
`AnalyticsEvent` round out settings/telemetry.

## API surface

| Route                       | Method | Purpose                                        |
| --------------------------- | ------ | ---------------------------------------------- |
| `/api/auth/[...nextauth]`   | *      | NextAuth (credentials, Google, GitHub)         |
| `/api/sessions`             | POST   | Persist completed session + trials (204 guest) |
| `/api/sessions`             | GET    | Recent sessions for the viewer                 |
| `/api/experiments`          | GET    | Room catalog (db, falls back to content)       |
| `/api/export`               | GET    | CSV/JSON trial export, `?anonymize=1`          |

Server actions: `signup`, `login`, `continueAsGuest`,
`requestPasswordReset` (enumeration-safe).

## State management

- **`game-store`** (Zustand): session lifecycle, `briefing → running ⇄
  paused → complete`. Records trials with monotonic timestamps; computes
  summary stats on completion; hands off to history layer.
- **`settings-store`** (Zustand + persist): accessibility, input, privacy
  toggles. `data-motion="reduced"` is reflected onto `<html>` and honored by
  CSS and Framer Motion alike.
- **React Query**: server reads (admin/research pages fetch server-side via
  RSC; client mutations go through fetch with graceful failure).

## Motion system

One physical language (`src/lib/motion.ts`): entrances rise 8px with
`cubic-bezier(0.22, 1, 0.36, 1)` under 500ms; interactive objects use a
stiff spring (480/42); charts draw in once. Reduced motion (system setting
or in-app toggle) collapses all of it, stimulus timing is never animated.

## Scaling notes

- WebSocket layer (live cohort dashboards, multiplayer rooms) attaches to
  the provisioned Redis pub/sub; session presence keys are namespaced
  `le:presence:*`.
- Trial writes are batched in a single `create` with nested rows, one
  round-trip per session, not per trial.
- All heavy pages are RSC; client JS ships only for islands (engines, HUD,
  charts, forms).
