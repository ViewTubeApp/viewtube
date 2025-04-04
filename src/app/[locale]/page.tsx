import { api } from "@/trpc/server";
import { type Metadata } from "next";
import { type Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { type SearchParams } from "nuqs/server";

import { filters } from "@/constants/query";

import { SortHeader } from "@/components/sort-header";

import { VideoGrid } from "./videos/grid";

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({ params }: HomePageProps) {
  const { locale } = await params;

  const t = await getTranslations({ locale });
  const title = `${t("title_part_start")}${t("title_part_end")}`;

  return {
    title: t("videos"),
    openGraph: {
      title,
      locale,
      type: "website",
      description: t("layout_description"),
    },
  } satisfies Metadata;
}

export default async function HomePage() {
  const [pn, pp, pv] = await Promise.allSettled([
    api.video.getVideoList(filters.video.list.new),
    api.video.getVideoList(filters.video.list.public),
    api.video.getVideoList(filters.video.list.popular),
  ]);

  await api.video.getVideoList.prefetchInfinite(filters.video.list.public);

  const videos = {
    new: pn.status === "fulfilled" ? pn.value : null,
    public: pp.status === "fulfilled" ? pp.value : null,
    popular: pv.status === "fulfilled" ? pv.value : null,
  };

  return (
    <div className="space-y-4 lg:space-y-8">
      {videos.popular && (
        <VideoGrid input={filters.video.list.popular} videos={videos.popular} horizontal>
          <SortHeader variant="popular" href="/videos?s=popular" />
        </VideoGrid>
      )}

      {videos.new && (
        <VideoGrid input={filters.video.list.new} videos={videos.new} horizontal delay={0.3}>
          <SortHeader variant="new" href="/videos?s=new" delay={0.3} />
        </VideoGrid>
      )}

      {videos.public && (
        <VideoGrid input={filters.video.list.public} videos={videos.public} delay={0.6}>
          <SortHeader variant="other" href="/videos" delay={0.6} />
        </VideoGrid>
      )}
    </div>
  );
}
