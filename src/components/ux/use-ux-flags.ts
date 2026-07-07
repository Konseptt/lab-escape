"use client";

import { useEffect, useState } from "react";
import { uxFlags } from "@/lib/ux/progress";

type UxFlagSet = ReturnType<typeof uxFlags>;

export function useUxFlags(): UxFlagSet {
  const [flags, setFlags] = useState<UxFlagSet>(() => uxFlags());

  useEffect(() => {
    const refresh = () => setFlags(uxFlags());
    window.addEventListener("lab-escape:ux", refresh);
    return () => window.removeEventListener("lab-escape:ux", refresh);
  }, []);

  return flags;
}
