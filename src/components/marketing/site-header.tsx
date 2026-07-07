import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { getViewer } from "@/lib/session";

export async function SiteHeader() {
  const viewer = await getViewer();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link href="/" aria-label="Lab Escape home">
          <Logo variant="header" />
        </Link>
        <nav aria-label="Site" className="hidden items-center gap-8 md:flex">
          <Link
            href="/experiments"
            className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            Experiments
          </Link>
          <Link
            href="/#method"
            className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            Method
          </Link>
          <Link
            href="/#institutions"
            className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            Institutions
          </Link>
          <Link
            href="/research"
            className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
          >
            Research
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {viewer ? (
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard">Open Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost" className="text-muted-foreground">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
