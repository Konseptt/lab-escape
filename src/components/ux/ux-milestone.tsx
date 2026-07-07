"use client";

import { useEffect } from "react";
import { markUxMilestone } from "@/lib/ux/progress";

export function UxMilestone({ type, id }: { type: "briefing" | "debrief" | "science"; id: string }) {
  useEffect(() => {
    markUxMilestone(type, id);
  }, [type, id]);
  return null;
}
