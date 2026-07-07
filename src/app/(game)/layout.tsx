import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("Session");

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-background">{children}</div>;
}
