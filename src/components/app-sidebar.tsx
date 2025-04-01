"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigationItems } from "@/hooks/use-navigation-items";
import { Link, usePathname } from "@/i18n/navigation";
import * as motion from "motion/react-client";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type FC, useRef } from "react";
import { P, match } from "ts-pattern";

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

type SidebarProps = React.ComponentProps<typeof Sidebar> & {
  admin: boolean;
};

export const AppSidebar: FC<SidebarProps> = ({ admin, ...props }) => {
  const t = useTranslations();

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

  const { toggleSidebar } = useSidebar();

  const items = useNavigationItems();
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <Sidebar {...props}>
      <SidebarContent ref={sidebarRef}>
        <BrandLogo className="shrink-0" contentClassName="h-14 pl-2 pt-3" />
        <hr />
        <SidebarGroup>
          {admin && (
            <SidebarGroupLabel>
              <motion.div {...motions.slide.x.in}>{t("public")}</motion.div>
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
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {admin && <hr className="-mb-2" />}
        {admin && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <motion.div {...motions.slide.x.in}>{t("admin")}</motion.div>
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
                      <Link href={item.url} prefetch>
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
