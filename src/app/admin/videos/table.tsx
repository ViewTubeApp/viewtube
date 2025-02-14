"use client";

import { api } from "@/trpc/react";
import { keepPreviousData } from "@tanstack/react-query";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { type FC, useTransition } from "react";
import { z } from "zod";

import { adminVideoListQueryOptions } from "@/constants/query";

import { DataTable } from "@/components/ui/data-table";

import { DashboardVideoCard } from "./card";
import { useDashboardColumns } from "./columns";

const pageSchema = z.object({
  pageSize: z.number(),
  pageIndex: z.number(),
});

export const DashboardVideoTable: FC = () => {
  const columns = useDashboardColumns();
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsJson(pageSchema.parse.bind(pageSchema))
      .withDefault({ pageIndex: 0, pageSize: 10 })
      .withOptions({ clearOnDefault: true, startTransition }),
  );

  const query = api.video.getVideoList.useQuery(
    {
      ...adminVideoListQueryOptions,
      query: searchQuery,
      offset: page.pageIndex * page.pageSize,
      limit: page.pageSize,
    },
    {
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
      card={DashboardVideoCard}
      onPaginationChange={setPage}
    />
  );
};
