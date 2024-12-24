"use client";

import { env } from "@/env";
import { stopPropagation } from "@/utils/react/html";
import { BarChart, Clock, Flame, Heart, Home, List, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC, useRef } from "react";

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

const items = {
  public: [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Popular",
      url: "/popular",
      icon: Flame,
    },
    {
      title: "New",
      url: "/new",
      icon: Clock,
    },
    {
      title: "Models",
      url: "/models",
      icon: Heart,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: List,
    },
  ],

  admin: [
    {
      title: "Upload",
      url: "/admin/upload",
      icon: Upload,
    },
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: BarChart,
    },
  ],
};

type SidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar: FC<SidebarProps> = (props) => {
  const pathname = usePathname();
  const { status } = useSession();

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
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                Public
              </motion.div>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.public.map((item) => (
                <SidebarMenuItem key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    onTransitionStart={stopPropagation}
                    onTransitionEnd={stopPropagation}
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
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                Admin
              </motion.div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.admin.map((item) => (
                  <SidebarMenuItem key={item.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      onTransitionStart={stopPropagation}
                      onTransitionEnd={stopPropagation}
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
