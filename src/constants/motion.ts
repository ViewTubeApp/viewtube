import { type AnimationProps, type Variants } from "motion/react";

export const MOTION_DURATION = 0.25;

export const motions = {
  fade: {
    in: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    } satisfies AnimationProps,
    out: {
      initial: { opacity: 1 },
      animate: { opacity: 0 },
      exit: { opacity: 1 },
    } satisfies AnimationProps,
  },

  stagger: {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, duration: MOTION_DURATION },
      },
    } satisfies Variants,
    item: {
      hidden: { opacity: 0 },
      show: { opacity: 1 },
    } satisfies Variants,
  },
} as const;
