"use client";

import { env } from "@/env";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import * as m from "@/paraglide/messages";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { type FC, useRef } from "react";
import { P, match } from "ts-pattern";

import { Link, usePathname } from "@/lib/i18n";

import { motions } from "@/constants/motion";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { BrandLogo } from "./brand-logo";

type SidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar: FC<SidebarProps> = (props) => {
  const isMobile = useIsMobile();

  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (url: string | { pathname: string; query: Record<string, string> }) => {
    return match(Object.fromEntries(searchParams.entries()))
      .with({ s: P.string }, ({ s }) =>
        match(url)
          .with({ query: { s: P.string } }, (url) => url.query.s === s)
          .otherwise(() => false),
      )
      .with({ m: P.string }, () => url === "/models")
      .with({ c: P.string }, () => url === "/categories")
      .otherwise(() => pathname === url);
  };

  const { status } = useSession();
  const { toggleSidebar, open, openMobile } = useSidebar();

  const items = useNavigationItems();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isAdmin = status === "authenticated" || env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <Sidebar {...props}>
      <SidebarContent ref={sidebarRef}>
        <BrandLogo className="shrink-0" contentClassName="h-14 pl-2 pt-3" hideText={!open && !openMobile} />
        <hr />
        <SidebarGroup>
          {isAdmin && (
            <SidebarGroupLabel>
              <motion.div {...motions.slide.x.in}>{m.public_str()}</motion.div>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.public.map((item) => (
                <SidebarMenuItem key={item.title} {...motions.slide.x.in}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && <hr className="-mb-2" />}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <motion.div {...motions.slide.x.in}>{m.admin()}</motion.div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.admin.map((item) => (
                  <SidebarMenuItem key={item.title} {...motions.slide.x.in}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      onClick={isMobile ? toggleSidebar : undefined}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};
