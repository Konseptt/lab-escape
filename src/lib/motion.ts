/**
 * Motion system.
 *
 * One physical language for the whole product: short distances, high damping,
 * no bounce on functional UI. Springs are used for interactive objects,
 * tweens with ease-out-expo for entrances. Durations stay under 500ms.
 */
import type { Transition, Variants } from "framer-motion";

export const spring: Transition = {
  type: "spring",
  stiffness: 480,
  damping: 42,
  mass: 0.9,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 34,
  mass: 1,
};

export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

/** Standard entrance: 8px rise + fade. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

/** Staggered container for lists and grids. */
export const stagger = (delay = 0.05): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: delay } },
});

/** Fade only, for elements that must not shift layout. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

/** Viewport settings for scroll-triggered reveals. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
