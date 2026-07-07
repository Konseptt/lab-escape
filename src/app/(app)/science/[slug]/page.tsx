import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CourseJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getRoom, ROOMS } from "@/lib/content/rooms";
import { PageHeader } from "@/components/page-header";
import { UxMilestone } from "@/components/ux/ux-milestone";
import { Reveal, RevealGroup, RevealItem } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { ResearchProtocolPanel } from "@/components/research/research-protocol-panel";

export function generateStaticParams() {
  return ROOMS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) return { title: "The Science" };
  return pageMetadata({
    title: `Science · ${room.title}`,
    description: `${room.paradigm} explained: ${room.whatHappened.slice(0, 155)}…`,
    path: `/science/${slug}`,
    keywords: [
      room.paradigm,
      room.domain,
      ...room.originalStudy.researchers,
      "psychology research",
    ],
  });
}

export default async function SciencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();

  const next = ROOMS.find(
    (r) => r.wing === room.wing && r.ordinal === room.ordinal + 1
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
      <CourseJsonLd
        name={`${room.title} — ${room.paradigm}`}
        description={room.concept}
        url={`/science/${room.slug}`}
      />
      <UxMilestone type="science" id={room.slug} />
      <PageHeader
        eyebrow={`Debrief · ${room.paradigm}`}
        title="The science behind the room"
        description={`${room.title} recreates ${room.originalStudy.researchers[0]}'s ${room.originalStudy.year} paradigm. Here is what it did to you, and why.`}
      />

      <article className="mt-12 space-y-16">
        <Reveal as="section">
          <h2 className="text-display text-3xl">What happened</h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {room.whatHappened}
          </p>
        </Reveal>

        <Reveal as="section">
          <h2 className="text-display text-3xl">Why it happened</h2>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            {room.whyItHappened}
          </p>
        </Reveal>

        <div className="mt-12">
          <ResearchProtocolPanel protocol={room.research} />
        </div>

        {/* Original experiment, specimen card */}
        <Reveal as="section">
          <h2 className="text-display text-3xl">The original experiment</h2>
          <div className="fiducial mt-6 border border-border text-foreground">
            <div className="grid gap-px bg-border sm:grid-cols-3">
              <div className="bg-background p-5">
                <p className="label-micro text-muted-foreground">Year</p>
                <p className="mt-2 font-mono text-2xl tabular">{room.originalStudy.year}</p>
              </div>
              <div className="bg-background p-5 sm:col-span-2">
                <p className="label-micro text-muted-foreground">Researchers</p>
                <p className="mt-2 text-lg tracking-tight">
                  {room.originalStudy.researchers.join(" · ")}
                </p>
              </div>
            </div>
            <div className="border-t border-border p-5">
              <p className="label-micro text-muted-foreground">Sample</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{room.originalStudy.sample}</p>
              <p className="label-micro mt-5 text-muted-foreground">Key finding</p>
              <p className="mt-1.5 text-sm leading-relaxed">{room.originalStudy.finding}</p>
              <p className="mt-5 border-t border-border pt-4 font-mono text-[11px] leading-relaxed text-faint">
                {room.originalStudy.citation}
              </p>
            </div>
          </div>
        </Reveal>

        <section aria-labelledby="apps-h">
          <Reveal>
            <h2 id="apps-h" className="text-display text-3xl">
              Where this shows up in the world
            </h2>
          </Reveal>
          <RevealGroup className="mt-6 space-y-px bg-border">
            {room.applications.map((app, i) => (
              <RevealItem
                key={app}
                className="flex gap-5 border border-border bg-background p-5 [&+&]:border-t-0"
              >
                <span className="font-mono text-[11px] text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{app}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <Reveal as="section">
          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-border pt-10">
            <div>
              <p className="label-micro text-muted-foreground">Continue</p>
              <p className="mt-1 text-lg font-medium tracking-tight">
                {next ? next.title : "Return to the facility"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="secondary">
                <Link href={`/play/${room.slug}`}>Run this room again</Link>
              </Button>
              <Button asChild>
                <Link href={next ? `/experiments/${next.slug}` : "/labs"}>
                  {next ? "Next room" : "Lab Map"} <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </article>
    </div>
  );
}
