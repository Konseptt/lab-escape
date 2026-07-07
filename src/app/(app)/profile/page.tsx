import type { Metadata } from "next";
import { getViewer } from "@/lib/session";
import { privatePageMetadata } from "@/lib/seo";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = privatePageMetadata("Profile");

export default async function ProfilePage() {
  const viewer = await getViewer();
  return (
    <ProfileClient
      name={viewer?.name ?? "Guest"}
      email={viewer?.email}
      isGuest={viewer?.isGuest ?? true}
    />
  );
}
