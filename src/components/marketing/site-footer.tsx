import Link from "next/link";
import { LogoMark } from "@/components/logo";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "Experiments", href: "/experiments" },
      { label: "Lab Map", href: "/labs" },
      { label: "Cognitive Profile", href: "/analytics" },
      { label: "Achievements", href: "/achievements" },
    ],
  },
  {
    heading: "Institutions",
    links: [
      { label: "Research Portal", href: "/research" },
      { label: "Admin Console", href: "/admin" },
      { label: "Data Export", href: "/research#export" },
      { label: "Consent & Ethics", href: "/research#consent" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Method", href: "/#method" },
      { label: "Accessibility", href: "/settings" },
      { label: "Privacy", href: "/#" },
      { label: "Terms", href: "/#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <LogoMark className="size-6 text-foreground" />
          <p className="mt-4 max-w-xs text-[0.8125rem] leading-relaxed text-muted-foreground">
            Landmark paradigms as measured rooms. For cohorts, labs, and floor
            exhibits, not engagement dashboards.
          </p>
          <p className="mt-6 font-mono text-[11px] text-faint">
            © {new Date().getFullYear()} Lab Escape. Instrument, not toy.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <p className="label-micro mb-4 text-faint">{col.heading}</p>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </footer>
  );
}
