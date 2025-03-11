"use client";

import { api } from "@/trpc/react";
import * as motion from "motion/react-client";
import { parseAsString, useQueryState } from "nuqs";
import { type FC } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { type APICategoryListType, type GetCategoryListSchema } from "@/server/api/routers/categories";

import { motions } from "@/constants/motion";

import { CategoryCard } from "./card";

interface CategoryGridProps {
  input: GetCategoryListSchema;
  categories: APICategoryListType;
}

export const CategoryGrid: FC<CategoryGridProps> = ({ input, categories: initialData }) => {
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const query = api.categories.getCategoryList.useInfiniteQuery(
    { ...input, query: searchQuery },
    {
      initialData: { pages: [initialData], pageParams: [] },
      getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    },
  );

  const [sentryRef] = useInfiniteScroll({
    loading: query.isLoading,
    hasNextPage: query.hasNextPage,
    disabled: query.isError,
    onLoadMore: () => query.fetchNextPage(),
  });

  return (
    <motion.div {...motions.fade.in} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {query.data?.pages
        .flatMap((page) => page.data)
        .map((category) => <CategoryCard key={category.id} category={category} />)}

      <div ref={sentryRef} className="h-1 w-full invisible" />
    </motion.div>
  );
};
