import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5", className)}
    >
      <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 22V13h5M17 2v9h-5M12 13v4"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="7.5" r="1.4" fill="var(--primary)" stroke="none" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  variant?: "compact" | "header";
};

export function Logo({ className, variant = "compact" }: LogoProps) {
  if (variant === "header") {
    return (
      <span className={cn("inline-flex items-center gap-3 text-foreground", className)}>
        <span className="relative flex size-10 shrink-0 items-center justify-center border border-border bg-surface">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-px -top-px size-2 border-l border-t border-primary/50"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-px -right-px size-2 border-b border-r border-primary/50"
          />
          <LogoMark className="size-6 text-foreground" />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-serif text-[1.0625rem] tracking-tight">Lab Escape</span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-faint">
            Psychology rooms
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5 text-foreground", className)}>
      <LogoMark />
      <span className="label-micro tracking-[0.22em] text-[0.75rem]">Lab&nbsp;Escape</span>
    </span>
  );
}
