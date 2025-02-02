"use client";

import { useInfiniteQueryObserver } from "@/hooks/use-infinite-query-observer";
import { api } from "@/trpc/react";
import { motion } from "motion/react";
import { parseAsString, useQueryState } from "nuqs";
import { type FC } from "react";

import { type CategoryListResponse, type GetCategoryListSchema } from "@/server/api/routers/categories";

import { motions } from "@/constants/motion";

import { CategoryCard } from "./card";

interface CategoryGridProps {
  input: GetCategoryListSchema;
  categories: CategoryListResponse;
}

export const CategoryGrid: FC<CategoryGridProps> = ({ input, categories: initialData }) => {
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const query = api.categories.getCategoryList.useInfiniteQuery(
    { ...input, query: searchQuery },
    { initialData: { pages: [initialData], pageParams: [] }, getNextPageParam: (lastPage) => lastPage.data.at(-1)?.id },
  );

  const { ref } = useInfiniteQueryObserver(query);

  return (
    <motion.div {...motions.fade.in} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {query.data?.pages
        .flatMap((page) => page.data)
        .map((category) => <CategoryCard key={category.id} category={category} ref={ref} />)}
    </motion.div>
  );
};
