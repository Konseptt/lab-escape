import Link from "next/link";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute inset-0 dot-grid" aria-hidden="true" />
      <header className="relative z-10 flex h-16 items-center border-b border-border px-6">
        <Link href="/" aria-label="Lab Escape home">
          <Logo variant="header" />
        </Link>
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="relative z-10 border-t border-border px-6 py-4">
        <p className="font-mono text-[11px] text-faint">
          Consent-first. Your data belongs to you.
        </p>
      </footer>
    </div>
  );
}
