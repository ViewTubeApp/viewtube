"use client";

import { useSidebarStore } from "@/lib/store/sidebar";
import { motion, AnimatePresence } from "motion/react";

interface SidebarOverlayProps {
  isOpen: boolean;
}

export function SidebarOverlay({ isOpen }: SidebarOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm"
          onClick={() => useSidebarStore.setState({ isOpen: false })}
        />
      )}
    </AnimatePresence>
  );
}
