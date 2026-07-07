"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NextAction } from "@/lib/ux/journey";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NextActionBar({
  action,
  className,
}: {
  action: NextAction;
  className?: string;
}) {
  return (
    <aside
      aria-label="Recommended next step"
      className={cn(
        "fiducial panel flex flex-col gap-4 border-l-[3px] border-l-primary p-5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <p className="label-micro text-faint">Next step</p>
        <p className="mt-1.5 text-base font-medium tracking-tight">{action.label}</p>
        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {action.rationale}
        </p>
      </div>
      <Button asChild size="lg" className="h-10 shrink-0 px-5">
        <Link href={action.href}>
          Continue
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </aside>
  );
}
