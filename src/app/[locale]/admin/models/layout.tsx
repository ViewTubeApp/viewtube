import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";
import { type PropsWithChildren } from "react";

import { type GetModelListSchema } from "@/server/api/routers/models";

import { filters } from "@/constants/query";

import { ModelsHeader } from "./header";
import { ModelsTable } from "./table";

interface ModelsLayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: ModelsLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("models") } satisfies Metadata;
}

export default async function ModelsLayout({ children, searchParams }: ModelsLayoutProps) {
  const { page, q: searchQuery } = await adminSearchParamsCache.parse(searchParams);

  const input: GetModelListSchema = {
    ...filters.model.list.admin,
    query: searchQuery,
    offset: page.pageIndex * page.pageSize,
    limit: page.pageSize,
  };

  const models = await api.models.getModelList(input);

  return (
    <div className="lg:container lg:mx-auto">
      <ModelsHeader />
      <ModelsTable models={models} input={input} />
      {children}
    </div>
  );
}
