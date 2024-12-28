"use client";

import { env } from "@/env";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { Link, usePathname } from "@/i18n/routing";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { type FC, useRef } from "react";

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
} from "@/components/ui/sidebar";

import { BrandLogo } from "./brand-logo";

type SidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar: FC<SidebarProps> = (props) => {
  const pathname = usePathname();
  const { status } = useSession();

  const t = useTranslations("navigation");

  const items = useNavigationItems();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isAdmin = status === "authenticated" || env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <Sidebar {...props}>
      <SidebarContent ref={sidebarRef}>
        <BrandLogo className="shrink-0" contentClassName="h-14 pl-2 pt-3" />
        <hr />
        <SidebarGroup>
          {isAdmin && (
            <SidebarGroupLabel>
              <motion.div {...motions.slide.x.in}>{t("public.title")}</motion.div>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.public.map((item) => (
                <SidebarMenuItem key={item.title} {...motions.slide.x.in}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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
              <motion.div {...motions.slide.x.in}>{t("admin.title")}</motion.div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.admin.map((item) => (
                  <SidebarMenuItem key={item.title} {...motions.slide.x.in}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
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
