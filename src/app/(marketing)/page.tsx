import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Psychology experiment rooms",
  description:
    "Train on landmark paradigms with trial-level logging. Stroop, inattentional blindness, false memory, framing, conformity, and more.",
  path: "/",
  keywords: [
    "psychology training",
    "cognitive experiments online",
    "Stroop task online",
    "inattentional blindness demo",
  ],
});

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LabCanvas } from "@/components/marketing/lab-canvas";
import { SubjectPathway } from "@/components/subject-pathway";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { RoomCard } from "@/components/room-card";
import { ROOMS } from "@/lib/content/rooms";

const METHOD_STEPS = [
  {
    n: "01",
    title: "Read the protocol",
    body: "Each room ships with the original citation, learning objectives, and the exact variables the paradigm measures. You know what you are about to do.",
  },
  {
    n: "02",
    title: "Run the block",
    body: "Stimulus, response, latency, logged trial by trial with a monotonic clock. The HUD stays out of the way. The room does not.",
  },
  {
    n: "03",
    title: "Review the debrief",
    body: "Your accuracy, RT curve, and trial timeline compared to the original finding. Session notes suggest what to drill on the next rep.",
  },
];

const DEPLOYMENTS = [
  { context: "Intro psych cohorts", detail: "Stroop + framing as first-week demos" },
  { context: "Methods seminars", detail: "Trial-level CSV export same afternoon" },
  { context: "Science museums", detail: "Conformity chamber as floor exhibit" },
  { context: "Cognitive labs", detail: "Kiosk mode, consent-gated collection" },
];

const FIELD_NOTE = {
  quote:
    "We stopped asking students to define inattentional blindness on an exam. We ask them to explain why they missed the gorilla, using their own RT distribution.",
  attribution: "Teaching note · Room A-01 · selective attention wing",
};

const IMPACT = [
  { value: "10", label: "Commissioned rooms", hint: "1935–1999 paradigms" },
  { value: "48", label: "Trials / session", hint: "median, main block" },
  { value: "±1", label: "ms resolution", hint: "performance.now()" },
  { value: "CSV", label: "Export format", hint: "trial-level, anonymized" },
];

