import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ExperimentsClient } from "./experiments-client";

export const metadata: Metadata = pageMetadata({
  title: "Experiment catalog",
  description:
    "Ten psychology paradigms in wing order: attention, memory, decision, executive control, and social influence. Briefing, session, debrief, literature.",
  path: "/experiments",
  keywords: ["psychology experiments list", "cognitive paradigms", "Stroop", "DRM", "Asch"],
});

export default function ExperimentsPage() {
  return <ExperimentsClient />;
}
