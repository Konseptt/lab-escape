import type { MetadataRoute } from "next";
import { ROOMS } from "@/lib/content/rooms";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/experiments"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/research"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/research/glossary"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/labs"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/login"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/signup"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  const roomRoutes: MetadataRoute.Sitemap = ROOMS.flatMap((room) => [
    {
      url: absoluteUrl(`/experiments/${room.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
    {
      url: absoluteUrl(`/science/${room.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    },
  ]);

  return [...staticRoutes, ...roomRoutes];
}
