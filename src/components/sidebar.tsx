"use client";

import { type Variants, motion } from "motion/react";

import { useSidebarStore } from "@/lib/store/sidebar";

import { CATEGORIES, MENU_ITEMS } from "@/constants/router";

import { CategoriesSection } from "./sidebar-categories";
import { NavigationSection } from "./sidebar-navigation";
import { SidebarOverlay } from "./sidebar-overlay";

const sidebarVariants: Variants = {
  open: { x: 0 },
  closed: { x: "-100%" },
};

const itemVariants: Variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -20 },
};

export function Sidebar() {
  const { isOpen } = useSidebarStore();

  return (
    <>
      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ bounce: 0, duration: 0.3, ease: "anticipate" }}
        className="fixed bottom-0 left-0 top-16 z-40 w-64 border-r bg-card md:top-16"
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
