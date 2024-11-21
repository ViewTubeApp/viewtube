"use client";

import { motion } from "motion/react";
import { spring } from "@/constants/animations";
import { cn } from "@/lib/utils";
import { type PropsWithChildren } from "react";
import { useSidebarStore } from "@/lib/store/sidebar";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function LayoutContent({ children }: PropsWithChildren) {
  const { isOpen } = useSidebarStore();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <motion.main
          initial={false}
          animate={{ paddingLeft: isOpen ? "16rem" : "1rem" }}
          transition={spring}
          className={cn("flex-1 py-4 pr-4", "max-lg:!pl-4")}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}