import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyPage() {
  return (
    <div className="text-center">
      <MailCheck className="mx-auto size-8 text-primary" strokeWidth={1.5} aria-hidden="true" />
      <h1 className="text-display mt-6 text-3xl">Check your email</h1>
      <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
        A verification link has been sent to your address. Open it on this
        device to finish signing in.
      </p>
      <p className="mt-8 text-sm text-muted-foreground">
        Wrong address?{" "}
        <Link href="/login" className="text-foreground underline underline-offset-4 hover:text-primary">
          Start over
        </Link>
      </p>
    </div>
  );
}
