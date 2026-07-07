import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Set new password" };

/** Legacy `/reset?token=` links redirect to path-based tokens. */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (token) redirect(`/reset/${token}`);

  return (
    <div>
      <p className="label-micro mb-3 text-primary">Recovery</p>
      <h1 className="text-display text-3xl">Invalid reset link</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        This link is missing a token. Request a new one from the forgot-password
        page.
      </p>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link
          href="/forgot-password"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          Request reset link
        </Link>
      </p>
    </div>
  );
}
