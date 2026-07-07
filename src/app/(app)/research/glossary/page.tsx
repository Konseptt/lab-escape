import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { buildGlossary } from "@/lib/content/research-vocabulary";
import { ROOMS } from "@/lib/content/rooms";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = pageMetadata({
  title: "Research glossary",
  description:
    "Operational definitions and standard terms for inattentional blindness, Stroop interference, DRM false memory, prospect theory, and related paradigms.",
  path: "/research/glossary",
  keywords: ["psychology glossary", "operational definition", "IV DV", "experimental design"],
});

export default function GlossaryPage() {
  const glossary = buildGlossary();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Research reference"
        title="Glossary"
        description="Operational definitions and standard terms used across the ten commissioned paradigms. Wording follows published experimental psychology literature."
        actions={
          <Button asChild variant="secondary" size="sm">
            <Link href="/research">
              <ArrowLeft className="size-4" />
              Research portal
            </Link>
          </Button>
        }
      />

      <p className="mt-6 text-sm text-muted-foreground">
        Each room briefing includes room-specific IVs, DVs, and operational definitions.
        This page collects shared vocabulary across{" "}
        <span className="font-mono text-xs text-foreground">{ROOMS.length}</span> protocols.
      </p>

      <dl className="mt-10 divide-y divide-border border-y border-border">
        {glossary.map(({ term, definition }) => (
          <div key={term} className="py-5">
            <dt className="text-base font-medium tracking-tight">{term}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
