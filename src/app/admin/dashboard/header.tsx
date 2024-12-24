"use client";

import { motion } from "motion/react";
import { type FC } from "react";

export const DashboardHeader: FC = () => {
  return (
    <motion.h1 className="mb-4 text-xl font-semibold sm:text-2xl" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      Content
    </motion.h1>
  );
};
