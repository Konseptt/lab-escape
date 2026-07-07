import { NextResponse } from "next/server";
import { withFallback, db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbOk = await withFallback(
    () => db.$queryRaw`SELECT 1`.then(() => true),
    false
  );

  return NextResponse.json(
    {
      status: "ok",
      db: dbOk ? "up" : "down",
      time: new Date().toISOString(),
    },
    { status: 200 }
  );
}
