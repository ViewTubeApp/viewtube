"use client";

import * as motion from "motion/react-client";
import { type FC } from "react";

import { motions } from "@/constants/motion";

import { AdaptiveBrandLogo } from "./adaptive-brand-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { NoSSR } from "./no-ssr";
import { Searchbar } from "./searchbar";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "./ui/sidebar";

export const Header: FC = () => {
  return (
    <motion.header
      {...motions.slide.y.in}
      className="w-full z-50 relative border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
    >
      <div className="flex h-12 lg:h-16 items-center px-2 lg:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger />
          <AdaptiveBrandLogo />
        </div>

        <Searchbar className="mr-2 lg:ml-4" />
        <LocaleSwitcher className="mr-2 lg:mr-4" />
        <NoSSR>
          <ThemeToggle />
        </NoSSR>
      </div>
    </motion.header>
  );
};
