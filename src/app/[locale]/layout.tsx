import { type Locale, routing } from "@/i18n/routing";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { type PropsWithChildren } from "react";

import { BaseLayout } from "@/components/base-layout";

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
    <BaseLayout locale={locale} brand={title}>
      {children}
    </BaseLayout>
  );
}
