"use client";

import { motion } from "motion/react";
import { type FC, type ReactNode } from "react";

import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title: ReactNode;
  extra?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, extra }) => {
  return (
    <motion.div className="mb-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        {extra}
      </div>
      <Separator className="mt-4 relative -left-2 w-[calc(100%+1rem)] sm:-left-4 sm:w-[calc(100%+2rem)]" />
    </motion.div>
  );
};
