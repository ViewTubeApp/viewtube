import * as m from "@/paraglide/messages";
import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { SearchParams } from "nuqs/server";
import { type PropsWithChildren } from "react";

import { GetCategoryListSchema } from "@/server/api/routers/categories";

import { adminCategoryListQueryOptions } from "@/constants/query";

import { CategoriesHeader } from "./header";
import { CategoriesTable } from "./table";

export async function generateMetadata() {
  return { title: m.categories() } satisfies Metadata;
}

interface CategoriesLayoutProps extends PropsWithChildren {
  searchParams: Promise<SearchParams>;
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
  await api.categories.getCategoryList.prefetch(input);

  return (
    <div className="lg:container lg:mx-auto">
      <CategoriesHeader />
      <CategoriesTable categories={categories} input={input} />
      {children}
    </div>
  );
}
