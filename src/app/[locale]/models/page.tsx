import { type Locale } from "@/i18n/routing";
import { api } from "@/trpc/server";
import { searchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";

import { type GetModelListSchema } from "@/server/api/routers/models";

import { adminModelListQueryOptions } from "@/constants/query";

import { ModelGrid } from "./grid";

interface ModelsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: ModelsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("models") } satisfies Metadata;
}

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetModelListSchema = {
    ...adminModelListQueryOptions,
    query: query ?? undefined,
  };

  const models = await api.models.getModelList(input);
  await api.models.getModelList.prefetchInfinite(input);

  return <ModelGrid input={input} models={models} />;
}
