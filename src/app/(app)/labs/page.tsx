import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";
import { LabMapClient } from "./lab-map-client";

export const metadata: Metadata = privatePageMetadata("Lab Map");

export default function LabsPage() {
  return <LabMapClient />;
}
