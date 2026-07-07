# Lab Escape

**Train on the experiments that built psychology.** Landmark paradigms (Stroop, Simons & Chabris, Asch, Milgram, and more) rebuilt as measurable escape rooms with trial-level logging.

Use it as a personal cognitive gym, a classroom lab instrument, or a museum kiosk. The play loop works offline-first with no database; add Postgres when you need accounts, cohort export, and admin tooling.

MIT licensed. No paid APIs. Runs entirely on your machine.

---

## What makes it different

| Most psych apps | Lab Escape |
|-----------------|------------|
| Read about a study | Run the task structure |
| One aggregate score | Trial-level RT, accuracy, seed |
| Generic brain games | Cited paradigms from 1935–1999 |
| Streaks and badges only | Debrief + literature + session notes |
| Cloud required | Guest mode + localStorage by default |

**Subject pathway:** Briefing → Session → Debrief → Literature.

---

## Features

### Play & measure
- **10 rooms** across **5 wings** (attention, memory, decision, executive, social)
- **9 game engines** (search, flicker, span, DRM, framing, bandit, stroop, conformity, authority)
- **Seeded trials** — same seed produces an identical sequence
- **Results debrief** — score, accuracy, RT curve, learning curve, trial timeline

### Personal training
- **Training log** (`/dashboard`) — weekly focus room, drill queue, clearance progress
- **Session notes** — rule-based debrief on each results page (no external services)
- **Cognitive profile** (`/analytics`) — six dimensions from your history
- **Achievements** — tied to real behaviors

### Research & operations
- **Research portal** — consent model, export pipeline (CSV/JSON)
- **Admin console** — telemetry, participant roster (admin role required)
- **Prisma + PostgreSQL** — users, sessions, trials, studies
- **NextAuth** — credentials + optional Google/GitHub OAuth

---

## Quick start

**Requirements:** Node.js 20+, npm 10+

```bash
git clone https://github.com/your-username/lab-escape.git
cd lab-escape
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Continue as guest, play any room, view results.

### With database

```bash
docker compose up -d
npm run db:push
npm run db:seed
npm run dev
```

**Demo accounts** (local only — set `SEED_DEMO_ACCOUNTS=true` before `npm run db:seed`):

| Email | Role |
|-------|------|
| `demo@labescape.app` | Player |
| `admin@labescape.app` | Admin |

Password: `labescape-demo`

Never enable demo accounts in production. If they were seeded earlier, run `npm run db:revoke-demo` against your production `DATABASE_URL` to rotate passwords and demote the demo admin.

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | For sync/export | PostgreSQL connection string |
| `AUTH_SECRET` | For auth | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Yes | e.g. `http://localhost:3000` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | Google OAuth |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | No | GitHub OAuth |

---

## Production deploy

### Checklist

1. Set strong `AUTH_SECRET` (`openssl rand -base64 32`, at least 32 characters).
2. Set `NEXT_PUBLIC_APP_URL` to your public origin (no trailing slash).
3. Provision PostgreSQL and set `DATABASE_URL`.
4. Run `npm run db:push` (or migrations) and `npm run db:seed` for demo accounts if needed.
5. Build: `npm run build` then `npm run start`, or use the Docker image below.

The app validates required env vars at startup in production (`AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`). Security headers are applied via the Next.js proxy layer. Private routes (dashboard, play, settings, admin) are `noindex`.

### Docker

```bash
docker compose up -d          # Postgres
npm run db:push && npm run db:seed
docker build -t lab-escape .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/lab_escape" \
  -e AUTH_SECRET="your-secret" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  lab-escape
```

Health check: `GET /api/health` returns `{ status: "ok", db: "up"|"down" }`.

### Vercel

Set the same env vars in the project dashboard. Add `prisma generate` to the build command if not using the default `npm run build` (this repo runs it automatically).

---

## Rooms

| Code | Room | Paradigm |
|------|------|----------|
| A-01 | The Invisible Gorilla | Inattentional blindness |
| A-02 | The Flicker Room | Change blindness |
| B-01 | Span Chamber | Digit span |
| B-02 | The Archive of Things That Never Happened | DRM false memory |
| C-01 | The Two Doors | Framing |
| C-02 | Reward Corridor | Multi-armed bandit |
| D-01 | Stroop Lock | Stroop interference |
| D-02 | Affective Gate | Emotional Stroop |
| E-01 | The Conformity Chamber | Asch conformity |
| E-02 | Authority Protocol | Milgram obedience (ethical simulation) |

Content source of truth: [`src/lib/content/rooms.ts`](src/lib/content/rooms.ts)

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Prisma schema |
| `npm run db:seed` | Seed database |

---

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md)
- [`docs/ACCESSIBILITY.md`](docs/ACCESSIBILITY.md)
- [`docs/USER_FLOWS.md`](docs/USER_FLOWS.md)

Each room briefing lists **IV**, **DV**, operational definitions, and key terms. Full glossary: `/research/glossary`.

---

## License

[MIT](LICENSE)
