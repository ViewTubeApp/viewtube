"use client";

import { motion } from "motion/react";
import { MENU_ITEMS, CATEGORIES } from "@/constants/navigation";
import { cn } from "@/lib/clsx";
import { useSidebarStore } from "@/lib/store/sidebar";
import { NavigationSection } from "./sidebar-navigation";
import { CategoriesSection } from "./sidebar-categories";
import { SidebarOverlay } from "./sidebar-overlay";

export function Sidebar() {
  const { isOpen } = useSidebarStore();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={cn(
          "fixed bottom-0 left-0 top-[7.5rem] z-40 w-64 border-r bg-card md:top-16 lg:translate-x-0",
          !isOpen && "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="scrollbar-hidden h-[calc(100vh-7.5rem)] space-y-4 overflow-y-auto py-4 md:h-[calc(100vh-4rem)]">
          <NavigationSection items={MENU_ITEMS} variants={itemVariants} />
          <CategoriesSection items={CATEGORIES} variants={itemVariants} />
        </div>
      </motion.aside>
      <SidebarOverlay isOpen={isOpen} />
    </>
  );
}
