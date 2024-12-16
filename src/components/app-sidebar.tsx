"use client";

import { env } from "@/env";
import { BarChart, Calendar, Home, Inbox, Search, Settings, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import { type FC } from "react";

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
      url: "#",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
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
  const { status } = useSession();
  const isAdmin = status === "authenticated" || env.NEXT_PUBLIC_NODE_ENV === "development";

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <BrandLogo contentClassName="h-14 pl-2 pt-3" />
        <hr />
        <SidebarGroup>
          {isAdmin && (
            <SidebarGroupLabel>
              <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                Public
              </motion.span>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.public.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <motion.a initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </motion.a>
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
              <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                Admin
              </motion.span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.admin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <motion.a initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </motion.a>
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
