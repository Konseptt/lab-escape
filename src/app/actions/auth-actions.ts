"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/client";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { GUEST_COOKIE } from "@/lib/session";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.email("Enter a valid email"),
  password: z.string().min(10, "Use at least 10 characters"),
});

export type AuthActionState = { error?: string; ok?: boolean };

function credentialsFailed(result: string | undefined) {
  return !result || result.includes("error=");
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
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, email, password } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    // Create directly; the unique constraint on email is the race-free check.
    await db.user.create({
      data: { name, email, passwordHash, settings: { create: {} } },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "An account with this email already exists." };
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
  const email = String(formData.get("email") ?? "").trim();
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
  const email = String(formData.get("email") ?? "").trim();
  if (!z.email().safeParse(email).success) {
    return { error: "Enter a valid email address." };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomUUID();
      // TODO: no consuming /reset route exists yet.
      // Cap outstanding tokens at one per email so anonymous re-requests
      // can't flood the table.
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
    }
  } catch {
    // same response either way
  }
  return { ok: true };
}

function isNextRedirect(err: unknown) {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    String((err as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}
