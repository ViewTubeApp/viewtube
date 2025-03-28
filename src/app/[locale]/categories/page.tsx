import { api } from "@/trpc/server";
import { userSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";

import { type GetCategoryListSchema } from "@/server/api/routers/categories";

import { adminCategoryListQueryOptions } from "@/constants/query";

import { CategoryGrid } from "./grid";

interface CategoriesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("categories") } satisfies Metadata;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { q: query } = await userSearchParamsCache.parse(searchParams);

  const input: GetCategoryListSchema = {
    ...adminCategoryListQueryOptions,
    query: query ?? undefined,
  };

  const categories = await api.categories.getCategoryList(input);
  await api.categories.getCategoryList.prefetchInfinite(input);

  return <CategoryGrid input={input} categories={categories} />;
}
