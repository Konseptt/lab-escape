# User flows · Lab Escape

End-to-end paths through the platform for players, researchers, and administrators.

## Player (guest or signed-in)

1. **Land** at `/`, marketing page with facility overview and CTA to sign in or continue as guest.
2. **Authenticate** at `/login`, credentials, OAuth (if configured), or guest cookie (`le_guest`).
3. **Dashboard** at `/dashboard`, recent sessions, wing progress, quick links to labs and experiments.
4. **Choose a room**
   - **Lab map** `/labs`, spatial wing layout with unlock state.
   - **Experiments** `/experiments`, catalog with filters and difficulty.
   - **Room briefing** `/experiments/[slug]`, concept, study citation, learning goals.
5. **Play** at `/play/[slug]`
   - Briefing screen → **Enter the room**.
   - Minimal HUD: objective, progress, inventory, hints, pause, accessibility, exit.
   - Engine runs trials; data recorded per trial to localStorage and API when DB is live.
6. **Results** at `/results/[sessionId]`, score, accuracy, trial breakdown, link to science debrief.
7. **Science debrief** at `/science/[slug]`, original study, mechanism, applications.
8. **Profile / settings**, XP, achievements `/achievements`, preferences `/settings`.

### Guest vs account

| Capability | Guest | Signed-in |
|------------|-------|-----------|
| Play all rooms | Yes | Yes |
| Persist sessions locally | Yes | Yes |
| Sync to Postgres | No | Yes |
| Leaderboard / analytics | Limited | Full |
| Research consent / export | No | Yes (researcher role) |

## Researcher

1. Sign in with a researcher or admin account (local demo: `demo@labescape.app` when `SEED_DEMO_ACCOUNTS=true`).
2. **Research portal** `/research`, study overview, join codes, export requests.
3. **Analytics** `/analytics`, cohort trends when DB has session data.
4. **Export** via `/api/export`, JSON/CSV of trials (authenticated, consent-gated in production).

## Administrator

1. Sign in as admin (`admin@labescape.app` when demo seed is enabled locally). Promote your own account to `ADMIN` in production.
2. **Admin console** `/admin`
   - **Telemetry**, DB status, participant count, sessions, trials.
   - **Experiment builder**, per-room title, summary, difficulty, engine JSON. Saves to `localStorage` overrides applied on next play session.
   - **Participants**, roster with session counts (requires Postgres + seed).
   - **Leaderboard**, top completed sessions from DB.
3. **Database setup** (first time):
   ```bash
   docker compose up -d
   npm run db:push && npm run db:seed
   ```

## Session data path

```
Engine trial → game store → localStorage (history.ts)
                         → POST /api/sessions (if authenticated + DB online)
                         → Prisma GameSession + Trial rows
```

## Accessibility during play

- HUD **Accessibility** sheet: reduced motion, high contrast, large text, colorblind-safe palette, keyboard-only hints.
- Settings at `/settings` mirror persisted preferences (`UserSettings` when signed in).

## Error recovery

- App route group uses `error.tsx`, retry or return to dashboard.
- Game **Exit** dialog warns before abandoning an in-progress session.
- Incomplete sessions recoverable from local history until finalized.
