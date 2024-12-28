"use client";

import { motion } from "motion/react";
import { type FC, Suspense } from "react";

import { motions } from "@/constants/motion";

import { BrandLogo } from "./brand-logo";
import { ChristmasLights } from "./christmas-lights";
import { Searchbar } from "./searchbar";
import { SidebarTrigger } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export const Header: FC = () => {
  return (
    <motion.header
      {...motions.slide.y.in}
      className="w-full z-50 relative border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center pl-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger />
          <BrandLogo className="block sm:hidden" />
        </div>

        <Suspense fallback={<Skeleton className="ml-auto h-[40px] max-w-2xl flex-1" />}>
          <Searchbar />
        </Suspense>
      </div>

      <ChristmasLights />
    </motion.header>
  );
};
