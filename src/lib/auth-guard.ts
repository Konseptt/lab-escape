import { redirect } from "next/navigation";
import { getViewer, type Viewer } from "@/lib/session";

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer || viewer.isGuest) redirect("/login");
  return viewer;
}

export async function requireRole(...roles: string[]): Promise<Viewer> {
  const viewer = await requireViewer();
  if (!roles.includes(viewer.role)) redirect("/dashboard");
  return viewer;
}
