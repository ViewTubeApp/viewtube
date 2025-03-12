import { type Locale } from "@/i18n/routing";
import { api } from "@/trpc/server";
import { adminSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";

import { type GetTagListSchema } from "@/server/api/routers/tags";

import { adminTagListQueryOptions } from "@/constants/query";

import { TagsHeader } from "./header";
import { TagsTable } from "./table";

interface TagsPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: TagsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return { title: t("tags") } satisfies Metadata;
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
