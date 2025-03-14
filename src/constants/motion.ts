import { type AnimationProps } from "motion/react";

export const MOTION_DURATION = 0.2;

export const motions = {
  fade: {
    in: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { ease: "easeOut" },
    } satisfies AnimationProps,
    out: {
      initial: { opacity: 1 },
      animate: { opacity: 0 },
      exit: { opacity: 1 },
      transition: { ease: "easeOut" },
    } satisfies AnimationProps,
  },

  scale: {
    in: {
      initial: { scale: 0 },
      animate: { scale: 1 },
      exit: { scale: 0 },
      transition: { ease: "easeOut" },
    } satisfies AnimationProps,
    reveal: {
      initial: { opacity: 0, scale: 0.85 },
      animate: { opacity: 0.25, scale: 1 },
      exit: { opacity: 0, scale: 0.85 },
      transition: { ease: "backOut", duration: 1 },
    } satisfies AnimationProps,
  },

  slide: {
    y: {
      in: {
        initial: { opacity: 0, y: -24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -24 },
        transition: { ease: "easeOut" },
      } satisfies AnimationProps,
    },
    x: {
      in: {
        initial: { opacity: 0, x: -24 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -24 },
        transition: { ease: "easeOut" },
      } satisfies AnimationProps,
    },
  },
} as const;
