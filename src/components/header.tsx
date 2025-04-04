"use client";

import { ClerkLoaded, ClerkLoading, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CircleUser, Cog, LogIn, Palette } from "lucide-react";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { type FC } from "react";

import { motions } from "@/constants/motion";

import { AdaptiveBrandLogo } from "./adaptive-brand-logo";
import { LocaleSwitcher } from "./locale-switcher";
import { NoSSR } from "./no-ssr";
import { Searchbar } from "./searchbar";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { IconButton } from "./ui/icon-button";
import { Label } from "./ui/label";
import { SidebarTrigger } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

export const Header: FC = () => {
  const t = useTranslations();

  return (
    <motion.header
      {...motions.slide.y.in}
      className="w-full z-50 relative border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60"
    >
      <div className="flex h-12 lg:h-16 items-center space-x-2 px-2 lg:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger />
          <AdaptiveBrandLogo />
        </div>

        <Searchbar />

        <ClerkLoading>
          <Skeleton className="size-8 rounded-full" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </ClerkLoaded>

        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="default" className="rounded-full size-9 lg:size-auto">
              <LogIn className="size-4" />
              <span className="sr-only lg:hidden">{t("sign_in")}</span>
              <span className="hidden lg:inline">{t("sign_in")}</span>
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button variant="secondary" className="hidden rounded-full lg:flex">
              <CircleUser className="size-4" />
              <span className="sr-only lg:hidden">{t("sign_up")}</span>
              <span className="hidden lg:inline">{t("sign_up")}</span>
            </Button>
          </SignUpButton>
        </SignedOut>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon={Cog} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="space-y-2">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="h-10 gap-2 justify-between" arrow={false}>
                <NoSSR>
                  <Label className="text-xs gap-1">
                    <Palette className="size-3" /> {t("theme")}
                  </Label>
                  <ThemeToggle />
                </NoSSR>
              </DropdownMenuSubTrigger>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="p-0 h-10" arrow={false}>
                <LocaleSwitcher />
              </DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};
