"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Fixation cross shown between trials. Small, dim, center. */
export function Fixation() {
  return (
    <div
      aria-hidden="true"
      className="flex h-40 items-center justify-center font-mono text-xl text-faint"
    >
      +
    </div>
  );
}

/** Stage: fixed-height centered stimulus area so nothing shifts. */
export function Stage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[60dvh] w-full flex-col items-center justify-center px-6",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Large response key button with keycap label. */
export function ResponseKey({
  label,
  keycap,
  onPress,
  disabled,
  swatch,
}: {
  label: string;
  keycap?: string;
  onPress: () => void;
  disabled?: boolean;
  swatch?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex min-w-24 flex-col items-center gap-2 border border-border bg-surface px-5 py-4",
        "transition-colors hover:border-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
        "disabled:opacity-40"
      )}
    >
      {swatch ? (
        <span className="size-3" style={{ background: swatch }} aria-hidden="true" />
      ) : null}
      <span className="text-sm">{label}</span>
      {keycap ? (
        <span className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase text-faint">
          {keycap}
        </span>
      ) : null}
    </motion.button>
  );
}

/** Inter-block interstitial with a short message. */
export function Interstitial({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-md text-center"
    >
      <p className="label-micro text-primary">{eyebrow}</p>
      <h2 className="text-display mt-4 text-3xl">{title}</h2>
      {body ? (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </motion.div>
  );
}
