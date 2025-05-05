"use client";

import { api } from "@/trpc/react";
import { paginationSchema } from "@/utils/pagination";
import { keepPreviousData } from "@tanstack/react-query";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { type FC, useTransition } from "react";

import { type CategoryListResponse, type GetCategoryListSchema } from "@/server/api/routers/categories";

import { DataTable } from "@/components/ui/data-table";

import { useCategoryColumns } from "./columns";

interface CategoriesTableProps {
  categories: CategoryListResponse;
  input: GetCategoryListSchema;
}

export const CategoriesTable: FC<CategoriesTableProps> = ({ categories: initialData, input }) => {
  const columns = useCategoryColumns();
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsJson(paginationSchema.parse.bind(paginationSchema))
      .withDefault({ pageIndex: 0, pageSize: 10 })
      .withOptions({ clearOnDefault: true, startTransition }),
  );

  const query = api.categories.getCategoryList.useQuery(
    {
      ...input,
      limit: page.pageSize,
      query: searchQuery ?? undefined,
      offset: page.pageIndex * page.pageSize,
    },
    {
      initialData,
      enabled: !isPending,
      placeholderData: keepPreviousData,
    },
  );

  const data = query.data?.data ?? [];
  const total = query.data?.meta?.total ?? 0;

  return (
    <DataTable
      loading={query.isLoading}
      pagination={page}
      total={total}
      columns={columns}
      data={data}
      onPaginationChange={setPage}
    />
  );
};
