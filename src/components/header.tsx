"use client";

import * as motion from "motion/react-client";
import { type FC } from "react";

import { motions } from "@/constants/motion";

import { ChristmasLights } from "./christmas-lights";
import { LocaleSwitcher } from "./locale-switcher";
import { Searchbar } from "./searchbar";
import { SidebarTrigger } from "./ui/sidebar";
import { AdaptiveBrandLogo } from "./adaptive-brand-logo";

export const Header: FC = () => {

  return (
    <motion.header
      {...motions.slide.y.in}
      className="w-full z-50 relative border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
    >
      <div className="flex h-16 items-center pl-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger />
          <AdaptiveBrandLogo />
        </div>

        <Searchbar />

        <div className="mr-2">
          <LocaleSwitcher />
        </div>
      </div>

      <ChristmasLights />
    </motion.header>
  );
};
