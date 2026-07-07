"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { RoomContent, Difficulty } from "@/lib/content/types";
import { DIFFICULTY_LABEL } from "@/lib/content/rooms";
import { loadRoomOverrides, saveRoomOverride } from "@/lib/content/overrides";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaderRow {
  id: string;
  score: number;
  accuracy: number;
  user: string;
  room: string;
}

export interface ParticipantRow {
  id: string;
  name: string;
  email: string;
  role: string;
  sessions: number;
  institution: string | null;
  lastActive: string | null;
}

export function AdminTabs({
  rooms,
  leaderboard,
  participants,
  dbLive,
}: {
  rooms: RoomContent[];
  leaderboard: LeaderRow[];
  participants: ParticipantRow[];
  dbLive: boolean;
}) {
  const initial = rooms[0];
  const initialOverride = loadRoomOverrides()[initial.slug];

  const [selected, setSelected] = useState(initial.slug);
  const room = rooms.find((r) => r.slug === selected)!;

  const [title, setTitle] = useState(initialOverride?.title ?? initial.title);
  const [summary, setSummary] = useState(initialOverride?.summary ?? initial.summary);
  const [difficulty, setDifficulty] = useState(
    (initialOverride?.difficulty as Difficulty | undefined) ?? initial.difficulty
  );
  const [configJson, setConfigJson] = useState(
    JSON.stringify(initialOverride?.config ?? initial.config, null, 2)
  );

  const selectRoom = useCallback(
    (slug: string) => {
      const o = loadRoomOverrides()[slug];
      const r = rooms.find((x) => x.slug === slug)!;
      setSelected(slug);
      setTitle(o?.title ?? r.title);
      setSummary(o?.summary ?? r.summary);
      setDifficulty((o?.difficulty as Difficulty | undefined) ?? r.difficulty);
      setConfigJson(JSON.stringify(o?.config ?? r.config, null, 2));
    },
    [rooms]
  );

  return (
    <Tabs defaultValue="builder">
      <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
        {["builder", "participants", "leaderboard", "exports"].map((t) => (
          <TabsTrigger
            key={t}
            value={t}
            className="rounded-none border-b border-transparent px-0 pb-3 text-sm capitalize text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            {t === "builder" ? "Experiment Builder" : t}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* ── Builder ── */}
      <TabsContent value="builder" className="pt-8">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
          <div>
            <Label htmlFor="room-select" className="label-micro text-muted-foreground">
              Room
            </Label>
            <Select value={selected} onValueChange={selectRoom}>
              <SelectTrigger id="room-select" className="mt-2 w-full rounded-none border-border bg-surface">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-border bg-raised">
                {rooms.map((r) => (
                  <SelectItem key={r.slug} value={r.slug}>
                    {r.code}, {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Changes publish to the next session start. Engine parameters are
              validated against the paradigm&apos;s allowed ranges.
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              let config: Record<string, unknown>;
              try {
                config = JSON.parse(configJson) as Record<string, unknown>;
              } catch {
                toast.error("Invalid JSON in engine parameters");
                return;
              }
              saveRoomOverride(selected, { title, summary, difficulty, config });
              toast.success("Configuration saved", {
                description: `${room.code} overrides apply on the next session start.`,
              });
            }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <Label htmlFor="b-title">Title</Label>
                <Input
                  id="b-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="b-difficulty">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as Difficulty)}
                >
                  <SelectTrigger id="b-difficulty" className="mt-2 w-full rounded-none border-border bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border bg-raised">
                    {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="b-summary">Summary</Label>
              <Textarea
                id="b-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="b-config">
                Engine parameters{" "}
                <span className="font-mono text-[11px] text-faint">
                  ({room.engine})
                </span>
              </Label>
              <Textarea
                id="b-config"
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
                rows={8}
                className="mt-2 font-mono text-xs"
                spellCheck={false}
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit">Save configuration</Button>
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  const r = rooms.find((x) => x.slug === selected)!;
                  const all = loadRoomOverrides();
                  delete all[selected];
                  localStorage.setItem(
                    "lab-escape:room-overrides",
                    JSON.stringify(all)
                  );
                  selectRoom(r.slug);
                  toast.message("Reverted to defaults");
                }}
              >
                Revert to defaults
              </Button>
            </div>
          </form>
        </div>
      </TabsContent>

      {/* ── Participants ── */}
      <TabsContent value="participants" className="pt-8">
        {!dbLive ? (
          <EmptyState
            title="Participant roster requires the database"
            description="Start Postgres (docker compose up -d), run npm run db:push && npm run db:seed, then reload."
          />
        ) : participants.length === 0 ? (
          <EmptyState
            title="No participants enrolled"
            description="Accounts created via signup or the seed script appear here."
          />
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="label-micro">Name</TableHead>
                  <TableHead className="label-micro">Email</TableHead>
                  <TableHead className="label-micro">Role</TableHead>
                  <TableHead className="label-micro text-right">Sessions</TableHead>
                  <TableHead className="label-micro">Institution</TableHead>
                  <TableHead className="label-micro text-right">Last active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.email}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.role}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {p.sessions}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.institution ?? "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[11px] text-faint">
                      {p.lastActive
                        ? new Date(p.lastActive).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      {/* ── Leaderboard ── */}
      <TabsContent value="leaderboard" className="pt-8">
        {leaderboard.length === 0 ? (
          <EmptyState
            title="No scored sessions on the server yet"
            description="The leaderboard ranks completed sessions stored in Postgres. Local guest sessions stay on-device by design."
          />
        ) : (
          <div className="border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="label-micro w-12">#</TableHead>
                  <TableHead className="label-micro">Participant</TableHead>
                  <TableHead className="label-micro">Room</TableHead>
                  <TableHead className="label-micro text-right">Accuracy</TableHead>
                  <TableHead className="label-micro text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((row, i) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="text-sm">{row.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.room}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {Math.round(row.accuracy * 100)}%
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular text-primary">
                      {row.score}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      {/* ── Exports ── */}
      <TabsContent value="exports" className="pt-8">
        <div className="max-w-xl space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Exports contain trial-level rows for every stored session:
            stimulus descriptor, expected and actual response, correctness, and
            reaction time, plus the session seed for exact replay.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <a href="/api/export?format=csv&anonymize=1">Download CSV (anonymized)</a>
            </Button>
            <Button asChild variant="secondary">
              <a href="/api/export?format=json&anonymize=1">Download JSON</a>
            </Button>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-faint">
            Identified exports require RESEARCHER or ADMIN role and an active
            consent record for each included participant.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
