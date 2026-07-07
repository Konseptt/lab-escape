import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getViewer } from "@/lib/session";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Training log",
    description: "Personal training log and session history.",
    path: "/dashboard",
  }),
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const viewer = await getViewer();
  return <DashboardClient name={viewer?.name ?? "Participant"} isGuest={viewer?.isGuest ?? true} />;
}
