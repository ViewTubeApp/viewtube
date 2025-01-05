import * as m from "@/paraglide/messages";
import { loadCategoryList } from "@/queries/server/load-category-list";
import { searchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type SearchParams } from "nuqs/server";

import { type GetCategoryListSchema } from "@/server/api/routers/categories";

import { adminCategoryListQueryOptions } from "@/constants/query";

import { CategoryGrid } from "./grid";

export function generateMetadata() {
  return { title: m.categories() } satisfies Metadata;
}

interface CategoriesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const { q: query } = await searchParamsCache.parse(searchParams);

  const input: GetCategoryListSchema = { ...adminCategoryListQueryOptions, query };
  const categories = await loadCategoryList(input);

  return <CategoryGrid input={input} categories={categories} />;
}
