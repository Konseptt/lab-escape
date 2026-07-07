import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { AchievementsClient } from "./achievements-client";

export const metadata: Metadata = privatePageMetadata("Achievements");

export default function AchievementsPage() {
  return <AchievementsClient />;
}
