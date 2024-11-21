"use client";

import { Menu, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import { spring } from "@/constants/animations";
import Link from "next/link";
import { useSidebarStore } from "@/lib/store/sidebar";
import { IconButton } from "./icon-button";
import { SearchBar } from "./searchbar";

export function Header() {
  const { toggleSidebar } = useSidebarStore();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={spring}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <IconButton icon={Menu} onClick={toggleSidebar} />
          <Link href="/">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-semibold tracking-tight text-primary transition-colors hover:text-primary/90"
            >
              ViewTube
            </motion.h2>
          </Link>
        </div>
        <SearchBar.Desktop />
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2"
        >
          <IconButton href="/upload" icon={PlusCircle} />
        </motion.div>
      </div>
      <SearchBar.Mobile />
    </motion.header>
  );
}
