"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import {
  login,
  signup,
  requestPasswordReset,
  resetPassword,
  type AuthActionState,
} from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
      {message}
    </p>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

const initial: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FieldError message={state.error} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Forgot?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <SubmitButton pending={pending}>Sign in</SubmitButton>
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, initial);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FieldError message={state.error} />
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" required placeholder="Ada Lovelace" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          aria-describedby="password-hint"
        />
        <p id="password-hint" className="text-[11px] text-faint">
          At least 10 characters.
        </p>
      </div>
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  if (state.ok) {
    return (
      <div role="status" className="border border-border bg-surface px-4 py-5 text-sm leading-relaxed text-muted-foreground">
        If an account exists for that address, a reset link is on its way.
        Check your inbox.
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4" noValidate>
      <FieldError message={state.error} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
        />
      </div>
      <SubmitButton pending={pending}>Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initial);

  if (state.ok) {
    return (
      <div role="status" className="border border-border bg-surface px-4 py-5 text-sm leading-relaxed text-muted-foreground">
        Password updated. You can{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          sign in
        </Link>{" "}
        with your new password.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4" noValidate>
      <FieldError message={state.error} />
      <input type="hidden" name="token" value={token} />
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          aria-describedby="reset-password-hint"
        />
        <p id="reset-password-hint" className="text-[11px] text-faint">
          At least 10 characters.
        </p>
      </div>
      <SubmitButton pending={pending}>Update password</SubmitButton>
    </form>
  );
}
