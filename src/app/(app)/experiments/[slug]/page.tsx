import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CourseJsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock } from "lucide-react";
import { getRoom, getWing, ROOMS } from "@/lib/content/rooms";
import { SubjectPathway } from "@/components/subject-pathway";
import { UxMilestone } from "@/components/ux/ux-milestone";
import { PageHeader } from "@/components/page-header";
import { DifficultyMeter } from "@/components/room-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  if (!room) return { title: "Experiment" };
  return pageMetadata({
    title: `${room.code} ${room.title}`,
    description: `${room.paradigm}: ${room.summary}`,
    path: `/experiments/${slug}`,
    keywords: [
      room.paradigm,
      room.domain,
      room.originalStudy.researchers[0],
      "psychology experiment",
      "reaction time task",
    ],
  });
}

export default async function ExperimentIntroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();
  const wing = getWing(room.wing);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <CourseJsonLd
        name={room.title}
        description={room.summary}
        url={`/experiments/${room.slug}`}
      />
      <UxMilestone type="briefing" id={room.slug} />
      <PageHeader
        eyebrow={`${room.code} · ${wing?.name ?? ""}`}
        title={room.title}
        description={room.summary}
        actions={
          <Button asChild size="lg" className="h-11 px-6">
            <Link href={`/play/${room.slug}`}>
              Begin session <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <SubjectPathway current="brief" roomSlug={room.slug} className="mt-8" />

      <div className="mt-8">
        <ResearchProtocolPanel protocol={room.research} />
      </div>

      {/* Spec row */}
      <div className="grid grid-cols-2 gap-px border-x border-b border-border bg-border sm:grid-cols-4">
        <div className="bg-background p-5">
          <p className="label-micro mb-2 text-muted-foreground">Difficulty</p>
          <DifficultyMeter level={room.difficulty} />
        </div>
        <div className="bg-background p-5">
          <p className="label-micro mb-2 text-muted-foreground">Estimated time</p>
          <p className="inline-flex items-center gap-1.5 text-sm">
            <Clock className="size-3.5 text-faint" aria-hidden="true" />
            {room.durationMin} minutes
          </p>
        </div>
        <div className="bg-background p-5">
          <p className="label-micro mb-2 text-muted-foreground">Paradigm</p>
          <p className="text-sm">{room.paradigm}</p>
        </div>
        <div className="bg-background p-5">
          <p className="label-micro mb-2 text-muted-foreground">First published</p>
          <p className="font-mono text-sm tabular">{room.originalStudy.year}</p>
        </div>
      </div>

      <div className="mt-14 grid gap-14 md:grid-cols-[1.5fr_1fr]">
        <div className="space-y-12">
          <section aria-labelledby="concept-h">
            <h2 id="concept-h" className="mb-4 text-xl font-medium tracking-tight">
              The concept
            </h2>
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
              {room.concept}
            </p>
          </section>

          <section aria-labelledby="background-h">
            <h2 id="background-h" className="mb-4 text-xl font-medium tracking-tight">
              Scientific background
            </h2>
            <p className="text-[0.9375rem] leading-relaxed text-muted-foreground">
              {room.background}
            </p>
            <p className="mt-6 border-l-2 border-border pl-4 font-mono text-xs leading-relaxed text-faint">
              {room.originalStudy.citation}
            </p>
          </section>
        </div>

        <aside className="space-y-10">
          <section aria-labelledby="goals-h">
            <h2 id="goals-h" className="label-micro mb-4 text-muted-foreground">
              Learning objectives
            </h2>
            <ol className="space-y-3">
              {room.learningGoals.map((goal, i) => (
                <li key={goal} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-mono text-[11px] text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-muted-foreground">{goal}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="skills-h">
            <h2 id="skills-h" className="label-micro mb-4 text-muted-foreground">
              Skills tested
            </h2>
            <div className="flex flex-wrap gap-2">
              {room.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="outline"
                  className="rounded-none border-border font-normal text-muted-foreground"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </section>

          <section aria-labelledby="study-h">
            <h2 id="study-h" className="label-micro mb-4 text-muted-foreground">
              Original study
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-faint">Researchers</dt>
                <dd className="mt-0.5">{room.originalStudy.researchers.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-xs text-faint">Sample</dt>
                <dd className="mt-0.5 text-muted-foreground">{room.originalStudy.sample}</dd>
              </div>
              <div>
                <dt className="text-xs text-faint">Key finding</dt>
                <dd className="mt-0.5 text-muted-foreground">{room.originalStudy.finding}</dd>
              </div>
            </dl>
          </section>

          <div className="border-t border-border pt-6">
            <Button asChild className="w-full">
              <Link href={`/play/${room.slug}`}>
                Enter {room.code} <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-faint">
              Trial-level data is recorded. You can export or delete it at any time.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
