import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavLinks, MobileNav } from "./nav-links";
import { getViewer } from "@/lib/session";
import { logout } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const viewer = await getViewer();

  return (
    <div className="flex min-h-dvh w-full">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Link href="/dashboard" aria-label="Lab Escape home">
            <Logo variant="header" />
          </Link>
        </div>
        <NavLinks role={viewer?.role ?? "PLAYER"} />
        <div className="border-t border-border p-4">
          {viewer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-7 items-center justify-center border border-border font-mono text-[10px] uppercase text-muted-foreground"
                >
                  {viewer.name.slice(0, 2)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{viewer.name}</p>
                  <p className="truncate text-[11px] text-faint">
                    {viewer.isGuest ? "Guest" : viewer.email}
                  </p>
                </div>
              </div>
              {viewer.isGuest ? (
                <Button asChild size="sm" variant="secondary" className="w-full">
                  <Link href="/login">Sign in</Link>
                </Button>
              ) : (
                <form action={logout}>
                  <Button type="submit" size="sm" variant="ghost" className="w-full text-faint">
                    Sign out
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <Button asChild size="sm" className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <Link href="/dashboard" aria-label="Lab Escape home">
          <Logo variant="header" />
        </Link>
        <MobileNav role={viewer?.role ?? "PLAYER"} />
      </div>

      <main id="main" className="min-w-0 flex-1 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
