import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { SettingsClient } from "./settings-client";

export const metadata: Metadata = privatePageMetadata("Settings");

export default function SettingsPage() {
  return <SettingsClient />;
}
