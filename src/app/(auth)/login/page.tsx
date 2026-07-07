import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div>
      <p className="label-micro mb-3 text-faint">Access</p>
      <h1 className="text-display text-3xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sync sessions across devices. Guest mode keeps data local.
      </p>
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
