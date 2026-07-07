import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/components/auth/auth-forms";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div>
      <p className="label-micro mb-3 text-faint">Account</p>
      <h1 className="text-display text-3xl">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Trial-level logging and export. You can also play as a guest without signing up.
      </p>
      <div className="mt-8 space-y-6">
        <SignupForm />
        <OAuthButtons />
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
