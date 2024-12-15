"use client";

import { BarChart, Menu, PlusCircle } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useSidebarStore } from "@/lib/store/sidebar";
import { IconButton } from "./icon-button";
import { SearchBar } from "./searchbar";
import { Suspense } from "react";
import { Skeleton } from "./ui/skeleton";
import { env } from "@/env";
import { useSelectedLayoutSegment } from "next/navigation";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();

  const segment = useSelectedLayoutSegment();
  const { toggleSidebar } = useSidebarStore();

  const isHome = segment === null;
  const isAdmin = !!session?.user || env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <IconButton icon={Menu} onClick={toggleSidebar} />
          <Link href="/">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-semibold uppercase tracking-tight text-primary transition-colors hover:text-primary/90"
            >
              {env.NEXT_PUBLIC_BRAND}
            </motion.h2>
          </Link>
        </div>
        {isHome && (
          <Suspense fallback={<Skeleton className="ml-auto h-[40px] max-w-2xl flex-1" />}>
            <SearchBar.Desktop />
          </Suspense>
        )}
        {isAdmin && (
          <>
            {!isHome && <div className="ml-auto" />}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <IconButton href="/admin/upload" icon={PlusCircle} />
              <IconButton href="/admin/dashboard" icon={BarChart} />
            </motion.div>
          </>
        )}
      </div>
    </motion.header>
  );
}
