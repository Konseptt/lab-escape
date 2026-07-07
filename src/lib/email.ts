import { absoluteUrl } from "@/lib/seo";

export function passwordResetUrl(token: string): string {
  return absoluteUrl(`/reset/${token}`);
}

/**
 * Send a password-reset email via Resend when RESEND_API_KEY is set.
 * In development without Resend, logs the link to the server console.
 */
export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<{ sent: boolean }> {
  const resetUrl = passwordResetUrl(token);
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ?? "Lab Escape <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[auth] reset link for ${to}: ${resetUrl}`);
    } else {
      console.error(
        "[auth] RESEND_API_KEY is not set; password reset email was not sent."
      );
    }
    return { sent: false };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your Lab Escape password",
      html: [
        `<p>You requested a password reset for Lab Escape.</p>`,
        `<p><a href="${resetUrl}">Set a new password</a></p>`,
        `<p>This link expires in 30 minutes and works once.</p>`,
        `<p>If you did not request this, you can ignore this email.</p>`,
      ].join(""),
      text: `Reset your Lab Escape password: ${resetUrl}\n\nThis link expires in 30 minutes.`,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[auth] Resend error ${res.status}: ${body}`);
    return { sent: false };
  }

  return { sent: true };
}