export default function LandingPage() {
  const featured = ROOMS.filter((r) =>
    ["stroop-lock", "invisible-gorilla", "conformity-chamber"].includes(r.slug)
  );

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden border-b border-border">
        <div className="absolute inset-0 dot-grid" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true">
          <LabCanvas />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/55"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-16 px-6 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-10 lg:pb-6">
          <div>
            <Reveal>
              <p className="label-micro mb-8 text-faint">
                Personal cognitive training · open source
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="text-display max-w-[14ch] text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[0.98]">
                Train on the experiments that built psychology.
              </h1>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-8 max-w-md text-[0.9375rem] leading-relaxed text-muted-foreground">
                Ten measurable rooms. Trial-level logging. After each session, a
                debrief ties your numbers to the published paradigm. For yourself,
                at your pace.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href="/dashboard">
                    Open training log
                    <ArrowRight className="size-4" strokeWidth={2} />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-11 px-4 text-muted-foreground"
                >
                  <Link href="/experiments">Protocol catalog</Link>
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.28} className="lg:mb-2">
            <div className="fiducial border border-border bg-surface p-6 text-foreground">
              <p className="label-micro text-primary">Facility readout</p>
              <dl className="mt-5 space-y-4 font-mono text-[11px]">
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-faint">Rooms commissioned</dt>
                  <dd className="tabular text-foreground">10</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-faint">Wings online</dt>
                  <dd className="tabular text-foreground">A–E</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border pb-3">
                  <dt className="text-faint">Trials / session</dt>
                  <dd className="tabular text-foreground">~48 median</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-faint">Clock source</dt>
                  <dd className="text-muted-foreground">performance.now()</dd>
                </div>
              </dl>
              <p className="marginalia mt-6 border-l-primary/40 text-[0.8125rem]">
                {FIELD_NOTE.quote}
              </p>
              <p className="mt-3 font-mono text-[10px] text-faint">
                {FIELD_NOTE.attribution}
              </p>
            </div>
          </Reveal>
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-10 pt-20 lg:pt-8">
          <Reveal delay={0.35}>
            <div className="instrument-strip justify-between">
              <span>N = 10 rooms · 5 wings</span>
              <span className="hidden sm:inline">Subject pathway enforced</span>
              <span>EST. 1935–1999</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Subject pathway (UX) ─────────────────────────────── */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <p className="label-micro mb-4 text-muted-foreground">Subject workflow</p>
            <h2 className="text-display max-w-xl text-3xl sm:text-4xl">
              One visit, four stations.
            </h2>
            <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-muted-foreground">
              The app mirrors how participants move through a real study: consent
              and briefing, measured session, personal debrief, then the original
              paper. No dead ends between them.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <SubjectPathway current="brief" className="mt-10" />
          </Reveal>
        </div>
      </section>

      {/* ── Method ───────────────────────────────────────────── */}
      <section id="method" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <Reveal>
              <p className="label-micro mb-4 text-muted-foreground">Method</p>
              <h2 className="text-display text-4xl sm:text-[2.75rem] leading-[1.05]">
                Reading the abstract is not the same as running the block.
              </h2>
            </Reveal>
            <RevealGroup className="grid gap-px border border-border bg-border">
              {METHOD_STEPS.map((step) => (
                <RevealItem key={step.n} className="bg-background p-8">
                  <p className="font-mono text-[11px] text-primary">{step.n}</p>
                  <h3 className="mt-5 text-lg font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>

      {/* ── Featured experiments ─────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <Reveal>
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label-micro mb-4 text-muted-foreground">
                  Wing samples
                </p>
                <h2 className="text-display text-4xl sm:text-5xl">
                  Start anywhere. Finish the wing.
                </h2>
              </div>
              <Link
                href="/experiments"
                className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
              >
                Full catalog <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Reveal>
          <RevealGroup className="grid gap-4 md:grid-cols-[1.1fr_0.9fr_0.9fr]">
            {featured.map((room, i) => (
              <RevealItem key={room.slug} className={i === 0 ? "md:row-span-1" : ""}>
                <RoomCard room={room} className={i === 0 ? "md:min-h-[220px]" : undefined} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Deployments ──────────────────────────────────────── */}
      <section id="institutions" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <Reveal>
            <p className="label-micro mb-10 text-faint">Typical deployments</p>
          </Reveal>
          <RevealGroup className="grid gap-px border border-border bg-border sm:grid-cols-2">
            {DEPLOYMENTS.map((d) => (
              <RevealItem
                key={d.context}
                className="flex flex-col justify-between bg-background p-8"
              >
                <p className="text-sm font-medium tracking-tight">{d.context}</p>
                <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {d.detail}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Research impact ──────────────────────────────────── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <Reveal>
              <p className="label-micro mb-4 text-muted-foreground">Instrument spec</p>
              <h2 className="text-display text-4xl sm:text-5xl">
                Built for export, not engagement metrics.
              </h2>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted-foreground">
                Every session writes stimulus identity, response, and latency per
                trial. Consent and anonymization are part of the schema, not a
                settings afterthought.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-11 px-6">
                  <Link href="/research">
                    Research portal <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="h-11 px-4 text-muted-foreground"
                >
                  <Link href="/login">Sign in to export</Link>
                </Button>
              </div>
            </Reveal>
            <RevealGroup className="grid grid-cols-2 gap-px border border-border bg-border">
              {IMPACT.map((item) => (
                <RevealItem key={item.label} className="bg-background p-8">
                  <p className="font-mono text-4xl tabular tracking-tight text-primary">
                    {item.value}
                  </p>
                  <p className="mt-3 text-[0.8125rem] font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-faint">{item.hint}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </div>
      </section>
    </>
  );
}
