"use client";

import { api } from "@/trpc/react";
import { paginationSchema } from "@/utils/shared/pagination";
import { keepPreviousData } from "@tanstack/react-query";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { type FC, useTransition } from "react";

import { GetModelListSchema } from "@/server/api/routers/models";
import { ModelListResponse } from "@/server/api/routers/models";

import { DataTable } from "@/components/ui/data-table";

import { ModelCard } from "./card";
import { useModelColumns } from "./columns";

interface ModelsTableProps {
  models: ModelListResponse;
  input: GetModelListSchema;
}

export const ModelsTable: FC<ModelsTableProps> = ({ models: initialData, input }) => {
  const columns = useModelColumns();
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsJson(paginationSchema.parse.bind(paginationSchema))
      .withDefault({ pageIndex: 0, pageSize: 10 })
      .withOptions({ clearOnDefault: true, startTransition }),
  );

  const query = api.models.getModelList.useQuery(
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
      card={ModelCard}
      onPaginationChange={setPage}
    />
  );
};
