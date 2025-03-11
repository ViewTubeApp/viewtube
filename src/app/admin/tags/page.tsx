import * as m from "@/paraglide/messages";
import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { SearchParams } from "nuqs/server";

import { GetTagListSchema } from "@/server/api/routers/tags";

import { adminTagListQueryOptions } from "@/constants/query";

import { TagsHeader } from "./header";
import { TagsTable } from "./table";

export async function generateMetadata() {
  return { title: m.tags() } satisfies Metadata;
}

interface TagsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function TagsPage({ searchParams }: TagsPageProps) {
  const { page, q: searchQuery } = await adminSearchParamsCache.parse(searchParams);

  const input: GetTagListSchema = {
    ...adminTagListQueryOptions,
    query: searchQuery,
    offset: page.pageIndex * page.pageSize,
    limit: page.pageSize,
  };

  const tags = await api.tags.getTagList(input);
  await api.tags.getTagList.prefetch(input);

  return (
    <div className="lg:container lg:mx-auto">
      <TagsHeader />
      <TagsTable tags={tags} input={input} />
    </div>
  );
}
