import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight, Database, FileJson, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { withFallback, db } from "@/lib/db";
import { ROOMS } from "@/lib/content/rooms";
import { PageHeader } from "@/components/page-header";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = pageMetadata({
  title: "Research portal",
  description:
    "Consent-first data collection, trial-level export (CSV/JSON), and research vocabulary (IV, DV, operational definitions) for institutional cohorts.",
  path: "/research",
  keywords: ["psychology research export", "trial-level data", "IRB", "experiment protocol"],
});

const PIPELINE = [
  {
    icon: ShieldCheck,
    title: "Consent",
    body: "Participants join a study with a code and sign a versioned consent record. Withdrawal is one click and deletes server-side trial data.",
  },
  {
    icon: Database,
    title: "Collection",
    body: "Every trial stores stimulus, response, correctness, and latency against a session seed, any sequence can be replayed bit-for-bit.",
  },
  {
    icon: FileSpreadsheet,
    title: "Export",
    body: "Trial-level CSV for R/SPSS/JASP, or structured JSON for computational pipelines. Anonymization is on by default.",
  },
];

export default async function ResearchPage() {
  const sessionCount = await withFallback(() => db.gameSession.count(), 0);
  const trialCount = await withFallback(() => db.trial.count(), 0);
  const participantCount = await withFallback(() => db.user.count(), 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="For institutions"
        title="Research Portal"
        description="Run cohorts, configure protocols, and export analysis-ready data. Built to satisfy an IRB, not just a syllabus."
      />

      {/* Institution dashboard */}
      <div className="grid grid-cols-3 gap-px border-x border-b border-border bg-border">
        <div className="bg-background p-6">
          <Stat label="Participants" value={participantCount} />
        </div>
        <div className="bg-background p-6">
          <Stat label="Sessions" value={sessionCount} />
        </div>
        <div className="bg-background p-6">
          <Stat label="Trials collected" value={trialCount} accent />
        </div>
      </div>

      {/* Pipeline */}
      <section aria-labelledby="vocab-h" className="mt-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="vocab-h" className="text-xl font-medium tracking-tight">
              Research vocabulary
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Each protocol documents independent variables, dependent variables, operational
              definitions, and constructs aligned with the original literature (APA-style wording).
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/research/glossary">
              Open glossary <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <ul className="mt-6 grid gap-px border border-border bg-border sm:grid-cols-2">
          {ROOMS.map((room) => (
            <li key={room.slug} className="bg-background p-4">
              <p className="font-mono text-[11px] text-faint">{room.code}</p>
              <p className="mt-1 text-sm font-medium">{room.paradigm}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                IV: {room.research.independentVariable.slice(0, 72)}
                {room.research.independentVariable.length > 72 ? "…" : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pipeline-h" className="mt-14" id="consent">
        <h2 id="pipeline-h" className="mb-6 text-xl font-medium tracking-tight">
          The data pipeline
        </h2>
        <div className="grid gap-px border border-border bg-border md:grid-cols-3">
          {PIPELINE.map((step) => (
            <div key={step.title} className="bg-background p-6">
              <step.icon className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-4 text-sm font-medium">{step.title}</h3>
              <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Export */}
      <section aria-labelledby="export-h" className="mt-14" id="export">
        <h2 id="export-h" className="mb-6 text-xl font-medium tracking-tight">
          Export
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col border border-border p-6">
            <FileSpreadsheet className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <h3 className="mt-4 text-sm font-medium">CSV, trial level</h3>
            <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
              One row per trial. Loads directly into R, JASP, SPSS, or a
              spreadsheet. Includes session seed, phase, stimulus JSON, response,
              accuracy, and RT.
            </p>
            <Button asChild size="sm" className="mt-5 self-start">
              <a href="/api/export?format=csv&anonymize=1">
                Download CSV <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>
          <div className="flex flex-col border border-border p-6">
            <FileJson className="size-4 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <h3 className="mt-4 text-sm font-medium">JSON, structured</h3>
            <p className="mt-2 flex-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
              Nested sessions with trial arrays and summary statistics, suited to
              Python/Julia pipelines and long-term archival.
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-5 self-start">
              <a href="/api/export?format=json&anonymize=1">
                Download JSON <ArrowRight className="size-3.5" />
              </a>
            </Button>
          </div>
        </div>
        <p className="mt-4 font-mono text-[11px] text-faint">
          Anonymous mode replaces identities with stable pseudonymous codes
          (P-XXXXXX). Identified export requires researcher role + consent records.
        </p>
      </section>

      {/* Protocol configuration */}
      <section aria-labelledby="protocol-h" className="mt-14">
        <h2 id="protocol-h" className="mb-6 text-xl font-medium tracking-tight">
          Protocol configuration
        </h2>
        <div className="border border-border">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Available paradigms, each configurable per study (trial counts,
              timing, adaptive vs fixed)
            </p>
            <Badge variant="outline" className="rounded-none border-border font-mono text-[10px] text-muted-foreground">
              {ROOMS.length} PARADIGMS
            </Badge>
          </div>
          <ul className="grid sm:grid-cols-2">
            {ROOMS.map((room) => (
              <li
                key={room.slug}
                className="flex items-center justify-between gap-4 border-b border-border px-6 py-3 last:border-b-0 sm:odd:border-r"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{room.title}</p>
                  <p className="font-mono text-[11px] text-faint">
                    {room.paradigm} · {room.originalStudy.year}
                  </p>
                </div>
                <Link
                  href={`/experiments/${room.slug}`}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Spec
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fiducial mt-14 border border-border p-8 text-foreground">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-lg">
            <p className="label-micro text-primary">Institutional access</p>
            <h2 className="mt-2 text-2xl font-medium tracking-tight">
              Running a course or a study?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Institution accounts add cohort management, study join codes,
              custom consent text, and dedicated data retention policies.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/signup">Request institution access</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
