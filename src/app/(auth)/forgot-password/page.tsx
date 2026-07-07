import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <p className="label-micro mb-3 text-primary">Recovery</p>
      <h1 className="text-display text-3xl">Reset your password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the email on your account and we&apos;ll send a reset link.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
