# Security · Lab Escape

Operational guidance for production hardening beyond what the app enforces in code.

## Rate limiting

Auth endpoints use an **in-memory** limiter (`src/lib/rate-limit.ts`). On Vercel/serverless, each instance has its own bucket, so limits are best-effort only.

### Recommended: Vercel WAF (production)

1. Vercel project → **Settings** → **Firewall** → **Rules**
2. Add rules for:
   - `POST` to `/api/auth/*` — e.g. 60 requests / minute / IP
   - `POST` to server actions on `/login`, `/signup`, `/forgot-password` (if exposed as distinct paths)
3. Return **429** when exceeded.

### Optional: Upstash Redis (durable limits)

For shared limits across instances:

1. Create an Upstash Redis database.
2. Add `@upstash/ratelimit` and `@upstash/redis` to the project.
3. Replace `checkRateLimit` in `src/lib/rate-limit.ts` with an Upstash sliding-window limiter keyed by `prefix:ip`.
4. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel.

Keep the in-memory limiter as a fallback when Redis is unreachable.

## Password reset email

Production requires a transactional provider:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key ([resend.com](https://resend.com)) |
| `EMAIL_FROM` | Verified sender, e.g. `Lab Escape <noreply@yourdomain.com>` |

Reset links use path tokens (`/reset/{uuid}`), not query strings, to reduce Referer leakage. Reset pages send `Referrer-Policy: no-referrer`.

## Secrets rotation

- **`AUTH_SECRET`** — rotate invalidates all sessions; plan a maintenance window.
- **`DATABASE_URL`** — rotate in Neon, update Vercel env, redeploy.
- **OAuth client secrets** — rotate in Google/GitHub consoles if exposed.

## Demo accounts

Never set `SEED_DEMO_ACCOUNTS=true` in production. If demo users exist from an earlier seed:

```bash
DATABASE_URL="…" npm run db:revoke-demo
```

## Session integrity

`POST /api/sessions` recomputes score and accuracy from trial rows server-side; client-supplied aggregates are ignored.

## Security headers

Applied in `src/proxy.ts`: CSP, HSTS (production), `X-Frame-Options`, `Referrer-Policy` (stricter on `/reset`).

## Audit

Re-run the local secret scanner:

```bash
python3 .cursor/skills/security-audit/scripts/scan-secrets.py \
  --target . \
  --patterns .cursor/skills/security-audit/scripts/patterns.dat \
  --output /tmp/audit.jsonl \
  --exclude-dirs node_modules,.next,.git,src/generated
```

Skill source: [YangKuoshih/security-audit](https://github.com/YangKuoshih/security-audit).
