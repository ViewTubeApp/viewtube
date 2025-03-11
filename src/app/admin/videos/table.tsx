"use client";

import { api } from "@/trpc/react";
import { paginationSchema } from "@/utils/shared/pagination";
import { keepPreviousData } from "@tanstack/react-query";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { type FC, useTransition } from "react";

import { GetVideoListSchema, VideoListResponse } from "@/server/api/routers/video";

import { DataTable } from "@/components/ui/data-table";

import { DashboardVideoCard } from "./card";
import { useDashboardColumns } from "./columns";

interface DashboardVideoTableProps {
  input: GetVideoListSchema;
  videos: VideoListResponse;
}

export const DashboardVideoTable: FC<DashboardVideoTableProps> = ({ input, videos: initialData }) => {
  const columns = useDashboardColumns();
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsJson(paginationSchema.parse.bind(paginationSchema))
      .withDefault({ pageIndex: 0, pageSize: 10 })
      .withOptions({ clearOnDefault: true, startTransition }),
  );

  const query = api.video.getVideoList.useQuery(
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
      card={DashboardVideoCard}
      onPaginationChange={setPage}
    />
  );
};
