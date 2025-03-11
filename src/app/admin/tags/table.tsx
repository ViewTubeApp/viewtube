"use client";

import { api } from "@/trpc/react";
import { paginationSchema } from "@/utils/shared/pagination";
import { keepPreviousData } from "@tanstack/react-query";
import { parseAsJson, parseAsString, useQueryState } from "nuqs";
import { type FC, useTransition } from "react";

import { GetTagListSchema, TagListResponse } from "@/server/api/routers/tags";

import { DataTable } from "@/components/ui/data-table";

import { TagCard } from "./card";
import { useTagColumns } from "./columns";

interface TagsTableProps {
  tags: TagListResponse;
  input: GetTagListSchema;
}

export const TagsTable: FC<TagsTableProps> = ({ tags: initialData, input }) => {
  const columns = useTagColumns();
  const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));

  const [isPending, startTransition] = useTransition();

  const [page, setPage] = useQueryState(
    "page",
    parseAsJson(paginationSchema.parse.bind(paginationSchema))
      .withDefault({ pageIndex: 0, pageSize: 10 })
      .withOptions({ clearOnDefault: true, startTransition }),
  );

  const query = api.tags.getTagList.useQuery(
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
      card={TagCard}
      onPaginationChange={setPage}
    />
  );
};
