const WEAK_SECRETS = new Set([
  "dev-only-secret-change-in-production-0000000000",
  "generate-with: openssl rand -base64 32",
  "changeme",
  "secret",
]);

export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required in production.");
  }
  if (secret.length < 32 || WEAK_SECRETS.has(secret)) {
    throw new Error("AUTH_SECRET must be a strong random string (openssl rand -base64 32).");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is required in production.");
  }
  if (appUrl.includes("localhost")) {
    console.warn("[env] NEXT_PUBLIC_APP_URL still points at localhost in production.");
  }
}
