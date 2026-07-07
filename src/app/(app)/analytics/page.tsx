import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { AnalyticsClient } from "./analytics-client";

export const metadata: Metadata = privatePageMetadata("Cognitive Profile");

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
