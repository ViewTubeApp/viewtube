"use client";

import { api } from "@/trpc/react";
import { keepPreviousData } from "@tanstack/react-query";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { type FC, useMemo, useTransition } from "react";
import { z } from "zod";

import { adminModelListQueryOptions } from "@/constants/query";

import { DataTable } from "@/components/ui/data-table";

import { ModelCard } from "./card";
import { useModelColumns } from "./columns";

const pageSchema = z.object({
  pageSize: z.number(),
  pageIndex: z.number(),
});

export const ModelsTable: FC = () => {
  const columns = useModelColumns();
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsJson(pageSchema.parse.bind(pageSchema))
      .withDefault({ pageIndex: 0, pageSize: 10 })
      .withOptions({ clearOnDefault: true, startTransition }),
  );

  const queryKey = useMemo(
    () => ({
      ...adminModelListQueryOptions,
      query: searchQuery,
      offset: page.pageIndex * page.pageSize,
      limit: page.pageSize,
    }),
    [searchQuery, page],
  );

  const query = api.models.getModelList.useQuery(queryKey, {
    enabled: !isPending,
    placeholderData: keepPreviousData,
  });

  const data = query.data?.data ?? [];
  const total = query.data?.meta?.total ?? 0;

  return (
    <DataTable
      loading={query.isLoading}
      pagination={page}
      total={total}
      columns={columns}
      data={data}
      card={ModelCard}
      onPaginationChange={setPage}
    />
  );
};
