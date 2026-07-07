"use client";

import { toast } from "sonner";
import { logout } from "@/app/actions/auth-actions";
import { useSettingsStore, type SettingsState } from "@/stores/settings-store";
import { PageHeader } from "@/components/page-header";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type BoolKey = {
  [K in keyof SettingsState]: SettingsState[K] extends boolean ? K : never;
}[keyof SettingsState];

interface Row {
  key: BoolKey;
  label: string;
  detail: string;
}

const SECTIONS: { heading: string; note?: string; rows: Row[] }[] = [
  {
    heading: "Accessibility",
    note: "These apply everywhere, including inside experiment rooms.",
    rows: [
      { key: "reducedMotion", label: "Reduce motion", detail: "Disables entrance animations and ambient movement. Stimulus timing is never affected." },
      { key: "highContrast", label: "High contrast", detail: "Raises stimulus and text contrast beyond WCAG AA." },
      { key: "largeText", label: "Larger stimuli", detail: "Increases stimulus type size in every room." },
      { key: "colorblindSafe", label: "Colorblind-safe palette", detail: "Color-critical tasks add shape and label redundancy." },
    ],
  },
  {
    heading: "Input",
    rows: [
      { key: "keyboardOnly", label: "Keyboard-first mode", detail: "Surfaces key hints prominently; every action stays reachable without a pointer." },
    ],
  },
  {
    heading: "Session",
    rows: [
      { key: "sound", label: "Sound", detail: "Interface confirmation tones. Rooms never rely on audio for stimuli." },
      { key: "hints", label: "Allow hints", detail: "Show the hint control in the HUD. Hint use is recorded with your data." },
    ],
  },
  {
    heading: "Research & privacy",
    note: "You can withdraw at any time. Withdrawal deletes server-side trial data.",
    rows: [
      { key: "researchMode", label: "Research mode", detail: "Strict timing presentation: fixed inter-trial intervals, no adaptive pacing, full trial logging." },
      { key: "anonymousData", label: "Anonymous contribution", detail: "Sessions joined to studies are keyed by a pseudonymous code, never your identity." },
      { key: "shareAnalytics", label: "Product analytics", detail: "Anonymous usage events that help improve the platform. Never trial data." },
    ],
  },
];

export function SettingsClient() {
  const settings = useSettingsStore();

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Preferences persist on this device and sync to your account when signed in."
      />

      <div className="mt-4 divide-y divide-border">
        {SECTIONS.map((section) => (
          <section key={section.heading} className="py-10" aria-labelledby={`s-${section.heading}`}>
            <h2 id={`s-${section.heading}`} className="text-lg font-medium tracking-tight">
              {section.heading}
            </h2>
            {section.note ? (
              <p className="mt-1 text-xs text-muted-foreground">{section.note}</p>
            ) : null}
            <div className="mt-6 space-y-6">
              {section.rows.map((row) => (
                <div key={row.key} className="flex items-start justify-between gap-8">
                  <div className="max-w-md">
                    <Label htmlFor={`set-${row.key}`} className="text-sm">
                      {row.label}
                    </Label>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {row.detail}
                    </p>
                  </div>
                  <Switch
                    id={`set-${row.key}`}
                    checked={settings[row.key]}
                    onCheckedChange={(v) => settings.set(row.key, v)}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Language & theme */}
        <section className="py-10" aria-labelledby="s-locale">
          <h2 id="s-locale" className="text-lg font-medium tracking-tight">
            Language & appearance
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="set-language" className="text-sm">
                Language
              </Label>
              <Select
                value={settings.language}
                onValueChange={(v) => settings.set("language", v)}
              >
                <SelectTrigger id="set-language" className="mt-2 w-full rounded-none border-border bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-none border-border bg-raised">
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Theme</Label>
              <p className="mt-2 flex h-9 items-center border border-border bg-surface px-3 text-sm text-muted-foreground">
                Laboratory Dark, calibrated for stimulus presentation
              </p>
              <p className="mt-1.5 text-[11px] text-faint">
                A single calibrated theme keeps stimulus luminance comparable across
                participants.
              </p>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="py-10" aria-labelledby="s-account">
          <h2 id="s-account" className="text-lg font-medium tracking-tight">
            Account
          </h2>
          <div className="mt-6">
            <form action={logout}>
              <Button type="submit" variant="secondary">
                Sign out
              </Button>
            </form>
          </div>
        </section>

        <section className="py-10" aria-labelledby="s-data">
          <h2 id="s-data" className="text-lg font-medium tracking-tight">
            Your data
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                window.open("/api/export?format=csv&anonymize=1", "_blank");
              }}
            >
              Export everything (CSV)
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                localStorage.removeItem("lab-escape:sessions");
                toast.success("Local session data deleted", {
                  description: "Server-side deletion requests are processed within 30 days.",
                });
              }}
            >
              Delete local data
            </Button>
          </div>
          <Separator className="mt-10" />
          <p className="mt-6 font-mono text-[11px] leading-relaxed text-faint">
            Lab Escape follows a consent-first model: no trial data leaves your
            device without an explicit study enrollment or account sync.
          </p>
        </section>
      </div>
    </div>
  );
}
