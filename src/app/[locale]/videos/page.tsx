import { api } from "@/trpc/server";
import { userSearchParamsCache } from "@/utils/server/search";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";
import { match } from "ts-pattern";

import { type GetVideoListSchema } from "@/server/api/routers/video";

import { filters } from "@/constants/query";

import { CategoryChannelHeader } from "@/components/category-channel-header";
import { ModelChannelHeader } from "@/components/model-channel-header";
import { SortHeader } from "@/components/sort-header";

import { VideoGrid } from "./grid";

interface VideosPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: VideosPageProps) {
  const { locale } = await params;

  const t = await getTranslations({ locale });
  const title = `${t("title_part_start")}${t("title_part_end")}`;

  return {
    title: t("videos"),
    openGraph: {
      locale,
      type: "website",
      title: `${title} | ${t("videos")}`,
      description: t("layout_description"),
    },
  } satisfies Metadata;
}

export default async function VideosPage({ searchParams }: VideosPageProps) {
  const {
    q: query,
    m: modelQuery,
    c: categoryQuery,
    s: sortQuery,
    t: tagQuery,
  } = await userSearchParamsCache.parse(searchParams);

  const defaultInput = match(sortQuery)
    .with("new", () => filters.video.list.new)
    .with("popular", () => filters.video.list.popular)
    .otherwise(() => filters.video.list.public);

  const input: GetVideoListSchema = {
    ...defaultInput,
    query: query ?? undefined,
    model: modelQuery ?? undefined,
    category: categoryQuery ?? undefined,
    tag: tagQuery ?? undefined,
  };

  const videos = await api.video.getVideoList(input);
  await api.video.getVideoList.prefetchInfinite(input);

  // Fetch additional data for headers
  const model = modelQuery ? await api.models.getModelById({ id: Number(modelQuery) }) : null;
  const category = categoryQuery ? await api.categories.getCategoryById({ id: Number(categoryQuery) }) : null;

  // Determine if we need delayed transition (when showing headers)
  const hasHeader = !!model || !!category || !!sortQuery;

  return (
    <VideoGrid input={input} videos={videos} delay={hasHeader ? 0.3 : 0}>
      {model && <ModelChannelHeader model={model} />}
      {category && <CategoryChannelHeader category={category} />}
      {sortQuery && <SortHeader variant={sortQuery} />}
    </VideoGrid>
  );
}
