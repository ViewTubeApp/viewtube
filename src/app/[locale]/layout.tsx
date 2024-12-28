import { env } from "@/env";
import { type Locale, routing } from "@/i18n/routing";
import "@/styles/globals.css";
import { type Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { type PropsWithChildren } from "react";

import { BaseLayout } from "@/components/base-layout";

const brand = env.NEXT_PUBLIC_BRAND.toUpperCase();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Omit<LocaleLayoutProps, "children">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });

  return {
    title: {
      template: `%s | ${brand}`,
      default: `${t("description")} | ${brand}`,
    },
    description: t("description"),
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  } satisfies Metadata;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <BaseLayout locale={locale} brand={brand}>
      {children}
    </BaseLayout>
  );
}
