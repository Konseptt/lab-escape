import { cookies } from "next/headers";
import { auth } from "@/lib/auth";

export const GUEST_COOKIE = "le_guest";

export interface Viewer {
  id: string;
  name: string;
  email: string | null;
  role: string;
  isGuest: boolean;
}

export async function getViewer(): Promise<Viewer | null> {
  const session = await auth().catch(() => null);
  if (session?.user?.id) {
    return {
      id: session.user.id,
      name: session.user.name ?? "Participant",
      email: session.user.email ?? null,
      role: session.user.role ?? "PLAYER",
      isGuest: false,
    };
  }

  const jar = await cookies();
  const guest = jar.get(GUEST_COOKIE)?.value;
  if (!guest) return null;

  return {
    id: `guest_${guest}`,
    name: "Guest",
    email: null,
    role: "PLAYER",
    isGuest: true,
  };
}
