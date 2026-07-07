import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type PathwayStep = "brief" | "session" | "debrief" | "literature";

const STEPS: {
  id: PathwayStep;
  n: string;
  label: string;
  hint: string;
  href?: (slug: string) => string;
}[] = [
  {
    id: "brief",
    n: "01",
    label: "Briefing",
    hint: "Protocol & objectives",
    href: (slug) => `/experiments/${slug}`,
  },
  {
    id: "session",
    n: "02",
    label: "Session",
    hint: "Trials & responses",
    href: (slug) => `/play/${slug}`,
  },
  {
    id: "debrief",
    n: "03",
    label: "Debrief",
    hint: "Your data",
  },
  {
    id: "literature",
    n: "04",
    label: "Literature",
    hint: "Original study",
    href: (slug) => `/science/${slug}`,
  },
];

export function SubjectPathway({
  current,
  roomSlug,
  sessionId,
  className,
}: {
  current: PathwayStep;
  roomSlug?: string;
  sessionId?: string;
  className?: string;
}) {
  const order = STEPS.map((s) => s.id);
  const currentIdx = order.indexOf(current);

  return (
    <nav aria-label="Subject pathway" className={cn("border border-border", className)}>
      <ol className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
        {STEPS.map((step, i) => {
          const done = i < currentIdx;
          const active = step.id === current;
          let href: string | undefined;
          if (roomSlug && step.href) href = step.href(roomSlug);
          if (step.id === "debrief" && sessionId) href = `/results/${sessionId}`;

          const content = (
            <>
              <p
                className={cn(
                  "font-mono text-[11px]",
                  active ? "text-primary" : done ? "text-muted-foreground" : "text-faint"
                )}
              >
                {step.n}
              </p>
              <p
                className={cn(
                  "mt-2 flex items-center gap-1.5 text-sm font-medium tracking-tight",
                  active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
                {done ? (
                  <Check className="size-3.5 text-success" strokeWidth={2} aria-hidden="true" />
                ) : null}
              </p>
              <p className="mt-0.5 text-[11px] text-faint">{step.hint}</p>
              {active ? (
                <span
                  className="mt-3 block h-px w-8 bg-primary"
                  aria-hidden="true"
                />
              ) : null}
            </>
          );

          return (
            <li
              key={step.id}
              className={cn(
                "relative p-4 sm:p-5",
                active
                  ? "border-l-[3px] border-l-primary bg-surface pl-[calc(1.25rem-2px)]"
                  : "border-l-[3px] border-l-transparent bg-background",
                done && !active && "opacity-75"
              )}
              aria-current={active ? "step" : undefined}
            >
              {href && !active ? (
                <Link
                  href={href}
                  className="block transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
