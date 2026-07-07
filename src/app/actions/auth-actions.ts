"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/client";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { normalizeEmail } from "@/lib/auth-email";
import { GUEST_COOKIE } from "@/lib/session";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.email("Enter a valid email"),
  password: z.string().min(10, "Use at least 10 characters"),
});

const resetPasswordSchema = z.object({
  token: z.string().uuid("Invalid or expired reset link."),
  password: z.string().min(10, "Use at least 10 characters"),
});

export type AuthActionState = { error?: string; ok?: boolean };

const GENERIC_SIGNUP_ERROR =
  "Could not create an account with those details. Try signing in or use a different email.";
const RATE_LIMIT_ERROR = "Too many attempts. Wait a minute and try again.";

function credentialsFailed(result: string | undefined) {
  return !result || result.includes("error=");
}

async function assertAuthRateLimit(action: string, limit = 10) {
  const ip = await clientIp();
  if (!checkRateLimit(rateLimitKey(action, ip), limit, 60_000)) {
    return RATE_LIMIT_ERROR;
  }
  return null;
}

async function clearGuestCookie() {
  const jar = await cookies();
  jar.delete(GUEST_COOKIE);
}

async function signInWithCredentials(email: string, password: string) {
  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
    redirectTo: "/dashboard",
  });
  if (credentialsFailed(typeof result === "string" ? result : undefined)) {
    return false;
  }
  await clearGuestCookie();
  return true;
}

export async function signup(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limited = await assertAuthRateLimit("signup");
  if (limited) return { error: limited };

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, password } = parsed.data;
  const email = normalizeEmail(parsed.data.email);

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await db.user.create({
      data: { name, email, passwordHash, settings: { create: {} } },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: GENERIC_SIGNUP_ERROR };
    }
    return { error: "Service temporarily unavailable. Try again or continue as a guest." };
  }

  try {
    const ok = await signInWithCredentials(email, password);
    if (!ok) return { error: "Account created but sign-in failed. Try logging in." };
    redirect("/dashboard");
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: "Account created but sign-in failed. Try logging in." };
  }
}

export async function login(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limited = await assertAuthRateLimit("login");
  if (limited) return { error: limited };

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  try {
    const ok = await signInWithCredentials(email, password);
    if (!ok) return { error: "Invalid email or password." };
    redirect("/dashboard");
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: "Could not sign in. Try again." };
  }
}

export async function continueAsGuest() {
  const jar = await cookies();
  jar.set(GUEST_COOKIE, crypto.randomUUID(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect("/dashboard");
}

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function logout() {
  await clearGuestCookie();
  await signOut({ redirectTo: "/" });
}

export async function requestPasswordReset(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limited = await assertAuthRateLimit("reset-request", 5);
  if (limited) return { error: limited };

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  if (!z.email().safeParse(email).success) {
    return { error: "Enter a valid email address." };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomUUID();
      await db.verificationToken.deleteMany({
        where: { identifier: `reset:${email}` },
      });
      await db.verificationToken.create({
        data: {
          identifier: `reset:${email}`,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 30),
        },
      });
      if (process.env.NODE_ENV === "development") {
        console.log(`[auth] reset link for ${email}: /reset?token=${token}`);
      }
      // TODO: send email via transactional provider in production.
    }
  } catch {
    // same response either way — do not reveal whether the email exists
  }
  return { ok: true };
}

export async function resetPassword(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const limited = await assertAuthRateLimit("reset-complete", 5);
  if (limited) return { error: limited };

  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { token, password } = parsed.data;

  try {
    const record = await db.verificationToken.findUnique({ where: { token } });
    if (
      !record ||
      !record.identifier.startsWith("reset:") ||
      record.expires < new Date()
    ) {
      return { error: "This reset link is invalid or has expired." };
    }

    const email = record.identifier.slice("reset:".length);
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      await db.verificationToken.delete({ where: { token } }).catch(() => null);
      return { error: "This reset link is invalid or has expired." };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.$transaction([
      db.user.update({ where: { id: user.id }, data: { passwordHash } }),
      db.verificationToken.delete({ where: { token } }),
      db.verificationToken.deleteMany({ where: { identifier: record.identifier } }),
    ]);

    const ok = await signInWithCredentials(email, password);
    if (!ok) return { ok: true };
    redirect("/dashboard");
  } catch (err) {
    if (isNextRedirect(err)) throw err;
    return { error: "Could not reset password. Request a new link." };
  }
}

function isNextRedirect(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}
