import { notFound } from "next/navigation";
import { getRoom, ROOMS } from "@/lib/content/rooms";
import { PlayClient } from "./play-client";

export function generateStaticParams() {
  return ROOMS.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoom(slug);
  return { title: room ? `${room.title} · In Session` : "In Session" };
}

export default async function PlayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoom(slug);
  if (!room) notFound();
  return <PlayClient room={room} />;
}
