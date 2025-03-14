import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";
import { type PropsWithChildren } from "react";

import { type GetCategoryListSchema } from "@/server/api/routers/categories";

import { adminCategoryListQueryOptions } from "@/constants/query";

import { CategoriesHeader } from "./header";
import { CategoriesTable } from "./table";

interface CategoriesLayoutProps extends PropsWithChildren {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: CategoriesLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("categories") } satisfies Metadata;
}

export default async function CategoriesLayout({ children, searchParams }: CategoriesLayoutProps) {
  const { page, q: searchQuery } = await adminSearchParamsCache.parse(searchParams);

  const input: GetCategoryListSchema = {
    ...adminCategoryListQueryOptions,
    query: searchQuery,
    offset: page.pageIndex * page.pageSize,
    limit: page.pageSize,
  };

  const categories = await api.categories.getCategoryList(input);

  return (
    <div className="lg:container lg:mx-auto">
      <CategoriesHeader />
      <CategoriesTable categories={categories} input={input} />
      {children}
    </div>
  );
}
