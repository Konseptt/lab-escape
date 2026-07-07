/**
 * Lightweight in-memory rate limiter for auth endpoints.
 * Best-effort on serverless (per instance); pair with edge/WAF for production scale.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function rateLimitKey(prefix: string, ip: string): string {
  return `${prefix}:${ip || "unknown"}`;
}

/** Prune stale buckets occasionally so memory stays bounded. */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      if (now >= entry.resetAt) buckets.delete(key);
    }
  }, 60_000).unref?.();
}
