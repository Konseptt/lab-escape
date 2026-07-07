"use client";

import { motion } from "framer-motion";
import { rise, stagger, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Scroll-triggered entrance wrapper. Children rise 8px and fade in once. */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "article";
}) {
  const Component = motion[Tag];
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: { opacity: 0, y: 8 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Container that staggers its Reveal-variant children. */
export function RevealGroup({
  children,
  className,
  delay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(delay)}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={rise} className={className}>
      {children}
    </motion.div>
  );
}
