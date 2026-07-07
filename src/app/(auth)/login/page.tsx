import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <p className="label-micro mb-3 text-faint">Access</p>
      <h1 className="text-display text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sync sessions across devices. Guest mode keeps data local.
      </p>
      {error === "rate-limit" ? (
        <p
          role="alert"
          className="mt-4 border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
        >
          Too many guest attempts. Wait a minute and try again.
        </p>
      ) : null}
      <div className="mt-8 space-y-6">
        <LoginForm />
        <OAuthButtons />
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link href="/signup" className="text-foreground underline underline-offset-4 hover:text-primary">
          Create one
        </Link>
      </p>
    </div>
  );
}
