"use client";

import { motion } from "motion/react";

import { motions } from "@/constants/motion";

export function PlayButton() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
      <motion.div {...motions.scale.in} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
        <svg className="h-6 w-6 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.div>
    </div>
  );
}
