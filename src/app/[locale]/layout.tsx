import { routing } from "@/i18n/routing";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type PropsWithChildren } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
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

  const t = await getTranslations({ locale });
  const title = `${t("title_part_start")}${t("title_part_end")}`;

  return (
    <Providers locale={locale} brand={title}>
      <AppSidebar collapsible="icon" />
      <main className="w-full flex flex-col max-w-full overflow-x-hidden">
        <Header />
        <div className="relative p-2 sm:p-4 flex-1">{children}</div>
      </main>
    </Providers>
  );
}
