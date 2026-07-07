import { NextResponse } from "next/server";
import { withFallback, db } from "@/lib/db";
import { ROOMS } from "@/lib/content/rooms";

/** Room catalog. Serves the seeded database rows, falling back to bundled content. */
export async function GET() {
  const rooms = await withFallback(
    () =>
      db.room.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ wing: { ordinal: "asc" } }, { ordinal: "asc" }],
        include: { wing: true },
      }),
    null
  );
  if (rooms) return NextResponse.json({ rooms, source: "db" });
  return NextResponse.json({ rooms: ROOMS, source: "content" });
}
