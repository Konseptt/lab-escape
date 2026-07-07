import type { Metadata } from "next";

export const siteConfig = {
  name: "Lab Escape",
  tagline: "Measured psychology rooms",
  description:
    "Landmark cognitive paradigms (Stroop, inattentional blindness, DRM, Asch, Milgram, and more) rebuilt as interactive rooms with trial-level logging for training, teaching, and research.",
  locale: "en_US",
  twitterHandle: "@labescape",
} as const;

export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = siteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${siteConfig.name} · ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "psychology experiments",
    "cognitive science",
    "Stroop task",
    "inattentional blindness",
    "change blindness",
    "false memory DRM",
    "Asch conformity",
    "Milgram obedience",
    "working memory",
    "prospect theory",
    "reaction time",
    "research platform",
    "psychology education",
    "escape room learning",
  ],
  authors: [{ name: "Lab Escape" }],
  creator: "Lab Escape",
  publisher: "Lab Escape",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "education",
};

export function privatePageMetadata(title: string): Metadata {
  return {
    title,
    robots: { index: false, follow: false },
  };
}

export function pageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
}): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}
