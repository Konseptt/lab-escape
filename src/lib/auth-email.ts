/** Normalize emails for lookup and storage (lowercase, trimmed). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
