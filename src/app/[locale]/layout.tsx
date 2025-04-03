import { routing } from "@/i18n/routing";
import { currentUser } from "@clerk/nextjs/server";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type PropsWithChildren } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import { PageLayout } from "@/components/page-layout";
import { Providers } from "@/components/providers";

interface RootLayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: RootLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = `${t("title_part_start")}${t("title_part_end")}`;

  return {
    title: {
      template: `%s | ${title}`,
      default: `${t("layout_description")} | ${title}`,
    },
    description: t("layout_description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  } satisfies Metadata;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const user = await currentUser();
  const t = await getTranslations({ locale });

  const title = `${t("title_part_start")}${t("title_part_end")}`;

  return (
    <Providers locale={locale} brand={title}>
      <AppSidebar admin={Boolean(user?.privateMetadata.role === "admin")} collapsible="icon" />
      <PageLayout>
        <Header />
        <PageLayout.Content>{children}</PageLayout.Content>
      </PageLayout>
    </Providers>
  );
}
