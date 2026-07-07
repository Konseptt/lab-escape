import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { ResultsClient } from "./results-client";

export const metadata: Metadata = privatePageMetadata("Session Results");

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <ResultsClient sessionId={sessionId} />;
}
