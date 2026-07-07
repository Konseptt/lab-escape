"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutGrid,
  Map,
  FlaskConical,
  Activity,
  Trophy,
  User,
  Settings,
  Shield,
  Database,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const PLAYER_LINKS = [
  { href: "/dashboard", label: "Training", icon: LayoutGrid },
  { href: "/labs", label: "Lab Map", icon: Map },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/analytics", label: "Cognitive Profile", icon: Activity },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

const STAFF_LINKS = [
  { href: "/admin", label: "Admin", icon: Shield },
  { href: "/research", label: "Research Portal", icon: Database },
];

function LinkList({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isStaff = role === "ADMIN" || role === "RESEARCHER";

  const renderLink = (link: (typeof PLAYER_LINKS)[number]) => {
    const active =
      pathname === link.href || pathname.startsWith(`${link.href}/`);
    return (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3 px-5 py-2 text-[0.8125rem] transition-colors",
          active
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {active ? (
          <span
            aria-hidden="true"
            className="absolute inset-y-1 left-0 w-px bg-primary"
          />
        ) : null}
        <link.icon
          className={cn("size-4", active ? "text-primary" : "text-faint group-hover:text-muted-foreground")}
          strokeWidth={1.75}
        />
        {link.label}
      </Link>
    );
  };

  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-0.5 py-4">
      <p className="label-micro px-5 pb-2 text-faint">Facility</p>
      {PLAYER_LINKS.map(renderLink)}
      {isStaff ? (
        <>
          <p className="label-micro px-5 pb-2 pt-6 text-faint">Operations</p>
          {STAFF_LINKS.map(renderLink)}
        </>
      ) : null}
    </nav>
  );
}

export function NavLinks({ role }: { role: string }) {
  return <LinkList role={role} />;
}

export function MobileNav({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open navigation"
        className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 border-border bg-background p-0">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex h-14 items-center border-b border-border px-5">
          <span className="label-micro">Lab Escape</span>
        </div>
        <LinkList role={role} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
