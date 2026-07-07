"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-start justify-center px-6 py-16">
      <p className="label-micro text-faint">Facility error</p>
      <h1 className="text-display mt-3 text-3xl">Something went wrong</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The page failed to load. Your local session data is unaffected. Try again,
        or return to the dashboard.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-[11px] text-faint">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="ghost" className="text-muted-foreground" asChild>
          <a href="/dashboard">Dashboard</a>
        </Button>
      </div>
    </div>
  );
}
